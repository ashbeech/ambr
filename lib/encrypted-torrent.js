import {
  ChunkStoreReadStream,
  ChunkStoreWriteStream,
} from "chunk-store-stream";
import { EventEmitter } from "events";
import pify from "pify";
import { ReadableWebToNodeStream } from "readable-web-to-node-stream";
import { Transform } from "readable-stream";
import calcPieceLength from "piece-length";
import Debug from "debug";
import MultiStream from "multistream";
import nodeToWebStream from "readable-stream-node-to-web";
import parseTorrent from "parse-torrent";
import pump from "pump";
import WebTorrent from "webtorrent";

import { blobStream } from "./shims/blob-stream.js";
import { plaintextSize, encryptedSize } from "ambrkeys";

import { browserDetect } from "./browser-detect.js";
import { rtcConfig, wsUrl } from "../config.js";
import { B2ChunkStore } from "./b2-chunk-store.js";
import { ChunkStoreSeedConn } from "./chunk-store-seed-conn.js";
import { copyChunkStore } from "./copy-chunk-store";
import { StorageManifest, isQuotaExceededError } from "./StorageManifest.js";

let storageManifest = null;

const pumpAsync = pify(pump);

const debug = Debug("ambr:encrypted-torrent");

// Must add up to 1
const CREATE_PROGRESS_FRACTIONS = {
  fillStore: 0.67, // fillStore takes ~2/3 of the time
  createTorrent: 0.33, // createTorrent takes ~1/3 of the time
};

const MAX_MOBILE_MEMORY_BYTES = 500_000_000; // 500MB
const MAX_MOBILE_STORAGE_BYTES = 1_000_000_000; // 1GB

// TODO: More that 1 token slot results in sha1 sum overlaps
/* 
Example:

---

lastChunkIndex:  28
SHASUM 1:  0a9b643e66142917f07ef7f10b57b67c9506db7b
SHASUM 2:  b69e7c04bd22e63d548f395d2207e7c4a063c09b

SHASUM 1:  0a9b643e66142917f07ef7f10b57b67c9506db7b
SHASUM 2:  0a9b643e66142917f07ef7f10b57b67c9506db7b

---

This means that uploaded file folder is missing concurrent tokens when overlap occurs i.e.
4 is uploaded twice but token aligned with 3 is missing

Solution: is to map the uploaded file to the download index and not have the download index just assume it's concurrent;
actually use the file chunk index in b2 as guide… 🤔

*/

const MAX_UPLOAD_CONCURRENCY = 1;

export class EncryptedTorrent extends EventEmitter {
  torrent = null;
  destroyed = false;
  webSeedB2ChunkStore = null;
  downloadStarted = false;

  constructor(keychain, b2ChunkStoreOpts) {
    super();

    this.keychain = keychain;
    this.b2ChunkStoreOpts = b2ChunkStoreOpts;
    this.webtorrent = new WebTorrent({
      tracker: {
        rtcConfig,
      },
    });

    this.webtorrent.on("error", (err) => {
      if (isQuotaExceededError(err)) {
        err = new Error("Storage is full!");
      }

      this.destroy(err);
    });

    globalThis.webtorrent = this.webtorrent; // For debugging

    if (!storageManifest) {
      // Only one StorageManifest should exist
      storageManifest = new StorageManifest();

      window.addEventListener("pagehide", async () => {
        try {
          await storageManifest.destroy();
        } catch (err) {}
      });
    }
  }

  async loadTorrent(
    encryptedTorrentFile,
    roomId,
    expiresAtTimestampMs,
    waitForUpload
  ) {
    if (this.destroyed) throw new Error("EncryptedTorrent destroyed");

    const torrentFileArr = await this.keychain.decryptMeta(
      encryptedTorrentFile
    );
    const torrentFile = Buffer.from(torrentFileArr);

    if (this.destroyed) return;

    if (this.torrent) {
      throw new Error("Attempted to load a different torrent");
    }

    const parsedTorrent = parseTorrent(torrentFile);

    debug("Adding torrent");

    let { store, type: storeType } = await storageManifest.getChunkStore(
      roomId,
      parsedTorrent.length,
      parsedTorrent.pieceLength,
      expiresAtTimestampMs
    );

    if (this.destroyed) {
      store.destroy();
      return;
    }

    let storeLocalCopy = true;
    // Don't store a local copy if memory is likely to be an issue,
    // or if a lot of storage is needed on mobile/Safari
    if (
      (storeType === "memory" &&
        parsedTorrent.length > MAX_MOBILE_MEMORY_BYTES) ||
      parsedTorrent.length > MAX_MOBILE_STORAGE_BYTES
    ) {
      const { isMobile, browser } = browserDetect();

      if (isMobile || browser === "safari") {
        storeLocalCopy = false;
      }
    }
    //console.log(`storeLocalCopy: ${storeLocalCopy}`);

    let storeUsed = false;
    let uploadSuccess = null;
    if (!storeLocalCopy) {
      uploadSuccess = await waitForUpload();
      if (this.destroyed) {
        store.destroy();
        return;
      }

      if (uploadSuccess) {
        store.destroy();
        store = new B2ChunkStore(parsedTorrent.pieceLength, {
          ...this.b2ChunkStoreOpts,
          length: parsedTorrent.length,
        });
        storeUsed = true;

        this.torrent = this.webtorrent.add(
          {
            ...parsedTorrent,
            announce: [], // Disable all p2p
          },
          {
            preloadedStore: store,
            skipVerify: true,
          }
        );
      } else {
        // Upload failed. Need to try p2p
        storeLocalCopy = true;
      }
    }

    if (storeLocalCopy) {
      function GetChunkStore() {
        if (storeUsed) {
          throw new Error("Chunk store already constructed");
        }
        storeUsed = true;
        return store;
      }

      this.torrent = this.webtorrent.add(parsedTorrent, {
        store: GetChunkStore,
        storeCacheSlots: storeType === "memory" ? 0 : 20, // Max number of LRU entries
        destroyStoreOnDestroy: true,
      });
    }

    const onReady = () => {
      cleanupListeners();

      // Disable default torrent selection to prevent automatic downloading
      // until a file is explicitly selected.
      // See: https://github.com/webtorrent/webtorrent/issues/164#issuecomment-248395202
      this.torrent.deselect(0, this.torrent.pieces.length - 1, false);

      // TODO: call store.onFilled once the ENTIRE torrent is done
      // this.torrent.once('done', () => {
      //   store.onFilled()
      // })
    };

    const onError = (err) => {
      cleanupListeners();
      if (!storeUsed) {
        store.destroy();
      }
      this.destroy(err);
    };

    this.torrent.on("ready", onReady);
    this.torrent.on("error", onError);
    const cleanupListeners = () => {
      this.torrent.off("ready", onReady);
      this.torrent.off("error", onError);
    };

    if (uploadSuccess === null) {
      waitForUpload().then((success) => {
        if (success) {
          this.webSeedB2ChunkStore = new B2ChunkStore(
            this.torrent.pieceLength,
            {
              ...this.b2ChunkStoreOpts,
              length: this.torrent.length,
            }
          );

          // A download alrady started using p2p; add the web seed now.
          // Do this even if the download already finished, since this
          // will also increment the room download count as a side effect.
          if (this.downloadStarted) {
            this._addWebSeed();
          }
        }
      });
    }

    return {
      torrent: this.torrent,
    };
  }

  async decryptFile(file, opts = {}) {
    const offset = opts.offset ?? 0;
    const length = opts.length ?? file.length - offset;

    let stream;
    if (offset !== 0 || length !== file.length) {
      const { ranges, decrypt } = await this.keychain.decryptStreamRange(
        offset,
        length,
        file.encryptedFile.length
      );
      const streams = ranges.map((range) => {
        return nodeToWebStream(
          file.encryptedFile.createReadStream({
            start: range.offset,
            end: range.offset + range.length - 1, // end is inclusive in createReadStream opts
          })
        );
      });

      stream = decrypt(streams);
    } else {
      const encryptedStream = nodeToWebStream(
        file.encryptedFile.createReadStream()
      );
      stream = await this.keychain.decryptStream(encryptedStream);
    }

    this.downloadStarted = true;
    this._addWebSeed(); // Make sure the web seed is added (if b2 enabled)

    return stream;
  }

  async createTorrent(files, roomId, expiresAtTimestampMs) {
    if (this.destroyed) throw new Error("EncryptedTorrent destroyed");
    //console.time("createTorrent");

    const filesToSeed = [];
    let encryptedTorrentLength = 0;

    for (const file of files) {
      const encryptedFileLength = encryptedSize(file.length);
      encryptedTorrentLength += encryptedFileLength;

      const plaintextStream = blobStream(file.file);
      const encryptedStream = await this.keychain.encryptStream(
        plaintextStream
      );

      if (this.destroyed) return;

      const nodeStream = new ReadableWebToNodeStream(encryptedStream);

      filesToSeed.push({
        path: file.path,
        stream: nodeStream,
        length: encryptedFileLength,
      });
    }

    // Use 5MB as a minimum unless the full torrent size is less than that
    let minPieceLength = Math.min(5e6, encryptedTorrentLength);
    // Then round up to the nearest multiple of 16KiB
    minPieceLength = Math.ceil(minPieceLength / 16384) * 16384;

    const pieceLength = Math.max(
      calcPieceLength(encryptedTorrentLength),
      minPieceLength
    );

    const { store, type: storeType } = await storageManifest.getChunkStore(
      roomId,
      encryptedTorrentLength,
      pieceLength,
      expiresAtTimestampMs
    );

    if (this.destroyed) {
      store.destroy();
      return;
    }

    const inputMultistream = new MultiStream(
      filesToSeed.map(({ stream }) => stream)
    );

    let progress = 0;
    const encryptedTorrent = this;
    const progressMeterAndChecker = new Transform({
      transform(buf, encoding, cb) {
        if (encryptedTorrent.destroyed) {
          return cb(new Error("Encrypted torrent is destroyed"));
        }

        this.push(buf);
        progress += buf.length;

        const createProgress =
          CREATE_PROGRESS_FRACTIONS.fillStore *
          (progress / encryptedTorrentLength);
        const roundedProgress = createProgress.toFixed(2);
        encryptedTorrent.emit("createProgress", roundedProgress);

        /*         console.log(
          "PROGRESS OF TORRENT CREATION (ENCRYPTION): ",
          roundedProgress
        ); */

        cb();
      },
    });

    //console.time("createTorrent fill store");

    try {
      await pumpAsync(
        inputMultistream,
        progressMeterAndChecker,
        new ChunkStoreWriteStream(store, pieceLength)
      );
    } catch (err) {
      store.destroy();
      if (this.destroyed) return;

      if (isQuotaExceededError(err)) {
        throw new Error("Storage is full!");
      } else {
        throw err;
      }
    }

    if (this.destroyed) {
      store.destroy();
      return;
    }

    await store.onFilled();

    if (this.destroyed) {
      store.destroy();
      return;
    }

    //console.timeEnd("createTorrent fill store");

    let offset = 0;
    const inputs = filesToSeed.map(({ path, length }) => {
      // For every file, construct the appropriate input stream
      const stream = new ChunkStoreReadStream(store, pieceLength, {
        length,
        offset,
      });

      offset += length;

      stream.name = path;
      return stream;
    });

    let torrentName = "torrent";
    if (inputs.length === 1) {
      // Special handling for single-file case
      const path = inputs[0].name.split("/");
      // Use the name of the file to name the torrent
      torrentName = path[path.length - 1];
    }

    // Unique nonce to ensure infoHash and store name are nondeterministic
    const nonce = Buffer.from(
      globalThis.crypto.getRandomValues(new Uint8Array(16))
    ).toString("hex");

    //console.time("createTorrent seed");
    const newTorrent = this.webtorrent.seed(inputs, {
      pieceLength,
      announceList: [[wsUrl]],
      // announceList: [[]], // For testing backblaze
      preloadedStore: store,
      storeCacheSlots: storeType === "memory" ? 0 : 20, // Max number of LRU entries
      destroyStoreOnDestroy: true,
      filterJunkFiles: false,
      name: torrentName,
      private: true,
      info: {
        nonce,
      },
      onProgress: (bytesHashed) => {
        const createProgress =
          CREATE_PROGRESS_FRACTIONS.fillStore +
          CREATE_PROGRESS_FRACTIONS.createTorrent *
            (bytesHashed / encryptedTorrentLength);
        this.emit("createProgress", createProgress);
      },
    });

    await new Promise((resolve, reject) => {
      const onSeed = () => {
        cleanup();
        resolve();
      };
      const onError = (err) => {
        cleanup();
        reject(err);
      };

      newTorrent.on("seed", onSeed);
      newTorrent.on("error", onError);
      const cleanup = () => {
        newTorrent.off("seed", onSeed);
        newTorrent.off("error", onError);
      };
    });
    //console.timeEnd("createTorrent seed");

    if (this.destroyed) {
      return;
    }

    debug("Added torrent");
    this.torrent = newTorrent;

    const torrentFile = this.torrent.torrentFile;

    const encryptedTorrentFile = await this.keychain.encryptMeta(torrentFile);

    //console.timeEnd("createTorrent");

    if (this.destroyed) {
      return;
    }

    return {
      infoHash: this.torrent.infoHash,
      encryptedTorrentFile,
      torrent: this.torrent,
    };
  }

  get cloudSize() {
    if (!this.torrent) {
      throw new Error("Torrent does not exist");
    }

    return this.torrent.pieceLength * this.torrent.pieces.length;
  }

  get files() {
    if (!this.torrent) {
      return null;
    }

    return this.torrent.files.map((file) => ({
      ...file,
      path: file.path.replace(/^torrent\//, ""),
      progress: file.progress,
      length: plaintextSize(file.length),
      encryptedFile: file,
    }));
  }

  async cloudUpload() {
    if (!this.torrent) {
      throw new Error("Torrent does not exist");
    }

    console.time("cloudUpload");

    // Concurrency should never more than the total number of pieces
    const maxConcurrency = Math.min(
      MAX_UPLOAD_CONCURRENCY,
      this.torrent.pieces.length
    );

    debug(`Max upload concurrency: ${maxConcurrency}`);

    const b2ChunkStore = new B2ChunkStore(this.torrent.pieceLength, {
      ...this.b2ChunkStoreOpts,
      length: this.torrent.length,
      maxUploadConcurrency: maxConcurrency,
      // TODO: webtorrent should have a way to get piece hashes
      getSha1Hash: (index) => this.torrent?._hashes[index],
    });

    try {
      await copyChunkStore(
        this.torrent.store,
        b2ChunkStore,
        this.torrent.pieces.length,
        {
          maxConcurrency,
          onProgress: (progress) => this.emit("createProgress", progress),
        }
      );
    } finally {
      b2ChunkStore.close();
    }
    console.timeEnd("cloudUpload");
  }

  _addWebSeed() {
    if (this.webSeedB2ChunkStore) {
      const chunkStoreConn = new ChunkStoreSeedConn(
        this.webSeedB2ChunkStore,
        this.torrent
      );

      this.torrent.addWebSeed(chunkStoreConn);
    }
  }

  destroy(err) {
    if (this.destroyed) return;
    this.destroyed = true;

    debug("destroy");

    this.torrent = null;
    this.keychain = null;
    this.webSeedB2ChunkStore = null;

    if (this.webtorrent) {
      if (!this.webtorrent.destroyed) {
        this.webtorrent.destroy();
      }
      this.webtorrent = null;
    }

    if (err) {
      this.emit("error", err);
    }
  }
}
