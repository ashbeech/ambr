import { useEffect, useState } from "react";
//import { useTranslation } from 'react-i18next'

import { relativeTime } from "../lib/time.js";

const REFRESH_RATE = 30_000;

export const RelativeTime = ({
  to,
  from,
  placeholder = "",
  onlyText = false,
}) => {
  /*  const {
    i18n: { language }
  } = useTranslation() */

  const [relative, setRelative] = useState(() => relativeTime({ to, from }));

  useEffect(() => {
    const refresh = () => {
      const relative = relativeTime({ to, from });
      setRelative(relative);
    };

    refresh();

    const interval = setInterval(refresh, REFRESH_RATE);

    return () => {
      clearInterval(interval);
    };
  }, [to, from]);

  if (onlyText) {
    if (to == null) return placeholder;
    else return relative;
  }

  if (to == null) {
    return <span>{placeholder}</span>;
  }

  if (!(to instanceof Date)) {
    to = new Date(to);
  }

  return (
    <time dateTime={to.toISOString()} title={to.toLocaleString("English")}>
      {relative}
    </time>
  );
};

/* 
import { useEffect, useState } from "react";
import { relativeTime } from "../lib/time.js";

const REFRESH_RATE = 30_000;

export const RelativeTime = ({ to, from, placeholder = "", onlyText = false, language = "en-US" }) => {
  const [relative, setRelative] = useState(() => relativeTime({ to, from, language }));

  useEffect(() => {
    const refresh = () => {
      const relative = relativeTime({ to, from, language });
      setRelative(relative);
    };

    refresh();

    const interval = setInterval(refresh, REFRESH_RATE);

    return () => {
      clearInterval(interval);
    };
  }, [to, from, language]);

  if (onlyText) {
    if (to == null) return placeholder;
    else return relative;
  }

  if (to == null) {
    return <span>{placeholder}</span>;
  }

  if (!(to instanceof Date)) {
    to = new Date(to);
  }

  return (
    <time dateTime={to.toISOString()} title={to.toLocaleString(language)}>
      {relative}
    </time>
  );
}; */
