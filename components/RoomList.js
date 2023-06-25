import { useEffect, useState, useContext, useCallback } from "react";
import {
  Box,
  Link,
  Flex,
  Heading,
  Icon,
  Grid,
  Stack,
  Text,
  VStack,
  Skeleton,
  Center,
  Fade,
  Img,
} from "@chakra-ui/react";
import {
  AddIcon,
  // ViewIcon, DeleteIcon,
} from "@chakra-ui/icons";
import { VscFile } from "react-icons/vsc";
import {
  addOrReplaceRoomServer,
  getRoomsServer,
  removeRoomByIdServer,
} from "../lib/RoomStorageManagerServer.js";
import { logEvent } from "../lib/analytics.js";
import { origin } from "../config.js";
import { fetcher } from "../lib/fetcher.js";
import { shouldReportError } from "../lib/errors.js";
import { ButtonLink } from "./ButtonLink.js";
import { CopyButton } from "./buttons/CopyButton.js";
import { RelativeTime } from "./RelativeTime.js";
import { MagicContext } from "../components/MagicContext";
import { ipfsGateway } from "../config.js";

const REFRESH_RATE = 300_000; // 5 minutes

// LOCAL CRON TEST
// NOTE: Triggers Class C transaction--B2 list_filenames cap: https://help.backblaze.com/hc/en-us/articles/224378407-Why-am-I-Reaching-Class-C-Transaction-Caps-with-Synology-
/* const deleteExpiredFiles = async () => {
  try {
    const response = await fetcher.get(`${origin}/api/cron`);
    console.log("deleteExpiredFiles res: ", response || "Nothing to report.");
  } catch (error) {
    console.error(error);
  }
}; */

const getFileFromIPFS = async (_url) => {
  try {
    console.log("getFileFromIPFS: ", _url);
    return await fetch(_url, {
      method: "GET",
    })
      .then((res) => {
        return res.json();
      })
      .catch(() => {
        console.error("IPFS: Unable to fetch url");
      });
  } catch (err) {
    console.error("Room | Failed to read encrypted metadata.", err);
  }
};

export const RoomList = ({ onChange = () => {} }) => {
  const { publicAddress } = useContext(MagicContext);
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateRooms = async (rooms) => {
    try {
      for (const room of rooms) {
        await addOrReplaceRoomServer(room);
      }
      setRooms(await getRoomsServer(publicAddress));
    } catch (err) {
      if (shouldReportError(err)) throw err;
    }
  };

  const removeRooms = useCallback(
    async (rooms) => {
      try {
        for (const room of rooms) {
          await removeRoomByIdServer(publicAddress, room.roomId);
        }
        setRooms(await getRoomsServer(publicAddress));
      } catch (err) {
        if (shouldReportError(err)) throw err;
      }
    },
    [publicAddress]
  );

  useEffect(() => {
    // LOCAL CRON TEST
    // TODO: Delete this as is just a test
    //deleteExpiredFiles();

    // Define an async function to check the expiration of rooms
    const checkExpiration = async (initialRooms = []) => {
      let roomList;

      // If initialRooms is provided, use it
      if (initialRooms !== null && initialRooms.length > 0) {
        roomList = initialRooms;
      } else {
        // Otherwise, fetch rooms for the public address
        try {
          roomList = await getRoomsServer(publicAddress);
        } catch (err) {
          if (shouldReportError(err)) throw err;
          return;
        }
      }

      let hasChanges = false;

      if (roomList === null || (roomList !== null && roomList.length === 0))
        return;
      // Convert roomList to an array if it's not already
      const iterableRoomList = Array.isArray(roomList)
        ? roomList
        : Object.values(roomList);

      // Loop through the rooms and check for changes in remaining downloads
      for (const room of iterableRoomList) {
        try {
          setLoading(true);

          const IPFSdata = await getFileFromIPFS(
            `https://${room.cid}.ipfs.${ipfsGateway}`
          );

          const { remainingDownloads } = await fetcher.get(
            `/api/room/${room.roomId}/remaining-downloads`,
            {
              headers: {
                Authorization: `Bearer sync-v1 ${room.writerToken}`,
              },
              retry: true,
            }
          );

          if (IPFSdata !== null && IPFSdata.image !== null) {
            room.image_src = IPFSdata.image ? IPFSdata.image : "";
          }
          // If the remaining downloads have changed, update the room and set hasChanges to true
          if (remainingDownloads !== room.remainingDownloads) {
            room.remainingDownloads = remainingDownloads;
            hasChanges = true;
          }

          setLoading(false);
        } catch (err) {
          console.error(err);
          return; // Ignore error
        }
      }

      // If there are changes, update the rooms state
      if (hasChanges) updateRooms(roomList);
    };

    // Immediately invoke the async function to initialize rooms and set up the interval
    (async () => {
      try {
        // Initialize rooms
        const initialRooms = await getRoomsServer(publicAddress);
        setRooms(initialRooms);

        // Trigger checkExpiration the first time
        await checkExpiration(initialRooms);

        // Set up an interval to call checkExpiration at a regular interval
        const interval = setInterval(checkExpiration, REFRESH_RATE);

        // Clear the interval when the component unmounts
        return () => {
          clearInterval(interval);
        };
      } catch (err) {
        if (shouldReportError(err)) throw err;
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!Array.isArray(rooms)) {
      return; // rooms is not an array, so exit the useEffect
    }

    const roomsToRemove = rooms.filter((r) => r.remainingDownloads === 0);
    if (roomsToRemove.length > 0) {
      removeRooms(roomsToRemove);
    } else {
      onChange(rooms);
    }
  }, [onChange, removeRooms, rooms]);

  const handleClose = async (room) => {
    await removeRooms([room]);
    return room.roomId;
  };

  const roomsLoaded = !loading && rooms !== null && rooms.length !== 0;

  return (
    <>
      <Heading
        mb={4}
        as={"h2"}
        className="fancy"
        lineHeight={["1.48rem !important"]}
      >
        Your Files
      </Heading>
      <Grid
        overflowY={"scroll"}
        overflowX={"hidden"}
        w={["full", "80vw", "86vw", "50vw"]}
        minW={["", "", "43rem"]}
        maxW={["", "", "40rem"]}
        borderBottom={roomsLoaded ? ["none", "1px solid"] : "none"}
        borderColor={"black.500"}
        pb={[0, 4]}
        templateColumns="repeat(auto-fill, minmax(100%, 1fr))"
      >
        <Box gridColumn={1} gridRow={1}>
          <Box w={"100%"} minW={"100%"}>
            {loading && (
              <>
                <Skeleton
                  startColor="gray.500"
                  endColor="gray.600"
                  height="8rem"
                  borderRadius={"xl"}
                  mb={4}
                  w={"100%"}
                >
                  Fetching File
                </Skeleton>
                <Skeleton
                  startColor="gray.500"
                  endColor="gray.600"
                  height="8rem"
                  borderRadius={"xl"}
                  mb={4}
                  w={"100%"}
                >
                  Fetching File
                </Skeleton>
                <Skeleton
                  startColor="gray.500"
                  endColor="gray.600"
                  height="8rem"
                  borderRadius={"xl"}
                  mb={4}
                  w={"100%"}
                >
                  Fetching File
                </Skeleton>
              </>
            )}
            {!loading && rooms !== null && rooms.length !== 0 && (
              <Fade in={rooms.length > 0}>
                <Stack spacing={[4, 4]} px={[0, 0]}>
                  {rooms.length > 0 &&
                    rooms.map((room) => (
                      <RoomItem
                        key={room.roomId}
                        room={room}
                        onClose={handleClose}
                      />
                    ))}
                </Stack>
              </Fade>
            )}
            {!loading && rooms !== null && rooms.length === 0 && (
              <>
                <Center>
                  <VStack>
                    <Box w={"50%"}>
                      <Text
                        fontSize={"md"}
                        textAlign={"center"}
                        as={"p"}
                        mb={4}
                      >
                        No files yet, but this is where you&apos;ll be able to
                        refer back to, and manage, your previous file transfers.
                      </Text>
                    </Box>

                    <ButtonLink
                      leftIcon={<Icon as={AddIcon} boxSize={3} />}
                      href={"/"}
                      colorScheme="black"
                      size="md"
                    >
                      Begin File Transferring
                    </ButtonLink>
                  </VStack>
                </Center>
              </>
            )}
          </Box>
        </Box>
      </Grid>
    </>
  );
};

export const RoomItem = ({ room, onClose = () => {} }) => {
  const { roomId, title, key, image_src } = room;
  const [deleting, setDeleting] = useState(false);

  const path = `/${roomId}#${key}`;
  const url = `${origin}${path}`;
  const _image_src = image_src.replace(/http:\/\/localhost:3000\//g, origin);

  const isExpired =
    (room !== null && room.expiresAtTimestampMs < Date.now()) ||
    (room !== null && room.remainingDownloads < 1);

  const handleClickCopy = () => {
    logEvent("share", { type: "copy" });
  };

  const handleClickDelete = async () => {
    setDeleting(true);
    onClose(room);
  };

  return (
    <>
      <Box
        py={[4, 4]}
        px={[0, 4]}
        borderWidth={1}
        borderColor="blackAlpha.600"
        borderRadius="3xl"
      >
        <Flex alignItems="center" justifyContent={"space-between"} w={"100%"}>
          <Box pos="relative" flex={1}>
            <Link href={path} colorScheme="black" size="sm">
              <Flex
                direction={"column"}
                alignItems={"center"}
                justifyContent={"center"}
                h={"100%"}
                minW={"80px"}
                px={1}
              >
                <Icon
                  pos="absolute"
                  as={VscFile}
                  boxSize={8}
                  zIndex={998}
                  blendMode="overlay"
                  objectFit={["contain !important"]}
                />
                <Img
                  h="80px"
                  src={_image_src}
                  objectFit={"contain !important"}
                  alt="Ambr Stone"
                  className="file-stone"
                />
              </Flex>
            </Link>
          </Box>

          <VStack
            className={"info"}
            flex={4}
            maxW={"50%"}
            w={["33%", "90%"]}
            pl={[0, 4]}
          >
            <Text
              as={"a"}
              w="full"
              href={[path]}
              cursor={"pointer"}
              align="left"
              noOfLines={1}
              fontSize={["lg", "xl"]}
              fontWeight="normal !important"
            >
              {title}
            </Text>
            <Text
              w="full"
              align="left"
              color="black.500"
              fontSize={["sm", "sm"]}
            >
              {!isExpired ? (
                <>
                  Download available for{" "}
                  <RelativeTime
                    to={Number(room.expiresAtTimestampMs)}
                    onlyText={true}
                  />
                  .
                </>
              ) : (
                <>Historic record.</>
              )}
            </Text>
          </VStack>

          <Flex
            flex={[1, 2]}
            direction={["row"]}
            alignContent={"right"}
            align={"right"}
            flexDirection={["column", "row-reverse"]}
            alignItems={"center"}
          >
            <CopyButton
              onClick={handleClickCopy}
              text={url}
              colorScheme="black"
              size={"md"}
              ml={[0, 2]}
            />
            <ButtonLink
              display={["none", "inherit"]}
              href={path}
              colorScheme="black"
              size="md"
            >
              View
            </ButtonLink>
          </Flex>
        </Flex>
      </Box>
      {/* </Link> */}
    </>
  );
};

{
  /*<Flex justify={"right"} align="right">
         <Box w={"full"} align="right" alignSelf="end">
          <Button
            //leftIcon={<Icon as={DeleteIcon} boxSize={4} />}
            onClick={handleClickDelete}
            colorScheme="black"
            size="sm"
            align="end"
            isDisabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Box>

  </Flex>*/
}
