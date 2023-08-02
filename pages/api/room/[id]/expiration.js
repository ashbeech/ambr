const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("ROOOM ID: ", req.query.id);
  console.log("ROOOM IDHASH: ", req.body);

  const roomId = req.query.id;
  const { idHash } = req.body;
  // Sets the lifetime of the room to 86400 seconds (24 hours) / 259200 seconds (72 hours)
  const lifetime = 259200000; //86400000;
  // Calculates the expiration timestamp by subtracting 86400000 ms (24 hours) / 259200000 ms (72 hours) from the current timestamp
  const expiresAtTimestampMs = new Date(Date.now() + lifetime).getTime();

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const room = await prisma.room.update({
      /*       where: {
        roomId,
      }, */
      where: {
        roomId_idHash: {
          roomId: roomId,
          idHash: idHash, // Replace with the actual idHash value for the room
        },
      },
      data: {
        expiresAtTimestampMs: expiresAtTimestampMs.toString(), // Set the timestamp to current date + lifetime
      },
    });

    if (room) {
      return res
        .status(200)
        .json({ message: `Updated expiration for room ${roomId}` });
    } else {
      console.error("Error updating expiration: Room not found");
      return res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    console.error("Error updating expiration:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
