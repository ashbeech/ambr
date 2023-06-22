import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Method not allowed." });
    return;
  }

  const id = parseInt(req.query.id);
  /*   console.log("UPDATE-USER QUERY: ", req.query);
  console.log("UPDATE-USER BODY: ", req.body);
  console.log("UPDATE-USER ID: ", id); */

  const { idHash, fileTransfersRemaining, ...rest } = req.body;

  if (!id || fileTransfersRemaining === null) {
    res
      .status(400)
      .json({ message: "No id or fileTransfersRemaining provided." });
    return;
  }

  if (!idHash) {
    res.status(400).json({ message: "No idHash provided." });
    return;
  }

  console.log("Updating User with… ", parseInt(fileTransfersRemaining));

  try {
    const user = await prisma.user.update({
      where: { idHash },
      data: {
        fileTransfersRemaining: parseInt(fileTransfersRemaining),
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  } finally {
    await prisma.$disconnect();
  }
}
