/*** @type {import('next').NextConfig} */
const nextConfig = {
  /*   publicRuntimeConfig: {
    wsUrl: "ws://localhost:3000/websocket",
  }, */
  /*   optimization: {
    minimize: false,
  }, */
  images: {
    domains: [
      "nftstorage.link",
      "w3s.link",
      "dweb.link",
      "gateway.pinata.cloud",
      "ipfs.io",
      "cloudflare-ipfs.com",
    ],
  },
  reactStrictMode: false,
  env: {
    REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV,
    REACT_APP_ADMIN_PK: process.env.REACT_APP_ADMIN_PK,
    REACT_APP_CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS,
    REACT_APP_RPC_URL: process.env.REACT_APP_RPC_URL,
    REACT_APP_RPC_CHAIN_ID: process.env.REACT_APP_RPC_CHAIN_ID,
    REACT_APP_NFTSTORAGE_TOKEN: process.env.REACT_APP_NFTSTORAGE_TOKEN,
    REACT_APP_IPFSGATEWAY: process.env.REACT_APP_IPFSGATEWAY,
    REACT_APP_MAGIC_LINK_SK: process.env.REACT_APP_MAGIC_LINK_SK,
    REACT_APP_MAGIC_LINK_PK: process.env.REACT_APP_MAGIC_LINK_PK,
    REACT_APP_IS_PULL_REQUEST: process.env.REACT_APP_IS_PULL_REQUEST,
    REACT_APP_RENDER: process.env.REACT_APP_RENDER,
    REACT_APP_ENABLE_TEST_SHORTCUTS:
      process.env.REACT_APP_ENABLE_TEST_SHORTCUTS,
    REACT_APP_RENDER_GIT_COMMIT: process.env.REACT_APP_RENDER_GIT_COMMIT,
    REACT_APP_PORT: process.env.REACT_APP_PORT,
    REACT_APP_RENDER_EXTERNAL_HOSTNAME:
      process.env.REACT_APP_RENDER_EXTERNAL_HOSTNAME,
    REACT_APP_HOSTNAME: process.env.REACT_APP_HOSTNAME,
    REACT_APP_MAILR_ADDR: process.env.REACT_APP_MAILR_ADDR,
    REACT_APP_MAILR_PW: process.env.REACT_APP_MAILR_PW,
    REACT_APP_STRIPE_SK: process.env.REACT_APP_STRIPE_SK,
  },
};

module.exports = nextConfig;
