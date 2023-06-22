import { createHash } from "crypto";

export function makeHash(inputValue) {
  return createHash("sha256").update(inputValue).digest("hex");
}
