/* eslint-env serviceworker */
"use strict";

// Increment the version to kick off the 'install' event and force previously
// cached resources to be cached again.
const CACHE_VERSION = 1;

// Increment this whenever the page needs to be able to test for new features
// in the service worker
const SERVICE_WORKER_VERSION = 2;

const NAME_PREFIX = "offline-v";
const CACHES = {
  OFFLINE: `offline-v${CACHE_VERSION}`,
};

const OFFLINE_URL = "./offline.html";

async function cacheAdd(cache, url) {
  // Set cache mode to 'reload' to ensure response comes from the network
  return cache.add(new Request(url, { cache: "reload" }));
}

self.addEventListener("install", (event) => {
  // Make the new version active immediately
  self.skipWaiting();

  event.waitUntil(
    (async function () {
      const offlineCache = await caches.open(CACHES.OFFLINE);
      return cacheAdd(offlineCache, OFFLINE_URL);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async function () {
      // Switch any existing tabs to use this service worker for fetches
      await self.clients.claim();

      // Delete all caches that start with NAME_PREFIX and aren't named in CACHES
      const expectedNames = new Set(Object.values(CACHES));
      const names = await caches.keys();

      return Promise.all(
        names
          .filter(
            (name) => name.startsWith(NAME_PREFIX) && !expectedNames.has(name)
          )
          .map((name) => {
            //console.log("Deleting out-of-date cache", name);
            return caches.delete(name);
          })
      );
    })()
  );
});

self.addEventListener("fetch", (event) => {
  //console.log("EVENT REQUEST: ", event.request);

  if (serveStream(event)) {
    return;
  }

  if (serveShareTarget(event)) {
    return;
  }

  event.respondWith(
    (async function () {
      // Respond from the cache if we can
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      if ("preloadResponse" in event) {
        try {
          // Use the preloaded response, if one exists
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;
        } catch (err) {
          // Ignore errors
        }
      }

      try {
        const response = await fetch(event.request); // , { mode: "cors" }
        //console.log("service-worker fetch request: ", event.request);
        //console.log("service-worker fetch response: ", response);
        return response;
      } catch (err) {
        // fetch() throws an exception when the server is unreachable. If fetch()
        // returns a valid HTTP response with a status code in the 4xx or 5xx
        // range, then an exception will NOT be thrown.

        if (event.request.mode !== "navigate") {
          // Only return the offline page for navigation requests (i.e. top-level
          // HTML pages)
          throw err;
        }

        const { url } = event.request;
        console.error(
          `Return offline page because fetch failed for ${url}: `,
          err
        );
        return caches.match(OFFLINE_URL);
      }
    })()
  );
});

// Respond to 'get-version' messages from the page
self.addEventListener("message", (event) => {
  const { type } = event.data;
  if (type === "get-version") {
    const port = event.ports[0];
    port.postMessage({
      type: "version",
      version: SERVICE_WORKER_VERSION,
    });
    port.close();
  }
});

// Support the Share Target API to receive shared files from other apps
function serveShareTarget(event) {
  const { request } = event;
  const url = new URL(request.url);

  if (
    url.origin !== self.location.origin ||
    request.method !== "POST" ||
    url.pathname !== "/share-target"
  ) {
    return false;
  }

  const dataPromise = event.request.formData();

  // Redirect so the user can refresh the page without resending data
  event.respondWith(Response.redirect("/?utm_source=share-target"));

  event.waitUntil(
    (async function () {
      // The page sends `share-target-ready` to tell service worker it is ready
      // to receive the shared files.
      await new Promise((resolve) => {
        const handleMessage = (event) => {
          const { type } = event.data;
          if (type === "share-target-ready") {
            resolve();
            self.removeEventListener("message", handleMessage);
          }
        };
        self.addEventListener("message", handleMessage);
      });

      const client = await self.clients.get(event.resultingClientId);
      const data = await dataPromise;
      const files = data.getAll("files");
      client.postMessage({ type: "share-target-files", files });
    })()
  );

  return true;
}

// Takes data from a MessagePort and converts it back into a ReadableStream.
// This is a substitute for native transferable streams.
const portToReadableStream = (port) => {
  let resolveDone;
  let rejectDone;
  const done = new Promise((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });

  done.catch(() => {});

  let resolveData = null;
  let rejectData = null;
  const makeDataPromise = () => {
    return new Promise((resolve, reject) => {
      resolveData = resolve;
      rejectData = reject;
    });
  };

  port.addEventListener("message", (event) => {
    const { type } = event.data;

    if (type === "data") {
      const { value, done } = event.data;
      resolveData({
        value,
        done,
      });
    } else if (type === "error") {
      const { message } = event.data;
      rejectData(new Error(message));
    }
  });
  port.start();

  const stream = new globalThis.ReadableStream({
    async pull(controller) {
      port.postMessage({
        type: "pull",
      });

      let result;
      try {
        result = await makeDataPromise();
      } catch (err) {
        port.close();
        rejectDone(err);
        throw err;
      }
      const { value, done } = result;

      if (done) {
        controller.close();
        port.close();
        resolveDone();
      } else {
        controller.enqueue(value);
      }
    },

    cancel(reason) {
      let err;
      let message;
      if (reason instanceof Error) {
        err = reason;
        message = reason.message;
      } else {
        err = new Error(`stream cancelled; reason: ${reason}`);
        message = String(reason);
      }

      rejectDone(err);

      port.postMessage({
        type: "cancel",
        message,
      });
      port.close();
    },
  });

  return {
    stream,
    done,
  };
};

// Substitute for Promise.any (which is not available in Safari 13 or Firefox 78)
// Resolves to the first resolved promise, or rejects if all promises reject.
// Unlike Promise.any, when this function rejects, it rejects with the error from
// the last promise to reject.
function firstToFulfill(promises) {
  let remaining = promises.length;
  if (remaining === 0) {
    return Promise.reject(new Error("Empty array passed to firstToFulfill"));
  }

  return new Promise((resolve, reject) => {
    for (const promise of promises) {
      promise.then(
        (result) => {
          remaining -= 1;
          resolve(result);
        },
        (err) => {
          remaining -= 1;
          if (remaining === 0) {
            reject(err);
          }
        }
      );
    }
  });
}

// Asks a given window (client) for a response stream
function getResponseFromWindow(client, fileId, requestHeaders, searchParams) {
  return new Promise((resolve, reject) => {
    const channel = new globalThis.MessageChannel();
    const localPort = channel.port1;

    client.postMessage(
      {
        type: "stream-request",
        fileId,
        searchParams,
        headers: requestHeaders,
      },
      [channel.port2]
    );

    const onMessage = (event) => {
      const { type } = event.data;

      if (type === "stream-response-error") {
        const { message } = event.data;
        reject(new Error(message));
      } else if (type === "stream-response-transferable") {
        const { stream, response } = event.data;

        // This code path only gets reached if native TransformStream
        // is available (tested in service-worker-download.js)
        const transform = new globalThis.TransformStream();
        const done = stream.pipeTo(transform.writable);

        resolve({
          response,
          stream: transform.readable,
          done,
        });
      } else if (type === "stream-response-port") {
        const { response } = event.data;
        const streamPort = event.ports[0];

        const { done, stream } = portToReadableStream(streamPort);

        resolve({
          response,
          stream,
          done,
        });
      } else {
        reject(new Error(`Unexpected message type received: ${type}`));
      }

      localPort.removeEventListener("message", onMessage);
      localPort.close();
    };

    localPort.addEventListener("message", onMessage);
    localPort.start();
  });
}

const withTimeout = async (promise, timeout) => {
  let timer;

  const result = await Promise.race([
    promise,
    new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error("Timeout"));
      }, timeout);
    }),
  ]);

  clearTimeout(timer);
  return result;
};

// Downloads are under this path
const DOWNLOAD_PATH_PREFIX = "/download-stream/";
// Keepalive is at this path
const KEEPALIVE_PATH = "/download-keepalive";

// Timeout to hear back from all pages before giving up
const STREAM_RESPONSE_TIMEOUT = 5_000;

// Wait a bit extra after the stream is done to make sure the download finishes
const EXTRA_WAIT_TIME = 1_000;

// Provide a download stream
function serveStream(event) {
  const { request } = event;
  const url = new URL(request.url);

  // Keepalives are necessary in firefox since event.waitUntil is limited in duration. See
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1378587
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1302715
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1610772
  if (url.origin === self.location.origin && url.pathname === KEEPALIVE_PATH) {
    event.respondWith(new Response());
    return true;
  }

  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(DOWNLOAD_PATH_PREFIX)
  ) {
    return false;
  }

  event.respondWith(
    (async function () {
      const fileId = url.pathname.slice(DOWNLOAD_PATH_PREFIX.length);

      const clients = await self.clients.matchAll({
        // Match all tabs, even if not controlled by this worker
        includeUncontrolled: true,
        type: "window",
      });

      const requestHeaders = {};
      for (const [key, value] of request.headers) {
        requestHeaders[key] = value;
      }

      const searchParams = {};
      for (const [key, value] of url.searchParams) {
        searchParams[key] = value;
      }

      // Ask all client tabs if they have the relevant file
      let downloadResponse;
      try {
        downloadResponse = await withTimeout(
          firstToFulfill(
            clients.map((client) =>
              getResponseFromWindow(
                client,
                fileId,
                requestHeaders,
                searchParams
              )
            )
          ),
          STREAM_RESPONSE_TIMEOUT
        );
      } catch (err) {
        console.error(`Download error for fileId ${fileId}:`, err);
        return Response.error();
      }

      const { response, stream, done } = downloadResponse;

      // Wait a bit extra after the stream is done to make sure the download finishes
      const delayedDone = (async () => {
        await done;
        await new Promise((resolve) => {
          setTimeout(resolve, EXTRA_WAIT_TIME);
        });
      })();

      // Keep the service worker alive until the download is done.
      // Does not fully work in firefox though; see keepalive above.
      event.waitUntil(delayedDone);

      return new Response(stream, response);
    })()
  );

  return true;
}
