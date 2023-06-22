/*
 * @dev
 *
 * Handler for web request for download from B2 bucket
 *
 */
/* 
import B2 from "backblaze-b2"; // import the B2 package

const b2Env = {
  id: process.env.REACT_APP_B2_APP_KEY_ID, // ID of the B2 application key
  key: process.env.REACT_APP_B2_APP_KEY, // Secret access key for B2
  bucket: process.env.REACT_APP_B2_DEV_NAME, // Name of the B2 bucket
  bucketID: process.env.REACT_APP_B2_DEV_ID, // ID of the B2 bucket
};

export default async function handler(req, res) {
  // export the function
  const b2 = new B2({
    applicationKeyId: b2Env.id, // Set the B2 application key ID
    applicationKey: b2Env.key, // Set the B2 application key
  });

  try {
    const { authorizationToken } = await b2.getDownloadAuthorization({
      bucketId: b2Env.bucketID, // Set the B2 bucket ID
      fileNamePrefix: "", // Set the prefix of the file name
      validDurationInSeconds: 604800, // Set the duration for which the download URL is valid
    });

    const { downloadUrl } = await b2.authorize(); // Authorize the download URL

    return res.status(200).json({
      // Return the download URL and authorization token
      authorizationToken,
      downloadUrl,
    });
  } catch (err) {
    console.error("Error getting download URL:", err);
    return res.status(500).json({ error: err.message }); // Return the error message
  }
} */

import B2 from "backblaze-b2";

const b2Env = {
  id: process.env.REACT_APP_B2_APP_KEY_ID,
  key: process.env.REACT_APP_B2_APP_KEY,
  bucket: process.env.REACT_APP_B2_DEV_NAME,
  bucketID: process.env.REACT_APP_B2_DEV_ID,
};

export default async function handler(req, res) {
  const b2 = new B2({
    applicationKeyId: b2Env.id,
    applicationKey: b2Env.key,
  });

  async function GetDownload() {
    try {
      //await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
      let auth = await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
      // get download authorization
      let response = await b2.getDownloadAuthorization({
        bucketId: b2Env.bucketID,
        fileNamePrefix: "",
        validDurationInSeconds: 604800, // a number from 0 to 604800
      });

      // send auth and url back to client
      return res.status(200).json({
        authorizationToken: response.data.authorizationToken,
        downloadUrl: auth.data.downloadUrl,
      });
    } catch (err) {
      console.error("Error getting URL:", err);
    }
  }
  // get upload url + auth
  await GetDownload();
}
