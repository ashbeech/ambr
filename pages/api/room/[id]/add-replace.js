/*
 * @dev
 *
 * Handler for web request that updates a room's data post-mint.
 *
 * • Request: Object of mint parameters, attached to a roomId for which to retrieve the room configuration.
 *   - roomId: Room's unique identifer,
 *   - mintState: true or false depending on whether minted or not,
 *   - idHash: Creator's hashed 0x on-chain address,
 *   - cid: IPFS CID of the file uploaded,
 *   - txHash: Transaction hash from minting,
 *
 * • Response: JSON object returning boolean state depending on whether the data save succeeded/failed.
 *
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { roomId, ...data } = req.body;

  try {
    const updatedRoom = await prisma.room.upsert({
      where: { roomId },
      update: data,
      create: { roomId, ...data },
    });
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error(`Error processing request. Error: ${error}`);
    res.status(500).json({ status: "Signing Failed: " + error.message });
  } finally {
    await prisma.$disconnect();
  }
}
