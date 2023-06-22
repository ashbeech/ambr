export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;

const rtfByLanguage = new Map();

export function relativeTime({
  to = new Date(),
  from = new Date(),
  language = "en-US",
} = {}) {
  if (!(to instanceof Date)) {
    to = new Date(to);
  }
  if (!(from instanceof Date)) {
    from = new Date(from);
  }

  if (
    typeof Intl === "undefined" ||
    typeof Intl.RelativeTimeFormat !== "function"
  ) {
    // No support in Safari 13 and other browsers we don't support
    return to.toLocaleString(language);
  }

  let rtf = rtfByLanguage.get(language);
  // Lazily init when first used
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(language, {
      localeMatcher: "best fit",
      numeric: "auto",
      style: "long",
    });
    rtfByLanguage.set(language, rtf);
  }

  const delta = Math.abs(from.valueOf() - to.valueOf());
  let count, unit;

  if (delta < 10 * SECOND) {
    unit = "second";
    count = 0;
  } else if (delta < MINUTE) {
    unit = "second";
    count = Math.round(delta / SECOND);
  } else if (delta < HOUR) {
    unit = "minute";
    count = Math.round(delta / MINUTE);
  } else if (delta < DAY) {
    unit = "hour";
    count = Math.round(delta / HOUR);
  } else if (delta < WEEK) {
    unit = "day";
    count = Math.round(delta / DAY);
  } else if (delta < MONTH) {
    unit = "week";
    count = Math.round(delta / WEEK);
  } else if (delta < YEAR) {
    unit = "month";
    count = Math.round(delta / MONTH);
  } else {
    unit = "year";
    count = Math.round(delta / YEAR);
  }

  const parts = rtf.formatToParts(
    count * Math.sign(to.valueOf() - from.valueOf()),
    unit
  );
  const formattedString = parts
    .filter(
      (part) =>
        part.type !== "literal" ||
        (part.value !== "in " && part.value !== "ago")
    )
    .map((part) => part.value)
    .join("");
  return formattedString;
}
