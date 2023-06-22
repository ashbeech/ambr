import BitField from "bitfield";
import Debug from "debug";
import ltDontHave from "lt_donthave";
import sha1 from "simple-sha1";
import Wire from "bittorrent-protocol";

const debug = Debug("ambr:chunk-store-seed-conn");

/**
 * Converts requests for torrent pieces into get calls on a chunk store.
 * Provides the same interface as the WebTorrent `WebConn` used for web seeds.
 * @param {string} chunkStore chunk store to get data from
 * @param {Object} torrent
 */
export class ChunkStoreSeedConn extends Wire {
  constructor(chunkStore, torrent) {
    super();

    this.chunkStore = chunkStore;
    this.connId = this.chunkStore.name;
    this._torrent = torrent;

    this._init();
  }

  _init() {
    this.setKeepAlive(true);

    this.use(ltDontHave());

    this.once("handshake", (infoHash, peerId) => {
      if (this.destroyed) return;
      this.handshake(infoHash, sha1.sync(this.connId));
      const numPieces = this._torrent.pieces.length;
      const bitfield = new BitField(numPieces);
      for (let i = 0; i <= numPieces; i++) {
        bitfield.set(i, true);
      }
      this.bitfield(bitfield);
    });

    this.once("interested", () => {
      debug("interested");
      this.unchoke();
    });

    this.on("uninterested", () => {
      debug("uninterested");
    });
    this.on("choke", () => {
      debug("choke");
    });
    this.on("unchoke", () => {
      debug("unchoke");
    });
    this.on("bitfield", () => {
      debug("bitfield");
    });
    this.lt_donthave.on("donthave", () => {
      debug("donthave");
    });

    this.on("request", (pieceIndex, offset, length, callback) => {
      debug(
        "request pieceIndex=%d offset=%d length=%d",
        pieceIndex,
        offset,
        length
      );
      this.chunkStore.get(
        pieceIndex,
        {
          offset,
          length,
        },
        (err, data) => {
          if (err) {
            debug(
              "request failed for pieceIndex=%d; cancelling with donthave",
              pieceIndex
            );
            // Cancel all in progress requests for this piece
            this.lt_donthave.donthave(pieceIndex);
            // Retry soon
            this.have(pieceIndex);
          }

          callback(err, data);
        }
      );
    });
  }

  destroy() {
    super.destroy();
    this.chunkStore = null;
    this._torrent = null;
  }
}
