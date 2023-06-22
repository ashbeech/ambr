/*
 * @dev
 *
 * Serves as the handler for web request that retrieves all room data available from database.
 *
 * • Request: Specified roomId for which to retrieve the room configuration.
 * • Response: JSON object isolated to the cloud state true or false from database, based on upload status of that room's file.
 *
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export default async function handler(request, response) {
  async function retrieveRecord(roomId) {
    try {
      const room = await prisma.room.findUnique({
        where: { roomId },
      });
      if (!room) {
        throw new Error(`Room with id ${roomId} not found`);
      }
      return room;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find record");
    } finally {
      await prisma.$disconnect();
    }
  }

  try {
    const record = await retrieveRecord(request.query.id);
    response.status(200).json(record);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
