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
import crypto from "crypto";

const encryption = process.env.REACT_APP_ENCRYPTION_SECRET;

function encryptKey(key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryption, "hex"),
    iv
  );
  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted;
}

export default async function handler(request, response) {
  async function updateRoomStatus(id, data) {
    try {
      const { key, ...roomData } = data;
      const encryptedKey = encryptKey(key);
      const record = await prisma.room.upsert({
        where: { roomId: id },
        update: { ...roomData, key: encryptedKey },
        create: { ...roomData, roomId: id, key: encryptedKey },
      });
      console.log(`Updated record with id: ${record.roomId}`);
      return record;
    } catch (error) {
      console.error(`Failed to update room with id ${id}. Error: ${error}`);
      throw new Error("Failed to update record");
    }
  }

  try {
    if (
      request.query.id == null ||
      request.body.txHash == null ||
      request.body.cid == null ||
      request.body.idHash == null ||
      request.body.mintState == null
    ) {
      throw new Error("Missing required parameters");
    }
    const record = await updateRoomStatus(request.query.id, request.body);
    response.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error processing request. Error: ${error}`);
    response.status(500).json({ status: "Signing Failed: " + error.message });
  } finally {
    await prisma.$disconnect();
  }
}
