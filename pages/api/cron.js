/*
 * @dev
 *
 * This script first retrieves the list of files in the B2 bucket using the listFileVersions method of the b2 object.
 * It then calculates the expiration date for files (e.g. 30 days ago) and creates an array of promises to delete expired files. For each file,
 * it checks if the uploadTimestamp property is before the expiration date and adds a promise to delete the file version with the specified ID using the deleteFileVersion method of the b2 object.
 * It then uses Promise.all to execute all the promises simultaneously and wait for them to resolve or reject.
 * Finally, it sends a JSON response with a success status.
 * 
 * // Example usage:
 * deleteExpiredFiles(b2Env, daysToExpire).then((result) => {
     console.log(result);
   }).catch((error) => {
    console.error(error);
   });
 *
 */
/* 
// import the 'B2' module from the 'backblaze-b2' library
import B2 from "backblaze-b2";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// Load the B2 credentials and environment variables from the .env file
const b2Env = {
  id: process.env.REACT_APP_B2_APP_KEY_ID,
  key: process.env.REACT_APP_B2_APP_KEY,
  bucket: process.env.REACT_APP_B2_DEV_NAME,
  bucketID: process.env.REACT_APP_B2_DEV_ID,
};

// Initialize the Backblaze B2 client using the provided credentials
const b2 = new B2({
  applicationKeyId: b2Env.id,
  applicationKey: b2Env.key,
});

// Function to delete expired files in a given room
async function deleteExpiredFiles(roomId) {
  try {
    // Construct the directory name for the room
    //const directoryName = `${room.roomId}/`;
    const directoryName = `${roomId}/`;

    // List all file versions in the B2 bucket that belong to the room directory
    const response = await b2.listFileVersions({
      bucketId: b2Env.bucketID,
      maxFileCount: 10000,
      prefix: directoryName,
    });

    // Extract the list of files from the API response
    const files = response.data.files;

    // Delete each expired file in the room using B2 API
    const promises = [];
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

    // Log the number of deleted files for the room
    console.log(`Deleted ${promises.length} expired files for room ${roomId}.`);
  } catch (err) {
    console.error(err);
  }
}

// API handler function
export default async function handler(req, res) {
  try {
    // Authorize the B2 client
    await b2.authorize();

    // Find all rooms that have expired files using Prisma
    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          {
            expiresAtTimestampMs: {
              lte: Date.now().toString(),
            },
          },
          {
            remainingDownloads: {
              lt: 1,
            },
          },
        ],
      },
    });

    // Delete expired files for each room using the deleteExpiredFiles function
    const promises = [];
    for (const room of rooms) {
      console.log("Room: ", room.roomId, room.expiresAtTimestampMs);
      promises.push(deleteExpiredFiles(room.roomId));
    }

    // Wait for all file deletion promises to complete
    await Promise.all(promises);

    // Return a success response
    res.json({ status: "success" });
  } catch (error) {
    console.error("Error deleting expired files:", error);
    res.json({ status: "error" });
  }
}
 */

import B2 from "backblaze-b2";
import { PrismaClient } from "@prisma/client";

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

// 1. Should fetch all expired
// 2. Should call b2 to delete files that are expired
// 3. Leave records un-deleted, unless mintState !== "Sealed"

// Function to check if a file exists
async function checkFileExists(bucketId, fileName) {
  return true;
  /* const { authorizationToken } = await b2.authorizeAccount();
  try {
    const response = await fetch(
      "https://api.backblazeb2.com/b2api/v2/b2_get_file_info",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authorizationToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: `${bucketId}_${fileName}`,
        }),
      }
    );

    if (response.status === 200) {
      return true; // File exists
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // File does not exist
    }
    throw error;
  } */
}

async function deleteExpiredFiles(roomId) {
  const directoryName = `${roomId}/`;

  let filesToDelete = [];
  let nextFileName = null;

  do {
    // This gets files matching the specific roomId
    const response = await b2.listFileVersions({
      bucketId: b2Env.bucketID,
      maxFileCount: 10000,
      startFileName: nextFileName,
      prefix: directoryName,
    });

    // Extract the list of files from the API response
    const files = response.data.files;

    for (const file of files) {
      const b2FileId = file.fileId;
      const fileName = file.fileName;
      const uploadTimestamp = file.uploadTimestamp;

      // Calculate expiration date (e.g., 1 day ago)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - 1);

      // If the uploadTimestamp is before the expiration date, add the file to the deletion list
      if (uploadTimestamp < expirationDate) {
        const fileExists = await checkFileExists(b2Env.bucketID, fileName);

        if (fileExists) {
          filesToDelete.push({
            fileId: b2FileId,
            fileName: fileName,
          });
        } else {
          console.log(`File not found: ${fileName}`);
        }
      }
    }

    nextFileName = response.data.nextFileName;
  } while (nextFileName);

  if (filesToDelete.length > 0) {
    // Delete expired files in batches
    const batchSize = 100;
    const totalBatches = Math.ceil(filesToDelete.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batch = filesToDelete.slice(i * batchSize, (i + 1) * batchSize);
      const deletePromises = batch.map(({ fileId, fileName }) =>
        b2.deleteFileVersion({
          fileId: fileId,
          fileName: fileName,
        })
      );
      await Promise.all(deletePromises);
    }

    console.log(
      `Deleted ${filesToDelete.length} expired files for room ${roomId}.`
    );
  }

  // Retry function to handle write conflicts
  const retry = async (fn, retries = 3, interval = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      console.log("Retrying transaction...");
      await new Promise((resolve) => setTimeout(resolve, interval));

      return retry(fn, retries - 1, interval);
    }
  };

  // Delete corresponding records in CockroachDB where mintState does NOT equal "Sealed"
  try {
    const deleteResult = await retry(async () => {
      return await prisma.room.deleteMany({
        where: {
          roomId: roomId,
          mintState: null,
        },
      });
    });

    const deletedCount = deleteResult.count;
    if (deletedCount > 0) {
      console.log(
        `Deletion Status: Deleted ${deletedCount} for room ${roomId}.`
      );
    } else {
      console.log(
        `Deletion Status: No records found to delete for room ${roomId}.`
      );
    }
  } catch (error) {
    console.error("Error deleting records from CockroachDB:", error);
  }
}

export default async function handler(req, res) {
  try {
    // Authorize the B2 client
    await b2.authorize();

    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          {
            expiresAtTimestampMs: {
              lte: Date.now().toString(),
            },
          },
          {
            remainingDownloads: {
              lt: 1,
            },
          },
          {
            key: null,
          },
        ],
      },
    });

    const promises = [];
    for (const room of rooms) {
      const expireStatus =
        room.expiresAtTimestampMs < Date.now() ? "expired" : "active";
      console.log(
        "Flagged for Deletion: ",
        room.roomId,
        room.mintState,
        expireStatus
      );
      promises.push(deleteExpiredFiles(room.roomId));
    }

    // Wait for all file deletion promises to complete
    await Promise.all(promises);

    // Return a success response
    res.json({ status: "success" });
  } catch (error) {
    console.error("Error deleting expired files:", error);
    res.json({ status: "error" });
  } finally {
    await prisma.$disconnect();
  }
}
