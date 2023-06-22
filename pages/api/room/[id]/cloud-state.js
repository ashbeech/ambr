/*
 * @dev
 *
 * Handler for web request to derive the cloud state to be true or false.
 *
 * • Request: Specified roomId for which to retrieve the room configuration.
 * • Response: JSON object isolated to the cloud state true or false from database, based on upload status of that room's file.
 *
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export default async function handler(request, response) {
  try {
    const record = await prisma.room.findUnique({
      where: { id: request.query.id },
      select: { cloudState: true },
    });
    response.status(200).json(record.cloudState);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
