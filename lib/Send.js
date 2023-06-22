import { EventEmitter } from "events";
import reemit from "re-emitter";
import { AmbrError } from "./errors.js";

export const JOIN_MODE = "join";
export const CREATE_MODE = "create";
export const SHARE_MODE = "share";
export const VERIFY_MODE = "verify";

export class Send extends EventEmitter {
  mode = null;
  room = null;
  destroyed = false;

  _cleanupListeners = null;

  // Can be called repeatedly
  async join(id = null, key = null) {
    //console.log("ID: ", id);
    //console.log("KEY: ", key);

    if (id === (this.room?.id || null)) {
      //console.log("RETURNING: ", id);
      //console.log("RETURNING: ", key);
      return;
    }

    this._destroyRoom();
    if (id && id !== "boost" && id !== "files") {
      const { Room } = await import("./Room.js");
      if (this.destroyed) {
        return;
      }
      this._setMode(JOIN_MODE);
      this._createRoom(Room);
      try {
        await this.room.join(id, key);
      } catch (err) {
        this._setMode(null);
        throw err;
      }
    }
  }

  async mint(_finalMetadata) {
    //console.log("Mint Send Call", _finalMetadata);
    this._setMode(SHARE_MODE);

    try {
      await this.room.mint(_finalMetadata);
    } catch (err) {
      this._setMode(null);
      throw err;
    }
  }

  async create(uploadFiles) {
    const { Room } = await import("./Room.js");
    if (this.destroyed) {
      return;
    }

    //console.log("create(uploadFiles=%o)", uploadFiles);
    this._destroyRoom();
    this._setMode(CREATE_MODE);
    this._createRoom(Room);
    try {
      await this.room.create(uploadFiles);
    } catch (err) {
      this._setMode(null);
      throw err;
    }
  }

  async verify(uploadFiles, sha1 = null, id = null, key = null, idHash = null) {
    console.log(
      `verify(uploadFiles=${uploadFiles[0].name} sha1=${sha1} id=${id} key=${key}) idHash=${idHash})`
    );
    console.log("Room ID: ", this.room?.id);
    if (id !== (this.room?.id || null)) return;

    //this._destroyRoom();
    if (id) {
      /*       const { Room } = await import("./Room.js");
      if (this.destroyed) {
        return;
      } */
      this._setMode(VERIFY_MODE);
      //this._createRoom(Room);
      try {
        await this.room.verify(uploadFiles, sha1, id, key, idHash);
      } catch (err) {
        console.log("BACK TO JOIN MODE");
        this._setMode(JOIN_MODE); // TODO: Set to previous mode (which will likely be JOIN_MODE as verifiaction happens from joining of a file page )
        // The error is: setting to this._setMode(null) has the page flick to the default upload/sendpanel page
        throw err;
      }
    }
  }

  _setMode(mode) {
    this.mode = mode;
    this.emit("mode", mode);
  }

  _createRoom(Room) {
    this.room = new Room();
    this._cleanupListeners = reemit(this.room, this, [
      "peerState",
      "cloudState",
      "chainState",
      "mintState",
      "verifyState",
      "createMintProgress",
      "createProgress",
      "downloading",
      "meta",
      "files",
      "url",
    ]);
    this.room.on("error", this._destroyRoom);
  }

  _destroyRoom = (err) => {
    if (!this.room) return;

    this._cleanupListeners?.();
    this._cleanupListeners = null;
    this.room.off("error", this._destroyRoom);

    this.room.destroy();
    this.room = null;

    this._setMode(null);
    this.emit("peerState", "Idle");
    this.emit("cloudState", "Preparing");
    this.emit("chainState", "Idle");
    this.emit("mintState", "Preparing");
    this.emit("verifyState", false);
    this.emit("createMintProgress", null);
    this.emit("createProgress", null);
    this.emit("meta", null);
    this.emit("files", null);
    this.emit("url", null);

    if (err) {
      this.emit("error", err);
    }
  };

  destroy() {
    if (!this.destroyed) {
      this.destroyed = true;
      this._destroyRoom();
    }
  }
}
