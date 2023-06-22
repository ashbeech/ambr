import sha1 from "simple-sha1";
import pify from "pify";
import queueMicrotask from "queue-microtask";

import { exponentialRetry } from "./fetcher.js";
import { withTimeout } from "./with-timeout.js";

const sha1Async = pify((input, cb) => sha1(input, (hash) => cb(null, hash)));

export class B2ChunkStore {
  closed = false;
  downloadAuthPromise = null;

  uploadAuthWaitQueue = [];
  uploadAuthTokenSlots = null; // Initialized in `initializeUploadAuthTokenSlots`

  constructor(chunkLength, opts) {
    this.chunkLength = chunkLength;

    if (typeof opts.length === "number") {
      this.lastChunkLength = opts.length % this.chunkLength || this.chunkLength;
      this.lastChunkIndex = Math.ceil(opts.length / this.chunkLength) - 1;
    } else {
      this.lastChunkIndex = null;
    }

    if (typeof opts.bucketName !== "string") {
      throw new Error("opts.bucketName must be a string");
    }
    this.bucketName = opts.bucketName;

    if (typeof opts.name !== "string") {
      throw new Error("opts.name must be a string");
    }
    this.name = opts.name;

    this.pathPrefix = null;
    if (opts.pathPrefix != null) {
      if (typeof opts.pathPrefix !== "string" || opts.pathPrefix === "") {
        throw new Error(
          "opts.pathPrefix must be nullish or a non-empty string"
        );
      }
      this.pathPrefix = opts.pathPrefix;
    }

    if (
      typeof opts.authUpload !== "function" &&
      typeof opts.authDownload !== "function"
    ) {
      throw new Error(
        "At least one of opts.authUpload or opts.authDownload must be a function"
      );
    }
    this.getSha1Hash = opts.getSha1Hash;
    this.authUpload = opts.authUpload;
    this.authDownload = opts.authDownload;

    // Max consecutive failures before giving up
    this.maxConsecutiveFailures = opts.numRequestAttempts || 10;
    this.maxUploadConcurrency = opts.maxUploadConcurrency || 1;
  }

  async get(index, opts, cb) {
    if (typeof opts === "function") return this.get(index, null, opts);

    if (this.closed) {
      queueMicrotask(() => {
        cb(new Error("Store closed"));
      });
      return;
    }

    if (!this.authDownload) {
      throw new Error(
        "Attempted to call .get() without passing opts.authDownload"
      );
    }

    if (!this.downloadAuthPromise) {
      // authDownload should handle retries internally
      this.downloadAuthPromise = await this.authDownload();
    }

    const { downloadUrl, authorizationToken } = this.downloadAuthPromise; //await this.downloadAuthPromise;

    let contentLength =
      index === this.lastChunkIndex ? this.lastChunkLength : this.chunkLength;
    let rangeHeader = null;
    if (
      (opts?.offset && opts.offset !== 0) ||
      (opts?.length && opts.length !== contentLength)
    ) {
      const start = opts.offset || 0;
      const end = opts.length ? start + opts.length : contentLength;
      contentLength = end - start;

      // End is inclusive in `Range` header
      rangeHeader = `bytes=${start}-${end - 1}`;
    }
    // Timeout between received data chunks
    const timeout = opts?.timeout ?? 60_000;

    const url = `${downloadUrl}/file/${this.bucketName}/${this.getChunkPath(
      index
    )}?Authorization=${authorizationToken}`;

    let data;

    try {
      data = await exponentialRetry(async (abort) => {
        if (this.closed) {
          abort(new Error("Store closed"));
        }

        const abortController = new globalThis.AbortController();
        let response;
        try {
          response = await withTimeout(
            globalThis.fetch(url, {
              headers: rangeHeader
                ? {
                    Range: rangeHeader,
                  }
                : {},
              signal: abortController.signal,
            }),
            timeout
          );
          data = Buffer.alloc(contentLength);

          let offset = 0;
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await withTimeout(reader.read(), timeout);
            if (done) {
              if (offset !== contentLength) {
                throw new Error("Content-Length mismatch");
              }
              break;
            }
            data.set(value, offset);
            offset += value.byteLength;
          }
        } catch (err) {
          abortController.abort();
          throw err;
        }

        if (this.closed) {
          abort(new Error("Store closed"));
        } else if (!response.ok) {
          throw new Error(
            `Unexpected error; response code: ${response.status}`
          );
        }

        return data;
      }, this.maxConsecutiveFailures);
    } catch (err) {
      cb(err);
      return;
    }

    cb(null, data);
  }

  async put(index, buf, cb = () => {}) {
    if (this.closed) {
      queueMicrotask(() => {
        cb(new Error("Store closed"));
      });
      return;
    }

    //console.log("lastChunkIndex: ", this.lastChunkIndex);

    const isLastChunk = index === this.lastChunkIndex;
    if (isLastChunk && buf.length !== this.lastChunkLength) {
      queueMicrotask(() =>
        cb(new Error(`Last chunk length must be ${this.lastChunkLength}`))
      );
      return;
    }
    if (!isLastChunk && buf.length !== this.chunkLength) {
      queueMicrotask(() =>
        cb(new Error(`Chunk length must be ${this.chunkLength}`))
      );
      return;
    }

    const shaSum = await sha1Async(buf); //this.getSha1Hash?.(index) ?? ();
    //console.log("SHASUM 1: ", this.getSha1Hash?.(index));
    //console.log("SHASUM 2: ", shaSum);

    let auth = null;
    try {
      await exponentialRetry(async (abort) => {
        if (this.closed) {
          abort(new Error("Store closed"));
        }

        if (!auth) {
          try {
            auth = await this.getUploadAuth();
          } catch (err) {
            abort(err);
          }
        }

        //console.log("AUTH: ", auth);

        if (this.closed) {
          abort(new Error("Store closed"));
        }

        let response;
        try {
          response = await globalThis.fetch(auth.uploadUrl, {
            method: "POST",
            credentials: "include",
            body: buf,
            headers: {
              Authorization: auth.authorizationToken,
              /*               "access-control-allow-origin":
                "https://ambr-mvp-ashbeech.vercel.app",
              "access-control-allow-credentials": "true", */
              "x-bz-content-sha1": shaSum,
              "x-bz-file-name": this.getChunkPath(index),
              "content-type": "application/octet-stream",
            },
          });

          // Read response body to avoid memory leak. For some reason request.body is retained otherwise
          await response.arrayBuffer();
        } catch (err) {
          // Network error; try to re-auth to get a different upload URL
          auth.doneFailed();
          auth = null;
          throw err;
        }

        // See https://www.backblaze.com/b2/docs/uploading.html for explanation of retry logic
        if (this.closed) {
          abort(new Error("Store closed"));
        } else if (response.ok) {
          // Success!
          //console.log("SUCCESS OF UPLOAD CHUNK", this.getChunkPath(index));
        } else if (response.status === 408 || response.status === 429) {
          // Transient error; retry with same credentials
          throw new Error(`Transient error; response code: ${response.status}`);
        } else {
          // Reauth for HTTP 401 Unauthorized, 5xx Server errors, and all others
          auth.doneFailed();
          auth = null;
          throw new Error(`Response code: ${response.status}`);
        }
      }, this.maxConsecutiveFailures);
    } catch (err) {
      // If auth is still set, it's assumed to not be the cause of the failure
      auth?.doneSucceeded();
      cb(err);
      return;
    }

    auth?.doneSucceeded();
    cb(null);
  }

  close(cb) {
    if (this.closed) {
      if (cb) {
        queueMicrotask(() => {
          cb(new Error("Store closed"));
        });
      }
      return;
    }
    this.closed = true;

    for (const waiter of this.uploadAuthWaitQueue) {
      waiter.reject(new Error("Store closed"));
    }
    this.uploadAuthWaitQueue = [];
    this.uploadAuthTokenSlots = [];

    if (cb) {
      queueMicrotask(() => {
        cb(null);
      });
    }
  }

  async destroy(cb) {
    if (cb) {
      queueMicrotask(() => {
        cb(null);
      });
    }
  }

  async fetchUploadAuthTokens() {
    const needFetch = this.uploadAuthTokenSlots.filter((tokenSlot) => {
      if (tokenSlot.state === "empty") {
        tokenSlot.state = "fetching";
        return true;
      }
      return false;
    });
    if (needFetch.length === 0) {
      return;
    }

    let fetchedTokens = [];
    try {
      // authUpload should handle retries internally
      fetchedTokens = await this.authUpload(needFetch.length);
    } catch (err) {
      console.error(err);
    }

    for (const fetchedToken of fetchedTokens) {
      const tokenSlot = needFetch.shift();
      tokenSlot.uploadUrl = fetchedToken.uploadUrl;
      tokenSlot.authorizationToken = fetchedToken.authorizationToken;
      this.uploadAuthTokenAvailable(tokenSlot);
    }

    // Mark any unfilled slots as failed
    for (const tokenSlot of needFetch) {
      this.uploadAuthTokenFailed(tokenSlot);
    }
  }

  uploadAuthTokenFailed(tokenSlot) {
    tokenSlot.state = "failed";

    if (this.uploadAuthTokenSlots.every(({ state }) => state === "failed")) {
      for (const waiter of this.uploadAuthWaitQueue) {
        waiter.reject(new Error("Authorization retries exhausted"));
      }
    }
  }

  uploadAuthTokenAvailable(tokenSlot) {
    tokenSlot.state = "ready";

    if (this.uploadAuthWaitQueue.length > 0) {
      tokenSlot.state = "busy";
      this.uploadAuthWaitQueue.shift().resolve(tokenSlot);
    }
  }

  initializeUploadAuthTokenSlots() {
    this.uploadAuthTokenSlots = [];
    for (let i = 0; i < this.maxUploadConcurrency; i++) {
      const tokenSlot = {
        state: "empty", // empty, fetching, ready, busy, failed
        consecutiveFailureCount: 0,
        uploadUrl: null,
        authorizationToken: null,
        doneFailed: () => {
          tokenSlot.consecutiveFailureCount += 1;
          if (
            tokenSlot.consecutiveFailureCount >= this.maxConsecutiveFailures
          ) {
            this.uploadAuthTokenFailed(tokenSlot);
          } else {
            tokenSlot.state = "empty";
            this.fetchUploadAuthTokens();
          }
        },
        doneSucceeded: () => {
          tokenSlot.consecutiveFailureCount = 0;
          this.uploadAuthTokenAvailable(tokenSlot);
        },
      };
      this.uploadAuthTokenSlots.push(tokenSlot);
    }
  }

  async getUploadAuth() {
    if (!this.authUpload) {
      throw new Error(
        "Attempted to call .put() without passing opts.authUpload"
      );
    }

    if (!this.uploadAuthTokenSlots) {
      this.initializeUploadAuthTokenSlots();
      this.fetchUploadAuthTokens();
    } else {
      const tokenSlot = this.uploadAuthTokenSlots.find(
        ({ state }) => state === "ready"
      );
      if (tokenSlot) {
        tokenSlot.state = "busy";
        return tokenSlot;
      }

      if (this.uploadAuthTokenSlots.every(({ state }) => state === "failed")) {
        throw new Error("Authorization retries exhausted");
      }
    }

    // Wait
    const waiter = {};
    const readyPromise = new Promise((resolve, reject) => {
      waiter.resolve = resolve;
      waiter.reject = reject;
    });
    this.uploadAuthWaitQueue.push(waiter);
    return await readyPromise;
  }

  getChunkPath(index) {
    /* Path is built like this:
     * prefix/components/myName/1
     * if index = 1, opts.name = 'myName', and opts.pathPrefix = 'prefix/components'
     */
    const prefixComponents =
      this.pathPrefix == null ? [] : this.pathPrefix.split("/");

    return [...prefixComponents, this.name, index]
      .map((pathComponent) => encodeURIComponent(pathComponent))
      .join("/");
  }
}
