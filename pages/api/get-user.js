import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { makeHash } from "../../lib/make-hash.js";

const prisma = new PrismaClient();
const encryption = process.env.REACT_APP_ENCRYPTION_SECRET;

function decryptEmail(encryptedEmail) {
  const iv = Buffer.from(encryptedEmail.slice(0, 32), "hex");
  const encryptedText = encryptedEmail.slice(32);
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryption, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function idHashCheck(idHash, publicAddress) {
  // Convert publicAddress to hash to check against idHash
  const unHashedinput = makeHash(publicAddress);

  if (idHash === unHashedinput) {
    return true;
  } else {
    console.error("Check fail: idHash does not match publicAddress");
    return false;
  }
}

export default async function handler(req, res) {
  const {
    method,
    query: { idHash, publicAddress },
  } = req;

  if (method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { idHash },
    });

    if (!user) {
      return res.json({ user });
    }

    const userWithoutId = {
      ...user,
      id: parseInt(user.id),
      email: user.email ? decryptEmail(user.email) : null,
      publicAddress: idHashCheck(user.idHash, publicAddress)
        ? publicAddress
        : null,
    };

    return res.status(200).json(userWithoutId);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  } finally {
    await prisma.$disconnect();
  }
}
