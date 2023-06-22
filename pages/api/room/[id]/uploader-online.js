/*
 * @dev
 *
 * Polls server to tell if client is online.
 *
 */

// Return the current time as an ISO string in a JSON object
export default async function handler(request, response) {
  // Get the current time as an ISO string
  const time = new Date().toISOString();

  // Return the time in a JSON object
  const uploaderLastTimeOnline = { time };
  response.status(200).json(uploaderLastTimeOnline);
}

/* export default async function handler(request, response) {
  const d = new Date();
  let time = d.toISOString();
  const uploaderLastTimeOnline = { uploaderLastTimeOnline: time };

  response.status(200).json(uploaderLastTimeOnline);
} */
