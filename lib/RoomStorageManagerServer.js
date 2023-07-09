import { makeHash } from "./make-hash.js";
import { fetcher } from "./fetcher.js";

/**
 * Adds or updates a room in the database.
 * @param {Object} room The room object to add or update.
 * @returns {Promise<Object>} The added or updated room object.
 */

// TODO: This could be re-instated to be used in Room.js and then call mint-state/equivilent room-based prisma calleer from there
// That would make the room manger consitent with the rest of the codebase.

export async function addOrReplaceRoomServer(room) {
  try {
    const updatedRoom = await fetch(`/api/add-replace?room=${room}`);
    return updatedRoom;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getRoomsServer(publicAddress) {
  if (!publicAddress) return null;

  // Convert publicAddress to hash to match the record obscured at rest
  const idHash = makeHash(publicAddress);

  if (!idHash) return null;

  try {
    const response = await fetch(`/api/get-rooms?idHash=${idHash}`);
    const rooms = await response.json();
    console.log("Rooms:", rooms);
    return rooms;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Removes a room from the database and deletes its corresponding file on B2.
 * @param {string} publicAddress The public address of the room.
 * @param {string} roomId The ID of the room to remove.
 */
export async function removeRoomByIdServer(publicAddress, roomId) {
  if (!publicAddress || !roomId) return null;

  // Convert publicAddress to hash to match the record obscured at rest
  const idHash = makeHash(publicAddress);

  try {
    // Delete the room's file on B2.
    const deletion = await fetcher.post(
      `/api/room/${roomId}/b2/auth-delete?roomId=${roomId}&idHash=${idHash}`,
      {
        retry: true,
      }
    );

    if (deletion && deletion.status === "success") {
      // Log that the file has been deleted.
      //console.log(`File ${deletion.id} deleted successfully.`);
    } else {
      console.log(`No file to delete for room ${roomId}.`);
    }
  } catch (error) {
    // Log the error and re-throw it.
    console.error(`Error deleting file: ${error}`);
    throw error;
  }
}
