/*
 * @dev
 *
 * Handler for web request to derive the salt used in cryptographic function.
 *
 * • Request: Specified roomId for which to retrieve the room configuration.
 * • Response: JSON object returning room data from database.
 *
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export default async function handler(request, response) {
  async function retrieveRecord(roomId) {
    try {
      const room = await prisma.room.findUnique({
        where: { roomId },
        select: { salt: true },
      });
      return room.salt;
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
