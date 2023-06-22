import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import * as Tracing from "@sentry/tracing";
import replaceString from "replace-string";

import { getEventContext } from "./event-context.js";
import { isProd, isPr, isRender, release, host } from "../config.js";

const FORBIDDEN_KEYS = [
  "authorization",
  "x-forwarded-for",
  "cf-connecting-ip",
].map((key) => key.toLowerCase());

// Leave this assignment so sentry can easily be enabled manually in dev mode
export const enabled = isProd;

const withScope = ({ level, extra, req, ...rest } = {}, fn) => {
  // Do not accept unexpected options
  if (Object.keys(rest).length > 0) {
    captureException(
      new Error(
        "Unexpected property in Sentry capture: " + JSON.stringify(rest)
      )
    );
  }
  Sentry.withScope((scope) => {
    if (level) scope.setLevel(level);
    if (extra) scope.setExtras(extra);
    if (!process.browser && req) {
      scope.addEventProcessor(async (event) => {
        return Sentry.Handlers.parseRequest(event, req);
      });
    }
    fn();
  });
};

export const captureException = (err, opts) => {
  if (enabled) {
    withScope(opts, () => {
      Sentry.captureException(err);
    });
  }
  console.error(err);
};

export const captureMessage = (message, opts) => {
  if (enabled) {
    withScope(opts, () => {
      Sentry.captureMessage(message);
    });
  }
  console.error(message);
};

export { Sentry };

export const init = (opts = {}) => {
  const config = {
    enabled,
    dsn: process.env.SENTRY_DSN,
    debug: false,
    release,
    environment: isRender && !isPr ? "production" : "development",
    sampleRate: 0.02,
    tracesSampleRate: 0.0002,
    sendDefaultPii: false, // Do not send personally-indentifying information
    autoSessionTracking: false, // Disable page view tracking
    serverName: host,
    maxValueLength: 2500, // Maximum length for exception values (defaults to 250)
  };

  if (process.browser) {
    const browserConfig = {
      tunnel: "/api/report-error",
      beforeSend(event, hint) {
        const { originalException } = hint;

        // Skip errors with SENTRY_IGNORE set
        if (originalException?.SENTRY_IGNORE === true) {
          return null;
        }

        // Send extra error data to sentry when SENTRA_EXTRA is set
        if (originalException?.SENTRY_EXTRA) {
          event.extra = {
            ...event.extra,
            errorExtra: originalException.SENTRY_EXTRA,
          };
        }

        if (event.exception != null) {
          // TODO: remove this eventually
          // Add extra information to debug UnhandledRejection
          // This is a similar test to what Sentry uses:
          // https://github.com/getsentry/sentry-javascript/blob/c94100abb1ea529c2ebeb1e3133be3b1c631fe9f/packages/utils/src/is.ts#L76-L78
          if (
            originalException === null ||
            typeof originalException !== "object"
          ) {
            console.error("originalException:", originalException);

            event.extra = {
              ...event.extra,
              nonErrorExceptionType: typeof originalException,
              nonErrorExceptionIsNull: originalException === null,
            };
          }
        }

        // Send event context with every Sentry report
        event.extra = {
          ...event.extra,
          eventContext: getEventContext(),
        };

        const secret = window.location.hash.slice(1) || null;
        event = scrubObjectSecret(event, secret);
        return event;
      },
      // Breadcrumbs are included in the event in beforeSend() so we
      // technically don't need to do anything in beforeBreadcrumb() but
      // we're being extra paranoid.
      beforeBreadcrumb(event) {
        const secret = window.location.hash.slice(1) || null;
        event = scrubObjectSecret(event, secret);
        return event;
      },
    };

    Sentry.init({ ...browserConfig, ...config });
  } else if (opts.cron) {
    const cronConfig = {
      integrations: [new Tracing.Integrations.Postgres()],

      tracesSampleRate: 0.01,
    };

    Sentry.init({ ...cronConfig, ...config });
  } else {
    if (!opts.app) {
      throw new Error("app option required in Node");
    }

    const nodeConfig = {
      beforeSend(event, hint) {
        event = scrubObjectKeys(event, FORBIDDEN_KEYS);
        return event;
      },

      // For Node.js, rewrite Error.stack to use relative paths, so that source
      // maps starting with ~/_next map to files in Error.stack with path
      // app:///_next
      integrations: [
        new RewriteFrames({
          iteratee: (frame) => {
            frame.filename = frame.filename.replace(
              `${process.env.SENTRY_SERVER_ROOT_DIR}.next/`,
              "app:///_next/"
            );
            frame.filename = frame.filename.replace(
              `${process.env.SENTRY_SERVER_ROOT_DIR}`,
              "app:///"
            );
            return frame;
          },
        }),
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app: opts.app }),
        new Tracing.Integrations.Postgres(),
      ],

      tracesSampleRate: 0.01,
    };

    Sentry.init({ ...nodeConfig, ...config });
  }
};

function scrubStringSecret(str, secret) {
  // Scrub anything that looks like a URL hash
  str = str.replace(/#[A-z0-9_-]+(\s|$)/g, "#REDACTED$1");

  // Scrub the secret from the string
  if (secret != null) {
    str = replaceString(str, secret, "REDACTED");
  }
  return str;
}

/**
 * Recursively redact `secret` from the `obj` object, no matter how deeply
 * nested. If `secret` appears in a value, it will be replaced with
 * `'REDACTED'`. If `secret` appears in a key, the whole key will be deleted.
 * Also scrubs anything that looks like a URL hash (since that's where we store
 * secrets in Ambr).
 */
function scrubObjectSecret(obj, secret) {
  if (typeof obj !== "object" || obj === null) {
    throw new TypeError("Invalid obj param");
  }

  if (typeof secret !== "string" && secret != null) {
    throw new TypeError("Invalid secret param");
  }

  const replacer = (key, value) => {
    if (typeof key === "string" && secret != null && key.includes(secret)) {
      // If a key contains the secret, delete the value
      return undefined;
    }
    if (typeof value === "string") {
      // If a value contains the secret, redact it
      return scrubStringSecret(value, secret);
    }
    return value;
  };

  return recursiveReplace(obj, replacer);
}

/**
 * Recursively redact the value of any key in `forbiddenKeys` from the `obj`
 * object, no matter how deeply nested. Note: This preserves the key name
 * (which is itself not a secret) and only redacts the value.
 */
function scrubObjectKeys(obj, forbiddenKeys) {
  if (typeof obj !== "object" || obj === null) {
    throw new TypeError("Invalid obj param");
  }

  if (!Array.isArray(forbiddenKeys)) {
    throw new TypeError("Invalid secrets param");
  }

  const replacer = (key, value) => {
    if (typeof key === "string" && forbiddenKeys.includes(key.toLowerCase())) {
      // If a key is forbidden, redact the value
      return "REDACTED";
    }
    return value;
  };

  return recursiveReplace(obj, replacer);
}

function recursiveReplace(obj, replacer) {
  return JSON.parse(JSON.stringify(obj), (key, value) =>
    key ? replacer(key, value) : value
  );
}
