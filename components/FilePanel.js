import React, { useState, useEffect } from "react";
import {
  Button,
  Fade,
  Stack,
  HStack,
  Text,
  Flex,
  Heading,
  Img,
  Box,
  Skeleton,
  Icon,
  Switch,
  VStack,
  Spinner,
} from "@chakra-ui/react";
//import { ViewIcon, ViewOffIcon, AttachmentIcon } from "@chakra-ui/icons";
import { SealIcon } from "./icons/SealIcon";
import { DownloadIcon } from "./icons/DownloadIcon";
import { PublicIcon } from "./icons/PublicIcon";
import { PrivateIcon } from "./icons/PrivateIcon";
import { Formik, Form, Field } from "formik";
//import { FileList } from "./FileList.js";
import { FilePicker } from "./FilePicker.js";
import { Share } from "./Share.js";
import { Panel } from "./Panel.js";
import { FileRecordPanel } from "./FileRecordPanel.js";
import { RelativeTime } from "./RelativeTime.js";
import { Arrow } from "./Arrow.js";
import {
  blockExplorer,
  ipfsViewer,
  origin,
  defaultRoomLifetimeMs,
} from "../config.js";

const IPFSImage = ({ image_src }) => {
  return image_src ? (
    <Img
      position={"relative"}
      w={["100%", "100%"]}
      h={["100%", "100%"]}
      src={image_src}
      objectFit={[
        "cover !important",
        "contain !important",
        "contain !important",
        "cover !important",
        "cover !important",
      ]}
      backgroundSize={"100%"}
      alt={`Ambr Stone`}
      className="file-stone"
    />
  ) : (
    <>{"Fetching..."}</>
  );
};

export const FilePanel = ({
  roomMeta,
  files,
  isDisabled,
  verifyFiles,
  verifyState,
  onDownload,
  onDownloadAll,
  isAuthenticated,
  downloadState,
  downloadProgress,
  isUserMatch,
}) => {
  let loaded = false;
  const fullyLoaded =
    loaded == false && roomMeta != null && roomMeta.readableMetadata != null;

  let fileHash = "Preparing ...";
  let txHashRaw = "";
  let txHash = "Preparing ...";
  let cid = "";
  let cidLink = "";
  let readableTimeStamp = "...";
  let creators = "...";
  let _image_src = null;
  let key_concept = "...";
  let client = "...";

  const isExpired =
    isDisabled ||
    (roomMeta !== null &&
      roomMeta.expiresAtTimestampMs < Date.now() &&
      verifyState !== "Verified") ||
    (roomMeta !== null &&
      roomMeta.remainingDownloads < 1 &&
      verifyState !== "Verified");

  const isExPublic = isExpired && isAuthenticated;
  const unVerified = !verifyState || verifyState === "Unverified";

  const [verifyOpen, setVerifyOpen] = useState(null);
  const [formModeLink, formMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (verifyState === "Verified") {
      setRefresh(true);
    }
  }, [verifyState, refresh]);

  useEffect(() => {
    formMode(roomMeta?.isPublic);
    setIsLoading(false);
  }, [roomMeta?.isPublic]);

  useEffect(() => {
    if (!isAuthenticated) {
      setVerifyOpen(false);
    }
    return () => {};
  }, [setVerifyOpen, isAuthenticated]);

  const handleClickVerify = () => {
    setVerifyOpen(!verifyOpen);
  };

  const handleChange = async (event) => {
    setIsLoading(true);

    try {
      formMode(event.target.checked);
      roomMeta.id &&
        (await fetch(`/api/room/${roomMeta.id}/reveal`, {
          method: "PUT",
          body: JSON.stringify({ public: event.target.checked }),
          headers: {
            "Content-Type": "application/json",
          },
        }));
    } catch (err) {
      console.error("Unable to update room:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (fullyLoaded) {
    fileHash = `${roomMeta.readableMetadata.fileHash}`;
    txHashRaw = roomMeta.txHash;
    txHash = `${blockExplorer}/tx/${txHashRaw}`;
    //contractAddressExt = `${blockExplorer}/address/${contractAddress}`;
    cid = roomMeta.cid ? roomMeta.cid : null;
    cidLink = `${ipfsViewer}${cid}`;
    // TODO: Make this dynamic; not localhost, hard-coded.
    _image_src = roomMeta.image_src.replace(
      /http:\/\/localhost:3000\//g,
      origin + "/"
    );

    //console.log(roomMeta);
    //const isUserMatch = roomMeta.isUserMatch ? roomMeta.isUserMatch : false;

    const d = new Date(roomMeta.readableMetadata.timestamp);
    readableTimeStamp =
      d.getHours() +
      ":" +
      (d.getMinutes() < 10 ? "0" : "") +
      d.getMinutes() +
      ", " +
      d.toDateString();

    if (roomMeta.readableMetadata.key_concept != null) {
      key_concept = roomMeta.readableMetadata.key_concept;
    }
    if (roomMeta.readableMetadata.client != null) {
      client = roomMeta.readableMetadata.client;
    }
    if (
      roomMeta.readableMetadata.creators != null &&
      roomMeta.readableMetadata.creators.length > 0 &&
      roomMeta.readableMetadata.creators[0] != undefined
    ) {
      for (let i = 0; i < roomMeta.readableMetadata.creators.length; i++) {
        creators = roomMeta.readableMetadata.creators.join(", ");
      }
    } else {
      creators = "None listed";
    }
    /*     if (
      roomMeta.readableMetadata.recipients != null &&
      roomMeta.readableMetadata.recipients.length > 0 &&
      roomMeta.readableMetadata.recipients[0] != undefined
    ) {
      for (let i = 0; i < roomMeta.readableMetadata.recipients.length; i++) {
        recipients = roomMeta.readableMetadata.recipients.join(", ");
      }
    } else {
      recipients = "None listed";
    } */
    loaded = true;
  }

  return (
    <>
      <Panel
        className="glass"
        pt={
          isExpired
            ? ["6 !important", "10 !important"]
            : ["0 !important", "10 !important"]
        }
      >
        <HStack
          w={"100%"}
          h={"100%"}
          display={["block", "flex"]}
          minH={["100%", "18rem", "18rem"]}
          minW={["100%", "82vw", "36rem"]}
          maxW={["17rem", "38rem"]}
          direction={[null, "row"]}
          spacing={[2, 4]}
          position="relative"
        >
          <Box
            w={["full", "40%"]}
            h={"100%"}
            overflow={"visible"}
            position={["static", "absolute"]}
          >
            {!fullyLoaded && isExpired && (
              <Box w={"100%"} h={"100%"}>
                <Box w={"full"} h={"100%"}>
                  <Flex
                    direction={"column"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    h={"100%"}
                  >
                    <Skeleton
                      startColor={"gray.500"}
                      endColor={"gray.600"}
                      borderRadius={"md"}
                      w={["100%", "90%"]}
                      h={["18rem", "2.525rem"]}
                      maxH={"100%"}
                      minH={"100%"}
                    />
                  </Flex>
                </Box>
              </Box>
            )}
            {fullyLoaded && (
              <Fade
                in={roomMeta != null && cid != null}
                style={{ height: "100%", width: "100%" }}
              >
                <Box overflow={"visible"} h={"100%"} spacing={0}>
                  {!isExpired && (
                    <Box
                      overflow="visible"
                      h="100%"
                      spacing={0}
                      position="relative"
                    >
                      {!isExpired && (
                        <Flex
                          direction="column"
                          alignItems="center"
                          justifyContent="center"
                          h="100%"
                          mr={[0, 3]}
                        >
                          <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            zIndex={997}
                            w={["33%", ""]}
                            h={["33%", ""]}
                            minW={"7rem"}
                          >
                            <Arrow
                              size={["xl", "xl", "xl", "xl", "xl"]}
                              maxW={["100%", "100%"]}
                              h="auto"
                              p={0}
                              disabled={false}
                              title=""
                              description=""
                              colorScheme="gray"
                              mode={!verifyOpen ? downloadState : "downloaded"}
                              progress={downloadProgress}
                            />
                          </Box>
                          <Box
                            position="relative"
                            w={["100%", "175%", "150%"]}
                            //h={["100%", "175%", "150%"]}
                          >
                            <IPFSImage image_src={_image_src} />
                          </Box>
                        </Flex>
                      )}
                    </Box>
                  )}
                  {isExpired && unVerified && (
                    <Fade
                      in={unVerified}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <Box
                        w={"100%"}
                        h={"100%"}
                        my={0}
                        position={["relative", "relative"]}
                      >
                        <Flex
                          direction="column"
                          alignItems="center"
                          justifyContent="center"
                          h="100%"
                          mb={[6, 0]}
                        >
                          <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            zIndex={998}
                            w={["100%", "100%"]}
                            h={["100%", "100%"]}
                            minW={"7rem"}
                          >
                            <Box h={"100%"} mr={[0, 4]}>
                              <FilePicker
                                onFiles={verifyFiles}
                                description={"Re-upload Original"}
                              />
                            </Box>
                          </Box>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position={"relative"}
                            w={["75%", "150%"]}
                            h={["100%", "150%"]}
                          >
                            <IPFSImage image_src={_image_src} />
                          </Box>
                        </Flex>
                      </Box>
                    </Fade>
                  )}
                  {isExpired && !unVerified && verifyState !== "Verified" && (
                    <Fade
                      in={verifyState === "Verifying"}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <Box w={"100%"} h={"100%"}>
                        <Flex
                          direction={"column"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          h={"100%"}
                        >
                          <VStack>
                            <Spinner size="xl" speed="0.33s" />
                            <Text fontWeight={"light"} fontSize={"md"}>
                              Verifying file matches original
                            </Text>
                          </VStack>
                        </Flex>
                      </Box>
                    </Fade>
                  )}
                  {isExpired && verifyState === "Verified" && (
                    <Fade
                      in={verifyState === "Verified"}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <Box w={"100%"} h={"100%"}>
                        <Flex
                          direction={"column"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          h={"100%"}
                        >
                          <Arrow
                            size={["xl"]}
                            maxW={["33%", "40%"]}
                            h={"auto"}
                            p={0}
                            disabled={false}
                            title={""}
                            description={""}
                            colorScheme="gray"
                            mode={"downloaded"}
                            progress={null}
                          />
                          <Box
                            zIndex={-999}
                            w={["100%", "65%"]}
                            h={["60%", "120%"]}
                            pos={"absolute"}
                            top={["-2rem", "-12%"]}
                            left={["0", "-10%"]}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              position={"relative"}
                              w={["100%", "150%"]}
                              h={["100%", "150%"]}
                            >
                              <IPFSImage image_src={_image_src} />
                            </Box>
                          </Box>
                        </Flex>
                      </Box>
                    </Fade>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
          <Box
            h={"100%"}
            w={["full", "60%"]}
            position={["relative", "absolute"]}
            top={[null, 0]}
            left={[null, "40%"]}
            sx={{ marginInlineStart: "0 !important" }}
          >
            <VStack
              display="flex"
              alignItems="flex-start"
              justifyContent="left"
              overflow="visible"
              maxWidth="100%"
              w="100%"
              h={["", "100%"]}
              pl={[0, 6]}
            >
              {!fullyLoaded && (
                <>
                  <Box position={"relative"} w={"100%"}>
                    <Skeleton
                      startColor="gray.500"
                      endColor="gray.600"
                      borderRadius={"md"}
                      h={"2.525rem"}
                      mt={0}
                      mb={5}
                    />
                    <Skeleton
                      startColor="gray.500"
                      endColor="gray.600"
                      borderRadius={"md"}
                      h="0.875rem"
                      mt={0}
                      mb={1}
                    />
                    <Skeleton
                      startColor="gray.500"
                      endColor="gray.600"
                      borderRadius={"md"}
                      w={"75%"}
                      h="0.875rem"
                      mt={0}
                      mb={4}
                    />
                    {!isExpired && (
                      <>
                        <Skeleton
                          startColor="gray.500"
                          endColor="gray.600"
                          borderRadius={"md"}
                          w={"100%"}
                          h="2.525rem"
                          mb={4}
                        />
                      </>
                    )}
                    {isAuthenticated && (
                      <>
                        <HStack mb={4}>
                          <Skeleton
                            startColor="gray.500"
                            endColor="gray.600"
                            borderRadius={"md"}
                            w={"48%"}
                            h="2.525rem"
                            mr={1}
                          />
                          <Skeleton
                            startColor="gray.500"
                            endColor="gray.600"
                            borderRadius={"md"}
                            w={"48%"}
                            h="2.525rem"
                          />
                        </HStack>
                        <Skeleton
                          startColor="gray.500"
                          endColor="gray.600"
                          borderRadius={"md"}
                          w={"25%"}
                          h="1.125rem"
                          mb={2}
                          mt={2}
                        />
                        <Skeleton
                          startColor="gray.500"
                          endColor="gray.600"
                          borderRadius={"md"}
                          w={"100%"}
                          h="2.525rem"
                        />
                      </>
                    )}
                  </Box>
                </>
              )}
              {!verifyOpen && fullyLoaded && files && (
                <Box
                  position={"relative"}
                  w={"100%"}
                  h={["", "auto"]}
                  maxH={["", "100%"]}
                  mb={isExPublic && formModeLink ? 0 : ".8em"}
                >
                  <TopRightPanel
                    isExpired={isExpired}
                    roomMeta={roomMeta}
                    files={files}
                    isDisabled={isDisabled}
                    onDownload={onDownload}
                    onDownloadAll={onDownloadAll}
                    downloadProgress={downloadProgress}
                    refresh={refresh}
                  />
                  {isAuthenticated &&
                    roomMeta != null &&
                    roomMeta.readableMetadata != null &&
                    isUserMatch && (
                      <HStack
                        mt={isExpired ? [4, 8] : [4, 0]}
                        mb={[2, 0]}
                        w="full"
                        overflow="hidden"
                      >
                        <Box flex="1" minW="0" maxW="50%">
                          <Button
                            leftIcon={<SealIcon boxSize={"1.4rem"} />}
                            isDisabled={false}
                            size={"md"}
                            onClick={handleClickVerify}
                            w="full"
                            overflow={"hidden"}
                          >
                            {"View Record"}
                          </Button>
                        </Box>
                        <Box
                          flex="1"
                          minW="0"
                          maxW="50%"
                          className="important"
                          py={"3px"}
                          px={0}
                          mx={"1px"}
                        >
                          <Formik
                            validateOnMount={true}
                            enableReinitialize={true}
                          >
                            <Form>
                              <HStack justifyContent={"flex-start"}>
                                <Field
                                  align={"left"}
                                  as={Switch}
                                  id="mode"
                                  name="mode"
                                  size="lg"
                                  variant="outline"
                                  disabled={isLoading}
                                  isChecked={formModeLink}
                                  onChange={handleChange}
                                />
                                <Icon
                                  as={formModeLink ? PublicIcon : PrivateIcon}
                                  boxSize={"1.85rem"}
                                />
                                <Text fontWeight={"medium"}>
                                  {formModeLink ? "Public" : "Private"}
                                </Text>
                              </HStack>
                            </Form>
                          </Formik>
                        </Box>
                      </HStack>
                    )}
                </Box>
              )}
              {roomMeta && !isUserMatch && roomMeta.isPublic && (
                <>
                  <HStack pb={3} overflow={"visible"}>
                    <SealIcon boxSize={"1.4rem"} />
                    <Heading
                      as={"h3"}
                      fontWeight={"medium !important"}
                      letterSpacing={"normal !important"}
                      zIndex={999}
                      textAlign={"left"}
                      w={"full"}
                      sx={isExpired ? {} : { marginTop: "0 !important" }}
                    >
                      File&apos;s Record:
                    </Heading>
                  </HStack>
                  <Box
                    position={"relative"}
                    maxH={isExpired ? "100%" : ["100%", "auto"]}
                    w={"100%"}
                    h={isExpired ? ["100%", "auto"] : ["100%", "auto"]}
                    sx={{ marginTop: "0 !important" }}
                    pt={isExPublic ? [6, 0] : [0, 0]}
                    overflow="auto"
                    //backgroundColor={["", "#f2f2f2"]}
                    //borderRadius={"xl"}
                    borderBottom={["", "1px"]}
                  >
                    <Box
                      w={"full"}
                      h={!isExPublic ? [null, "auto"] : [null, "auto"]}
                    >
                      <FileRecordPanel
                        title={
                          roomMeta?.readableMetadata.title
                            ? roomMeta.readableMetadata.title
                            : ""
                        }
                        client={client ? client : ""}
                        key_concept={key_concept ? key_concept : ""}
                        creators={creators ? creators : ""}
                        numCreators={
                          roomMeta.readableMetadata.creators.length
                            ? roomMeta.readableMetadata.creators.length
                            : 0
                        }
                        fileHash={fileHash ? fileHash : ""}
                        cid={cid ? cid : ""}
                        cidLink={cidLink ? cidLink : ""}
                        txHash={txHash ? txHash : ""}
                        txHashRaw={txHashRaw ? txHashRaw : ""}
                        readableTimeStamp={
                          readableTimeStamp ? readableTimeStamp : ""
                        }
                      />
                    </Box>
                  </Box>
                </>
              )}
              {verifyOpen &&
                isAuthenticated &&
                roomMeta &&
                roomMeta.readableMetadata &&
                isUserMatch && (
                  <Box w={"100%"} h={["", "100%"]}>
                    <FileRecordPanel
                      title={
                        roomMeta?.readableMetadata.title
                          ? roomMeta.readableMetadata.title
                          : ""
                      }
                      client={client ? client : ""}
                      key_concept={key_concept ? key_concept : ""}
                      creators={creators ? creators : ""}
                      numCreators={
                        roomMeta.readableMetadata.creators.length
                          ? roomMeta.readableMetadata.creators.length
                          : 0
                      }
                      fileHash={fileHash ? fileHash : ""}
                      cid={cid ? cid : ""}
                      cidLink={cidLink ? cidLink : ""}
                      txHash={txHash ? txHash : ""}
                      txHashRaw={txHashRaw ? txHashRaw : ""}
                      readableTimeStamp={
                        readableTimeStamp ? readableTimeStamp : ""
                      }
                      formModeLink={formModeLink}
                      isLoading={isLoading}
                      handleClickVerify={handleClickVerify}
                      handleChange={handleChange}
                    />
                  </Box>
                )}
              {!verifyOpen &&
                fullyLoaded &&
                files &&
                isAuthenticated &&
                roomMeta &&
                isUserMatch && (
                  <Box
                    w={"full"}
                    pos={["relative", "absolute"]}
                    bottom={0}
                    //mt={["","2em !important"]}
                  >
                    <SharePanel
                      shareUrl={
                        origin +
                        globalThis.location?.pathname +
                        globalThis.location?.hash
                      }
                    />
                  </Box>
                )}
            </VStack>
          </Box>
        </HStack>
      </Panel>
    </>
  );
};

const TopRightPanel = React.memo(
  ({ isExpired, roomMeta, files, isDisabled, onDownloadAll, refresh }) => {
    const [d, setD] = useState(new Date()); // initialize d to current date
    //const [title, setTitle] = useState("Fetching File");
    const strings = ["You've got a file", "Your file awaits"];
    //const randomIndex = Math.floor(Math.random() * strings.length);
    const title = roomMeta?.readableMetadata.title; //strings[randomIndex];

    // HACK: Disable download all button if there's a file greater than 4GB
    const downloadAllSupported =
      files.length === 1 || files.every((file) => file.length < 2 ** 32);

    function formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }

    useEffect(() => {
      if (roomMeta?.readableMetadata?.timestamp) {
        const newD = new Date(roomMeta.readableMetadata.timestamp);
        setD(newD);
      }
    }, [roomMeta]);

    return (
      <Stack spacing={[2, 2]} h={isExpired ? ["", "auto"] : ["", "auto"]}>
        {roomMeta && (
          <Heading
            as={"h2"}
            zIndex={999}
            textAlign={"left"}
            noOfLines={2}
            w={"full"}
            overflowX={"hidden"}
            overflowY={"scroll"}
          >
            {title}
          </Heading>
        )}
        {roomMeta &&
          roomMeta.expiresAtTimestampMs != null &&
          roomMeta.remainingDownloads != null && (
            <Fade in>
              <Box overflow={"hidden"} mb={[2, 0]} spacing={0}>
                <Text fontSize={"sm"} zIndex={999} noOfLines={[3, 2]}>
                  Shared <RelativeTime to={d} />.{" "}
                  {!isExpired && (
                    <>
                      Available for{" "}
                      <RelativeTime
                        to={
                          refresh
                            ? new Date(
                                Date.now() + defaultRoomLifetimeMs
                              ).getTime()
                            : Number(roomMeta.expiresAtTimestampMs)
                        }
                        onlyText={true}
                      />
                      .
                    </>
                  )}
                  {isExpired && (
                    <>
                      {" "}
                      This file&apos;s original download link has expired, but
                      historic record remains.
                    </>
                  )}
                </Text>
              </Box>
            </Fade>
          )}
        {/*       {!isExpired && (
        <FileList
          files={files}
          isDisabled={isDisabled || files.length === 0}
          onDownload={onDownload}
          downloadProgress={downloadProgress}
          mb={4}
        />
      )} */}
        {!isExpired && (
          <Box justify="space-between" align="center">
            <Stack
              overflow={"hidden"}
              spacing={2}
              mb={[0, 4]}
              mt={!isExpired ? [4, 3] : [4, 0]}
            >
              {downloadAllSupported && (
                <Button
                  leftIcon={<Icon as={DownloadIcon} boxSize={5} />}
                  isDisabled={isDisabled || files.length === 0 || isExpired}
                  w={"100%"}
                  onClick={onDownloadAll}
                >
                  <Text>
                    {"Download" + ` (${formatBytes(files[0].length, 0)})`}
                  </Text>
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    );
  }
);

TopRightPanel.displayName = "TopRightPanel";

const SharePanel = ({ shareUrl }) => {
  return (
    <>
      <Fade in={shareUrl}>
        <Heading
          as={"h4"}
          fontWeight={"medium !important"}
          zIndex={999}
          textAlign={"left"}
          noOfLines={1}
          w={"full"}
          pb={2}
        >
          {"Share"}
        </Heading>
        <Share
          url={shareUrl}
          w="full"
          maxW="3xl"
          size={"md"}
          justify="center"
        />
      </Fade>
    </>
  );
};

SharePanel.displayName = "SharePanel";
