import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const encryption = process.env.REACT_APP_ENCRYPTION_SECRET;

function decryptKey(encryptedKey) {
  const iv = Buffer.from(encryptedKey.slice(0, 32), "hex");
  const encrypted = encryptedKey.slice(32);
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryption, "hex"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export default async function handler(req, res) {
  try {
    const { idHash } = req.query;
    if (!idHash) {
      res.status(400).json({ status: "idHash is missing" });
      return;
    }
    const rooms = await prisma.room.findMany({
      where: {
        idHash,
        NOT: {
          key: "",
        },
        mintState: "Sealed",
      },
      orderBy: {
        expiresAtTimestampMs: "desc",
      },
    });
    /*     const rooms = await prisma.room.findMany({
      where: {
        idHash,
        NOT: {
          key: "",
        },
        mintState: "Sealed",
      },
      include: {
        files: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }); */
    const decryptedRooms = rooms.map((room) => {
      return {
        ...room,
        key: decryptKey(room.key),
      };
    });
    res.status(200).json(decryptedRooms);
  } catch (error) {
    console.error(`Error fetching rooms: ${error}`);
    res.status(500).json({ status: "Error fetching rooms" });
  } finally {
    await prisma.$disconnect();
  }
}
