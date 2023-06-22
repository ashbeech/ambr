/* eslint-env browser */

import Debug from "debug";

import { browserDetect } from "../browser-detect.js";

const debug = Debug("ambr:blob-stream");

/**
 * Convert a blob into a ReadableStream.
 * Includes a shim for environments where blob.stream() is not available.
 */
export function blobStream(blob) {
  // Chrome, Edge, Firefox, Safari TP
  if (typeof Blob.prototype.stream !== "undefined") {
    const { os, userAgent, browser, versionMajor, versionMinor } =
      browserDetect();
    // Safari 14.1 completely crashes.
    // It looks like 14.2 (TP as of April 26, 2021) is OK
    const forceShim =
      (os === "ios" && userAgent.includes("Safari/604.1")) || // iOS 14.5 webview
      (os === "ios" && userAgent.includes("Safari/605.1")) || // iOS 14.5 webview (request desktop site)
      (browser === "safari" && versionMajor === 14 && versionMinor >= 1) || // Safari 14.1 on iOS and Mac
      (os === "ios" && userAgent.includes("UCBrowser"));

    if (!forceShim) {
      debug("Using native blob.stream()");
      return blob.stream();
    }
  }

  debug("Using shim blob.stream()");

  // Safari 14 and older
  return new ReadableStream(new BlobStreamSource(blob));
}

class BlobStreamSource {
  offset = 0;

  constructor(blob, chunkSize = 512 * 1024) {
    this.blob = blob;
    this.chunkSize = chunkSize;
  }

  pull(controller) {
    return new Promise((resolve, reject) => {
      const bytesLeft = this.blob.size - this.offset;
      if (bytesLeft <= 0) {
        controller.close();
        resolve();
        return;
      }

      const size = Math.min(this.chunkSize, bytesLeft);
      const blob = this.blob.slice(this.offset, this.offset + size);
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          controller.enqueue(new Uint8Array(reader.result));
          resolve();
        },
        { once: true }
      );
      reader.addEventListener("error", (event) => reject(reader.error), {
        once: true,
      });
      reader.readAsArrayBuffer(blob);
      this.offset += size;
    });
  }
}
