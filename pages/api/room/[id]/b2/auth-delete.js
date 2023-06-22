import B2 from "backblaze-b2";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const b2Env = {
  id: process.env.REACT_APP_B2_APP_KEY_ID,
  key: process.env.REACT_APP_B2_APP_KEY,
  bucket: process.env.REACT_APP_B2_DEV_NAME,
  bucketID: process.env.REACT_APP_B2_DEV_ID,
};

const b2 = new B2({
  applicationKeyId: b2Env.id,
  applicationKey: b2Env.key,
});

async function deleteFiles(roomId, idHash) {
  try {
    // Finally delete db record if files were deleted
    const deletedRoom = await prisma.room.delete({
      where: {
        roomId_idHash: {
          roomId: roomId,
          idHash: idHash,
        },
      },
    });

    if (!deletedRoom.roomId) {
      console.error(`No files found to delete for room ${roomId}.`);
      return null;
    } else {
      // List all file versions in the B2 bucket that belong to the room directory
      const response = await b2.listFileNames({
        bucketId: b2Env.bucketID,
        maxFileCount: 10000,
        prefix: `${roomId}/`,
      });

      // Extract the list of files from the API response
      const files = response.data.files;

      // Delete each file in the room using B2 API
      const promises = [];
      if (files.length > 0) {
        for (const file of files) {
          const b2FileId = file.fileId;
          const fileName = file.fileName;
          promises.push(
            b2.deleteFileVersion({
              fileId: b2FileId,
              fileName: fileName,
            })
          );
        }

        // Wait for all file deletion promises to complete
        await Promise.all(promises);
      } else {
        console.error(`No files found to delete for room ${roomId}.`);
        return null;
      }

      // Log that the room has been removed.
      console.log(
        `Deleted ${promises.length} file for room ${deletedRoom.roomId}.`
      );

      return deletedRoom.roomId;
    }
  } catch (error) {
    console.error(`Error deleting files for room ${roomId}: ${error}`);
    throw error;
  }
}

// API handler function
export default async function handler(req, res) {
  try {
    // Authorize the B2 client
    await b2.authorize();

    const { idHash, roomId } = req.query;

    console.log("roomId: ", roomId);
    console.log("idHash: ", idHash);

    if (!roomId || !idHash) {
      throw new Error("Room's ID or hash ID not provided");
    }

    const id = await deleteFiles(roomId, idHash);
    res.json({ status: "success", id: id });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
}
