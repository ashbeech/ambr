// TODO: open source this as an alternative to StreamSaver
import base64 from "base64-js";
import Debug from "debug";
import { transformStream } from "ambrkeys";

import { readableStreamToPort } from "./readable-stream-to-port.js";
import { timeoutStream } from "./timeout-stream.js";
import { withTimeout } from "./with-timeout.js";

const debug = Debug("ambr:service-worker-download");

// Fall back to blob mode if the service worker isn't ready in 5 seconds
const READY_TIMEOUT = 5_000;

// Send fetches to a keepalive endpoint during downloads to prevent the
// service worker from stopping
const KEEPALIVE_INTERVAL = 20_000;

// Downloads are under this path
const DOWNLOAD_PATH_PREFIX = "/download-stream/";
// Keepalive is at this path
const KEEPALIVE_PATH = "/download-keepalive";

function arrayToB64Url(array) {
  return base64
    .fromByteArray(array)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function makeId() {
  return arrayToB64Url(globalThis.crypto.getRandomValues(new Uint8Array(16)));
}

// Ignore service workers with lower version
const MIN_SERVICE_WORKER_VERSION = 2;

// If native TransformStream is supported, optimistically try transferring ReadableStreams
// directly to the service worker; if that fails, this variable will be set to false to
// fall back to sending messages over a channel. The transferable stream code path requires
// TransformStream so don't even try transferable streams if TransformStream is not available.
let transferableStreamsSupported = !!globalThis.TransformStream;

async function waitForServiceWorker() {
  return await withTimeout(
    (async () => {
      const serviceWorker = navigator.serviceWorker;
      const registration = await serviceWorker?.getRegistration();
      // No service worker is registered at all, so this is guaranteed to fail
      if (registration == null) {
        return null;
      }
      // Wait for ready
      await serviceWorker.ready;

      const controller = serviceWorker.controller;

      // This happens if 'bypass for network' is enabled in chrome dev tools
      if (controller == null) {
        return null;
      }

      // Check the service worker version
      const version = await new Promise((resolve, reject) => {
        const channel = new globalThis.MessageChannel();
        const localPort = channel.port1;

        controller.postMessage(
          {
            type: "get-version",
          },
          [channel.port2]
        );

        const onMessage = (event) => {
          const { type, version } = event.data;
          localPort.removeEventListener("message", onMessage);
          localPort.close();

          if (type === "version") {
            resolve(version);
          } else {
            reject(new Error(`Unexpected message type: ${type}`));
          }
        };

        localPort.addEventListener("message", onMessage);
        localPort.start();
      });

      debug(`found service worker version: ${version}`);

      if (version >= MIN_SERVICE_WORKER_VERSION) {
        return serviceWorker;
      } else {
        return null;
      }
    })(),
    READY_TIMEOUT
  );
}

// Creates a ServiceWorkerStreamSource if a service worker is registered (see docs below).
// If no service worker is registered, returns null
export async function makeStreamSource() {
  let container;
  try {
    container = await waitForServiceWorker();
    if (container == null) {
      debug("no service worker registered");
      console.error("NO SERVICE WORKER REGISTERED");
      return null;
    }
  } catch {
    debug("timed out waiting for service worker to be active");
    return null;
  }

  debug("service worker is active");
  //console.log("SERVICE WORKER ACTIVE");

  return new ServiceWorkerStreamSource(container);
}

/**
 * Creating a ServiceWorkerStreamSource provides a source for downloads under
 * DOWNLOAD_PATH_PREFIX that serves files through the service worker. Each file
 * added to the ServiceWorkerStreamSource gets a unique, random URL, which when
 * visited calls its associated fileGetter.
 *
 * For example, once a ServiceWorkerStreamSource is created, calling `addFile` on it
 * and passing in a `fileGetter` will return a URL like
 * /download-stream/aRandomFileId
 * If a GET request for that URL reaches the service worker, `fileGetter` will
 * be called with { headers, queryParams }, and when it's promise resolves to
 * a response containing { stream, headers } the service worker will generate
 * a response to the fetch.
 */
class ServiceWorkerStreamSource {
  _destroyed = false;
  _fileRegistrations = new Map();
  _keepaliveInterval = null;
  _keepaliveCount = 0;

  constructor(container) {
    this.container = container;

    this.container.addEventListener("message", this._onMessage);
  }

  /**
   * Takes in an array of `fileGetter` functions to fetch files, and returns an array of URLs, one
   * for each `fileGetter`. Each `fileGetter` should be a function that takes { headers, queryParams}
   * as input and returns a promise that resolves to { stream, headers }, where `stream` is a
   * ReadableStream and `headers` is an optional object.
   * `fileGetter` will be called each time the corresponding URL is fetched, and its return value
   * will be used to construct the response for that URL in the service worker.
   * @param {Function[]} fileGetters Array of functions returning Promise<{stream, headers}>
   * @returns {string[]} Array of URLs
   */
  addFiles(fileGetters) {
    const urls = fileGetters.map((fileGetter) => {
      const fileId = makeId();

      this._fileRegistrations.set(fileId, fileGetter);

      return `${DOWNLOAD_PATH_PREFIX}${fileId}`;
    });

    return urls;
  }

  // Like `addFiles`, but for a single `fileGetter`
  addFile(fileGetter) {
    return this.addFiles([fileGetter])[0];
  }

  // Removes the handlers all of the URLs passed in `urls`, which must have
  // previously been returned by `addFiles` or `addFile`
  removeFiles(urls) {
    for (const url of urls) {
      if (!url.startsWith(DOWNLOAD_PATH_PREFIX)) {
        throw new Error(`Invalid URL doesn't have correct prefix: ${url}`);
      }

      const fileId = url.slice(DOWNLOAD_PATH_PREFIX.length);
      if (!this._fileRegistrations.delete(fileId)) {
        throw new Error(
          `Cannot call removeFiles on a URL that was not added: ${url}`
        );
      }
    }
  }

  // Like `removeFiles`, but for a single URL
  removeFile(url) {
    this.removeFiles([url]);
  }

  // Cleans up the entire namespace and all URLs under it.
  destroy() {
    if (this._destroyed) {
      return;
    }
    this._destroyed = true;
    this._fileRegistrations = null;

    this.container.removeEventListener("message", this._onMessage);

    clearInterval(this._keepaliveInterval);
    this._keepaliveInterval = null;
  }

  // Enable or disable keepalive, which is necessary to keep the service worker
  // from stopping, especially in firefox
  _setKeepalive(enable) {
    if (this._destroyed) {
      return;
    }

    this._keepaliveCount += enable ? 1 : -1;
    debug(`new keepalive count: ${this._keepaliveCount}`);

    if (this._keepaliveCount === 0) {
      debug("turning keepalive off");
      clearInterval(this._keepaliveInterval);
      this._keepaliveInterval = null;
    } else if (this._keepaliveInterval === null) {
      debug("turning keepalive on");
      this._keepaliveInterval = setInterval(async () => {
        debug("making keepalive fetch");
        try {
          await globalThis.fetch(KEEPALIVE_PATH);
        } catch (err) {
          debug(`keepalive fetch failed: ${err}`);
        }
        debug("keepalive fetch succeeded");
      }, KEEPALIVE_INTERVAL);
    }
  }

  _onMessage = async (event) => {
    if (event.data.type === "stream-request") {
      const { fileId, headers: requestHeaders, searchParams } = event.data;
      const localPort = event.ports[0];

      const fileGetter = this._fileRegistrations.get(fileId);
      if (fileGetter == null) {
        localPort.postMessage({
          type: "stream-response-error",
          message: "not found",
        });
        return;
      }

      // Start keepalive as soon as possible
      this._setKeepalive(true);

      let fileResponse;
      try {
        fileResponse = await fileGetter({
          headers: requestHeaders,
          searchParams,
        });
        if (fileResponse?.stream == null) {
          throw new Error("fileGetter did not return a stream");
        }
      } catch (err) {
        localPort.postMessage({
          type: "stream-response-error",
          message: err.message,
        });
        this._setKeepalive(false);
        return;
      }
      const { stream, response, idleTimeout } = fileResponse;

      const transform = transformStream(stream);

      // Stop keepalive once the stream is done
      const stopKeepalive = () => {
        this._setKeepalive(false);
      };
      transform.done.then(stopKeepalive, stopKeepalive);

      // If idleTimeout is set, wrap with timeoutStream that cleans up the stream
      // if the browser doesn't want data for idleTimeout ms
      const responseStream =
        idleTimeout == null
          ? transform.readable
          : timeoutStream(transform.readable, idleTimeout);

      this._sendResponseOverPort(response, responseStream, localPort);
    }
  };

  _sendResponseOverPort(response, stream, responsePort) {
    const sendStreamTransferable = () => {
      // Sends the stream by transferring it directly
      responsePort.postMessage(
        {
          type: "stream-response-transferable",
          response,
          stream,
        },
        [stream]
      );
      debug("using transferable readableStream");
    };

    const sendStreamPort = () => {
      // Sends the stream over a MessagePort instead
      const streamPort = readableStreamToPort(stream);
      responsePort.postMessage(
        {
          type: "stream-response-port",
          response,
        },
        [streamPort]
      );
      debug("using readableStreamToPort");
    };

    if (transferableStreamsSupported) {
      try {
        // This will fail if transferable streams aren't supported
        sendStreamTransferable();
      } catch {
        // We expect DataCloneError if the ReadableStream couldn't be transferred,
        // but not all browsers set err.name, so assume any error indicates
        // a transfer problem
        transferableStreamsSupported = false;
        sendStreamPort();
      }
    } else {
      sendStreamPort();
    }
  }
}
