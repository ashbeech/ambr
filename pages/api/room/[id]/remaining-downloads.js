/*
 * @dev
 *
 * A legacy script required to function without errors.
 *
 * TODO: Would like to remove this by closed-βeta.
 *
 */

export default async function handler(request, response) {
  const remainingDownloads = { remainingDownloads: 100 };

  response.status(200).json(remainingDownloads);
}
