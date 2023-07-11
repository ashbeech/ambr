import { useState, useEffect } from "react";
import {
  Box,
  Collapse,
  Stack,
  Text,
  Textarea,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Button,
  Input,
  VStack,
  Switch,
  FormControl,
  HStack,
  Heading,
  Icon,
  Fade,
  Img,
} from "@chakra-ui/react";
import { WarningIcon } from "./icons/WarningIcon";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
//import { maxRoomCloudSizeGb, maxRoomSizeGb } from "../config.js";
//import { useBreakpointValue } from "../hooks/useBreakpointValue.js";
import { CREATE_MODE, SHARE_MODE } from "../lib/Send.js";
import { FilePicker } from "./FilePicker.js";
import { Arrow } from "./Arrow.js";
import { Panel } from "./Panel.js";
import { Check } from "./Check.js";
import { Share } from "./Share.js";

export const SendPanel = ({
  mode,
  handleFiles,
  onMint = () => {},
  cloudState,
  peerState,
  chainState,
  mintState,
  createMintProgress,
  createProgress,
  roomMeta,
  fileName,
  creator,
  shareUrl,
  filesLength,
  handleRoomLifetimeChange,
  handleMaxRoomDownloadsChange,
  ...rest
}) => {
  //const { numDownloadingPeers, lifetime, maxDownloads } = roomMeta;
  //const roomCreationTime = roomMeta.expiresAtTimestampMs - roomMeta.lifetime * 1000;

  const [formModeLink, formMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldWarn, setShouldWarn] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState({
    client: "",
    concept: "",
    creators: [""],
    emails: [""],
    mode: formModeLink,
  });

  const handleChange = async (event) => {
    setIsLoading(true);

    try {
      formMode(formModeLink ? false : true);
    } catch (err) {
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const showProgress =
    chainState !== "Active" ||
    (mintState !== "Sealed" &&
      mintState !== "Signing Failed" &&
      cloudState === "Uploading") ||
    (cloudState !== "Uploading" && mintState !== "Sealed") ||
    cloudState === "Uploading";

  const handleSubmit = async (_values) => {
    //setLoading(true);

    // Pass in the key from global this
    //console.log("globalThis", globalThis);
    //console.log("this", this);
    //console.log("roomMeta", roomMeta);

    //const key = globalThis.location?.hash.slice(1) || null;

    const mint = {
      //key: key,
      roomMeta: roomMeta,
      _form_values: {
        ..._values, // spread the values object
        mode: formModeLink, // add mode property with formModeLink value
      },
      creator: creator,
    };

    onMint(mint);
  };

  const validationSchema = Yup.object().shape({
    /*     creators: Yup.array().of(
      Yup.object().shape({
        creator: Yup.string().required("Creator name required"),
      })
    ), */
    /*     emails: Yup.array().of(
      Yup.object().shape({
        email: Yup.string().email("Email invalid").required("Email required"),
      })
    ), */
    concept: Yup.string().required(
      "↑ Required evidential support for your work"
    ),
  });

  useEffect(() => {
    if (
      (mode === CREATE_MODE && mintState !== "Sealed") ||
      (mode === SHARE_MODE && mintState !== "Sealed")
    ) {
      setShouldWarn(true);
    } else {
      setShouldWarn(false);
    }
  }, [mode, cloudState, mintState]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (shouldWarn) {
        event.preventDefault();
        event.returnValue =
          "Leaving this page will cause the upload process to fail.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldWarn]);

  return (
    <>
      <Panel className="glass">
        <HStack
          display={["block", "grid"]}
          maxHeight={[null, null]}
          direction={[null, "row"]}
          spacing={[2, 4]}
          position="relative"
          h={"100%"}
          w={"100%"}
          minH={["100%", "22rem"]}
          minW={["", "", "24rem"]}
          maxW={"40rem"}
        >
          <Box
            w={mode === SHARE_MODE ? ["full", "60%"] : ["full", "45%"]}
            style={{ transition: "width 0.1s ease-in, height 0.1s ease-in" }}
            h={"100%"}
            mb={[3, 0]}
            position={"relative"}
          >
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              h="100%"
            >
              <Fade
                in={mode === CREATE_MODE || mode === SHARE_MODE}
                style={{ height: "100%", width: "100%" }}
                unmountOnExit
              >
                <Box
                  position="absolute"
                  w={mode === SHARE_MODE ? ["100%", "164%"] : "100%"}
                >
                  <Text
                    w={"100%"}
                    style={{
                      transition: "width 0.1s ease-in, height 0.1s ease-in",
                    }}
                    fontSize={mode === SHARE_MODE ? ["2xl", "2xl"] : "2xl"}
                    fontWeight={
                      mode === SHARE_MODE
                        ? ["semibold !important", "semibold !important"]
                        : "medium !important"
                    }
                    align={"left"}
                    noOfLines={2}
                    wordBreak="break-word"
                    pr={"1rem"}
                  >
                    {cloudState === "Uploading" && (
                      <>{"Uploading " + fileName}</>
                    )}
                    {peerState !== "Active" && <>{"Encrypting " + fileName}</>}
                    {cloudState === "Uploaded" && (
                      <>
                        {mode === SHARE_MODE
                          ? fileName
                          : "Uploaded " + fileName}
                      </>
                    )}
                  </Text>
                </Box>
              </Fade>
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
                <Box zIndex={999} h={"100%"} mr={[0, 3]}>
                  <Fade
                    in={mode === null}
                    style={{
                      height: "100%",
                      width: "100%",
                      transition: "height 0.1s ease-in, width 0.1s ease-in",
                    }}
                    unmountOnExit
                  >
                    <FilePicker
                      onFiles={handleFiles}
                      description={"Select a file"}
                    />
                  </Fade>
                  <Fade
                    in={mode === CREATE_MODE || mode === SHARE_MODE}
                    style={{
                      height: "100%",
                      width: "100%",
                      zIndex: -999,
                      transition: "height 0.1s ease-in, width 0.1s ease-in",
                    }}
                    unmountOnExit
                  >
                    <Fade
                      style={{ height: "100%", width: "100%" }}
                      in={showProgress}
                      unmountOnExit
                    >
                      <Flex
                        direction={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        h={"100%"}
                      >
                        <CreateProgress mode={mode} progress={createProgress} />
                      </Flex>
                    </Fade>
                    <Fade
                      in={mode === CREATE_MODE || mode === SHARE_MODE}
                      unmountOnExit
                      style={{ height: "100%", width: "100%" }}
                    >
                      <Fade
                        style={{ height: "100%", width: "100%" }}
                        in={!showProgress}
                        unmountOnExit
                      >
                        {mintState === "Sealed" && (
                          <Box zIndex={99} h={"100%"}>
                            {roomMeta && (
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
                                  mode={"downloaded"}
                                  disabled={false}
                                  title={""}
                                  description={""}
                                  colorScheme="gray"
                                />
                              </Flex>
                            )}
                          </Box>
                        )}
                      </Fade>
                    </Fade>
                  </Fade>
                </Box>
              </Box>
              <Box
                zIndex={-999}
                w={["100%", "100%"]}
                h={["100%", "100%"]}
                pos={["relative", "absolute"]}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position={"relative"}
                  w={"100%"}
                  h={["18rem", "100%"]}
                >
                  <Box
                    overflow={"visible"}
                    width={"24rem"}
                    height={"24rem"}
                    pos={"absolute"}
                  >
                    <Img
                      w={["100%", "100%"]}
                      h={"100%"}
                      ml={["0.8em", 0]}
                      objectFit={"none !important"}
                      src={`/images/amber-7.png`}
                      position={"relative"}
                      alt={`Ambr Stone`}
                      className="file-stone"
                    />
                  </Box>
                </Box>
              </Box>
            </Flex>
          </Box>
          <Box
            h={"100%"}
            overflowY={"scroll"}
            overflowX={"hidden"}
            w={["full", "55%"]}
            position={["relative", "absolute"]}
            top={[null, 0]}
            left={[null, "45%"]}
            sx={{ marginInlineStart: "0 !important" }}
            zIndex={999}
          >
            <Box h={"100%"}>
              <Fade
                in={mode !== SHARE_MODE}
                style={{ height: "100%", width: "100%" }}
                unmountOnExit
              >
                <Formik
                  validateOnMount={true}
                  validationSchema={validationSchema}
                  enableReinitialize={true}
                  initialValues={initialFormValues}
                  onSubmit={(values) => {
                    handleSubmit(values);
                  }}
                >
                  {({ errors, touched, values, isValid }) => (
                    <Form>
                      <VStack
                        margin={"0 0 1.5em 0"}
                        spacing={0}
                        align="flex-start"
                      >
                        <Field
                          as={Input}
                          id="client"
                          name="client"
                          type="text"
                          variant="outline"
                          placeholder={"Client's name"}
                          p={3}
                        />
                        <FormControl
                          isInvalid={!!errors.concept && touched.concept}
                        >
                          <Field
                            as={Textarea}
                            rows="5"
                            name="concept"
                            type="text"
                            variant="outline"
                            placeholder={
                              "Describe the file's key concept? e.g. 'Pitch for super bowl half-time ad spot'"
                            }
                            mt={1}
                            p={3}
                          />
                          <ErrorMessage
                            name="concept"
                            component="div"
                            className="invalid-feedback"
                          />
                        </FormControl>
                        <FormControl
                        //isInvalid={!!errors.creators && touched.creators}
                        >
                          <FieldArray
                            name="creators"
                            render={(arrayHelpers) => (
                              <Box mt={1}>
                                {values.creators.map((creator, index) => (
                                  <Box key={index}>
                                    <Flex>
                                      <Field
                                        as={Input}
                                        name={`creators.${index}.creator`}
                                        type="creator"
                                        variant="outline"
                                        placeholder={
                                          index <= 0
                                            ? "Co-creator's name"
                                            : "Creator's name"
                                        }
                                        p={3}
                                        value={creator.creator || ""} // Ensure a default value is set
                                      />
                                      {values.creators && index > 0 ? (
                                        <Button
                                          ml={4}
                                          type="button"
                                          variant={"rounded"}
                                          onClick={() =>
                                            arrayHelpers.remove(index)
                                          }
                                          className={"m-btn p-m-btn"}
                                        >
                                          −
                                        </Button>
                                      ) : (
                                        ""
                                      )}
                                      <Button
                                        type="button"
                                        variant={"rounded"}
                                        onClick={() =>
                                          arrayHelpers.insert(index, "")
                                        }
                                        className={"p-btn p-m-btn"}
                                      >
                                        +
                                      </Button>
                                    </Flex>
                                    <ErrorMessage
                                      name={`creators.${index}.creator`}
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </Box>
                                ))}
                              </Box>
                            )}
                          />

                          {/* <FieldArray
                            name="creators"
                            render={(arrayHelpers) => (
                              <Box mt={1}>
                                {values.creators.map((creator, index) => (
                                  <Box key={index}>
                                    <Flex>
                                      <Field
                                        as={Input}
                                        name={`creators.${index}.creator`}
                                        type="creator"
                                        variant="outline"
                                        placeholder={
                                          index > 0
                                            ? "Co-creator's name"
                                            : "Creator's name"
                                        }
                                        p={3}
                                      />
                                      {values.creators && index > 0 ? (
                                        <Button
                                          ml={4}
                                          type="button"
                                          variant={"rounded"}
                                          onClick={() =>
                                            arrayHelpers.remove(index)
                                          } // remove a creator from the list
                                          className={"m-btn p-m-btn"}
                                        >
                                          −
                                        </Button>
                                      ) : (
                                        ""
                                      )}
                                      <Button
                                        type="button"
                                        variant={"rounded"}
                                        onClick={() =>
                                          arrayHelpers.insert(index, "")
                                        } // insert an empty string at a position
                                        className={"p-btn p-m-btn"}
                                      >
                                        +
                                      </Button>
                                    </Flex>
                                    <ErrorMessage
                                      name={`creators.${index}.creator`}
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </Box>
                                ))}
                              </Box>
                            )}
                          /> */}
                        </FormControl>
                        <FormControl
                          isInvalid={!!errors.emails && touched.emails}
                        >
                          <Collapse
                            style={{ height: "100%", width: "100%" }}
                            in={formModeLink}
                            unmountOnExit
                          >
                            <FieldArray
                              name="emails"
                              render={(arrayHelpers) => (
                                <Box width={"100%"} mt={1}>
                                  {values.emails.map((email, index) => (
                                    <Box w={"full"} key={index}>
                                      <Flex w={"full"}>
                                        <Field
                                          as={Input}
                                          name={`emails.${index}.email`}
                                          type="email"
                                          variant="outline"
                                          placeholder={"Email file to"}
                                          p={3}
                                        />
                                        {values.emails && index > 0 ? (
                                          <Button
                                            ml={1}
                                            type="button"
                                            variant={"rounded"}
                                            onClick={() =>
                                              arrayHelpers.remove(index)
                                            } // remove a creator from the list
                                            className={"m-btn p-m-btn"}
                                          >
                                            −
                                          </Button>
                                        ) : (
                                          ""
                                        )}
                                        <Button
                                          type="button"
                                          variant={"rounded"}
                                          onClick={() =>
                                            arrayHelpers.insert(index, "")
                                          } // insert an empty string at a position
                                          className={"p-btn p-m-btn"}
                                        >
                                          +
                                        </Button>
                                      </Flex>
                                      <ErrorMessage
                                        name={`emails.${index}.email`}
                                        component="div"
                                        className="invalid-feedback"
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            />
                          </Collapse>
                        </FormControl>
                        <Box w={"full"}>
                          <Button
                            mt={2}
                            type="submit"
                            width="full"
                            isDisabled={
                              mode === CREATE_MODE &&
                              cloudState !== "Preparing" &&
                              isValid
                                ? false
                                : true
                            }
                          >
                            {formModeLink ? "Transfer" : "Get Link"}
                          </Button>
                        </Box>
                      </VStack>
                      <Box mb={[4, 0]}>
                        <HStack>
                          <Field
                            as={Switch}
                            id="mode"
                            name="mode"
                            size="lg"
                            variant="outline"
                            isChecked={formModeLink}
                            onChange={handleChange}
                          />
                          <Text fontWeight={"medium"}>
                            {formModeLink
                              ? "Get a link instead"
                              : "Switch to email transfer"}
                          </Text>
                        </HStack>
                      </Box>
                    </Form>
                  )}
                </Formik>
              </Fade>
              <Fade
                in={mode === SHARE_MODE}
                style={{ height: "100%", width: "100%" }}
                unmountOnExit
              >
                <Box
                  className="center-box"
                  h={"100%"}
                  w={["100%", ""]}
                  justifyContent={["left", "center"]}
                  alignItems={["left", "center"]}
                  display={["", "flex"]}
                  pt={mode === SHARE_MODE ? [0, "8%"] : [0, 0]}
                >
                  <CreateMintProgress
                    peerState={peerState}
                    cloudState={cloudState}
                    chainState={chainState}
                    mintState={mintState}
                    progress={createMintProgress}
                  />
                </Box>
              </Fade>
            </Box>
          </Box>
        </HStack>
        <Collapse
          in={mode === SHARE_MODE && mintState !== "Sealed"}
          unmountOnExit
        >
          <HStack mt={6} w="full" align="center" spacing={2}>
            <Icon as={WarningIcon} boxSize={10} mr={2} />
            <Text
              fontSize={"lg"}
              zIndex={999}
              textAlign={"left"}
              noOfLines={3}
              w={"full"}
            >
              Please keep this window open until your file is signed and sealed.
            </Text>
          </HStack>
        </Collapse>
        <Collapse
          in={mode === SHARE_MODE && mintState === "Sealed"}
          unmountOnExit
        >
          <Stack mt={[8, 0]} w="full" spacing={2}>
            <Heading
              as={"h4"}
              zIndex={999}
              textAlign={"left"}
              noOfLines={1}
              w={"full"}
            >
              {"Ready to Share"}
            </Heading>
            <Share
              url={shareUrl}
              w="full"
              maxW="3xl"
              size={["md", "lg"]}
              justify="center"
            />
          </Stack>
        </Collapse>
      </Panel>
    </>
  );
};

const CreateProgress = ({ mode, progress }) => {
  if (progress == null) progress = 0;

  //console.log("FILE UPLOAD PROGRESS: ", progress);

  const [isIndeterminate, setIsIndeterminate] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsIndeterminate(false);
    }, 5000);
    return () => {
      clearTimeout(timeout);
      setIsIndeterminate(true);
    };
  }, []);

  return (
    <VStack
      display={"flex"}
      alignItems="center"
      justifyContent="center"
      w={"100%"}
      h={"100%"}
      spacing={2}
    >
      <Box position={["", ""]} w={"100%"}>
        <Box display="flex" flexDirection="column">
          {/*           <Box alignSelf="flex-start" position={["", "absolute"]}>
            <Text
              w={"100%"}
              fontFamily={"heading"}
              fontSize={["2xl", "xl"]}
              fontWeight={"bold"}
              align={"left"}
              noOfLines={3}
              wordBreak="break-word"
            >
              {cloudState === "Uploading" && <>{"Uploading " + fileName}</>}
              {peerState !== "Active" && <>{"Encrypting " + fileName}</>}
              {cloudState === "Uploaded" && <>{"Uploaded " + fileName}</>}
            </Text>
          </Box> */}
          <Box
            display={"flex"}
            position={"relative"}
            alignItems="center"
            justifyContent="center"
            pt={[0, 4]}
          >
            <CircularProgress
              size={"100%"}
              isIndeterminate={isIndeterminate}
              value={progress * 100}
              color="black.500"
              trackColor="orange.400"
              thickness="0.4px"
              capIsRound={true}
              min={1}
              w={mode === SHARE_MODE ? ["68%", "65%"] : ["68%", "80%"]}
              minW={["11rem", ""]}
              maxW={["13rem"]}
              mt={["2rem", 0]}
            >
              <CircularProgressLabel
                color="black.500"
                fontSize="2xl"
                fontWeight={"normal"}
              >
                {Math.round(progress * 100) + "%"}
              </CircularProgressLabel>
            </CircularProgress>
          </Box>
        </Box>
      </Box>
    </VStack>
  );
};

let interval = undefined;

const CreateMintProgress = ({ peerState, cloudState, mintState, progress }) => {
  if (progress == null) progress = 0;

  const [isMintIndeterminate, setIsMintIndeterminate] = useState(true);

  const [running, setRunning] = useState(false);
  const [_progress, setProgress] = useState(0);

  useEffect(() => {
    if (running) {
      interval = setInterval(() => {
        setProgress((prev) => prev + 1);
      }, 98);
    } else {
      clearInterval(interval);
    }
  }, [running]);

  useEffect(() => {
    if (_progress === 98) {
      setRunning(false);
      clearInterval(interval);
    }
  }, [_progress]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMintIndeterminate(false);
      setRunning(!running);
    }, 5000);
    return () => {
      clearTimeout(timeout);
      setIsMintIndeterminate(true);
    };
  }, [running]);

  return (
    <>
      <VStack align="left" spacing={0} pl={["", "", ""]}>
        <Box>
          <Check
            mb={["1.88em", "2.6em"]}
            disabled={peerState === "Active" ? false : true}
            title={peerState === "Inactive" ? "Encrypting" : "Encrypted"}
            size={["lg", "lg"]}
            description={""}
            colorScheme="gray"
          />
        </Box>
        <Box>
          <Check
            mb={["1.88em", "2.6em"]}
            disabled={cloudState === "Uploaded" ? false : true}
            title={cloudState}
            size={["lg", "lg"]}
            description={""}
            colorScheme="gray"
          />
        </Box>
        <Box>
          <Check
            disabled={mintState === "Sealed" ? false : true}
            title={mintState}
            size={["lg", "lg"]}
            description={""}
            colorScheme="gray"
          />
        </Box>
      </VStack>
    </>
  );
};
