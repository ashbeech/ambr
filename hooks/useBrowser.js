import { useContext, useMemo } from "react";

import { AmbrContext } from "../components/AmbrContext.js";
import { browserDetect } from "../lib/browser-detect.js";

export const useBrowser = () => {
  // This is the 'User-Agent' header on the server side
  const { userAgent } = useContext(AmbrContext);
  const browser = useMemo(() => {
    return browserDetect(userAgent);
  }, [userAgent]);
  return browser;
};
