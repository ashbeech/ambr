/* eslint-env browser */

import { useToast as useToastChakra } from "@chakra-ui/react";
import { useCallback } from "react";
//import { useTranslation } from "react-i18next";

export const useToast = () => {
  const toastChakra = useToastChakra();

  const toast = useCallback((opts) => {
    if (opts.status == null) {
      opts.status = "info";
    }
    if (opts.position == null) opts.position = "top";

    if (opts.duration == null) {
      opts.duration = opts.status === "error" ? null : 10_000;
    }

    if (opts.isClosable == null) opts.isClosable = opts.status === "error";

    try {
      // Vibrate API requires user interaction, otherwise it throws
      navigator.vibrate?.(100);
    } catch {}

    toastChakra(opts);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  toast.closeAll = () => toastChakra.closeAll();

  return toast;
};

// Support passing an unmodified error object and show an error toast
export const useToastError = () => {
  const toast = useToast();

  const toastError = useCallback(
    (err, { title, description, status = "error", ...restOpts } = {}) => {
      // ...

      toast({
        title,
        description,
        status,
        ...restOpts,
      });
    },
    [toast]
  );

  toastError.closeAll = () => toast.closeAll();

  return toastError;
};
