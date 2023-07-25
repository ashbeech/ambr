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
import { CREATE_MODE, JOIN_MODE, SHARE_MODE } from "../lib/Send.js";
import { FilePicker } from "./FilePicker.js";
import { Arrow } from "./Arrow.js";
import { Check } from "./Check.js";
import { Share } from "./Share.js";

const nowTimestamp = Date.now();
//const randomAmbr = `/images/amber-${(nowTimestamp % 7) + 1}.png`;
const initialFormValues = {
  client: "",
  concept: "",
  creators: [""],
  emails: [""],
  mode: true,
};

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
  const [formModeLink, formMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldWarn, setShouldWarn] = useState(false);
  const [randomAmbr, setRandomAmbr] = useState(
    `/images/amber-${(nowTimestamp % 7) + 1}.png`
  );
  const [shouldReset, shouldResetBoolean] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  console.log("formModeLink", formModeLink);

  /*   const initialFormValues = useMemo(
    () => ({
      client: "",
      concept: "",
      creators: [""],
      emails: [""],
      mode: formModeLink,
    }),
    [formModeLink]
  ); */

  useEffect(() => {
    console.log("RESEEET");
    setRandomAmbr(`/images/amber-${(nowTimestamp % 7) + 1}.png`);
  }, []);

  useEffect(() => {
    // Create an image object to track the image load event
    const image = new Image();
    image.src = randomAmbr;

    // When the image is loaded, update the state
    image.onload = () => {
      setIsImageLoaded(true);
    };

    // Clean up the image object
    return () => {
      image.onload = null;
    };
    console.log("RESET AMBR: ", randomAmbr);
  }, [randomAmbr]);

  const handleChange = async () => {
    setIsLoading(true);
    console.log("randomAmbr 1: ", randomAmbr);
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
    const mint = {
      //key: key,
      roomMeta: roomMeta,
      _form_values: {
        ..._values, // spread the values object
        mode: formModeLink, // add mode property with formModeLink value
      },
      creator: creator,
      stone: randomAmbr,
    };
    onMint(mint);
    shouldResetBoolean(true);
  };

  // Conditional Yup schema
  const validationSchema = Yup.object().shape({
    emails: formModeLink
      ? Yup.array().of(
          Yup.object().shape({
            email: Yup.string()
              .email("Email invalid")
              .required("Email required"),
          })
        )
      : null, // Set to null when formModeLink is false
  });

  // Prevent leaving page before critical client-side interaction is complete
  useEffect(() => {
    if (mode === JOIN_MODE) return;
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
      <Fade
        in={mode === SHARE_MODE}
        h={"auto"}
        w={["100%", "100%"]}
        pos={"relative"}
        style={{ height: "auto", width: "100%" }}
        unmountOnExit
      >
        <Text
          w={"100%"}
          fontSize={"2xl"}
          fontWeight={"semibold !important"}
          align={"left"}
          noOfLines={1}
          wordBreak="break-word"
        >
          {fileName}
        </Text>
      </Fade>
      <HStack
        w={"100%"}
        h={"100%"}
        display={["block", "grid"]}
        minH={
          mode === SHARE_MODE
            ? ["100%", "20rem", "20rem"]
            : ["100%", "22rem", "22rem"]
        }
        minW={["100%", "77vw", "40rem"]}
        maxH={["100%", "24rem"]}
        direction={[null, "row"]}
        spacing={[2, 4]}
        position="relative"
        style={{
          transition: "width 0.1s ease-in, height 0.1s ease-in",
        }}
      >
        <VStack
          w={mode === SHARE_MODE ? ["100%", "50%"] : ["100%", "45%"]}
          h={["auto", "100%"]}
          gap={0}
        >
          <Fade
            in={mode === CREATE_MODE}
            style={{ height: "auto", width: "100%" }}
            h={"auto"}
            w={mode === SHARE_MODE ? ["100%", "100%"] : ["100%", "100%"]}
            pos={"relative"}
            unmountOnExit
          >
            <Box
              position="relative"
              w={mode === SHARE_MODE ? ["100%", "100%"] : ["100%", "100%"]}
              h={["100%", "auto"]}
              pt={"0.5em"}
              zIndex={2}
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
                noOfLines={1}
                wordBreak="break-word"
              >
                {cloudState === "Uploading" && <>{"Uploading " + fileName}</>}
                {peerState !== "Active" && <>{"Encrypting " + fileName}</>}
                {cloudState === "Uploaded" && (
                  <>{mode === SHARE_MODE ? fileName : "Uploaded " + fileName}</>
                )}
              </Text>
            </Box>
          </Fade>
          <Box
            display={"flex"}
            alignItems="center"
            justifyContent="center"
            position={["relative", "absolute"]}
            w={mode === SHARE_MODE ? ["full", "50%"] : ["full", "45%"]}
            h={mode === SHARE_MODE ? ["100%", "100%"] : ["100%", "100%"]}
            //top={mode === CREATE_MODE ? [0, "15%"] : [0, 0]}
            //maxW={mode === SHARE_MODE ? [null, "24rem"] : [null, "17rem"]}
            //pt={mode === CREATE_MODE ? [0, 0] : [0, 8]}
            pt={mode === SHARE_MODE ? [2, 2] : [0, 0]}
            pl={mode === SHARE_MODE ? [0, 0] : [0, 0]}
            mb={[2, 0]}
          >
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              h="100%"
              w={"100%"}
              m={"auto"}
              pos={"relative"}
              style={{
                transition: "width 1s ease-in, height 1s ease-in",
              }}
            >
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                zIndex={998}
                w={["100%", "100%"]}
                h={["100%", "100%"]}
                minW={"8rem"}
              >
                <Box zIndex={998} h={"100%"} mr={[0, 0]} overflow={"hidden"}>
                  <Fade
                    in={mode === null}
                    style={{
                      height: "100%",
                      width: "100%",
                    }}
                    unmountOnExit
                  >
                    <FilePicker
                      mr={mode === CREATE_MODE ? [0, 3] : [0, 3]}
                      onFiles={handleFiles}
                      description={"Select a file"}
                    />
                  </Fade>
                  <Fade
                    in={mode === CREATE_MODE || mode === SHARE_MODE}
                    style={{
                      height: "100%",
                      width: "100%",
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
                        w={"100%"}
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
                          <Box h={"100%"}>
                            {roomMeta && (
                              <Flex
                                direction={"column"}
                                alignItems={"center"}
                                justifyContent={"center"}
                                h={"100%"}
                              >
                                <Arrow
                                  size={["xl"]}
                                  maxW={["7rem"]}
                                  w={["33%"]}
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
                zIndex={1}
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
                  h={["20rem", "100%"]}
                >
                  <Box
                    overflow={"visible"}
                    w={mode === SHARE_MODE ? "100%" : ["100%", "112%"]}
                    h={mode === SHARE_MODE ? "100%" : ["100%", "112%"]}
                    pos={"absolute"}
                    style={{
                      filter: isImageLoaded
                        ? `blur(${Math.round(6.66 - createProgress * 6.66)}px)`
                        : `blur(333px)`,
                      transition: "filter 0.76s ease-in",
                    }}
                  >
                    <Img
                      w={["100%", "100%"]}
                      h={"100%"}
                      ml={[0, 0]}
                      objectFit={["contain !important", "contain !important"]}
                      src={randomAmbr}
                      position={"relative"}
                      alt={`Ambr Stone`}
                      className="file-stone"
                    />
                  </Box>
                </Box>
              </Box>
            </Flex>
          </Box>
        </VStack>
        <Box
          h={"100%"}
          overflowY={"scroll"}
          overflowX={"hidden"}
          w={mode === SHARE_MODE ? ["full", "50%"] : ["full", "55%"]}
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
                enableReinitialize={shouldReset}
                initialValues={initialFormValues}
                onSubmit={(values) => {
                  handleSubmit(values);
                }}
              >
                {({ errors, touched, values, validateForm, isValid }) => (
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
                      //isInvalid={!!errors.concept && touched.concept}
                      >
                        <Field
                          as={Textarea}
                          rows="4"
                          name="concept"
                          type="text"
                          variant="outline"
                          placeholder={
                            "Short description of the file's key concept e.g.'Pitch for super bowl half-time ad spot'"
                          }
                          mt={1}
                          p={3}
                        />
                        {/*                         <ErrorMessage
                          name="concept"
                          component="div"
                          className="invalid-feedback"
                        /> */}
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
                                        index === values.creators.length - 1
                                          ? `Creator's name`
                                          : `Co-creator's name`
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
                      </FormControl>
                      <FormControl
                        isInvalid={
                          formModeLink && !!errors.emails && touched.emails
                        }
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
                                        value={email.email || ""} // Ensure a default value is set
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
                          onChange={async () => {
                            await handleChange();
                            validateForm();
                          }}
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
                w={["100%", "100%"]}
                justifyContent={["left", "center"]}
                alignItems={["left", "center"]}
                display={["", "flex"]}
                pt={mode === SHARE_MODE ? [0, 0] : [0, 0]}
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
        <HStack mt={[4, 4]} w="full" align="center" spacing={2}>
          <Icon as={WarningIcon} boxSize={10} mr={2} />
          <Text
            fontSize={["md", "lg"]}
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
        endingHeight={"auto"}
        unmountOnExit
      >
        <Stack mt={[8, 3]} w="full" spacing={2} h={"auto"} maxH={"6rem"}>
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
          <Box
            display={"flex"}
            position={"relative"}
            alignItems="center"
            justifyContent="center"
            top={[2, 2]}
            left={[0, 0]}
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
              w={mode === SHARE_MODE ? ["68%", "65%"] : ["33%", "60%"]}
              minW={["8rem", null]}
              maxW={["9.5rem", "9.5rem"]}
              mt={[0, 0]}
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
    <VStack align="left" spacing={0} pl={[null, null, null]}>
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
  );
};
