import { useCallback, useDebugValue, useEffect, useState } from "react";
import { useRouter } from "next/router";
import queueMicrotask from "queue-microtask";
import { useToast, useToastError } from "./useToast.js";
//import { useWarnBeforeLeave } from "./useWarnBeforeLeave.js";
import {
  //CREATE_MODE,
  JOIN_MODE,
  Send,
} from "../lib/Send.js";
import { shouldReportError } from "../lib/errors.js";
import { origin } from "../config.js";

export const useSend = (id, key) => {
  const router = useRouter();

  const [send, setSend] = useState(null);
  const [mode, setMode] = useState(id ? JOIN_MODE : null);
  const [peerState, setPeerState] = useState("Idle");
  const [cloudState, setCloudState] = useState("Preparing");
  const [chainState, setChainState] = useState("Idle");
  const [mintState, setMintState] = useState("Preparing");
  const [verifyState, setVerifyState] = useState(false);
  const [createProgress, setCreateProgress] = useState(null);
  const [createMintProgress, setCreateMintProgress] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [roomMeta, setRoomMeta] = useState(null);
  const [files, setFiles] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);

  const toast = useToast();
  const toastError = useToastError();

  const isExpired = roomMeta !== null && roomMeta?.remainingDownloads === 0;

  const handleUrl = useCallback(
    (url) => {
      if (url) {
        //console.log("Reloads page with:", origin + url);
        setShareUrl(origin + url);
        router.push(url, undefined, { shallow: true });
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleError = useCallback(
    (err) => {
      toastError(err, {
        title: "useSend.fileTransferError",
      });
      if (shouldReportError(err)) {
        // Ensure other error handlers run despite throwing
        queueMicrotask(() => {
          throw err;
        });
      }
    },
    [toastError]
  );

  // Determine if we should warn about leaving the share URL before upload finishes
  /* let showWarnBeforeLeave = false;
  let confirmLeaveMessage = null;
  let unloadCanceledMessage = null;
  if (mode === JOIN_MODE) {
    confirmLeaveMessage = "useSend.confirmLeaveDownload";
    unloadCanceledMessage = "useSend.unloadCanceledDownload";
    showWarnBeforeLeave = downloading && !isExpired;
  } else if (mode === CREATE_MODE) {
    const cloudUploadFailed = cloudState === "Upload Failed";
    confirmLeaveMessage = cloudUploadFailed
      ? "useSend.confirmLeaveP2P"
      : "useSend.confirmLeaveCloud";
    unloadCanceledMessage = cloudUploadFailed
      ? "useSend.unloadCanceledP2P"
      : "useSend.unloadCanceledCloud";
    showWarnBeforeLeave = cloudState !== "Uploaded" && !isExpired;
  }

  let warnIfLeavingPath = null;
  if (showWarnBeforeLeave && shareUrl?.startsWith(origin)) {
    warnIfLeavingPath = shareUrl.slice(origin.length);
  }

  // Show warning before leaving page
  useWarnBeforeLeave(
    warnIfLeavingPath,
    confirmLeaveMessage,
    unloadCanceledMessage
  );
 */
  useEffect(() => {
    const send = new Send();
    setSend(send);

    send.on("mode", setMode);
    send.on("peerState", setPeerState);
    send.on("cloudState", setCloudState);
    send.on("chainState", setChainState);
    send.on("mintState", setMintState);
    send.on("verifyState", setVerifyState);
    send.on("createMintProgress", setCreateMintProgress);
    send.on("createProgress", setCreateProgress);
    send.on("downloading", setDownloading);

    send.on("meta", setRoomMeta);
    send.on("url", handleUrl);
    send.on("files", setFiles);
    send.on("error", handleError);

    return () => {
      send.destroy();
      send.off("mode", setMode);
      send.off("peerState", setPeerState);
      send.off("cloudState", setCloudState);
      send.off("chainState", setChainState);
      send.off("mintState", setMintState);
      send.off("verifyState", setVerifyState);
      send.off("createMintProgress", setCreateMintProgress);
      send.off("createProgress", setCreateProgress);
      send.off("downloading", setDownloading);
      send.off("meta", setRoomMeta);
      send.off("url", handleUrl);
      send.off("files", setFiles);
      send.off("error", handleError);

      setSend(null);
    };
  }, [handleError, handleUrl]);

  useEffect(() => {
    (async () => {
      try {
        await send?.join(id, key);
      } catch (err) {
        console.error("ERROR:", err);
        if (err) {
          toastError(err, { title: err.message });
        }
        if (shouldReportError(err)) throw err;
      }
    })();
  }, [send, id, key, toastError]);

  // If room expired, show expiration page
  useEffect(() => {
    if (!isExpired) return;

    const filesLength = files !== null ? files.length : 10;
    //console.log("File Length: ", filesLength);
    toast({
      title: downloading
        ? ("useSend.roomExpiredWhileDownloading", { count: filesLength })
        : ("useSend.roomExpired", { count: filesLength }),
      description: downloading
        ? "useSend.roomExpiredWhileDownloadingDescription"
        : ("useSend.roomExpiredDescription", { count: filesLength }),
      status: "error",
    });

    // Force refresh page
    //console.log("Force refresh page");
    router.push({
      pathname: window.location.pathname,
      hash: window.location.hash,
      query: { error: "gone" },
    });
  }, [downloading, files, isExpired, router, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show warning when uploader went offline
  useEffect(() => {
    (async () => {
      if (mode !== JOIN_MODE || !roomMeta) return;

      const showMessage =
        ["Upload Failed", "sender-left"].includes(cloudState) &&
        roomMeta.numDownloadingPeers === 0;

      if (showMessage) {
        toast({
          title: "useSend.uploaderMissing",
          description: "useSend.uploaderMissingDescription",
          status: "warning",
        });
        //console.log("showMessage: ", showMessage);
      }
    })();
  }, [cloudState, mode, roomMeta, toast]);

  // Log state changes
  /*   useEffect(() => {
    console.log(
      `state mode=${mode}, peerState=${peerState}, cloudState=${cloudState}`
    );
  }, [mode, peerState, cloudState]); */

  useDebugValue(
    `mode=${mode}, peerState=${peerState}, cloudState=${cloudState}`
  );

  const create = useCallback(
    async (uploadFiles) => {
      try {
        await send.create(uploadFiles);
      } catch (err) {
        toastError(err, { title: "useSend.createError" });
        throw err;
      }
    },
    [send, toastError]
  );

  const mint = useCallback(
    async (_finalMetadata) => {
      try {
        //console.log("Mint useSend Call", _finalMetadata);

        await send.mint(_finalMetadata);
      } catch (err) {
        toastError(err, { title: "useSend.createError" });
        throw err;
      }
    },
    [send, toastError]
  );

  const verify = useCallback(
    async (uploadFiles) => {
      //console.log("VERIFY ROOM META: ", roomMeta);
      try {
        if (roomMeta !== null && roomMeta?.fileHash) {
          await send.verify(
            uploadFiles,
            roomMeta?.fileHash,
            id,
            key,
            roomMeta.idHash
          );
        }
      } catch (err) {
        if (err) {
          toastError(err, { title: err.message });
        }
        if (shouldReportError(err)) throw err;
      }
    },
    [send, roomMeta, key, id, toastError]
  );

  const getZipUrl = useCallback(() => send.room.getZipUrl(), [send]);

  const handleDelete = useCallback(async () => {
    await send.room.handleDelete();

    // If the deletion succeeded, redirect to the homepage
    router.push("/");
  }, [send, router]);

  const handleReport = useCallback(
    async (reason) => {
      await send.room.handleReport(reason);

      // If the report succeeded, redirect to the homepage
      router.push("/");
    },
    [send, router]
  );

  const handleRoomLifetimeChange = useCallback(
    (lifetime) => send.room.handleRoomLifetimeChange(lifetime),
    [send]
  );

  const handleMaxRoomDownloadsChange = useCallback(
    (maxDownloads) => send.room.handleMaxRoomDownloadsChange(maxDownloads),
    [send]
  );

  return {
    mode,
    roomMeta,
    peerState,
    cloudState,
    chainState,
    mintState,
    verifyState,
    createMintProgress,
    createProgress,
    files,
    shareUrl,
    create: send && create,
    mint: send && mint,
    verify: send && verify,
    getZipUrl: send && getZipUrl,
    handleDelete: send && handleDelete,
    handleReport: send && handleReport,
    handleRoomLifetimeChange: send && handleRoomLifetimeChange,
    handleMaxRoomDownloadsChange: send && handleMaxRoomDownloadsChange,
  };
};
