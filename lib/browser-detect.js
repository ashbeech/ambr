/**
 * Detect the browser from the given userAgent string. When called from a
 * browser, `userAgent` can be omitted and it will be inferred automatically,
 * and other techniques are used to improve browser guess accuracy.
 */

export const browserDetect = (userAgent = "") => {
  let nav = null;
  if (typeof navigator !== "undefined") {
    nav = navigator;
    userAgent = nav.userAgent;
  }

  let device = null;

  if (/iphone|ipod/i.test(userAgent)) {
    device = "iphone";
  } else if (
    /ipad/i.test(userAgent) ||
    // iPad OS 13 and up
    (nav?.platform === "MacIntel" && nav?.maxTouchPoints > 1)
  ) {
    device = "ipad";
  }

  let os = null;

  if (device === "iphone" || device === "ipad") {
    os = "ios";
  } else if (/android/i.test(userAgent)) {
    os = "android";
  } else if (/mac os x/i.test(userAgent)) {
    os = "mac";
  } else if (/windows/i.test(userAgent)) {
    os = "windows";
  } else if (/linux/i.test(userAgent)) {
    os = "linux";
  }

  let browser = null;
  let browserAgent = null; // Name of browser, as used in userAgent string

  if (/samsungbrowser\//i.test(userAgent)) {
    browser = "samsung";
    browserAgent = "samsungbrowser";
  } else if (/edg\//i.test(userAgent)) {
    browser = "edge";
    browserAgent = "edg";
  } else if (/edga\//i.test(userAgent)) {
    browser = "edge";
    browserAgent = "edga";
  } else if (/opt\//i.test(userAgent)) {
    // Opera iOS
    browser = "opera";
    browserAgent = "opt";
  } else if (/opr\//i.test(userAgent)) {
    // Opera Android
    browser = "opera";
    browserAgent = "opr";
  } else if (/chrome\//i.test(userAgent)) {
    browser = "chrome";
  } else if (/safari\//i.test(userAgent)) {
    browser = "safari";
  } else if (/firefox\//i.test(userAgent)) {
    browser = "firefox";
  }

  if (browserAgent == null) browserAgent = browser;

  let version = null;

  const versionMatch = userAgent.match(/version\/([\d.]+)/i);
  if (versionMatch != null) {
    version = versionMatch[1];
  } else if (browserAgent) {
    const versionMatch = userAgent.match(
      new RegExp(`${browserAgent}/([\\d.]+)`, "i")
    );
    if (versionMatch != null) {
      version = versionMatch[1];
    }
  }

  let versionMajor = null;
  let versionMinor = null;

  if (version != null) {
    const versionParts = version.split(".");
    versionMajor = Number(versionParts[0]);
    if (versionParts.length > 1) {
      versionMinor = Number(versionParts[1]);
    }
  }

  const isMobile =
    os === "ios" || os === "android" || /mobile/i.test(userAgent);

  let isOutdated = false;
  if (browser === "samsung" && versionMajor < 14) {
    isOutdated = true;
  } else if (
    // TODO: Once Edge Canary on Android becomes stable, the version number will
    // match Chromium and we should replace browserAgent === 'edg' with
    // browser === 'edge'
    (browser === "chrome" || browserAgent === "edg") &&
    versionMajor < 78
  ) {
    isOutdated = true;
  } else if (browser === "safari" && versionMajor < 13) {
    isOutdated = true;
  } else if (browser === "firefox" && versionMajor < 78) {
    isOutdated = true;
  }

  let isUnsupported = false;
  if (browser === "opera" && os === "ios") {
    isUnsupported = true;
  }

  return {
    userAgent,
    browser,
    version,
    versionMajor,
    versionMinor,
    device,
    os,
    isMobile,
    isUnsupported,
    isOutdated,
  };
};
