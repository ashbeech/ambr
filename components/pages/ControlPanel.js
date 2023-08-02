import {
  Text,
  Box,
  Flex,
  Fade,
  SlideFade,
  OrderedList,
  UnorderedList,
  ListItem,
  HStack,
  VStack,
  Img,
  Link,
  Center,
} from "@chakra-ui/react";
import LogoLoader from "../icons/LogoLoader";
import { shouldReportError } from "../../lib/errors.js";
import { useCallback, useEffect, useState, useContext } from "react";
import { Panel } from "../Panel.js";
import { FilePanel } from "../FilePanel.js";
import { PayPanel } from "../PayPanel.js";
import { RoomList } from "../RoomList.js";
import { SafeContainer } from "../SafeContainer.js";
import { SendPanel } from "../SendPanel.js";
import {
  CREATE_MODE,
  JOIN_MODE,
  SHARE_MODE,
  VERIFY_MODE,
} from "../../lib/Send.js";
import { useSend } from "../../hooks/useSend.js";
import { getUser } from "../../lib/UserManager";
import Navigation from "../Navigation.js";
import Login from "../Login.js";
import { MagicContext } from "../MagicContext.js";
import { makeHash } from "../../lib/make-hash.js";
import { tagline, environment } from "../../config.js";

export function ControlPanel() {
  const { hash, pathname } = globalThis.location;
  const key = hash?.slice(1) || null;
  let roomId = pathname.substring(1) || null;

  // Display logo if not logged in
  let lockedState = (_key && !isLoggedIn) || isLoggedIn;

  const { magic, publicAddress, isLoggedIn } = useContext(MagicContext);
  const [loading, setLoading] = useState(true);
  const [showFiles, setShowFiles] = useState(false);
  //const [showRoomList, setShowRoomList] = useState(false);
  const [_path, setPath] = useState(null);
  const [_key, setKey] = useState(null);
  const [_mode, setMode] = useState(null);
  const [_roomId, setRoomId] = useState(null);
  const [downloadState, setDownloadState] = useState("idle"); // 'idle', 'preparing', 'downloading', 'completed', 'failed'
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileTransfersRemaining, setSharesRemaining] = useState(-999);

  const showFileTransfer =
    (fileTransfersRemaining !== -999 && fileTransfersRemaining <= 0) ||
    fileTransfersRemaining >= 1;

  const {
    mode,
    peerState,
    cloudState,
    chainState,
    mintState,
    verifyState,
    createMintProgress,
    createProgress,
    roomMeta,
    shareUrl,
    files,
    create,
    mint,
    verify,
    getZipUrl,
    handleRoomLifetimeChange,
    handleMaxRoomDownloadsChange,
  } = useSend(roomId, key);

  // NOTE: Frontend logic for UX; update to file transfer record happens at payment-outcome
  const handleFileTransfersRemainingUpdate = (value) => {
    setSharesRemaining(value);
  };

  const handleFiles = useCallback(
    async (files) => {
      setFileName(files[0].name);
      if (create == null) return;
      setShowFiles(false);
      try {
        await create(files);
      } catch (err) {
        console.error("Error: ", err);
        if (shouldReportError(err)) throw err;
      }
    },
    [create]
  );

  const verifyFiles = useCallback(
    async (files) => {
      if (verify == null) return;
      try {
        await verify(files);
      } catch (err) {
        console.error("Error: ", err);
        if (shouldReportError(err)) throw err;
      }
    },
    [verify]
  );

  const handleMint = useCallback(
    async (_finalMetadata) => {
      if (mint == null) return;
      try {
        await mint(_finalMetadata);
      } catch (err) {
        console.error("Error: ", err);
        if (shouldReportError(err)) throw err;
      }
    },
    [mint]
  );

  const initLoader = async (user) => {
    setSharesRemaining(user.fileTransfersRemaining);
    setLoading(false);
  };
  // Must ensure that the user is logged in before loading the page
  useEffect(() => {
    // Check existence of Magic, if not, don't load the page
    if (magic === null) return;
    if (magic !== null && isLoggedIn && publicAddress === "") return;
    if (magic !== null && !isLoggedIn && publicAddress === "")
      setLoading(false);

    if (
      magic !== null &&
      isLoggedIn &&
      publicAddress &&
      fileTransfersRemaining === -999
    ) {
      getUser(publicAddress)
        .then((user) => initLoader(user))
        .catch((error) => console.error(error));
    }
  }, [magic, publicAddress, isLoggedIn, fileTransfersRemaining]);

  useEffect(() => {
    setKey(globalThis.location?.hash.slice(1) || null);
    setDownloadProgress(0);
    setDownloadState("idle");
  }, [_key, setKey]);

  useEffect(() => {
    if (pathname) setPath(pathname);
    if (roomId) roomId ? setRoomId(roomId) : setRoomId(null);
    key ? setKey(globalThis.location?.hash.slice(1)) : setKey(null);
    if (
      (key && mode !== _mode) ||
      (mode === CREATE_MODE && _mode === null) ||
      (mode === SHARE_MODE && _mode === CREATE_MODE) ||
      (pathname === "/" && mode === null && _mode === SHARE_MODE)
    )
      setMode(mode);
    // TODO: Decide if this is OK to un-comment and use to update fileTransfersRemaining
    // Might be good to do a console log of something to see how often this getUser will be called.

    if (publicAddress) {
      // Designed to udate how many file shares a user has in the UI
      updateUser(publicAddress);
    }
  }, [key, mode, _mode, pathname, roomId, publicAddress]);

  useEffect(() => {
    if (
      fileTransfersRemaining <= 0 &&
      pathname === "/" &&
      _mode !== SHARE_MODE
    ) {
      setMode(null);
      setPath("/top-up");
    }
  }, [fileTransfersRemaining, pathname, _mode]);

  /*   const handleChangeRooms = (rooms) => {
    setShowRoomList(rooms.length > 0);
  };
 */

  // Support the Share Target API to receive shared files from other apps
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Ensure that create is non-null so we don't have to add/remove the event
    // listener twice on the first page load
    if (create == null) return;

    const handleMessage = (event) => {
      const { type, files } = event.data;
      if (type === "share-target-files") {
        logEvent("shareTarget");
        handleFiles(files);
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);

    // Tell the service worker that page is ready to receive files
    navigator.serviceWorker.controller?.postMessage({
      type: "share-target-ready",
    });

    return () => {
      try {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      } catch (err) {
        // This happens in UCBrowser
        console.error(err);
      }
    };
  }, [create, handleFiles]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Ensure that verify is non-null so we don't have to add/remove the event
    // listener twice on the first page load
    if (verify == null) return;

    const handleMessage = (event) => {
      const { type, files } = event.data;
      if (type === "share-target-files") {
        logEvent("shareTarget");
        verifyFiles(files);
      }
    };
    navigator.serviceWorker.addEventListener("message", handleMessage);

    // Tell the service worker that page is ready to receive files
    navigator.serviceWorker.controller?.postMessage({
      type: "share-target-ready",
    });

    return () => {
      try {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      } catch (err) {
        // This happens in UCBrowser
        console.error(err);
      }
    };
  }, [verify, verifyFiles]);

  useEffect(() => {
    if (downloadProgress === 100) {
      setDownloadState("downloaded");
    } else if (downloadProgress > 0) {
      setDownloadState("downloading");
    }
  }, [downloadProgress]);

  useEffect(() => {
    if (
      _path === "/top-up" ||
      _path === "/files" ||
      (_path === "/" && _mode === JOIN_MODE)
    ) {
      // Resetting mode
      setMode(null);
    }
  }, [_path, _mode]);

  const updateUser = async (publicAddress) => {
    //console.log("UPDATING USER: ", publicAddress);
    const user = await getUser(publicAddress)
      .then((user) => setSharesRemaining(user.fileTransfersRemaining))
      .catch((error) => console.error(error));
  };

  const handleDownload = async (path) => {
    setDownloadState("preparing");

    const file = files.find((file) => file.path === path);

    let url;
    try {
      url = await file.getDownloadUrl();
    } catch (err) {
      console.error(err);
      return;
    }

    if (url == null) return;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download file: ${file.name}`);
      return;
    }

    const contentLength =
      response.headers.get("Transfer-Encoding") === "chunked"
        ? null
        : response.headers.get("Content-Length");
    const total = contentLength ? Number(contentLength) : null;
    let loaded = 0;

    const reader = response.body.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      //console.log("%: ", loaded);

      if (total !== null) {
        setDownloadProgress(Math.floor((loaded / total) * 100));
      }
    }

    if (total === null) {
      setDownloadProgress(100);
    }

    const blob = new Blob(chunks);
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = file.name;
    a.click();
  };

  const handleDownloadAll = async () => {
    //console.log("Downloading all: ", files);
    // Special case for 1 file download
    if (files.length === 1) {
      handleDownload(files[0].path);
      return;
    }

    const name = `Ambr ${roomId}.zip`;

    let url;
    try {
      url = await getZipUrl();
    } catch (err) {
      console.error(err);
      return;
    }
    if (url == null) return;

    downloadFromUrl(url, name);
  };

  const downloadFromUrl = (url, downloadAttribute) => {
    // Check if the URL is a blob URL
    if (url.startsWith("blob:")) {
      // Create a new <a> element and set its href to the URL
      const a = document.createElement("a");
      // If a download attribute is provided, set it on the <a> element
      if (downloadAttribute) {
        a.setAttribute("download", downloadAttribute);
      }
      a.href = url;
      // Programmatically click the <a> element to initiate the download
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 30 * 1000);

      setDownloadState("completed");
    } else {
      // Create a new hidden <iframe> element and set its src to the URL

      const iframe = document.createElement("iframe");
      iframe.hidden = true;
      iframe.src = url;
      // Append the <iframe> element to the <body> element
      document.body.appendChild(iframe);
      // TODO: Consider removing the <iframe> element from the <body> element
      // after the download has completed to prevent memory leaks

      iframe.addEventListener("load", () => {
        setDownloadState("completed");
        document.body.removeChild(iframe);
      });

      iframe.addEventListener("error", () => {
        setDownloadState("failed");
        document.body.removeChild(iframe);
      });
    }
  };

  const controlPanel = (_isAuthenticated) => {
    const showPanel =
      fileTransfersRemaining !== -999 &&
      fileTransfersRemaining >= 1 &&
      _path !== "/files" &&
      _path !== "/top-up" &&
      _isAuthenticated &&
      _mode !== JOIN_MODE &&
      _mode !== VERIFY_MODE &&
      key === null;
    const showPanel2 =
      fileTransfersRemaining !== -999 &&
      fileTransfersRemaining >= 1 &&
      _path !== "/files" &&
      _path !== "/top-up" &&
      _isAuthenticated &&
      _mode !== JOIN_MODE &&
      _mode !== VERIFY_MODE &&
      _mode === SHARE_MODE;

    const showDownloadPanel =
      (_mode !== CREATE_MODE &&
        _mode === JOIN_MODE &&
        _key &&
        _roomId !== "files" &&
        _roomId !== "top-up") ||
      (_mode !== CREATE_MODE &&
        _mode === VERIFY_MODE &&
        _key &&
        _roomId !== "files" &&
        _roomId !== "top-up");
    const showFilePanel =
      magic !== null && _isAuthenticated && _path === "/files";
    const showSubFilePanel1 = magic !== null && _path === "/files";
    const showTopup =
      (fileTransfersRemaining !== -999 &&
        fileTransfersRemaining <= 0 &&
        _isAuthenticated &&
        _path === "/" &&
        _mode !== SHARE_MODE) ||
      (magic !== null && _isAuthenticated && _path === "/top-up");
    const showHomeStone = magic !== null && !_key && !_isAuthenticated;
    const isExpired =
      (roomMeta !== null && roomMeta.expiresAtTimestampMs < Date.now()) ||
      (roomMeta !== null && roomMeta.remainingDownloads < 1);
    const allFailedIntermission =
      !showPanel &&
      !showPanel2 &&
      !showDownloadPanel &&
      !showFilePanel &&
      !showSubFilePanel1 &&
      !showTopup &&
      !showHomeStone;

    const idHash = makeHash(publicAddress);
    const isUserMatch =
      _isAuthenticated &&
      publicAddress &&
      roomMeta !== null &&
      roomMeta.idHash === idHash;

    {
      /* <-- DEV USE START --> */
    }
    const dev_readout =
      environment === "development"
        ? `All Failed: ${allFailedIntermission} | ID: ${_roomId} | KEY: ${_key} | fileTransRem: ${fileTransfersRemaining} | _path: ${_path} | mode: ${mode} | _mode: ${_mode}`
        : "";
    {
      /* <-- DEV USE END --> */
    }

    return (
      <>
        {/* <-- DEV USE START --> */}
        <Box
          pos={"relative"}
          top={0}
          display={"flex"}
          alignItems={"center"}
          w={"100%"}
        >
          <Text>{dev_readout}</Text>
        </Box>
        {/* <-- DEV USE END --> */}
        {(loading || allFailedIntermission) && (
          <Fade in={loading || allFailedIntermission}>
            <Box
              h={"100dvh"}
              minH={"100%"}
              pos={"fixed"}
              inset={0}
              overflow={"hidden"}
              display={"grid"}
              place-items={"center"}
            >
              <Center h="100%">
                <LogoLoader />
              </Center>
            </Box>
          </Fade>
        )}
        {!loading && (
          <>
            <Flex
              className={!_key && !_isAuthenticated ? "home-stone" : ""}
              backgroundSize={"cover !important"}
              h={"100%"}
              overflowX={"hidden"}
              overflowY={showHomeStone ? "hidden" : "scroll"}
              minH={"100%"}
              pos={"fixed"}
              inset={0}
              display={"grid"}
              place-items={"center"}
            >
              <Box>
                <Navigation
                  fileTransfersRemaining={fileTransfersRemaining}
                  mintState={mintState}
                  chainState={chainState}
                />
                <Box
                  pb={[8, 0]}
                  display={[null, "flex"]}
                  w={[null, "100%"]}
                  justifyContent={[null, "center"]}
                  alignItems={[null, "center"]}
                  h={[null, "73%"]}
                >
                  {lockedState && (
                    <Box display={""} pr={4} spacing={4} w={"100%"}>
                      <HStack
                        alignContent={"center"}
                        flexDirection={"row-reverse"}
                        pl={2}
                        py={4}
                      >
                        <Img
                          src={"/images/logo.svg"}
                          alt="Ambr — Sharing Ideas Worth Protecting"
                          height={10}
                        />
                        {_path !== "/files" && (
                          <Text
                            w={"100%"}
                            alignSelf="flex-end"
                            align={"left"}
                            as={"h1"}
                            fontSize={"2xl"}
                            noOfLines={1}
                            m={0}
                          >
                            {!_key ? "Share your file" : "You`ve got a file"}
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  )}
                  {(showPanel || showPanel2) && (
                    <Fade in={showPanel || showPanel2}>
                      <Box
                        w={"100%"}
                        h={"100%"}
                        maxW={["90%", "100%"]}
                        display={["", "flex"]}
                        alignItems="center"
                        justifyContent="center"
                        position={["relative", "relative"]}
                        top={0}
                        right={0}
                        left={0}
                        bottom={0}
                        margin="auto"
                      >
                        <SafeContainer
                          position={"relative"}
                          display={"block"}
                          w={"100%"}
                          h={"100%"}
                          maxW={["3xl", "3xl", "5xl"]}
                          sx={{
                            paddingInlineStart: "0 !important",
                            paddingInlineEnd: "0 !important",
                          }}
                        >
                          <HStack w={"100%"} h={"100%"}>
                            <Box w={"100%"} h={"100%"} overflow={"visible"}>
                              <Panel
                                className="glass"
                                h={["auto", "28rem"]}
                                minH={[null, "28rem"]}
                                display={["block", "flex"]}
                                flexDirection={["column", "column"]}
                                justifyContent={[null, "center"]}
                                alignItems={[null, "center"]}
                                style={{
                                  transition:
                                    "width 0.1s ease-in, height 0.1s ease-in",
                                }}
                              >
                                <SendPanel
                                  mode={_mode}
                                  creator={publicAddress}
                                  handleFiles={handleFiles}
                                  cloudState={cloudState}
                                  peerState={peerState}
                                  createProgress={createProgress}
                                  createMintProgress={createMintProgress}
                                  roomMeta={roomMeta}
                                  fileName={fileName}
                                  shareUrl={shareUrl}
                                  filesLength={files?.length ?? 0}
                                  handleRoomLifetimeChange={
                                    handleRoomLifetimeChange
                                  }
                                  handleMaxRoomDownloadsChange={
                                    handleMaxRoomDownloadsChange
                                  }
                                  onMint={handleMint}
                                  chainState={chainState}
                                  mintState={mintState}
                                />
                              </Panel>
                            </Box>
                            <Box
                              display={["none", "none", "block"]}
                              p={8}
                              spacing={4}
                              minW={"33%"}
                              maxW={"33%"}
                            >
                              <SlideFade
                                in={showPanel || showPanel2}
                                offsetX={"-10%"}
                                offsetY={"0"}
                                transition={{
                                  enter: { duration: 0.15, ease: "easeOut" },
                                  exit: { duration: 0.15, ease: "easeOut" },
                                }}
                                style={{ height: "100%", width: "100%" }}
                              >
                                <Text
                                  as={"h1"}
                                  className={"fancy"}
                                  noOfLines={3}
                                >
                                  Share
                                  <br />
                                  your pitch
                                  <br />
                                  in a pinch.
                                </Text>
                                <OrderedList>
                                  <ListItem>Upload your file.</ListItem>
                                  <ListItem>
                                    Describe the file&apos;s contents (this will
                                    be private unless you decide to make it
                                    public).
                                  </ListItem>
                                  <ListItem>Share your download link.</ListItem>
                                </OrderedList>
                              </SlideFade>
                            </Box>
                          </HStack>
                        </SafeContainer>
                      </Box>
                    </Fade>
                  )}
                  {showDownloadPanel && (
                    <Fade in={showDownloadPanel}>
                      <Box
                        w={"100%"}
                        h={"100%"}
                        maxW={["90%", "100%"]}
                        display={["", "flex"]}
                        alignItems="center"
                        justifyContent="center"
                        position={["relative", "relative"]}
                        top={0}
                        right={0}
                        left={0}
                        bottom={0}
                        margin="auto"
                      >
                        <SafeContainer
                          position={"relative"}
                          display={"block"}
                          w={"100%"}
                          h={"100%"}
                          maxW={["3xl", "3xl", "5xl"]}
                          sx={{
                            paddingInlineStart: "0 !important",
                            paddingInlineEnd: "0 !important",
                          }}
                        >
                          <HStack w={"100%"} h={"100%"} maxW={"full"}>
                            <Box w={"100%"}>
                              <Panel
                                className="glass"
                                pt={
                                  isExpired
                                    ? ["6 !important", "10 !important"]
                                    : ["0 !important", "10 !important"]
                                }
                                style={{
                                  transition:
                                    "width 0.1s ease-in, height 0.1s ease-in",
                                }}
                              >
                                <FilePanel
                                  roomMeta={roomMeta}
                                  files={files}
                                  verifyFiles={verifyFiles}
                                  verifyState={verifyState}
                                  isDisabled={peerState === "Idle"}
                                  onDownload={handleDownload}
                                  onDownloadAll={handleDownloadAll}
                                  isAuthenticated={_isAuthenticated}
                                  downloadState={downloadState}
                                  downloadProgress={downloadProgress}
                                  isUserMatch={isUserMatch}
                                />
                              </Panel>
                            </Box>
                            <Box
                              display={["none", "none", "block", "block", ""]}
                              p={8}
                              spacing={4}
                              minW={"33%"}
                              maxW={"33%"}
                            >
                              {_isAuthenticated &&
                                isExpired &&
                                !isUserMatch && (
                                  <SlideFade
                                    in={showDownloadPanel}
                                    offsetX={"-10%"}
                                    offsetY={"0"}
                                    transition={{
                                      enter: {
                                        duration: 0.15,
                                        ease: "easeOut",
                                      },
                                      exit: { duration: 0.15, ease: "easeOut" },
                                    }}
                                    style={{ height: "100%", width: "100%" }}
                                  >
                                    <Text as={"h1"} className={"fancy"}>
                                      Share Work Fearlessly
                                    </Text>
                                    <Text as={"p"}>
                                      Each file shared through Ambr generates a
                                      private, unchangeable historic record of
                                      the event and the related work.
                                    </Text>
                                  </SlideFade>
                                )}
                              {isExpired && isUserMatch && (
                                <SlideFade
                                  in={showDownloadPanel}
                                  offsetX={"-10%"}
                                  offsetY={"0"}
                                  transition={{
                                    enter: { duration: 0.15, ease: "easeOut" },
                                    exit: { duration: 0.15, ease: "easeOut" },
                                  }}
                                  style={{ height: "100%", width: "100%" }}
                                >
                                  <Text
                                    as={"h1"}
                                    className={"fancy"}
                                    noOfLines={3}
                                  >
                                    Re-share
                                    <br />
                                    your pitch
                                    <br />
                                    in a pinch.
                                  </Text>
                                  <OrderedList>
                                    <ListItem>
                                      <Text noOfLines={2}>
                                        Re-upload the original file.
                                      </Text>
                                    </ListItem>
                                    <ListItem>
                                      <Text noOfLines={2}>
                                        Keep the file&apos;s certificate private
                                        or make it publicly visible.
                                      </Text>
                                    </ListItem>
                                    <ListItem>
                                      <Text noOfLines={2}>
                                        Share the file&apos;s link for
                                        <br />
                                        others to download.
                                      </Text>
                                    </ListItem>
                                  </OrderedList>
                                </SlideFade>
                              )}
                              {!isExpired && (
                                <>
                                  {isUserMatch && (
                                    <SlideFade
                                      in={showDownloadPanel}
                                      offsetX={"-10%"}
                                      offsetY={"0"}
                                    >
                                      <Text
                                        as={"h1"}
                                        className={"fancy"}
                                        noOfLines={2}
                                      >
                                        Ready to share
                                      </Text>
                                      <UnorderedList>
                                        <ListItem>
                                          <Text noOfLines={2}>
                                            Share the file&apos;s link for
                                            <br />
                                            others to download.
                                          </Text>
                                        </ListItem>
                                        <ListItem>
                                          <Text noOfLines={5}>
                                            Set the file&apos;s certificate to
                                            be private or made publicly visible.
                                          </Text>
                                        </ListItem>
                                      </UnorderedList>
                                    </SlideFade>
                                  )}
                                </>
                              )}
                              {!_isAuthenticated &&
                                !isExpired &&
                                !isUserMatch && (
                                  <SlideFade
                                    in={showDownloadPanel}
                                    offsetX={"-10%"}
                                    offsetY={"0"}
                                  >
                                    <Text as={"h1"} className={"fancy"}>
                                      You&apos;ve
                                      <br />
                                      got a file
                                    </Text>
                                    <Text fontSize={"md"}>
                                      This file&apos;s been shared with you,
                                      <br />
                                      ready to download.
                                      <br />
                                      <br />
                                      By doing so, you acknowledge the
                                      confidential nature of the contents and
                                      agree not to misuse, reproduce,
                                      distribute, or steal the ideas within.
                                      <br />
                                      <br />
                                      All rights, including intellectual
                                      property, belong to the original creator.
                                    </Text>
                                  </SlideFade>
                                )}
                            </Box>
                          </HStack>
                        </SafeContainer>
                      </Box>
                    </Fade>
                  )}
                  {showFilePanel && (
                    <>
                      <Fade
                        in={showSubFilePanel1}
                        h={"100%"}
                        w={"100%"}
                        pos={"relative"}
                      >
                        <Box
                          w={"100%"}
                          h={"100%"}
                          maxW={["90%", "100%"]}
                          display={["", "flex"]}
                          alignItems="center"
                          justifyContent="center"
                          position={["relative", "relative"]}
                          top={0}
                          right={0}
                          left={0}
                          bottom={0}
                          margin="auto"
                        >
                          <SafeContainer
                            position={"relative"}
                            display={"block"}
                            w={"100%"}
                            h={"100%"}
                            pb={[0, 0]}
                            minW={"100% !important"}
                            maxW={["xs", "3xl", "5xl"]}
                            sx={{
                              paddingInlineStart: "0 !important",
                              paddingInlineEnd: "0 !important",
                            }}
                          >
                            <Box w={"100%"} h={"100%"} overflow={"visible"}>
                              <Panel
                                className={"glass"}
                                bg={[
                                  `radial-gradient(farthest-corner at center, RGBA(255, 255, 255, 0.44) 58%, RGBA(224, 224, 220, 0.16) 85%, RGBA(173, 173, 168, 0.16) 95%)`,
                                  `radial-gradient(farthest-corner at center, RGBA(255, 255, 255, 0.44) 58%, RGBA(224, 224, 220, 0.66) 85%, RGBA(173, 173, 168, 0.33) 95%)`,
                                ]}
                                pt={[8, 10]}
                                pb={[8, 10]}
                              >
                                <VStack
                                  display={"flex"}
                                  alignItems="center"
                                  justifyContent="flex-start"
                                  minW={"100%"}
                                  minH={"24rem"}
                                  maxW={["100%", "100%"]}
                                  maxH={[null, "24rem"]}
                                  pt={[0]}
                                >
                                  <RoomList />
                                </VStack>
                              </Panel>
                            </Box>
                          </SafeContainer>
                        </Box>
                      </Fade>
                    </>
                  )}
                  {showTopup && (
                    <Fade in={showTopup}>
                      <Box
                        w={"100%"}
                        h={"100%"}
                        maxW={["90%", "100%"]}
                        display={["", "flex"]}
                        alignItems="center"
                        justifyContent="center"
                        position={["relative", "relative"]}
                        top={0}
                        right={0}
                        left={0}
                        bottom={0}
                        margin="auto"
                      >
                        <SafeContainer
                          position={"relative"}
                          display={"block"}
                          w={"100%"}
                          h={"100%"}
                          maxW={["3xl", "3xl", "5xl"]}
                          sx={{
                            paddingInlineStart: "0 !important",
                            paddingInlineEnd: "0 !important",
                          }}
                        >
                          <HStack w={"100%"} maxW={"full"}>
                            <Box w={"100%"}>
                              <Panel className={"glass"} overflow={"visible"}>
                                <PayPanel
                                  mode={_mode}
                                  fileTransfersRemaining={
                                    fileTransfersRemaining
                                  }
                                  onUpdateFileTransfersRemaining={
                                    handleFileTransfersRemainingUpdate
                                  }
                                  setPath={setPath}
                                  publicAddress={publicAddress}
                                />
                              </Panel>
                            </Box>
                            <Box
                              display={["none", "none", "block", "block", ""]}
                              p={8}
                              spacing={4}
                              minW={"33%"}
                              maxW={"33%"}
                            >
                              {showFileTransfer && (
                                <SlideFade
                                  in={showFileTransfer}
                                  offsetX={"-10%"}
                                  offsetY={"0"}
                                >
                                  {fileTransfersRemaining <= 0 && (
                                    <Text
                                      as={"h1"}
                                      className={"fancy"}
                                      noOfLines={3}
                                    >
                                      We&apos;d love
                                      <br />
                                      to share
                                      <br />
                                      more.
                                    </Text>
                                  )}
                                  {fileTransfersRemaining >= 1 && (
                                    <Text
                                      as={"h1"}
                                      className={"fancy"}
                                      noOfLines={3}
                                    >
                                      Share
                                      <br />
                                      more ideas
                                      <br />
                                      fearlessly.
                                    </Text>
                                  )}
                                  <Text fontSize={"md"} noOfLines={12}>
                                    Proving the origin and authenticity of your
                                    work is made easy with Ambr.
                                    <br />
                                    Feel confident sharing valuable ideas with
                                    clients.
                                  </Text>
                                </SlideFade>
                              )}
                            </Box>
                          </HStack>
                        </SafeContainer>
                      </Box>
                    </Fade>
                  )}
                  {showHomeStone && (
                    <Fade in={showHomeStone} unmountOnExit>
                      <VStack
                        w={"96%"}
                        h={220}
                        position="absolute"
                        px={8}
                        top={0}
                        right={0}
                        left={0}
                        bottom={0}
                        margin="auto"
                        spacing={[3, 5]}
                        zIndex={999}
                      >
                        <Img src={`images/ambr.svg`} />
                        <Text
                          letterSpacing={["normal", "wide"]}
                          fontSize={["lg", "xl"]}
                        >
                          {tagline}
                        </Text>
                        <Login />
                      </VStack>
                    </Fade>
                  )}
                </Box>
                <Box
                  w={"100%"}
                  h={["auto", "13%"]}
                  maxH={"13%"}
                  pl={8}
                  pr={8}
                  pb={showHomeStone ? [4, 0] : [8, 0]}
                  position={
                    showHomeStone ? "absolute" : ["relative", "relative"]
                  }
                  display={["", "flex"]}
                  alignItems={["", "end"]}
                  bottom={[0, 4]}
                  textAlign={"center"}
                  justifyContent={"center"}
                >
                  {!showHomeStone && (
                    <>
                      <Link
                        href={"security"}
                        target="_blank"
                        fontSize={"sm"}
                        title="Take a read of Ambr's Security Statement"
                        fontWeight={"lighter"}
                        pl={3}
                      >
                        Security
                      </Link>
                      <Link
                        href={"terms"}
                        target="_blank"
                        title="Make sure you've read Ambr's Privacy Policy"
                        fontSize={"sm"}
                        fontWeight={"lighter"}
                        pl={2}
                      >
                        Terms
                      </Link>
                      <Link
                        href={"privacy"}
                        target="_blank"
                        fontSize={"sm"}
                        title="Make sure you've read Ambr's Privacy Policy"
                        fontWeight={"lighter"}
                        pl={2}
                      >
                        Privacy
                      </Link>
                    </>
                  )}
                  {showHomeStone && (
                    <>
                      <Link
                        href={"faq"}
                        target="_blank"
                        fontSize={"sm"}
                        title="Take a read of Ambr's frequently asked questions"
                        fontWeight={"normal"}
                        _hover={{ textDecoration: "none", color: "white" }}
                      >
                        What is Ambr?
                      </Link>
                    </>
                  )}
                  <Text
                    display={["block", "inline"]}
                    pl={[3, 4]}
                    pt={[1, 0]}
                    fontSize={"sm"}
                    fontWeight={"lighter"}
                  >
                    &copy; {new Date().getFullYear()}{" "}
                    <Link
                      fontSize={"sm !important"}
                      fontWeight={"lighter"}
                      href={"https://ambr.link"}
                      target="_self"
                      title="Ambr — Share ideas worth protecting."
                    >
                      Ambr
                    </Link>
                  </Text>
                </Box>
              </Box>
            </Flex>
          </>
        )}
      </>
    );
  };

  return (
    <Box className="container">
      <Box>{controlPanel(isLoggedIn)}</Box>
    </Box>
  );
}
