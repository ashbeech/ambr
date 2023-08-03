import { makeHash } from "./make-hash.js";
import { fetcher } from "../lib/fetcher.js";

export async function createUser(email, publicAddress) {
  //console.log("Creating new user ...", email, publicAddress);

  if (!publicAddress || !email) {
    throw new Error("Missing required parameters: email and publicAddress.");
  }

  // Convert publicAddress to hash to match the record obscured at rest
  const idHash = makeHash(publicAddress);

  const response = await fetch("/api/create-user", {
    method: "POST",
    body: JSON.stringify({ email, idHash }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to create user.");
  }

  const user = await response.json();
  return user;
}

export async function updateUser(id, data) {
  if (!id) {
    throw new Error("Invalid user ID");
  }
  const response = await fetch(`/api/update-user?id=${id.toString()}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const user = await response.json();
  return user;
}

export async function getUser(publicAddress) {
  if (!publicAddress) return null;

  // Convert publicAddress to hash to match the record obscured at rest
  const idHash = makeHash(publicAddress);

  if (!idHash) {
    throw new Error("No idHash provided.");
  }

  let user = null;
  while (user === null) {
    try {
      const response = await fetch(
        `/api/get-user?idHash=${idHash}&publicAddress=${publicAddress}`
      );
      const user = await response.json();
      return user;
    } catch (error) {
      console.error(error);
    }
  }
}
