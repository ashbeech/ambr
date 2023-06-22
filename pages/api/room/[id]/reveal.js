import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const roomId = req.query.id;
  const isPublic = req.body.public; // <-- access isPublic value from req.body

  try {
    const updatedRoom = await prisma.room.update({
      where: {
        roomId: roomId,
      },
      data: {
        public: isPublic,
      },
    });
    res.status(200).json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: "Unable to update room" });
  }
}
