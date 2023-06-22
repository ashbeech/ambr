import { useEffect } from "react";
import { useRouter } from "next/router";
import { useToast } from "./useToast.js";

export const useWarnBeforeLeave = (
  expectedPageUrl,
  confirmLeaveMessage,
  unloadCanceledMessage
) => {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    // This is very ugly but seems to work
    // Inspired by https://github.com/vercel/next.js/issues/2476
    if (expectedPageUrl == null) return;

    // Once confirmed, don't block future navigations
    let confirmed = false;
    const confirmNavigation = () => {
      if (!confirmed) {
        confirmed = window.confirm(confirmLeaveMessage);
      }
      return confirmed;
    };

    const routeChangeStart = (url) => {
      if (url === expectedPageUrl) return;

      if (!confirmNavigation()) {
        const err = new Error("Abort route change");
        err.SENTRY_IGNORE = true; // Don't send to sentry
        throw err;
      }
    };
    router.events.on("routeChangeStart", routeChangeStart);

    router.beforePopState(({ as }) => {
      if (as === expectedPageUrl) return true;

      if (confirmNavigation()) {
        return true;
      } else {
        window.history.pushState(null, "", expectedPageUrl); // Fix up browser history state
        router.replace(expectedPageUrl, null, { shallow: true }); // Navigate back
        //router.back();
        return false;
      }
    });

    const beforeUnload = (event) => {
      if (confirmed) return;

      toast({
        title: unloadCanceledMessage,
        status: "warning",
      });

      event.preventDefault(); // Standard
      event.returnValue = ""; // Chrome
    };
    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      router.events.off("routeChangeStart", routeChangeStart);
      router.beforePopState(undefined);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [toast, expectedPageUrl, confirmLeaveMessage, unloadCanceledMessage]); // eslint-disable-line react-hooks/exhaustive-deps
};
