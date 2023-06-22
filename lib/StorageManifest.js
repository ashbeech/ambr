/* eslint-env browser */
import queueMicrotask from "queue-microtask";
import { openDB } from "idb";
import IdbChunkStore from "idb-chunk-store";
import MemoryChunkStore from "memory-chunk-store";
// import FoundationChunkStore from '../foundation-chunk-store/index.js'
import FsAccessChunkStore from "fs-access-chunk-store";
//import { captureException, captureMessage } from './sentry.js'
import { roundSizeAsMb } from "./analytics.js";
import { browserDetect } from "./browser-detect.js";

// HACK: access indexedDB early to prevent idb open from hanging in Safari.
// https://bugs.webkit.org/show_bug.cgi?id=226547
const idbHackRef = globalThis.indexedDB;

const OPEN_EXPIRATION_TIME_SECONDS = 60;
const STORAGE_FAILURE_EXPIRATION_SECONDS = 24 * 3600; // 1 day; use memory if there was a quota error since then
const EXTRA_FREE_SPACE = 100_000_000; // Try to leave this much free space

export class StorageManifest {
  dbPromise = null;
  openerId = null;
  refreshInterval = null;
  destroyed = false;
  memoryOnly = false;

  constructor() {
    try {
      // Used to detect if an entry is owned by the current tab
      // Generate a random hex string to identify this tab's ownership of entries
      const openerIdArray = new Uint8Array(16);
      crypto.getRandomValues(openerIdArray);
      this.openerId = Buffer.from(openerIdArray).toString("hex");

      // Check if indexedDB is available and create a DB
      if (!idbHackRef) {
        // HACK: this should not happen normally; it's just here to make sure idbHackRef
        // is used somewhere and not optimized out.
        // But if indexedDB is truly not present on globalThis, we fall back to memory
        // gracefully.
        //console.log("DEBUG: IndexedDB not available; falling back to memory");
        this.memoryOnly = true;
        return;
      }

      // Open the "storage-manifest" DB and create object stores
      this.dbPromise = (async () => {
        const db = await openDB("storage-manifest", undefined, {
          upgrade(db) {
            db.createObjectStore("stores", {
              keyPath: "name",
            });

            db.createObjectStore("failed-types", {
              keyPath: "type",
            });
          },
          blocked() {
            //console.log("DEBUG: StorageManifest open blocked");
            // Try to keep things working anyway
            this.memoryOnly = true; // fallback to memory if blocked
          },
          blocking() {
            //console.log("DEBUG: StorageManifest open blocking");
          },
          terminated() {
            // This event only fires on *unexpected* close, not when .close() is called
            // Don't know why this is happening, so log it
            //console.log("DEBUG: StorageManifest DB unexpectedly closed");
            this.memoryOnly = true; // fallback to memory if terminated unexpectedly
            if (this.refreshInterval != null) {
              clearInterval(this.refreshInterval);
              this.refreshInterval = null;
            }
          },
        });

        // Refresh the DB contents periodically and set refreshInterval
        this.refresh();
        this.refreshInterval = setInterval(
          () => this.refresh(),
          (OPEN_EXPIRATION_TIME_SECONDS / 2) * 1000
        );

        return db;
      })();
    } catch (error) {
      console.error(`Error creating StorageManifest: ${error.message}`);
      this.memoryOnly = true; // fallback to memory if there's an error
    }
  }

  async getChunkStore(desiredName, size, pieceLength, expirationTimestampMs) {
    if (this.destroyed) {
      throw new Error("already destroyed");
    }

    const {
      manifestEntryHandle: handle,
      recentFailure,
      browserReportedQuota: quota,
    } = await this.reserveSpace(
      desiredName,
      size,
      pieceLength,
      expirationTimestampMs
    );

    const { type } = handle;

    //console.log(`DEBUG: Using ${type} storage`);

    /*     logEvent("storage", {
      type,
      sizeMb: roundSizeAsMb(size),
      recentFailure,
      quotaMb: roundSizeAsMb(browserReportedQuota),
      memoryOnly: this.memoryOnly,
    });
 */

    const WrappedChunkStore = wrapChunkStore(
      {
        size,
        pieceLength,
      },
      handle
    );

    return {
      store: new WrappedChunkStore(),
      type,
      recentFailure,
      quotaMb: roundSizeAsMb(quota),
      memoryOnly: this.memoryOnly,
    };
  }

  async destroy() {
    if (this.destroyed) {
      throw new Error("already destroyed");
    }

    this.destroyed = true;

    if (!this.memoryOnly) {
      await this.runTransactionOnEntries(async (stores) => {
        for (const store of stores) {
          store.setInUse(null);
        }
      });

      const db = await this.dbPromise;
      try {
        await db.close();
      } catch (error) {
        console.error("Error closing the database:", error);
      }
    }

    clearInterval(this.refreshInterval ?? undefined);
  }

  async refresh() {
    await this.runTransactionOnEntries(async (entries) => {
      console.log("refreshing active stores");
      for (const entry of entries) {
        for (const opener of entry.data.openedBy) {
          if (opener.openerId === this.openerId) {
            opener.updatedAt = null; // entry.normalize() will fill in now
            entry.dirty = true;
          }
        }
      }
    });
  }

  async addFailedType(type) {
    if (this.destroyed) {
      throw new Error("already destroyed");
    }

    const db = await this.dbPromise;
    await db.put("failed-types", {
      type,
      failedAtTimestamp: Date.now(),
    });
  }

  async getFailedTypes() {
    const db = await this.dbPromise;
    return await db.getAll("failed-types");
  }

  async runTransactionOnEntries(transactionFn) {
    const db = await this.dbPromise;
    const transaction = db.transaction("stores", "readwrite");
    const promises = [transaction.done];

    const rawEntries = await transaction.store.getAll();
    const purgeableEntries = [];
    const liveEntries = [];

    for (const rawEntry of rawEntries) {
      const entry = new StoreManifestEntry(this, rawEntry, false);
      entry.normalize();
      if (entry.purgeable) {
        purgeableEntries.push(entry);
      } else {
        liveEntries.push(entry);
      }
    }

    try {
      await transactionFn(liveEntries, purgeableEntries);
    } catch (err) {
      transaction.done.catch(() => {});
      // User provided function failed, so abort
      try {
        transaction.abort();
      } catch {}
      throw err;
    }

    const toDelete = [];
    for (const entry of liveEntries.concat(purgeableEntries)) {
      entry.normalize();
      promises.push(entry.save(transaction.store));
      if (entry.purgeable) {
        toDelete.push(entry);
      }
    }

    // Wait for transaction to complete
    await Promise.all(promises);

    const deleted = [];
    for (const entry of toDelete) {
      try {
        await entry.destroyUnderlyingStore();
      } catch (err) {
        console.error(`Error destroying store: ${err.message}`);
        //captureException(err)
      }

      // Assume the store actually got deleted even if destroyUnderlyingStore threw
      // TODO: there may be cases where that's a bad assumption.
      // Let's watch for quota errors. Perhaps try a few times?
      deleted.push(entry);
    }

    if (deleted.length > 0) {
      const db = await this.dbPromise;
      const transaction = db.transaction("stores", "readwrite");

      await Promise.all([
        transaction.done,
        ...deleted.map((entry) => transaction.store.delete(entry.data.name)),
      ]);
    }
  }

  getChunkStoreType() {
    const { browser, os } = browserDetect();
    if (this.memoryOnly) {
      return "memory";
      // Disabled pending
      // } else if (typeof storageFoundation !== 'undefined') {
      //   return 'foundation'
    } else if (
      typeof navigator?.storage?.getDirectory === "function" &&
      // Do not use Safari's buggy File System Access implementation
      browser !== "safari" &&
      os !== "ios"
    ) {
      // 'webfs' is the old name, but keep it for compatibility
      // with existing manifests
      return "webfs";
    } else {
      return "indexeddb";
    }
  }

  async reserveSpace(name, size, pieceLength, expirationTimestampMs) {
    await this.dbPromise;

    // Attempt to reserve space in IndexedDB, but fall back to memory if there were recent storage failures
    let type = this.getChunkStoreType();
    let recentFailure = false;
    if (type !== "memory") {
      const now = Date.now();
      const failedTypes = await this.getFailedTypes();
      if (
        failedTypes.some(
          ({ failedAtTimestamp }) =>
            now - failedAtTimestamp < STORAGE_FAILURE_EXPIRATION_SECONDS * 1000
        )
      ) {
        //console.log("DEBUG: Recent storage failure reported; falling back to memory");
        type = "memory";
        recentFailure = true;
      }
    }

    if (type === "memory") {
      return {
        manifestEntryHandle: new StorageManifestEntryHandle(name, type, this),
        recentFailure,
        browserReportedQuota: null,
      };
    }

    // Try to estimate available storage quota and leave some free space
    let quota = 1_000_000_000;
    let browserReportedQuota = null;
    let browserReportedUsed = null;
    if (typeof navigator?.storage?.estimate === "function") {
      const { quota: estimateQuota, usage: estimateUsage } =
        await navigator.storage.estimate();

      //console.log(`DEBUG: browser reported storage quota: ${estimateQuota}`);
      //console.log(`DEBUG: browser reported storage used: ${estimateUsage}`);

      browserReportedQuota = estimateQuota;
      quota = estimateQuota - EXTRA_FREE_SPACE;
      browserReportedUsed = estimateUsage;
    }

    // Try to reserve space in IndexedDB by updating the store manifest
    await this.runTransactionOnEntries(async (liveEntries, deadEntries) => {
      let usedSize = liveEntries.reduce(
        (acc, entry) => acc + entry.data.size,
        0
      );
      let deadUsedSize = deadEntries.reduce(
        (acc, entry) => acc + entry.data.size,
        0
      );

      // Account for used space not tracked in the manifest (if available from the browser)
      if (
        browserReportedUsed != null &&
        browserReportedUsed > usedSize + deadUsedSize
      ) {
        const usedSpaceNotInManifest =
          browserReportedUsed - usedSize - deadUsedSize;
        usedSize += usedSpaceNotInManifest;
      }

      // If there isn't enough available space in the quota, delete expired entries
      if (usedSize + size > quota) {
        liveEntries.sort(
          (a, b) => a.data.expirationTimestampMs - b.data.expirationTimestampMs
        );

        for (const entry of liveEntries) {
          if (entry.data.openedBy.length === 0) {
            usedSize -= entry.data.size;
            entry.makePurgeable();

            if (usedSize + size <= quota) {
              break;
            }
          }
        }
      }

      // If there still isn't enough available space in the quota, fall back to memory
      if (usedSize + size > quota) {
        type = "memory";
        return;
      }

      // Add the new entry to the store manifest
      liveEntries.push(
        new StoreManifestEntry(this, {
          name,
          expirationTimestampMs,
          size,
          pieceLength,
          type,
          openedBy: [{ openerId: this.openerId, mode: "readwrite" }],
        })
      );
    });

    return {
      manifestEntryHandle: new StorageManifestEntryHandle(name, type, this),
      recentFailure,
      browserReportedQuota,
    };
  }
}

// A single entry in the manifest
class StoreManifestEntry {
  purgeable = false; // Should this be marked for deletion?

  constructor(manifest, data, dirty = true) {
    this.manifest = manifest;
    this.data = data; // Does this need to be written back to the DB?
    this.dirty = dirty;
  }

  /*
   * Cleans up expired openedBy, and marks this entry as deletable
   * if it is expired
   */
  normalize() {
    const now = Date.now();
    // Remove expired openedBy entries
    const openedBy = this.data.openedBy.filter((opener) => {
      // Fill in now for new entries
      if (opener.updatedAt == null) {
        this.dirty = true;
        opener.updatedAt = now;
        return true;
      }

      // Always keep our own
      if (opener.openerId === this.manifest.openerId) {
        return true;
      }

      // Keep others if they were updated recently
      return opener.updatedAt + OPEN_EXPIRATION_TIME_SECONDS * 1000 >= now;
    });

    const shouldDelete = this.data.expirationTimestampMs < now;
    if (shouldDelete) {
      this.data.openedBy = []; // Empty existing entries
      this.makePurgeable();
    } else if (this.data.openedBy.length !== openedBy.length) {
      this.dirty = true;
      this.data.openedBy = openedBy;
    }
  }

  /*
   * Sets this tab as using the store in the specified `mode`
   */
  setInUse(mode) {
    const openedBy = this.data.openedBy;

    const index = openedBy.findIndex(
      (opener) => opener.openerId === this.manifest.openerId
    );
    if (mode === null) {
      // Should remove if exists
      if (index !== -1) {
        // Remove unwanted entry
        openedBy.splice(index, 1);
        this.dirty = true;
      }
    } else if (mode === "readwrite" || mode === "readonly") {
      // Should add or update
      if (index !== -1 && openedBy[index].mode !== mode) {
        // Update existing entry
        openedBy[index].mode = mode;
        this.dirty = true;
      } else if (index === -1) {
        // Add new entry
        openedBy.push({
          openerId: this.manifest.openerId,
          mode: mode,
        });
        this.dirty = true;
      }
    } else {
      throw new Error(`Unexpected mode: ${mode}`);
    }
  }

  /*
   * Marks this entry as ready to delete
   */
  makePurgeable() {
    if (this.data.openedBy.length > 0) {
      throw new Error("Cannot makePurgeable while entry is in use");
    }

    this.purgeable = true;
    this.dirty = true;
    this.data.openedBy.push({
      openerId: this.manifest.openerId,
      mode: "readwrite",
    });
  }

  /*
   * Saves this entry if needed
   */
  async save(transactionStore) {
    if (this.dirty) {
      await transactionStore.put(this.data);
    }
  }

  /*
   * Frees underlying storage corresponding
   * to this entry
   */
  async destroyUnderlyingStore() {
    console.log(`Deleting store: ${this.data.name} of type: ${this.data.type}`);
    const ChunkStoreConstructor = constructors[this.data.type];

    // Construct the store just to destroy it
    const store = new ChunkStoreConstructor(this.data.pieceLength, {
      name: this.data.name,
    });
    await new Promise((resolve, reject) => {
      store.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    //console.log(`DEBUG: Finished deleting store: ${this.data.name} of type: ${this.data.type}`);
  }
}

// Handle used to update an entry from outside StorageManifest class
class StorageManifestEntryHandle {
  quotaExceededErrorFired = false;
  quotaExceededErrorRecorded = false;

  constructor(name, type, storageManifest) {
    this.name = name;
    this.type = type;
    this.storageManifest = storageManifest;
  }

  async onError(err) {
    if (!err.notFound) {
      console.error(`Store error: ${err.message}`);
      //captureException(err)
    }

    if (this.type === "memory") {
      return;
    }
    if (!isQuotaExceededError(err)) {
      return;
    }

    // Don't actually try to record the error yet, since storage is full.
    // Wait until the offending store is deleted first
    this.quotaExceededErrorFired = true;
  }

  async recordQuotaExceededError() {
    if (this.quotaExceededErrorFired && !this.quotaExceededErrorRecorded) {
      this.quotaExceededErrorRecorded = true;
      await this.storageManifest.addFailedType(this.type);
    }
  }

  async removeFromManifest() {
    if (this.type === "memory") {
      return;
    }

    await this.storageManifest.runTransactionOnEntries(async (entries) => {
      for (const [i, entry] of entries.entries()) {
        if (entry.data.name === this.name) {
          entries.splice(i, 1);
        }
      }
    });
  }

  // useType can be 'readwrite', 'readonly', null (unused)
  async setInUse(useType) {
    if (this.type === "memory") {
      return;
    }

    await this.storageManifest.runTransactionOnEntries(async (entries) => {
      for (const entry of entries) {
        if (entry.data.name === this.name) {
          entry.setInUse(useType);
          return;
        }
      }
    });
  }
}

export function isQuotaExceededError(err) {
  if (
    err instanceof globalThis.DOMException &&
    err.name === "QuotaExceededError"
  ) {
    return true;
  }

  // For Firefox
  if (err.name === "NS_ERROR_FILE_NO_DEVICE_SPACE") {
    return true;
  }

  return false;
}

const constructors = {
  // foundation: FoundationChunkStore,
  webfs: FsAccessChunkStore,
  indexeddb: IdbChunkStore,
  memory: MemoryChunkStore,
};

function wrapChunkStore(config, manifestEntryHandle) {
  const { size, pieceLength } = config;
  const { name, type } = manifestEntryHandle;

  const ChunkStoreConstructor = constructors[type];

  return class ChunkStoreWrapper extends ChunkStoreConstructor {
    _filled = false;

    constructor() {
      try {
        super(pieceLength, {
          length: size,
          name,
        });
      } catch (err) {
        manifestEntryHandle.onError(err);
        throw err;
      }
    }

    // Called to indicate that all writes are finished and the chunk store is usable from other tabs
    async onFilled() {
      if (!this._filled) {
        this._filled = true;

        // Foundation can only be used by one tab at once
        if (type !== "foundation") {
          await manifestEntryHandle.setInUse("readonly");
        }
      }
    }

    put(index, buf, cb = () => {}) {
      if (this._filled) {
        queueMicrotask(() => {
          cb(new Error("Already filled; store is read-only"));
        });
        return;
      }

      super.put(index, buf, (err) => {
        if (err) {
          manifestEntryHandle.onError(err);
        }

        cb(err);
      });
    }

    get(index, opts, cb) {
      if (!cb) {
        cb = opts;
        opts = undefined;
      }

      super.get(index, opts, (err, buf) => {
        if (err) {
          manifestEntryHandle.onError(err);
        }

        cb(err, buf);
      });
    }

    close(cb = () => {}) {
      super.close(async (err) => {
        if (err) {
          manifestEntryHandle.onError(err);
        }

        if (!manifestEntryHandle.quotaExceededErrorFired) {
          // This would fail if the quota is already exceeded
          await manifestEntryHandle.setInUse(null);
        }
        cb(err);
      });
    }

    destroy(cb = () => {}) {
      if (!this._filled || manifestEntryHandle.quotaExceededErrorFired) {
        // Not useable by other tabs; just destroy immediately
        super.destroy((err) => {
          // This needs to be delayed until after destroy to ensure there is space to record the error
          manifestEntryHandle.recordQuotaExceededError();
          if (err) {
            // It may be still using storage, so leave it in the manifest
            manifestEntryHandle.setInUse(null).then(() => cb(null), cb);
          } else {
            manifestEntryHandle.removeFromManifest().then(() => cb(null), cb);
          }
        });
      } else {
        // May already be in use elsewhere
        this.close(cb);
      }
    }
  };
}
