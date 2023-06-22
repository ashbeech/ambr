/*
 * @dev
 *
 * Generates a Room's data incl. a random room ID, saving all to DB.
 *
 */

const { PrismaClient } = require("@prisma/client");
// Imports PrismaClient for interacting with the database
const prisma = new PrismaClient();
// Creates an instance of PrismaClient
const crypto = require("crypto");
// Imports the Node.js built-in crypto library

// This exports an async function called "handler" that accepts a request and a response object
export default async function handler(request, response) {
  // Defines an inner async function called "randomString" that generates a random string based on the length and characters provided
  async function randomString(length, chars) {
    // If the characters are undefined, throw an error
    if (!chars) {
      throw new Error("Argument 'chars' is undefined");
    }
    // If the length of the character array is greater than 256, throw an error
    const charsLength = chars.length;
    if (charsLength > 256) {
      throw new Error(
        "Argument 'chars' should not have more than 256 characters" +
          ", otherwise unpredictability will be broken"
      );
    }

    // Generates an array of random bytes and uses it to construct a string of random characters from the given characters
    const randomBytes = crypto.randomBytes(length);
    const res = new Array(length);

    let cursor = 0;
    for (let i = 0; i < length; i++) {
      cursor += randomBytes[i];
      res[i] = chars[cursor % charsLength];
    }

    return res.join("");
  }

  // Generate Room ID
  const id = await randomString(
    5,
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  );
  // Generates a room ID by calling the "randomString" function with the given length and character set

  //console.log("ID: ", id);

  // Sets the lifetime of the room to 86400 seconds (24 hours)
  const lifetime = 86400000;
  // Calculates the expiration timestamp by subtracting 86400000 ms (24 hours) from the current timestamp
  const expiresAtTimestampMs = new Date(Date.now() + lifetime).getTime();
  // Sets the maximum number of downloads for the room to 100
  const maxDownloads = 100;
  // Sets the remaining number of downloads for the room to 100
  const remainingDownloads = 100;

  const body = {
    id,
    expiresAtTimestampMs,
    maxDownloads,
    lifetime,
    remainingDownloads,
  };
  // Constructs an object containing the room ID, expiration timestamp, maximum downloads, lifetime, and remaining downloads

  // Defines an inner async function called "createRoom" that creates a new "Room" record in the database with the given data
  async function createRoom() {
    const newRoom = await prisma.room.create({
      data: {
        roomId: id,
        idHash: "",
        public: false,
        readerToken: request.body.readerToken,
        salt: request.body.salt,
        expiresAtTimestampMs: expiresAtTimestampMs.toString(),
        multiFile: false,
        maxDownloads: maxDownloads,
        lifetime: lifetime,
        remainingDownloads: remainingDownloads,
      },
    });
    // Saves the new room to the database using the Prisma client and logs a message to the console with the ID of the newly created room
    //console.log(`Created room with id: ${newRoom.roomId}`);
  }

  /* 
  
    roomId               String   @id @default(dbgenerated("substr(uuid_generate_v4()::text, 1, 5)")) @map(name: "room_id")
  key                  String?
  idHash               String?
  fileHash             String?
  title                String?
  public               Boolean?
  readerToken          String?
  salt                 String?
  expiresAtTimestampMs String?  @default(dbgenerated("cast(extract(epoch from now() + interval '1 day') * 1000 as string)"))
  maxDownloads         Int?     @default(100)
  lifetime             Int?     @default(86400)
  remainingDownloads   Int?     @default(100)
  encryptedTorrentFile String?
  sizeMb               Float?
  multiFile            Boolean?
  cloudState           String?
  mintState            String?
  cid                  String?
  txHash               String?
  
  */

  // Tries to create a new room using the "createRoom" function and sends a JSON response with a success message
  try {
    await createRoom();
    response.status(200).json(body);
  } catch (error) {
    console.error(error);
    // Catches any errors thrown during the room creation process and sends a JSON response with an error message
    response.status(500).json({ error: "Failed to create room" });
  } finally {
    // Ensures that the Prisma client is properly disconnected from the database after the request is handled
    await prisma.$disconnect();
  }
}
