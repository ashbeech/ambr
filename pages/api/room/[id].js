/*
 * @dev
 *
 * Handler for web request that updates a room's data post-upload.
 *
 * • Request: Object of file's parameters, attached to a roomId for which to update the room configuration.
 *   - roomId: Room's unique identifer,
 *   - fileHash: true or false depending on whether minted or not,
 *   - sizeMb: Creator's 0x on-chain address,
 *   - multiFile: IPFS CID of the file uploaded,
 *   - encryptedTorrentFile: Transaction hash from minting,
 *
 * • Response: JSON object returning boolean state depending on whether the data save succeeded/failed.
 *
 */

// Import the PrismaClient class from the "@prisma/client" module.
const { PrismaClient } = require("@prisma/client");

// Create a new PrismaClient instance.
const prisma = new PrismaClient();

export default async function handler(request, response) {
  async function retrieveRecord(roomId) {
    //, userIdHash) {
    try {
      //console.log("userIdHash:", userIdHash);
      const room = await prisma.room.findUnique({
        where: { roomId },
      });
      /*       room.isUserMatch = false;
      if (room.idHash && userIdHash === room.idHash) {
        // Set the userIsMatch value in the room record
        room.isUserMatch = true; // Assuming userIsMatch is a boolean field
      } */
      if (!room) {
        throw new Error(`Room with id ${roomId} not found`);
      }
      return room;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find record");
    }
  }

  async function updateRecord(body, query) {
    // Create an array with the names of required fields.
    const requiredFields = ["sha1sum", "sizeMb", "multiFile"];

    // Check if each required field is present in the request body. If not, throw an error.
    for (const field of requiredFields) {
      if (body[field] == null) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }

    // Create an object with data to update the database.
    const data = {
      roomId: query.id,
      fileHash: body.sha1sum,
      sizeMb: body.sizeMb,
      multiFile: body.multiFile,
      encryptedTorrentFile: body.encryptedTorrentFile,
    };

    try {
      // Update the record in the database with the specified data and query.
      const record = await prisma.room.update({
        where: {
          roomId: query.id,
        },
        data,
      });

      // Log a message with the ID of the created record.
      //console.log(`Updated record with id: ${record.roomId}`);

      // Return the updated record.
      return record;
    } catch (error) {
      // If an error occurs, return the error message.
      throw new Error(`Failed to update record: ${error.message}`);
    }
  }

  try {
    let record;
    console.log("DEV DEBUG | [ID] BODY: ", request.body);
    console.log(
      "DEV DEBUG | ID, HASH: ",
      request.query.id,
      request.query.userIdHash
    );
    if (request.body.encryptedTorrentFile != null) {
      record = await updateRecord(request.body, request.query);
    } else if (request.query.userIdHash != null) {
      record = await retrieveRecord(request.query.id, request.query.userIdHash);
    } else {
      // Default to retrieving the record if no body is present.
      record = await retrieveRecord(request.query.id);
    }
    response.status(200).json(record);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
