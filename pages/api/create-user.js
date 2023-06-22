import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import crypto from "crypto";

const encryption = process.env.REACT_APP_ENCRYPTION_SECRET;

function encryptEmail(email) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryption, "hex"),
    iv
  );
  let encrypted = cipher.update(email, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted;
}

export default async function handler(req, res) {
  const { email, idHash } = req.body;

  try {
    const encryptedEmail = encryptEmail(email);
    const user = await prisma.user.create({
      data: {
        email: encryptedEmail,
        idHash,
        fileTransfersRemaining: 5,
      },
    });
    //console.log("user created:", user);

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create user." });
  } finally {
    await prisma.$disconnect();
  }
}
