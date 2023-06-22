/* eslint-env browser */

//import Debug from "debug";

import { fetcher } from "./fetcher.js";
//import { captureException } from './sentry.js'
import { getEventContext } from "./event-context.js";

//const debug = Debug("ambr:analytics");

export const logEvent = (type, payload = null) => {
  if (type !== "pageview") {
    payload = {
      ...getEventContext(),
      ...payload,
    };
  }
  //debug("%s %o", type, payload);
  /* 
  fetcher
    .post("/api/info", {
      body: {
        type,
        payload,
        props: {
          // NOTE: BE VERY CAREFUL TO NOT INCLUDE THE HASH IN THE PATH. THE HASH
          // IS THE SECRET KEY WHICH SHOULD NEVER BE SENT TO THE SERVER.
          path:
            window.location.origin +
            window.location.pathname +
            window.location.search,
          referrer: document.referrer || null,
          width: Math.round(window.innerWidth / 100) * 100,
        },
      },
    })
    .catch((err) => {
      try {
        err.message = "Failed to send info: " + err.message;
      } catch {}
      //captureException(err, { level: 'info' })
    }); */
};

export const logPageview = () => {
  logEvent("pageview");
};

/*
 * Converts a number of bytes into a number of MB with at
 * most two significant figures; e.g.
 * 1 => 0
 * 2_600_000 => 3
 * 17_200_000 => 17
 * 121_000_000 => 120
 * 990_000_000 => 990
 * 996_000_000 => 1000
 * 2_430_000_000 => 2400
 * -1 => null
 * NaN => null
 */
export const roundSizeAsMb = (size) => {
  if (!Number.isFinite(size) || size < 0) {
    return null;
  }

  const rawSizeMb = size / 1_000_000;

  let scalingFactor = 1;
  let quantity = Math.round(rawSizeMb);
  while (quantity > 100) {
    scalingFactor *= 10;
    quantity = Math.round(rawSizeMb / scalingFactor);
  }

  return quantity * scalingFactor;
};
