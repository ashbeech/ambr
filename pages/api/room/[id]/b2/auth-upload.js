/*
 * @dev
 *
 * Handler for web request for 2 step process to upload to B2 bucket.
 *
 * • Request: Authorisation token for upload.
 * • Response: JSON object with assigned uploadUrl and authorizationToken.
 *
 */

// import the 'B2' module from the 'backblaze-b2' library
import B2 from "backblaze-b2";

// set configuration information for the Backblaze B2 bucket
const b2Env = {
  id: process.env.REACT_APP_B2_APP_KEY_ID, // application key ID
  key: process.env.REACT_APP_B2_APP_KEY, // application key
  bucket: process.env.REACT_APP_B2_DEV_NAME, // bucket name
  bucketID: process.env.REACT_APP_B2_DEV_ID, // bucket ID
};

// create a new B2 object using the configuration information
const b2 = new B2({
  applicationKeyId: b2Env.id,
  applicationKey: b2Env.key,
});

// a function to retrieve an upload URL and authorization token for the B2 bucket
async function asyncFunc() {
  try {
    // call the 'getUploadUrl' method of the 'b2' object to retrieve the upload URL and authorization token
    const response = await b2.getUploadUrl({
      bucketId: b2Env.bucketID,
    });
    const { authorizationToken, uploadUrl } = response.data;
    // return an object containing the upload URL and authorization token
    return { uploadUrl, authorizationToken };
  } catch (error) {
    // log an error message and return null if an error occurs
    console.error("Error getting upload URL:", error);
    return null;
  }
}

// define an asynchronous request handler function for this script
export default async function handler(req, res) {
  try {
    // authorize the 'b2' object using the B2 credentials (authorization lasts for 24 hours)
    await b2.authorize();

    // retrieve the number of tokens requested from the client
    const { numTokens } = req.body;
    //console.log("NUMBER OF TOKENS: ", numTokens);

    // create an array of promises to call the 'asyncFunc' function 'numTokens' times
    const promises = [];
    for (let i = 0; i < numTokens; i++) {
      promises.push(asyncFunc());
    }

    // use Promise.all to execute all the promises simultaneously and wait for them to resolve or reject
    const results = await Promise.all(promises);

    // filter the results to exclude null values (i.e. any errors that occurred while getting upload tokens)
    const tokens = results.filter((result) => result !== null);
    //console.log("TOKENS RETURNED: ", tokens);

    // send the list of tokens back to the client in a JSON response
    res.json(tokens);
  } catch (error) {
    // log an error message and send a JSON response with an error status if an error occurs
    console.error("Error getting upload tokens:", error);
    res.json({ status: "error" });
  }
}

/* import B2 from "backblaze-b2";

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

  async function GetUpload() {
    try {
      await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
      let num = req.body.numTokens;
      console.log("NUMBER OF TOKENS: ", num);

      let array = [];

      async function asyncFunc(_i) {
        let response = await b2.getUploadUrl({
          bucketId: b2Env.bucketID,
        });
        return new Promise((resolve, reject) => {
          if (response.data.authorizationToken != null) {
            let obj = {
              uploadUrl: response.data.uploadUrl,
              authorizationToken: response.data.authorizationToken,
            };
            resolve(array.push(obj));
          } else {
            reject("No auth token provided :(");
          }
        });
      }

      const promises = [];
      for (let i = 0; i < num; i++) {
        promises.push(asyncFunc(i));
      }

      Promise.all(promises)
        .then((results) => {
          //console.log("All done", results);
          //console.log("ARRAY RETURNED: ", array);
          return res.status(200).json(array);
        })
        .catch((e) => {
          // Handle errors here
          console.error("Promises didn't work");
          return res.status(200).json({ status: "error" });
        });

      // send auth and url back to client
    } catch (err) {
      console.error("Error getting URL:", err);
    }
  }
  // get upload url
  await GetUpload();
} */
