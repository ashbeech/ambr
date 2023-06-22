// TODO: publish to npm

/* global fetch, Headers, Blob, FormData */
/* 
const DEFAULT_RETRIES = 5;

const INITIAL_RETRY_DELAY = 500; // ms
const MAX_RETRY_DELAY = 10000; // ms

export async function fetcher(
  url, // <-- /api/room
  {
    raw, // boolean, return { res, body } instead of just body
    method,
    headers,
    query,
    body: reqBody, // <-- readerToken: await this.keychain.authTokenB64(), salt: this.keychain.saltB64,
    // by default, the response content-type header determines if response is
    // treated as JSON. Setting this to `true` forces the response to be
    // treated as JSON, while `false` forces it to be treated as text.
    json,
    retry, // boolean | number
    ...rest
  } = {}
) {
  const fetchOpts = {
    method: method?.toUpperCase() ?? "GET",
    headers: new Headers(headers ?? {}),
    ...rest,
  };

  if (query) {
    const params = new URLSearchParams(Object.entries(query));
    url += "?" + params.toString();
  }

  if (reqBody) {
    const isJsonRequest =
      reqBody != null &&
      typeof reqBody === "object" &&
      !(reqBody instanceof ArrayBuffer) &&
      !ArrayBuffer.isView(reqBody) &&
      !(reqBody instanceof URLSearchParams) &&
      (typeof Blob === "undefined" || !(reqBody instanceof Blob)) &&
      (typeof FormData === "undefined" || !(reqBody instanceof FormData));

    if (isJsonRequest) {
      fetchOpts.headers.set("content-type", "application/json");
      fetchOpts.body = JSON.stringify(reqBody);
    } else {
      fetchOpts.body = reqBody;
    }
  }

  if (json !== false) {
    fetchOpts.headers.set("accept", "application/json");
  }

  let maxRetries = 0;
  if (retry === true) {
    maxRetries = DEFAULT_RETRIES;
  } else if (typeof retry === "number") {
    maxRetries = retry;
  } */

/*   fetchOpts.headers.set(
    "access-control-allow-origin",
    "https://ambr-mvp-ashbeech.vercel.app"
  );
  fetchOpts.headers.set("access-control-allow-credentials", "true"); */
/* 
  return await exponentialRetry(async () => {
    const res = await fetch(url, fetchOpts);

    // If `json` option is specified as a boolean, it forces response to be
    // treated as JSON (true) or text (false). Otherwise, the response
    // content-type header determines if response is treated as JSON or text.
    const isJsonResponse =
      typeof json === "boolean"
        ? json
        : /^application\/json(;|$)/.test(res.headers.get("content-type"));

    let body;
    try {
      if (isJsonResponse) {
        body = await res.json();
      } else {
        body = await res.text();
      }
    } catch (_err) {
      if (res.ok) {
        const err = new Error(`Unable to parse response: ${_err.message}`);
        err.res = res;
        err.SENTRY_EXTRA = {
          resHeaders: res.headers,
        };
        throw err;
      }
    }

    if (body?.err != null) {
      const { code, message } = body.err;
      const err = new Error(message);
      if (code) err.code = code;
      err.res = res;
      err.body = body;
      err.SENTRY_EXTRA = {
        resHeaders: res.headers,
        resBody: body,
      };
      throw err;
    }

    if (!res.ok) {
      const err = new Error(
        `Server returned ${res.status} ${res.statusText}. ${JSON.stringify(
          body
        )}`
      );
      err.res = res;
      err.body = body;
      err.SENTRY_EXTRA = {
        resHeaders: res.headers,
        resBody: body,
      };
      throw err;
    }

    return raw
      ? {
          res,
          body,
        }
      : body;
  }, maxRetries);
}

["get", "head", "post", "put", "patch", "delete"].forEach((method) => {
  fetcher[method] = async (url, opts = {}) => {
    if (opts.method != null) {
      throw new Error(
        `Cannot use fetcher.${method} with { method: ${opts.method} } option`
      );
    }
    //console.log("Fetcherrrr: ", opts);
    return fetcher(url, { method, ...opts });
  };
});
 */
/**
 * Retries a given function multiple times, using exponential backoff with
 * jitter to space the retries out in time. The function is called with an
 * `abort` function as an argument; if `abort(err)` is called, `err` will
 * be thrown immediately with no additional retries.
 * @param {*} fn Function to retry; passed `abort`
 * @param {*} maxRetries `fn` is called once, plus up to `maxRetries` additional times if it fails
 * @returns the return value of `fn`
 */
/* export async function exponentialRetry(fn, maxRetries = DEFAULT_RETRIES) {
  let attemptNum = 0;

  let abortCalled = false;
  const abort = (err) => {
    abortCalled = true;
    throw err;
  };

  while (true) {
    try {
      return await fn(abort);
    } catch (err) {
      if (abortCalled || attemptNum >= maxRetries) {
        throw err;
      }
    }

    // baseDelay exponentially increases from INITIAL_RETRY_DELAY to MAX_RETRY_DELAY
    const baseDelay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(2, attemptNum),
      MAX_RETRY_DELAY
    );

    // Apply some jitter so the delay is between baseDelay/2 and baseDelay
    const retryDelay = 0.5 * baseDelay * (1 + Math.random());

    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    attemptNum += 1;
  }
} */

const DEFAULT_RETRIES = 5;
const INITIAL_RETRY_DELAY = 500; // ms
const MAX_RETRY_DELAY = 10000; // ms

export async function fetcher(url, options = {}) {
  const {
    raw = false,
    method = "GET",
    headers = {},
    query = {},
    body,
    json = true,
    retry = false,
    ...rest
  } = options;

  const fetchOpts = {
    method: method.toUpperCase(),
    headers: new Headers(headers),
    ...rest,
  };

  if (query) {
    const params = new URLSearchParams(Object.entries(query));
    const queryStr = params.toString();
    url += queryStr ? `?${queryStr}` : "";
  }

  if (body) {
    const isJsonRequest =
      typeof body === "object" &&
      !(body instanceof ArrayBuffer) &&
      !ArrayBuffer.isView(body) &&
      !(body instanceof URLSearchParams) &&
      (typeof Blob === "undefined" || !(body instanceof Blob)) &&
      (typeof FormData === "undefined" || !(body instanceof FormData));

    if (isJsonRequest) {
      fetchOpts.headers.set("Content-Type", "application/json");
      fetchOpts.body = JSON.stringify(body);
    } else {
      fetchOpts.body = body;
    }
  }

  if (json) {
    fetchOpts.headers.set("Accept", "application/json");
  }

  let maxRetries = 0;
  if (retry === true) {
    maxRetries = DEFAULT_RETRIES;
  } else if (typeof retry === "number") {
    maxRetries = retry;
  }

  try {
    return await exponentialRetry(async () => {
      const res = await fetch(url, fetchOpts);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }

      let resBody;
      if (json) {
        try {
          resBody = await res.json();
        } catch (err) {
          throw new Error(`Unable to parse response: ${err.message}`);
        }
      } else {
        resBody = await res.text();
      }

      if (resBody?.err != null) {
        const { code, message } = resBody.err;
        const err = new Error(message);
        if (code) {
          err.code = code;
        }
        err.res = res;
        err.body = resBody;
        throw err;
      }
      return raw ? { res, body: resBody } : resBody;
    }, maxRetries);
  } catch (err) {
    console.error(`Request failed for ${url}. ${err.message}`);
    throw err;
  }
}

["get", "head", "post", "put", "patch", "delete"].forEach((method) => {
  fetcher[method] = async (url, opts = {}) => {
    if (opts.method != null) {
      throw new Error(
        `Cannot use fetcher.${method} with { method: ${opts.method} } option`
      );
    }
    return fetcher(url, { method, ...opts });
  };
});

export async function exponentialRetry(fn, maxRetries = DEFAULT_RETRIES) {
  let attemptNum = 0;

  let abortCalled = false;
  const abort = (err) => {
    abortCalled = true;
    throw err;
  };

  while (true) {
    try {
      return await fn(abort);
    } catch (err) {
      if (abortCalled || attemptNum >= maxRetries) {
        throw err;
      }
    }

    const baseDelay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(2, attemptNum),
      MAX_RETRY_DELAY
    );

    const retryDelay = 0.5 * baseDelay * (1 + Math.random());

    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    attemptNum += 1;
  }
}
