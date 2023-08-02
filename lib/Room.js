import { basename } from "path";
import { EventEmitter } from "events";
import { isJunkPath } from "create-torrent";
import parseRange from "range-parser";
import prettyBytes from "pretty-bytes";
import reemit from "re-emitter";
import throttle from "throttleit";
import { Keychain, transformStream } from "ambrkeys";
import { roundSizeAsMb, logEvent } from "./analytics.js";
import { setEventContext } from "./event-context.js";
import { browserDetect } from "./browser-detect.js";
import { makeStreamSource } from "./service-worker-download.js";
import { fetcher } from "./fetcher.js";
import { EncryptedTorrent } from "./encrypted-torrent.js";
import { AmbrError } from "./errors.js";
import { makeZipStream } from "./make-zip-stream.js";
import { getMediaType } from "../lib/media-type.js";
import { hashFile } from "../lib/file-hash.js";
import { makeHash } from "../lib/make-hash.js";
import { NFTStorage, Blob } from "nft.storage";
import { ethers } from "ethers";
import contractABI from "../contracts/ambrABI.js";
import { getUser, updateUser } from "../lib/UserManager";

import {
  isProd,
  b2Config,
  maxRoomSize,
  origin,
  uploaderPingIntervalSeconds,
  ipfsGateway,
  defaultRoomLifetimeMs,
  //defaultMaxRoomDownloads,
} from "../config.js";
//import { JOIN_MODE } from "./Send.js";

// Poll remainingDownloads interval
const REMAINING_DOWNLOADS_POLL_INTERVAL_SECS = 120;

// Security headers – See server/util.js for an explanation
const DOWNLOAD_SECURITY_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "false",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Origin-Agent-Cluster": "?1",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "geolocation=(), camera=(), microphone=(), sync-xhr=(), interest-cohort=()",
  "Document-Policy": "document-write=?0",
  "Content-Security-Policy":
    "default-src 'none'; base-uri 'none'; frame-ancestors 'self'; form-action 'none';",
};

/*
 *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 * ░░░░░░░░░░░░░░░░░░  ROOM CLASS  ░░░░░░░░░░░░░░░░░░░░
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 *
 * Various state variables such as peerState, cloudState, chainState, and mintState.
 * The Room class also has properties for storing file data, download information, and metadata.
 * There are methods for returning the URL of the room, and for minting a file as an NFT.
 * The mint method takes in _finalMetadata and performs various operations such as setting the keychain property and updating the various state variables.
 * It then generates the file's corresponding NFT's various attributes such as Creators, Client, and Key Concept which are based on the form values passed in _form_values.
 *
 */
export class Room extends EventEmitter {
  // Idle, Active
  peerState = "Idle";
  // Preparing, Uploading, Uploaded, Upload-failed
  cloudState = "Preparing";
  // Idle, Active
  chainState = "Idle";
  // Preparing, Signing, Sealed, Mint-failed
  mintState = "Preparing";

  verifyState = null;

  destroyed = false;
  id = null;
  files = null;
  downloadStreamSource = null;
  downloadUrls = null;
  zipDownloadUrl = null;
  meta = null;

  // Internal
  encryptedTorrent = null;
  keychain = null;
  torrent = null;
  handleCreateProgress = null;
  handleCreateMintProgress = null;
  pollRemainingDownloadsInterval = null;
  pollUploaderPingInterval = null;

  downloadProgress = new Map();

  constructor() {
    super();
    //debug("constructor");
  }

  get url() {
    return this.id ? `/${this.id}#${this.keychain.keyB64}` : null;
  }

  //░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  //░░░░░░░░░░░░░░░  MINT FILE AS NFT  ░░░░░░░░░░░░░░░░░
  //░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

  async mint(_finalMetadata) {
    const roomMintMeta = _finalMetadata.roomMeta;
    const _form_values = _finalMetadata._form_values;
    const _publicAddress = _finalMetadata.creator;
    const hash = roomMintMeta.sha1sum ? roomMintMeta.sha1sum : null;

    if (this.destroyed) {
      throw new Error("Already destroyed");
    }
    const key = this.url.split("#")[1] || null;
    const url = this.url ? (origin + this.url).toString() : "";

    if (key == null) {
      throw new AmbrError("SECRET_KEY_INVALID", "The secret key is missing");
    }

    if (hash == null) {
      throw new AmbrError("HASH_INVALID", "The file's fingerprint is missing");
    }

    setEventContext("roomId", roomMintMeta.id);

    if (this.destroyed) return;

    try {
      this.keychain = new Keychain(key, roomMintMeta.salt);
    } catch (err) {
      throw new AmbrError(
        "SECRET_KEY_INVALID",
        "Invalid link: Key used is incorrect"
      );
    }

    this.chainState = "Active";
    this.emit("chainState", this.chainState);
    this._listenCreateMintProgress();

    const generateTitle = (files) => {
      let str = files[0].name;
      for (let i = 1; i < files.length; i++) {
        const f = files[i];
        if (str.length + f.name.length > 50) {
          str += ", ...";
          break;
        }
        str += `, ${f.name}`;
      }
      return str;
    };

    const title = generateTitle(this.meta.uploadFiles);

    // Public to client only
    const jsonDataPRIVATE = {
      id: roomMintMeta.id,
      fileHash: hash,
      contentLength: roomMintMeta.size,
      timestamp: Date.now(),
      expiresAtTimestampMs: roomMintMeta.expiresAtTimestampMs,
      lifetime: roomMintMeta.lifetime,
    };

    jsonDataPRIVATE.attributes = new Array();
    jsonDataPRIVATE.attributes.push(
      {
        trait_type: "Type",
        value: "Ambr Secured File Share",
      },
      {
        trait_type: "Title",
        value: title,
      }
    );

    // creators
    if (_form_values.creators.length > 0) {
      _form_values.creators.forEach((arr) => {
        jsonDataPRIVATE.attributes.push({
          trait_type: "Creators",
          value: arr.creator,
        });
      });
    }

    // client
    if (_form_values.client !== null || _form_values.client !== "") {
      jsonDataPRIVATE.attributes.push({
        trait_type: "Client",
        value: _form_values.client,
      });
    }

    // key concept
    if (_form_values.concept !== null || _form_values.concept !== "") {
      jsonDataPRIVATE.attributes.push({
        trait_type: "Key Concept",
        value: _form_values.concept,
      });
    }

    const emailto = new Array();

    // Check mode is set to email transfer, which is `true`
    if (_form_values.mode) {
      // Check emails are not empty, just incase
      if (_form_values.emails.every((address) => address.email !== "")) {
        // Add email address recipients to metadata
        _form_values.emails.forEach((address) => {
          jsonDataPRIVATE.attributes.push({
            trait_type: "Recipient",
            value: address.email,
          });
          emailto.push(address.email);
        });
      }
    }

    // Transform to private
    const buffer = Buffer.from(JSON.stringify(jsonDataPRIVATE));
    const encryptedMetadata = await this.keychain.encryptMeta(buffer);
    const metadata = {
      name: "Ambr encrypted metadata",
      data: encryptedMetadata,
    };
    const randomAmbr = _finalMetadata.stone
      ? _finalMetadata.stone
      : `/images/amber-${Math.floor(Math.random() * 7) + 1}.png`;
    const lifetime = roomMintMeta.lifetime;

    const jsonDataPUBLIC = JSON.stringify({
      id: roomMintMeta.id,
      public: false,
      name: `Ambr File ${roomMintMeta.id}`,
      creator: _publicAddress,
      fileName: `${roomMintMeta.id}/0`,
      fileHash: hash,
      salt: roomMintMeta.salt,
      readerToken: roomMintMeta.readerToken,
      timestamp: Date.now(),
      expiresAtTimestampMs: roomMintMeta.expiresAtTimestampMs,
      lifetime: lifetime,
      maxDownloads: roomMintMeta.maxDownloads,
      description:
        "This token holds a permentant, and encrypted record of a file shared via Ambr.link.",
      type: "Ambr — Share ideas worth protecting.",
      infoHash: roomMintMeta.infoHash,
      image: `${origin + randomAmbr}`,
      encryptedData: metadata,
      external_url: `${origin + roomMintMeta.id}`,
      attributes: [
        {
          trait_type: "Type",
          value: "Ambr Secured File [Encrypted]",
        },
      ],
    });

    let success = true;

    // Set up Ethereum provider and signer
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_RPC_URL
    );
    const privateKey = process.env.REACT_APP_ADMIN_PK;
    const wallet = new ethers.Wallet(privateKey, provider);

    // Set up NFT.storage client
    const apiKey = process.env.REACT_APP_NFTSTORAGE_TOKEN;
    const client = new NFTStorage({ token: apiKey });

    // Set up contract information
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    const _contractABI = contractABI;
    const contract = new ethers.Contract(contractAddress, _contractABI, wallet);

    // Must upload to IPFS first: Do this via nft.storage.
    // Set up metadata and upload to IPFS
    try {
      const blob = new Blob([jsonDataPUBLIC]);
      const cid = await client.storeBlob(blob);

      this._listenCreateMintProgress(); // Reset for mint progress
      this.mintState = "Signing";
      this.emit("mintState", this.mintState);
      //console.log(`Metadata uploaded with CID ${cid}`);
      const hashBytes20 = ethers.utils.arrayify("0x" + hash).slice(0, 20);
      // Get gas price estimate
      const gasPrice = await provider.getGasPrice();
      const gasUnits = await contract.estimateGas.issue(
        _publicAddress,
        cid,
        hashBytes20
      );
      const transactionFee = ethers.BigNumber.from(
        Math.round(gasPrice.mul(gasUnits) / 100000000000000)
      );
      console.log(`Transaction fee: ${transactionFee}`);
      // Send transaction to mint NFT with CID
      const tx = await contract.issue(_publicAddress, cid, hashBytes20, {
        gasPrice: !isProd
          ? "30000000000"
          : ethers.utils.parseUnits(transactionFee.toString(), "gwei"),
        gasLimit: 3000000,
      });
      console.log(`Transaction sent: ${tx.hash}`);

      // Convert publicAddress to hash to match the record obscured at rest
      const idHash = makeHash(_publicAddress);

      // Wait for transaction to be mined and get receipt
      const receipt = await tx.wait();
      if (receipt.status == 0) {
        this.mintState = "Signing Failed";
        throw new Error(`Transaction failed with status ${receipt.status}`);
      }
      //console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
      //console.log(`Transaction receipt:`, receipt);
      success = true;
      this.mintState = "Sealed";

      if (this.destroyed) return;

      // TODO: This saving of the key to the room record in the db, via the mint-state api endpoint,
      // was shoehorned into where it would best fit in existing framework code (here; below).
      // However, putting together a new endpoint room/[id]/something-appropriate.js or a diversion within an existing room endpoint like [id].js
      // to save the key where it's first generated for the room, or a more appropriate place in the code if applicable.
      // Also might just work how I have it now 🤷‍♂️

      try {
        await fetcher.post(`/api/room/${roomMintMeta.id}/mint-state`, {
          body: {
            title: title,
            mintState: success ? "Sealed" : "Signing Failed",
            key: key,
            idHash: idHash,
            cid: cid,
            txHash: tx.hash,
          },
          headers: {
            Authorization: await this.keychain.authHeader(),
          },
          retry: true,
        });
      } catch (err) {
        success = false;
        this.mintState = "Signing Failed";
        console.error("Failed to notify server of mint!", err);
      }
    } catch (error) {
      console.error(`Error minting NFT: ${error}`);
      success = false;
      this.mintState = "Signing Failed";
    }

    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    // Init email transfers if any
    if (
      (_form_values.mode && this.mintState !== "Signing Failed") ||
      (emailto[0] !== undefined &&
        isValidEmail(emailto[0]) &&
        this.mintState !== "Signing Failed")
    ) {
      console.log("Email to: ", emailto);

      // Email transfer option handler
      async function sendEmail(to, id, link, from) {
        if (!to || !id) return;
        try {
          await fetcher.post(`/api/room/${id}/mail`, {
            body: {
              to: to,
              from: from,
              subject: "You've Got a File",
              filename: _finalMetadata.roomMeta.uploadFiles[0].name
                ? _finalMetadata.roomMeta.uploadFiles[0].name
                : "No Name.pdf",
              size: prettyBytes(
                _finalMetadata.roomMeta.size ? _finalMetadata.roomMeta.size : 0
              ),
              time: _finalMetadata.roomMeta.expiresAtTimestampMs
                ? _finalMetadata.roomMeta.expiresAtTimestampMs
                : "100 days",
              link: link,
            },
            retry: false,
          });
        } catch (err) {
          console.error("Failed to send mail.", err);
        }
      }
      await sendEmail(emailto, roomMintMeta.id, url, _publicAddress);
    }

    // Emit mint state
    this.emit("mintState", this.mintState);
    // Change URL
    if (this.mintState === "Sealed") {
      this.emit("url", this.url);
    }

    if (_publicAddress) {
      // Convert publicAddress to hash to match the record obscured at rest
      const idHash = makeHash(_publicAddress);
      if (idHash) {
        try {
          // TODO: This getting user's file transfers remaining should be done on the backend
          // 1. Using the idHash here, call a backend endpoint. The updateUser is fine.
          // 2. Instead of passing the user.fileTransfersRemaining - 1 across the network, get user according to their idHash server-side
          // 3. Do this server-side: user.fileTransfersRemaining - 1. This will mean only insentive is NOT to trigger this event, but perhaps we also use a backend call from another api endpoint instead of this point in the Room.js process
          // 4. User should be updated in the backend and reflected in the transfers remaining.
          const user = await getUser(_publicAddress);
          //console.log("user: ", user);
          const updatedUser = await updateUser(user.id, {
            idHash: idHash,
            fileTransfersRemaining: user.fileTransfersRemaining - 1,
          });
          //console.log("updatedUser: ", updatedUser);
          //return updatedUser;
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  //░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  //░░░░░░░░░░░░░░░░░░  CREATE ROOM  ░░░░░░░░░░░░░░░░░░░
  //░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

  /*
   * --------------------
   * @dev: Create Func Overview
   *
   * Creates a new encrypted room and starts uploading files to it.
   * The function checks if the room has already been destroyed and throws an error if it has.
   * The function then initialises a new keychain object, processes the uploaded files, checks if there are any files, and if their total size is within the maximum room size.
   * The files' hash (SHA1) is then calculated and saved. The function then generates a reader token and salt, which are used to authenticate the client and access the room.
   * The function makes a post request to the server to create the room and retrieve its ID, lifetime, remaining downloads, and expiration time.
   * The function then starts polling the server, initializing the encrypted torrent, and creating the torrent file.
   * Finally, the metadata of the room and the uploaded files are saved and emitted to the client.
   * --------------------
   */

  async create(uploadFiles) {
    // If room is destroyed, throw an error
    if (this.destroyed) {
      throw new Error("Room already destroyed");
    }

    // Initialize keychain to prove permission to fetch room data
    /*
    Used to prove that the client has permission to fetch data for a room.
    Without a valid authentication token, the server will not return the
    encrypted room metadata or allow downloading the encrypted file data
    */
    this.keychain = new Keychain();

    // Process uploaded files
    const processedFiles = processFiles(uploadFiles);

    // If no files were processed, throw an error
    if (processedFiles.length === 0) {
      throw new AmbrError("ZERO_FILES", "Please choose a non-empty folder");
    }

    // Calculate size of processed files
    let size = 0;
    for (const file of processedFiles) size += file.length;

    // If size of processed files exceeds maximum room size, throw an error
    if (size > maxRoomSize) {
      console.error("ROOM_MAX_ROOM_SIZE");
      throw new AmbrError(
        "ROOM_MAX_ROOM_SIZE",
        `This file is ${prettyBytes(size)}. The maximum size is ${prettyBytes(
          maxRoomSize
        )}.`
      );
    }

    // Emit "files" event with processed files
    this.emit("files", processedFiles);

    // Initialize sha1sum to null
    let sha1sum = null;

    // Hash each file and increment the file counter
    const numberOfFiles = uploadFiles.length;
    let fileCounter = 0;
    for (const file of uploadFiles) {
      await hashFile(file, (hashedFile, hash) => {
        fileCounter++;
        if (fileCounter === numberOfFiles) {
          sha1sum = hash;
        }
      });
    }

    // Fetch reader token and salt from keychain
    const readerToken = await this.keychain.authTokenB64();
    const salt = this.keychain.saltB64;

    // Create room using reader token and salt
    const room = await fetcher.post("/api/room", {
      body: {
        readerToken: readerToken,
        salt: salt,
      },
      retry: false,
    });

    // If room is destroyed, return
    if (this.destroyed) return;

    // Destructure response data
    const {
      id,
      expiresAtTimestampMs,
      maxDownloads,
      lifetime,
      remainingDownloads,
    } = room;

    // Set event context and initialize room ID
    setEventContext("roomId", id);

    this.id = id;
    //console.log("THIS: ", String.fromCharCode.apply(null, this.keychain.key));
    //console.log("This url is 2: ", this.url);

    // TODO: Temporary setting of writer token
    this.keychain.setAuthToken("lHWOJ/y+297HoTRqldFndw==");

    // Start uploading process
    this._pollUploaderPing();

    // Initialize encrypted torrent with keychain, bucket name, path prefix, room ID, and authUpload
    this.encryptedTorrent = new EncryptedTorrent(this.keychain, {
      bucketName: b2Config.bucketName, // B2 bucket name
      pathPrefix: b2Config.pathPrefix, // B2 path prefix
      name: id, // Room ID
      authUpload: async (numTokens) =>
        await fetcher.post(`/api/room/${id}/b2/auth-upload`, {
          body: {
            numTokens, // Number of tokens to request
          },
          headers: {
            Authorization: await this.keychain.authHeader(),
          },
          retry: true,
        }),
    });
    // Listen to error events from the encryptedTorrent and re-emit them from this instance
    this._cleanupListeners = reemit(this.encryptedTorrent, this, ["error"]);

    // Start listening to the progress of creating a torrent
    this._listenCreateProgress();

    // Create a torrent using the processedFiles, id, and expiresAtTimestampMs
    const torrentInfo = await this.encryptedTorrent.createTorrent(
      processedFiles,
      id,
      expiresAtTimestampMs
    );

    // If this instance is destroyed, return immediately
    if (this.destroyed) return;

    // Extract the torrent information
    const { infoHash, encryptedTorrentFile, torrent } = torrentInfo;

    // If sha1sum is provided, continue with the processing
    if (sha1sum) {
      // Store the meta information in this instance
      this.meta = {
        id,
        expiresAtTimestampMs,
        lifetime,
        maxDownloads,
        numDownloadingPeers: 0,
        remainingDownloads,
        size,
        salt,
        readerToken,
        infoHash,
        uploadFiles,
        sha1sum,
      };

      // Emit the meta information
      this.emit("meta", this.meta);

      // Store the torrent and add listeners to it
      this.torrent = torrent;
      this._addTorrentListeners();
      this._initServiceWorkerDownloads();

      // Emit the files information
      this.emit("files", this._files);

      // Update the room configuration with the sha1sum, encryptedTorrentFile, and file size information
      await fetcher.patch(`/api/room/${id}`, {
        body: {
          sha1sum,
          encryptedTorrentFile:
            Buffer.from(encryptedTorrentFile).toString("base64"),
          multiFile: processedFiles.length > 1,
          sizeMb: roundSizeAsMb(size),
        },
        headers: {
          Authorization: await this.keychain.authHeader(),
        },
        retry: true,
      });

      // If this instance is destroyed, return immediately
      if (this.destroyed) return;

      // Update the torrent tracker to allow the infoHash
      torrent.discovery.tracker.update();

      // Set the peerState to "Active" and emit the event
      this.peerState = "Active";
      this.emit("peerState", "Active");

      // Reset the progress for creating the torrent
      this._listenCreateProgress();

      // Start polling the remaining downloads
      this._pollRemainingDownloads();

      // Set the initial success value to true
      let success = true;

      // If the encryptedTorrent's cloudSize is too big, skip the cloud upload
      if (this.encryptedTorrent.cloudSize > room.maxCloudSize) {
        success = false;
        console.error("Too big for cloud upload; skipping!");
      } else {
        // Set the cloudState to "Uploading" and emit the event
        this.cloudState = "Uploading";
        this.emit("cloudState", this.cloudState);

        try {
          // Try to upload to the cloud
          await this.encryptedTorrent.cloudUpload();
        } catch (err) {
          success = false;
          this.cloudState = "Upload Failed";
          console.error("Cloud upload failed!", err);
        }
      }

      // Check if the object has been destroyed
      if (this.destroyed) return;

      // Notify server of upload completion
      try {
        await fetcher.post(`/api/room/${id}/b2/finish-upload`, {
          body: {
            success,
          },
          headers: {
            Authorization: await this.keychain.authHeader(),
          },
          retry: true,
        });
      } catch (err) {
        // If server notification fails, set success to false
        success = false;
        this.cloudState = "Upload Failed";
        // Log error message
        console.error("Failed to notify server of upload completion!", err);
      }

      // Check if the object has been destroyed
      if (this.destroyed) return;

      // Set the cloudState based on the success of the upload
      this.cloudState = success ? "Uploaded" : "Upload Failed";

      // If the upload was successful, clear the pollUploaderPingInterval and set it to null
      if (success) {
        clearInterval(this.pollUploaderPingInterval);
        this.pollUploaderPingInterval = null;
      }
    } else {
      // If sha1 checksum is not provided, set cloudState to Upload Failed
      this.cloudState = "Upload Failed";
      // Log error message
      console.error("No sha1 checksum provided");
    }

    // Emit an event to update the cloudState
    this.emit("cloudState", this.cloudState);
  }

  //░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  //░░░░░░░░░░░░░░░░░░░  JOIN ROOM  ░░░░░░░░░░░░░░░░░░░░
  //░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

  // Initiating Room join from ID and key.
  async join(id, key) {
    if (this.destroyed) {
      throw new Error("Room already destroyed");
    }

    if (key == null) {
      throw new AmbrError("SECRET_KEY_INVALID", "The secret key is missing");
    }
    setEventContext("roomId", id);

    this.id = id;

    let roomLoaded = false;

    const salt = await fetcher.get(`/api/room/${id}/salt`, {
      retry: true,
    });

    if (this.destroyed) return;

    try {
      this.keychain = new Keychain(key, salt);
    } catch (err) {
      throw new AmbrError(
        "SECRET_KEY_INVALID",
        "Invalid link: Key used is incorrect"
      );
    }
    this.encryptedTorrent = new EncryptedTorrent(this.keychain, {
      bucketName: b2Config.bucketName,
      pathPrefix: b2Config.pathPrefix,
      name: id,
      authDownload: async () =>
        await fetcher.post(`/api/room/${id}/b2/auth-download`, {
          headers: {
            Authorization: await this.keychain.authHeader(),
            "Access-Control-Allow-Origin": "*",
          },
          retry: true,
        }),
    });
    this._cleanupListeners = reemit(this.encryptedTorrent, this, ["error"]);

    // eslint-disable-next-line no-unmodified-loop-condition
    while (true) {
      if (this.destroyed) return;
      let room;
      try {
        const response = await fetcher.get(`/api/room/${id}`, {
          headers: {
            Authorization: await this.keychain.authHeader(),
          },
          retry: true,
          raw: true,
        });

        // Access other properties of the response
        //console.log("Status:", response.res.status);

        // NOTE: This only works if fetcher call raw = true.
        if (response.res && response.res.ok) {
          // Handle the successful response; process the response data
          room = await response.body;
        } else {
          throw new AmbrError("SECRET_KEY_INVALID", "Not a valid link");
        }
      } catch (err) {
        throw new AmbrError("SECRET_KEY_INVALID", "Not a valid link");
      }

      if (this.destroyed) return;

      const {
        cloudState,
        encryptedTorrentFile,
        expiresAtTimestampMs,
        lifetime,
        maxDownloads,
        remainingDownloads,
        fileHash,
        cid,
        txHash,
        ["public"]: isPublic,
        idHash,
      } = room;

      if (cloudState !== this.cloudState) {
        this.cloudState = cloudState;
        this.emit("cloudState", this.cloudState);
      }

      if (room != null && cid != null) {
        async function getFileFromIPFS(_url) {
          return await fetch(_url, {
            method: "GET",
          })
            .then((res) => {
              return res.json();
            })
            .catch(() => {
              console.error("IPFS: Unable to fetch url");
            });
        }
        /* 
        console.log("cid: ", cid);
        console.log("ipfsGateway: ", ipfsGateway);
        console.log(`https://${cid}.ipfs.${ipfsGateway}`);
        */
        try {
          const IPFSdata = await getFileFromIPFS(
            `https://${cid}.ipfs.${ipfsGateway}` //ipfsFinal
          );

          /* 
          console.log("IMAAAAAGE: ", IPFSdata.image);

          const image_prefix_input = IPFSdata.image
            .replace(/[^\/]*$/, "")
            .slice(0, -1); // = ipfs://CID
          const image_prefix = image_prefix_input.replace("ipfs", "https"); // = https://CID
          const image_suffix = IPFSdata.image.replace(/^.*[\\\/]/, ""); // = amber.png
          const image_src = 
            image_prefix + ".ipfs." + "w3s.link" + "/" + image_suffix; */
          const image_src = IPFSdata.image;
          //console.log("image_src: ", image_src);

          let arr = Object.keys(IPFSdata.encryptedData.data).map(
            (k) => IPFSdata.encryptedData.data[k]
          );

          const decode3 = Buffer.from(arr);

          const dencryptedMetadata = await this.keychain.decryptMeta(decode3);
          const jsonStringDecoded =
            Buffer.from(dencryptedMetadata).toString("utf8");
          const processMetadata = JSON.parse(jsonStringDecoded);
          let readableMetadata = {};

          for (let i = 0; i < processMetadata.attributes.length; i++) {
            if (processMetadata.attributes[i].trait_type == "Title") {
              readableMetadata["title"] = processMetadata.attributes[i].value;
            }
            if (processMetadata.attributes[i].trait_type == "Creators") {
              if (readableMetadata["creators"] == null) {
                readableMetadata["creators"] = [];
              }
              let creator = processMetadata.attributes[i].value;
              readableMetadata["creators"].push(creator);
            }
            if (processMetadata.attributes[i].trait_type == "Key Concept") {
              readableMetadata["key_concept"] =
                processMetadata.attributes[i].value;
            }
            if (processMetadata.attributes[i].trait_type == "Client") {
              readableMetadata["client"] = processMetadata.attributes[i].value;
            }
            if (processMetadata.attributes[i].trait_type == "Recipient") {
              if (readableMetadata["recipients"] == null) {
                readableMetadata["recipients"] = [];
              }
              let email = processMetadata.attributes[i].value;
              readableMetadata["recipients"].push(email);
            }
          }

          if (processMetadata.fileHash != null) {
            readableMetadata["fileHash"] = processMetadata.fileHash;
          }
          if (processMetadata.timestamp != null) {
            readableMetadata["timestamp"] = processMetadata.timestamp;
          }
          if (processMetadata.timestamp != null) {
            readableMetadata["timestamp"] = processMetadata.timestamp;
          }
          //console.log("Unprocessed Metadata: ", processMetadata);
          //console.log("Decrypted Metadata: ", readableMetadata);

          if (!roomLoaded) {
            roomLoaded = true;
            this.meta = {
              id,
              isPublic,
              expiresAtTimestampMs,
              lifetime,
              maxDownloads,
              numDownloadingPeers: 0,
              remainingDownloads,
              readableMetadata,
              fileHash,
              cid,
              txHash,
              image_src,
              idHash,
            };

            //console.log("JOINED AND THIS IS ROOM: ", room);
            //console.log("JOINED AND THIS IS ROOM META: ", this.meta);

            this.emit("meta", this.meta);
          }
        } catch (err) {
          console.error("Room | Failed to read encrypted metadata.", err);
        }
      }

      if (encryptedTorrentFile && this.encryptedTorrent) {
        const torrentInfo = await this.encryptedTorrent.loadTorrent(
          Buffer.from(encryptedTorrentFile, "base64"),
          id,
          expiresAtTimestampMs,
          this._waitForUpload.bind(this)
        );

        if (this.destroyed) return;

        // If this.destroyed is true, torrentInfo will be nullish
        this.torrent = torrentInfo.torrent;

        this._addTorrentListeners();
        // This maybe somewhat of a hack for now, but to explain,
        // if a user joins an expired room, the service worker will load a stream that is defunct
        // in that, if a user re-uploads a file it isn't populating the download stream correctly.
        // So the solution is to:
        // 1. Check the expiresAtTimestampMs of the room; if expired then don't init download-stream, as there is nothing to download anyway
        // 2. Delay that same _initServiceWorkerDownloads until the user re-uploads.
        // There may be a way to do this in the service worker but I haven't explored yet.
        if (expiresAtTimestampMs > Date.now()) {
          this._initServiceWorkerDownloads();
        }

        this.emit("files", this._files);

        this.peerState = "Active";
        this.emit("peerState", this.peerState);

        break;
      } else {
        console.error("encryptedTorrent: ", this.encryptedTorrent);
      }

      // Poll every 5 seconds if the torrent file isn't available
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
    }

    this._pollRemainingDownloads();
  }

  //░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  //░░░░░░░░░░░░░░░░░░  VERIFY ROOM  ░░░░░░░░░░░░░░░░░░░
  //░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

  async verify(uploadFiles, sha1, id, key, idHash) {
    this.verifyState = "Verifying";
    this.emit("verifyState", this.verifyState);

    //console.log("VERIFYING ROOM: ", sha1, id, key, idHash);
    // Hash each file and increment the file counter
    const numberOfFiles = uploadFiles.length;
    let fileCounter = 0;
    let sha1sum = "";

    for (const file of uploadFiles) {
      // Asynchronously hash the current file
      await hashFile(file, (hashedFile, hash) => {
        // Increment the file counter
        fileCounter++;
        // Append the hash to the SHA1 sum
        sha1sum += hash;

        //console.log("SHA1SUM: ", sha1sum);
        //console.log("SHA1: ", sha1);

        // Check if all files have been hashed
        if (fileCounter === numberOfFiles) {
          // Compare the calculated SHA1 sum with the provided SHA1
          if (sha1 !== sha1sum) {
            // The file does not match the original
            this.verifyState = "Unverified";
            this.emit("verifyState", this.verifyState);
          } else {
            // The file matches the original
            this.verifyState = "Verified";
            //console.log("VERIFY IDHASH 1: ", idHash);
            //this.emit("mode", JOIN_MODE);

            this._reUpload(id, key, uploadFiles, idHash);
          }
        }
      });
    }

    // If room is destroyed, return
    if (this.destroyed) return;
  }

  async _reUpload(id, key, uploadFiles, idHash) {
    // If room is destroyed, throw an error
    if (this.destroyed) {
      throw new Error("Room already destroyed");
    }

    // Set event context and initialize room ID from function parameter
    setEventContext("roomId", id);
    this.id = id;

    const salt = await fetcher.get(`/api/room/${id}/salt`, {
      retry: true,
    });

    if (this.destroyed) return;

    try {
      this.keychain = new Keychain(key, salt);
    } catch (err) {
      throw new AmbrError(
        "SECRET_KEY_INVALID",
        "Invalid link: Key used is incorrect"
      );
    }
    // Process uploaded files
    const processedFiles = processFiles(uploadFiles);

    // If no files were processed, throw an error
    if (processedFiles.length === 0) {
      throw new AmbrError("ZERO_FILES", "Please choose a non-empty folder");
    }

    // Calculate size of processed files
    let size = 0;
    for (const file of processedFiles) size += file.length;

    // If size of processed files exceeds maximum room size, throw an error
    if (size > maxRoomSize) {
      console.error("ROOM_MAX_ROOM_SIZE");
      throw new AmbrError(
        "ROOM_MAX_ROOM_SIZE",
        `This file is ${prettyBytes(size)}. The maximum size is ${prettyBytes(
          maxRoomSize
        )}.`
      );
    }

    // Emit "files" event with processed files
    this.emit("files", processedFiles);

    // Initialize sha1sum to null
    let sha1sum = null;

    // Hash each file and increment the file counter
    const numberOfFiles = uploadFiles.length;
    let fileCounter = 0;
    for (const file of uploadFiles) {
      await hashFile(file, (hashedFile, hash) => {
        fileCounter++;
        if (fileCounter === numberOfFiles) {
          sha1sum = hash;
        }
      });
    }

    // If room is destroyed, return
    if (this.destroyed) return;

    // Set event context and initialize room ID
    setEventContext("roomId", id);

    this.id = id;

    // TODO: Temporary setting of writer token
    this.keychain.setAuthToken("lHWOJ/y+297HoTRqldFndw==");

    // Start uploading process
    this._pollUploaderPing();

    // Initialize encrypted torrent with keychain, bucket name, path prefix, room ID, and authUpload
    this.encryptedTorrent = new EncryptedTorrent(this.keychain, {
      bucketName: b2Config.bucketName, // B2 bucket name
      pathPrefix: b2Config.pathPrefix, // B2 path prefix
      name: id, // Room ID
      authUpload: async (numTokens) =>
        await fetcher.post(`/api/room/${id}/b2/auth-upload`, {
          body: {
            numTokens, // Number of tokens to request
          },
          headers: {
            Authorization: await this.keychain.authHeader(),
          },
          retry: true,
        }),
    });
    // Listen to error events from the encryptedTorrent and re-emit them from this instance
    this._cleanupListeners = reemit(this.encryptedTorrent, this, ["error"]);

    // Start listening to the progress of creating a torrent
    this._listenCreateProgress();

    // Calculates the expiration timestamp by subtracting 86400000 ms (24 hours) from the current timestamp
    const expiresAtTimestampMs = new Date(
      Date.now() + defaultRoomLifetimeMs
    ).getTime();

    // Create a torrent using the processedFiles, id, and expiresAtTimestampMs
    const torrentInfo = await this.encryptedTorrent.createTorrent(
      processedFiles,
      id,
      expiresAtTimestampMs
    );

    // If this instance is destroyed, return immediately
    if (this.destroyed) return;

    // Extract the torrent information
    const { infoHash, encryptedTorrentFile, torrent } = torrentInfo;

    // If sha1sum is provided, continue with the processing
    if (sha1sum) {
      // Store the torrent and add listeners to it
      this.torrent = torrent;
      this._addTorrentListeners();
      this._initServiceWorkerDownloads();

      // Emit the files information
      this.emit("files", this._files);

      // Update the room configuration with the sha1sum, encryptedTorrentFile, and file size information
      await fetcher.patch(`/api/room/${id}`, {
        body: {
          sha1sum,
          encryptedTorrentFile:
            Buffer.from(encryptedTorrentFile).toString("base64"),
          multiFile: processedFiles.length > 1,
          sizeMb: roundSizeAsMb(size),
        },
        headers: {
          Authorization: await this.keychain.authHeader(),
        },
        retry: true,
      });

      // If this instance is destroyed, return immediately
      if (this.destroyed) return;

      // Update the torrent tracker to allow the infoHash
      torrent.discovery.tracker.update();

      // Set the peerState to "Active" and emit the event
      this.peerState = "Active";
      this.emit("peerState", "Active");

      // Reset the progress for creating the torrent
      this._listenCreateProgress();

      // Start polling the remaining downloads
      this._pollRemainingDownloads();

      // Set the initial success value to true
      let success = true;

      // If the encryptedTorrent's cloudSize is too big, skip the cloud upload
      // TODO: Insert maximum cloud upload size check

      // Set the cloudState to "Uploading" and emit the event
      this.cloudState = "Uploading";
      this.emit("cloudState", this.cloudState);

      try {
        // Try to upload to the cloud
        await this.encryptedTorrent.cloudUpload();
      } catch (err) {
        success = false;
        this.cloudState = "Upload Failed";
        console.error("Cloud upload failed!", err);
      }

      // Check if the object has been destroyed
      if (this.destroyed) return;

      // Notify server of upload completion
      try {
        await fetcher.post(`/api/room/${id}/b2/finish-upload`, {
          body: {
            success,
          },
          headers: {
            Authorization: await this.keychain.authHeader(),
          },
          retry: true,
        });
      } catch (err) {
        // If server notification fails, set success to false
        success = false;
        this.cloudState = "Upload Failed";
        // Log error message
        console.error("Failed to notify server of upload completion!", err);
      }

      // Check if the object has been destroyed
      if (this.destroyed) return;

      // Set the cloudState based on the success of the upload
      this.cloudState = success ? "Uploaded" : "Upload Failed";

      // If the upload was successful, clear the pollUploaderPingInterval and set it to null
      if (success) {
        clearInterval(this.pollUploaderPingInterval);
        this.pollUploaderPingInterval = null;

        try {
          const response = await fetcher.patch(
            `/api/room/${this.id}/expiration`,
            {
              body: { idHash },
              headers: {
                Authorization: await this.keychain.authHeader(),
              },
              raw: true,
              retry: true,
            }
          );

          //console.log("RAW RES: ", response);

          if (response.res.ok) {
            //console.log(`Message: ${response.body.message}`);

            // Emit result of verification
            //console.log("EMIT: ", this.verifyState);
            this.emit("verifyState", this.verifyState);

            /*             if (this.destroyed) {
              throw new Error("Room already destroyed");
            }
 */
            /* 
            this.encryptedTorrent = new EncryptedTorrent(this.keychain, {
              bucketName: b2Config.bucketName,
              pathPrefix: b2Config.pathPrefix,
              name: id,
              authDownload: async () =>
                await fetcher.post(`/api/room/${id}/b2/auth-download`, {
                  headers: {
                    Authorization: await this.keychain.authHeader(),
                    "Access-Control-Allow-Origin": "*",
                  },
                  retry: true,
                }),
            });
            this._cleanupListeners = reemit(this.encryptedTorrent, this, [
              "error",
            ]);

            // eslint-disable-next-line no-unmodified-loop-condition
            while (true) {
              if (this.destroyed) return;
              let room;
              try {
                const response = await fetcher.get(`/api/room/${id}`, {
                  headers: {
                    Authorization: await this.keychain.authHeader(),
                  },
                  retry: true,
                  raw: true,
                });

                // Access other properties of the response
                //console.log("Status:", response.res.status);

                // NOTE: This only works if fetcher call raw = true.
                if (response.res && response.res.ok) {
                  // Handle the successful response; process the response data
                  room = await response.body;
                } else {
                  throw new AmbrError("SECRET_KEY_INVALID", "Not a valid link");
                }
              } catch (err) {
                throw new AmbrError("SECRET_KEY_INVALID", "Not a valid link");
              }

              if (this.destroyed) return;

              if (encryptedTorrentFile && this.encryptedTorrent) {
                console.log("GOYT TO THE END 1");

                const torrentInfo = await this.encryptedTorrent.loadTorrent(
                  Buffer.from(encryptedTorrentFile, "base64"),
                  id,
                  expiresAtTimestampMs,
                  this._waitForUpload.bind(this)
                );

                if (this.destroyed) return;

                // If this.destroyed is true, torrentInfo will be nullish
                this.torrent = torrentInfo.torrent;

                this._addTorrentListeners();
                this._initServiceWorkerDownloads();

                this.emit("files", this._files);

                this.peerState = "Active";
                this.emit("peerState", this.peerState);

                console.log("GOYT TO THE END 3");

                break;
              } else {
                console.error("encryptedTorrent: ", this.encryptedTorrent);
              }

              // Poll every 5 seconds if the torrent file isn't available
              await new Promise((resolve) => {
                setTimeout(resolve, 5000);
              });
            }

            this._pollRemainingDownloads();

            console.log("GOYT TO THE END 2");

            this.emit("mode", JOIN_MODE);

            // Check if the service worker is registered
            //if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then(function (registration) {
              // Trigger the install event manually
              registration.dispatchEvent(new Event("install"));
            });
            //}
 */
            //const data = await response.json();
            //return data; // Return the response data
          } else {
            console.error("Error updating expiration:", response.statusText);
            //return null; // Return null in case of an error
          }
        } catch (error) {
          console.error("Error updating expiration:", error);
          //return null; // Return null in case of an error
        }
      }
    } else {
      // If sha1 checksum is not provided, set cloudState to Upload Failed
      this.cloudState = "Upload Failed";
      // Log error message
      console.error("No sha1 checksum provided");
    }

    // Emit an event to update the cloudState
    this.emit("cloudState", this.cloudState);
  }

  async _waitForUpload() {
    while (true) {
      if (this.destroyed) return false;

      if (this.cloudState === "Uploaded") {
        return true;
      } else if (
        this.cloudState === "Upload Failed" ||
        this.cloudState === null
      ) {
        return false;
      }

      // Poll every 5 seconds if the cloud download isn't ready
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });

      if (this.destroyed) return false;

      try {
        const { cloudState } = await fetcher.get(
          `/api/room/${this.id}/cloud-state`,
          {
            headers: {
              Authorization: await this.keychain.authHeader(),
            },
            retry: true,
          }
        );
        this.cloudState = cloudState;
      } catch (err) {
        const status = err.res?.status;
        if (status >= 400 && status <= 499) {
          // API error; don't retry
          this.cloudState = "Upload Failed";
        }
      }
    }
  }

  _pollRemainingDownloads() {
    if (this.pollRemainingDownloadsInterval) {
      return;
    }

    this.pollRemainingDownloadsInterval = setInterval(async () => {
      const { remainingDownloads } = await fetcher.get(
        `/api/room/${this.id}/remaining-downloads`,
        {
          headers: {
            Authorization: await this.keychain.authHeader(),
          },
          retry: true,
        }
      );

      if (this.destroyed) return;

      if (
        this.meta != null &&
        remainingDownloads != null &&
        remainingDownloads !== this.meta.remainingDownloads
      ) {
        this.meta.remainingDownloads = remainingDownloads;
        //debug(`remainingDownloads changed to ${this.meta.remainingDownloads}`);
        this.emit("meta", { ...this.meta });
      }

      if (remainingDownloads === 0) {
        clearInterval(this.pollRemainingDownloadsInterval);
        this.pollRemainingDownloadsInterval = null;
      }
    }, REMAINING_DOWNLOADS_POLL_INTERVAL_SECS * 1000);
  }

  _pollUploaderPing() {
    if (this.pollUploaderPingInterval) {
      return;
    }

    const callUploaderPing = async () => {
      await fetcher.patch(`/api/room/${this.id}/uploader-online`, {
        headers: {
          Authorization: await this.keychain.authHeader(),
        },
        retry: true,
      });
    };

    this.pollUploaderPingInterval = setInterval(
      callUploaderPing,
      uploaderPingIntervalSeconds * 1000
    );

    //console.log("POLL INT: ", this.pollUploaderPingInterval);

    // Trigger first time immediately
    callUploaderPing();
  }

  get _files() {
    return (
      this.encryptedTorrent?.files?.map((file) => {
        const { path } = file;
        let progress = 0;

        const downloadProgress = this.downloadProgress.get(path)?.[0].progress;
        if (downloadProgress !== undefined) {
          // Show 0.1% progress immediately when download requested
          progress = Math.max(downloadProgress, 0.001);
        }

        const getPreviewUrl = () => this._getPreviewUrl(file);
        const getDownloadUrl = () => this._getDownloadUrl(file);

        return {
          ...file,
          progress,
          getPreviewUrl,
          getDownloadUrl,
        };
      }) || null
    );
  }

  _initializeFileProgress(file) {
    const { path, length } = file;
    // Use an object so it has a stable identity
    const progressEntry = {
      progress: 0,
    };

    let progressEntries = this.downloadProgress.get(path);
    if (progressEntries === undefined) {
      progressEntries = [progressEntry];
      this.downloadProgress.set(path, progressEntries);
      if (this.downloadProgress.size === 1) {
        // A download started when none were in progress before
        this.emit("downloading", true);
      }
    } else {
      progressEntries.push(progressEntry);
    }

    return {
      onProgress: (progress) => {
        progressEntry.progress = progress / length;
      },
      onDone: () => {
        const index = progressEntries.indexOf(progressEntry);
        if (index >= 0) {
          progressEntries.splice(index, 1);
          if (progressEntries.length === 0) {
            this.downloadProgress.delete(path);
            if (this.downloadProgress.size === 0) {
              // The last download finished
              this.emit("downloading", false);
            }
          }
        }
      },
    };
  }

  _trackStreamProgress(stream, onProgress, onDone) {
    let bytesDownloaded = 0;
    const transform = transformStream(stream, {
      transform: async (chunk, controller) => {
        await controller.enqueue(chunk);

        if (onProgress) {
          bytesDownloaded += chunk.byteLength;
          onProgress(bytesDownloaded);

          this._handleProgress();
        }
      },
    });

    if (onDone) {
      transform.done.then(onDone, onDone);
    }

    return transform.readable;
  }

  _handleProgress = throttle(() => {
    if (this.downloadProgress.size > 0) {
      this.emit("files", this._files);
    }
  }, 500);

  async _initServiceWorkerDownloads() {
    const files = this.encryptedTorrent.files;

    const downloadStreamSource = await makeStreamSource();
    if (downloadStreamSource == null) {
      return;
    }
    if (this.destroyed) {
      downloadStreamSource.destroy();
      return;
    }
    this.downloadStreamSource = downloadStreamSource;

    this.downloadUrls = new Map();
    const urls = this.downloadStreamSource.addFiles(
      files.map((file) => async ({ searchParams, headers }) => {
        const { preview } = searchParams;

        return await this._getFileStream(file, {
          isDownload: !preview,
          requestHeaders: headers,
        });
      })
    );

    for (const [index, file] of files.entries()) {
      this.downloadUrls.set(file.path, urls[index]);
    }

    this.zipDownloadUrl = this.downloadStreamSource.addFile(async () => {
      return await this._getZipStream();
    });
  }

  async _getFileStream(file, opts = {}) {
    const { name, length: fileLength } = file;
    const { isDownload, requestHeaders } = opts;

    const headers = {
      "Content-Length": fileLength,
      "Accept-Ranges": "bytes",
      ...DOWNLOAD_SECURITY_HEADERS,
    };
    const contentType = getMediaType(name);
    if (contentType != null) {
      headers["Content-Type"] = contentType;
    }

    let status = 200;
    let statusText = "OK";
    let decryptOpts;
    let startsAtByteZero = true;
    const rangeHeader = requestHeaders?.range;
    if (rangeHeader !== undefined) {
      // Handle Range requests
      const ranges = parseRange(fileLength, rangeHeader);
      if (ranges.type === "bytes") {
        const start = ranges[0].start;
        const end = ranges[0].end; // inclusive
        const length = end - start + 1;

        startsAtByteZero = start === 0;

        headers["access-control-allow-origin"] =
          "https://ambr-mvp-ashbeech.vercel.app";
        headers["access-control-allow-credentials"] = "true";
        headers["content-length"] = length;
        headers["content-range"] = `bytes ${start}-${end}/${fileLength}`;

        status = 206;
        statusText = "Partial Content";
        decryptOpts = {
          offset: start,
          length,
        };
      } else {
        return {
          response: {
            status: 416,
            statusText: "Range Not Satisfiable",
            headers: {
              //"Access-Control-Allow-Origin": "*",
              //"Transfer-Encoding": "chunked",
              "Content-Range": `bytes */${fileLength}`,
            },
          },
          stream: new globalThis.ReadableStream(),
        };
      }
    }

    // Only log requests for the beginning of the file
    if (startsAtByteZero) {
      //console.log("download", isDownload);
      logEvent("download", {
        type: isDownload ? "single" : "preview",
      });
    }

    let stream = await this.encryptedTorrent.decryptFile(file, decryptOpts);
    if (this.destroyed) {
      stream.cancel().catch(() => {});
      return null;
    }

    let idleTimeout;
    if (isDownload) {
      const { onProgress, onDone } = this._initializeFileProgress(file);
      this.emit("files", this._files);
      stream = this._trackStreamProgress(stream, onProgress, () => {
        onDone();
        this.emit("files", this._files);
      });

      headers["Content-Disposition"] = encodeContentDisposition(name);
    } else {
      // Kill the preview stream after a minute. When testing with
      // Sintel.mp4 I observed up to 17 second idle periods with
      // Chrome but much less with Firefox/Safari
      idleTimeout = 60_000;
    }

    return {
      response: {
        status,
        statusText,
        headers,
      },
      stream,
      idleTimeout,
    };
  }

  async _getZipStream() {
    const files = this.encryptedTorrent.files;
    logEvent("download", { type: "all" });

    const onDoneHandlers = [];

    const zipContents = await Promise.all(
      files.map(async (file) => {
        let stream = await this.encryptedTorrent.decryptFile(file);
        const { onProgress, onDone } = this._initializeFileProgress(file);
        onDoneHandlers.push(onDone);

        stream = this._trackStreamProgress(stream, onProgress);

        return {
          stream,
          path: file.path,
        };
      })
    );
    if (this.destroyed) {
      for (const { stream } of zipContents) {
        stream.cancel().catch(() => {});
      }
      return null;
    }

    let stream = makeZipStream(zipContents);

    this.emit("files", this._files);
    const transform = transformStream(stream);

    const done = () => {
      for (const onDone of onDoneHandlers) {
        onDone();
      }
      this.emit("files", this._files);
    };
    transform.done.then(done, done);

    stream = transform.readable;

    const name = `Ambr ${this.id}.zip`;

    return {
      stream,
      response: {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": encodeContentDisposition(name),
          ...DOWNLOAD_SECURITY_HEADERS,
        },
      },
    };
  }

  async _getDownloadUrl(file) {
    if (this.destroyed) return null;

    const { path } = file;
    const { browser, os } = browserDetect();

    // service worker doesn't work for downloads on Safari
    if (browser !== "safari" && os !== "ios") {
      const url = this.downloadUrls?.get(path);
      if (url != null) {
        return url;
      }
    }
    const streamResponse = await this._getFileStream(file, {
      isDownload: true,
    });
    if (streamResponse == null) return null;

    const { headers } = streamResponse.response;
    // Video 'view' option fails on iOS
    if (os === "ios" && headers?.["Content-Type"]?.startsWith("video/")) {
      headers["Content-Type"] = "application/octet-stream";
    }

    return await this._streamToBlobUrl(streamResponse);
  }

  async _getPreviewUrl(file) {
    if (this.destroyed) return null;

    const { path } = file;

    const url = this.downloadUrls?.get(path);
    if (url != null) {
      // Adding preview=1 disables the progress bar
      return `${url}?preview=1`;
    }

    const streamResponse = await this._getFileStream(file, {
      isDownload: false,
    });
    if (streamResponse == null) return null;
    return await this._streamToBlobUrl(streamResponse);
  }

  async _streamToBlobUrl({ stream, response }) {
    const res = new globalThis.Response(stream, response);

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async getZipUrl() {
    if (this.destroyed) return null;

    const { browser, os } = browserDetect();

    // service worker doesn't work for downloads on Safari
    if (browser !== "safari" && os !== "ios") {
      const url = this.zipDownloadUrl;
      if (url != null) {
        return url;
      }
    }

    const streamResponse = await this._getZipStream();
    if (streamResponse == null) return null;
    return await this._streamToBlobUrl(streamResponse);
  }

  async handleDelete() {
    if (this.destroyed) {
      throw new Error("Already destroyed");
    }

    await fetcher.delete(`/api/room/${this.id}`, {
      headers: {
        Authorization: await this.keychain.authHeader(),
      },
      retry: true,
    });
  }

  async handleReport(reason) {
    if (this.destroyed) {
      throw new Error("Already destroyed");
    }

    await fetcher.post(`/api/room/${this.id}/report`, {
      body: {
        reason,
      },
      headers: {
        Authorization: await this.keychain.authHeader(),
      },
      retry: true,
    });
  }

  async handleRoomLifetimeChange(lifetime) {
    if (this.destroyed) {
      throw new Error("Already destroyed");
    }

    try {
      await fetcher.patch(`/api/room/${this.id}/expiration`, {
        headers: {
          Authorization: await this.keychain.authHeader(),
        },
        raw: true,
        retry: true,
      });

      if (response.ok) {
        const data = await response.json();
        //console.log(`Updated expiration for room ${this.id}`);
        return data; // Return the response data
      } else {
        console.error("Error updating expiration:", response.statusText);
        return null; // Return null in case of an error
      }
    } catch (error) {
      console.error("Error updating expiration:", error);
      return null; // Return null in case of an error
    }
  }

  async handleMaxRoomDownloadsChange(maxDownloads) {
    if (this.destroyed) {
      throw new Error("Already destroyed");
    }

    await fetcher.patch(`/api/room/${this.id}/expiration`, {
      body: {
        maxDownloads,
      },
      headers: {
        Authorization: await this.keychain.authHeader(),
      },
      retry: true,
    });
  }

  _listenCreateProgress() {
    if (!this.encryptedTorrent) throw new Error("no encryptedTorrent");

    if (this.handleCreateProgress) {
      this.encryptedTorrent.off("createProgress", this.handleCreateProgress);
    }
    const handleCreateProgress = throttle((progress) => {
      // Ensure throttled events don't go through if handleCreateProgress has been reset
      if (handleCreateProgress === this.handleCreateProgress) {
        this.emit("createProgress", Math.max(progress, 0.01));
      }
    }, 500);
    this.handleCreateProgress = handleCreateProgress;

    this.emit("createProgress", 0.01);
    this.encryptedTorrent.on("createProgress", this.handleCreateProgress);
  }

  _listenCreateMintProgress() {
    const handleCreateMintProgress = throttle((progress) => {
      // Ensure throttled events don't go through if handleCreateProgress has been reset
      if (handleCreateMintProgress === this.handleCreateMintProgress) {
        this.emit("createMintProgress", Math.max(progress, 0.01));
      }
    }, 500);
    this.handleCreateMintProgress = handleCreateMintProgress;

    this.emit("createMintProgress", 0.01);
  }

  _addTorrentListeners() {
    if (!this.torrent) throw new Error("no torrent");
    this.torrent.on("warning", this._handleTorrentWarning);
    this.torrent.on("wire", this._handleTorrentWire);
  }

  _removeTorrentListeners() {
    if (!this.torrent) throw new Error("no torrent");
    this.torrent.off("warning", this._handleTorrentWarning);
    this.torrent.off("wire", this._handleTorrentWire);
  }

  _handleTorrentWarning = (err) => {
    //debug(`torrent warning: ${err.message}`);
  };

  _handleTorrentWireInterested = () => {
    if (this.meta == null) return;
    this.meta.numDownloadingPeers += 1;
    /*     debug(
      `numDownloadingPeers incremented to ${this.meta.numDownloadingPeers}`
    ); */
    this.emit("meta", { ...this.meta });
  };

  _handleTorrentWireUninterested = () => {
    if (this.meta == null) return;
    this.meta.numDownloadingPeers -= 1;
    /*     debug(
      `numDownloadingPeers decremented to ${this.meta.numDownloadingPeers}`
    ); */
    this.emit("meta", { ...this.meta });
  };

  _handleTorrentWire = (wire) => {
    if (wire.type === "webSeed") {
      return;
    }

    wire.on("interested", this._handleTorrentWireInterested);
    wire.on("uninterested", this._handleTorrentWireUninterested);

    wire.once("close", () => {
      if (wire.peerInterested) {
        this._handleTorrentWireUninterested();
      }

      wire.off("interested", this._handleTorrentWireInterested);
      wire.off("uninterested", this._handleTorrentWireUninterested);
    });
  };

  async destroy() {
    if (this.destroyed) {
      throw new Error("Already destroyed");
    }
    this.destroyed = true;

    //console.log("Room | destroy: ", this.destroyed);

    if (this.torrent) {
      this._removeTorrentListeners();
      this.torrent = null;
    }

    if (this._cleanupListeners) {
      this._cleanupListeners();
    }

    if (this.downloadStreamSource) {
      this.downloadStreamSource.destroy();
      this.downloadStreamSource = null;
      this.downloadUrls = null;
      this.zipDownloadUrl = null;
    }

    clearInterval(this.pollRemainingDownloadsInterval);
    this.pollRemainingDownloadsInterval = null;

    clearInterval(this.pollUploaderPingInterval);
    this.pollUploaderPingInterval = null;

    if (this.encryptedTorrent) {
      if (this.handleCreateProgress) {
        this.encryptedTorrent.off("createProgress", this.handleCreateProgress);
      }
      this.encryptedTorrent.destroy();
      this.encryptedTorrent = null;
    }

    this.peerState = null;
    this.cloudState = null;
    this.chainState = null;
    this.mintState = null;
    this.verifyState = null;
    this.handleCreateMintProgress = null;
    this.handleCreateProgress = null;

    this.id = null;
    this.downloadProgress.clear();
    this.meta = null;
  }
}

function processFiles(files) {
  const ret = [];
  for (const file of files) {
    // With drag and drop, fullPath is available.
    // When picking a drectory using <input> with webkitdirectory set, webkitRelativePath is available.
    // Otherwise, only name is available.
    const path = file.fullPath || file.webkitRelativePath || file.name;

    // Skip junk files
    if (isJunkPath(path.split("/"))) continue;

    const fileWrapper = {
      file,
      path,
      name: basename(path),
      length: file.size,
      progress: 0,
    };
    ret.push(fileWrapper);
  }
  //console.log("Returned Post process Room.js File: ", ret);
  return ret;
}

// eslint-disable-next-line no-control-regex
const ENCODE_URL_ATTR_CHAR_REGEXP = /[\x00-\x20"'()*,/:;<=>?@[\\\]{}\x7f]/g;

// The syntax for filename is very weird; see
// https://datatracker.ietf.org/doc/html/rfc6266#section-4.3
function encodeContentDisposition(name) {
  // percent encode as UTF-8
  const encoded = encodeURIComponent(name).replace(
    ENCODE_URL_ATTR_CHAR_REGEXP,
    pencode
  );

  return `attachment; filename*=UTF-8''${encoded}`;
}

function pencode(char) {
  return "%" + String(char).charCodeAt(0).toString(16).toUpperCase();
}
