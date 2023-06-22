/*
 * @dev
 *
 * Handler for web request that saves upload state.
 *
 * • Request: Object with upload state (AKA cloud state: "Uploaded" : "Upload Failed"), attached to roomId.
 * • Response: JSON object returning boolean state depending on whether save was succeeded/failed.
 *
 */

// Import PrismaClient from the "@prisma/client" package
const { PrismaClient } = require("@prisma/client");
// Initialize a new instance of PrismaClient
const prisma = new PrismaClient();

// Define an async function called "handler" that takes in "request" and "response" objects
export default async function handler(request, response) {
  // Determine cloudState based on the value of the "success" property in the request body
  const cloudState = request.body.success ? "Uploaded" : "Upload Failed";

  // Define an async function called "updateRoomStatus" that takes in a roomId and a cloudState
  async function updateRoomStatus(roomId, cloudState) {
    try {
      // Update the room with the specified roomId to the specified cloudState
      const record = await prisma.room.update({
        where: {
          roomId,
        },
        data: {
          cloudState,
        },
      });
      // Log a success message and return the updated record
      console.log(`Updated record with id: ${record.roomId}`);
      return record;
    } catch (error) {
      // Log an error message and throw an error
      console.error(`Failed to update room with id ${roomId}. Error: ${error}`);
      throw new Error("Failed to update record");
    }
  }

  try {
    // Input validation: Throw an error if the "id" property is missing from the query parameters
    if (!request.query.id) {
      throw new Error("Missing required parameter 'id'");
    }
    // Call the "updateRoomStatus" function with the roomId and cloudState and return the updated record
    const record = await updateRoomStatus(request.query.id, cloudState);
    response.status(200).json(record);
  } catch (error) {
    // Log an error message and return a 500 status code with the error message
    console.error(`Error processing request. Error: ${error}`);
    response.status(500).json({ error: error.message });
  } finally {
    // Disconnect the PrismaClient instance after the response has been sent
    await prisma.$disconnect();
  }
}
