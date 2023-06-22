import { openDB } from "idb";
import { fetcher } from "./fetcher.js";

const DB_NAME = "rooms";
const STORE_NAME = "rooms";

class RoomStorageManager {
  static storageInstance = null;

  constructor() {
    this.dbPromise = (async () => {
      let db;
      try {
        db = await openDB(DB_NAME, undefined, {
          upgrade: (db) => {
            const store = db.createObjectStore(STORE_NAME, {
              keyPath: ["publicAddress", "id"],
            });
            store.createIndex("publicAddressIndex", "publicAddress", {
              unique: false,
            });
            store.createIndex("idIndex", "id", {
              unique: true,
            });
          },
        });
      } catch (err) {
        throw new Error("Unable to open IndexedDB database: " + err.message);
      }

      return db;
    })();
  }

  static async getDBInstance() {
    if (!this.storageInstance) {
      this.storageInstance = new RoomStorageManager();
    }
    return this.storageInstance.dbPromise;
  }
}

export async function getRooms(_publicAddress) {
  const db = await RoomStorageManager.getDBInstance();
  if (!db) {
    throw new Error("Unable to get IndexedDB instance");
  }

  const index = db
    .transaction(STORE_NAME)
    .objectStore(STORE_NAME)
    .index("publicAddressIndex");
  if (!index) {
    console.error(
      `Index "publicAddressIndex" not found in object store "${STORE_NAME}"`
    );
    return [];
  }

  const range = IDBKeyRange.only(_publicAddress);
  try {
    return index.getAll(range);
  } catch (error) {
    console.error(
      `Error fetching rooms for public address "${_publicAddress}":`,
      error
    );
    throw error;
  }
}

export async function addOrReplaceRoom(room) {
  const db = await RoomStorageManager.getDBInstance();
  if (!db) {
    throw new Error("Unable to get IndexedDB instance");
  }

  await db.put(STORE_NAME, room);
}

/**
 * Removes a room from the database and deletes its corresponding file on B2.
 * @param {string} publicAddress The public address of the room.
 * @param {string} roomId The ID of the room to remove.
 */
export async function removeRoomById(publicAddress, roomId) {
  try {
    // Delete the room's file on B2.
    const { deletion } = await fetcher.post(
      `/api/room/${roomId}/b2/auth-delete`,
      {
        retry: true,
      }
    );

    // Log that the file has been deleted.
    //console.log(`File ${deletion} deleted successfully.`);
  } catch (error) {
    // Log the error and re-throw it.
    console.error(`Error deleting file: ${error}`);
    throw error;
  }

  try {
    // Get an instance of the IndexedDB database.
    const db = await RoomStorageManager.getDBInstance();
    if (!db) {
      throw new Error("Unable to get IndexedDB instance");
    }

    // Remove the room from the database.
    const key = [publicAddress, roomId];
    await db.delete(STORE_NAME, key);

    // Log that the room has been removed.
    //console.log(`Room ${roomId} removed successfully.`);
  } catch (error) {
    // Log the error and re-throw it.
    console.error("Error removing room:", error);
    throw error;
  }
}
