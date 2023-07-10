// The environment the site is running in
export const environment = process.env.REACT_APP_NODE_ENV || "development";

// Is the site running in production?
export const isProd = environment === "production";

// Is the site running in a pull request?
export const isPr = process.env.REACT_APP_IS_PULL_REQUEST === "true";

// Is the site running on Render?
export const isRender = process.env.REACT_APP_RENDER === "true";

// Stripe products
export const stripeProducts = !isProd
  ? ["prod_O1IwO8cwxTjNGp"]
  : ["prod_O98lNwyT3aRI9u"];

// The git commit of the running site
export const release = process.env.REACT_APP_RENDER_GIT_COMMIT || "development";

// Server port
export const port = Number(process.env.REACT_APP_PORT) || 3000;

// IP address to listen on
export const bindAddress = isRender ? "0.0.0.0" : "127.0.0.1";

// Hostname on Render
const renderHostname = isPr
  ? process.env.REACT_APP_RENDER_EXTERNAL_HOSTNAME
  : process.env.REACT_APP_HOSTNAME;

// Website hostname + port
export const host = isRender ? renderHostname : `localhost:${port}`;

export const ipfsGateway = process.env.REACT_APP_IPFSGATEWAY;

export const blockExplorer = isProd
  ? "https://polygonscan.com"
  : "https://mumbai.polygonscan.com";

export const ipfsViewer = "https://ipfs.io/ipfs/";

// Website protocol
export const protocol = isRender ? "https" : "http";

// Website origin (scheme + hostname + port)
export const origin = `${protocol}://${host}`;

const wsProtocol = isRender ? "wss" : "ws";

// Websocket origin (scheme + hostname + port)
export const wsOrigin = `${wsProtocol}://${host}`;

// Websocket URL
export const wsUrl = `${wsOrigin}/websocket`;

// Title of the site
export const siteTitle = "Ambr";

export const tagline = "Share ideas worth protecting";

// Description of the site
export const siteDescription =
  "File transfers that provide a robust layer of traceability for the copyright of your work.";

// Twitter username of the site
export const socialHandle = "ambrlink";

export const siteTwitterUrl = `https://twitter.com/${socialHandle}`;

// Discord invite link for the site
export const siteDiscord = "https://discord.gg/VuPEbumVWg";

// Site logo
export const siteLogo = `${origin}/images/logo-80x80.png`;

// Default image to represent site on social networks
export const siteSocialImage = `/images/social-share-home.png`; //${origin}

// Root path of project
export const rootPath = process.cwd();

// Maximum room size displayed to user
export const maxRoomSizeGb = 10;

// Maximum cloud room size displayed to user
export const maxRoomCloudSizeGb = 5;

// Maximum room size in bytes
export const maxRoomSize = maxRoomSizeGb * 1e9;

// Maximum room size in bytes for cloud upload
export const maxRoomCloudSize = maxRoomCloudSizeGb * 1e9 * 1.1;

// Room lifetime by default
export const defaultRoomLifetimeSeconds = 24 * 3600; // One day
export const defaultRoomLifetimeMs = 86400000; // One day

// Maximum downloads per room by default
export const defaultMaxRoomDownloads = 100;

// Values for lifetime (1 hour, 2 hours, 6 hours, 12 hours, 24 hours)
export const roomLifetimeValues = [1, 2, 6, 12, 24].map((h) => h * 3600);

// Values for max downloads
export const maxRoomDownloadsValues = [1, 5, 10, 20, 50, 100];

// Time between each uploader ping
export const uploaderPingIntervalSeconds = 30;

// WebRTC configuration
export const rtcConfig = {
  iceServers: [
    {
      urls: ["stun:relay.ambr.app:443"],
    },
    {
      urls: [
        "turn:relay.ambr.app:443?transport=udp",
        "turn:relay.ambr.app:443?transport=tcp",
        "turns:relay.ambr.app:443?transport=tcp",
      ],
      username: "relay.ambr.app",
      credential: "tears-whiplash-overall-diction",
    },
  ],
  sdpSemantics: "unified-plan",
  bundlePolicy: "max-bundle",
  iceCandidatePoolsize: 1,
};

// Backblaze B2 bucket information
let b2Config;
if (isRender) {
  if (isPr) {
    // The service name is a unique slug per PR
    b2Config = {
      bucketName: "ambr-prod",
      bucketId: "4a5eff4831157c208f270d1b",
      pathPrefix: null,
    };
  } else {
    b2Config = {
      bucketName: "ambr-dev",
      bucketId: "aa3eff1811a5ec608f070d1b",
      pathPrefix: null,
    };
  }
} else {
  // dev/ci environments
  b2Config = {
    bucketName: "ambr-dev",
    bucketId: "aa3eff1811a5ec608f070d1b",
    pathPrefix: null,
  };
}
export { b2Config };
