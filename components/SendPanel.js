import { useState, useEffect, useRef } from "react";
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
import CustomText from "./CustomText.js";
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

  const boxRef = useRef(null);
  const [hasBottomBorder, setHasBottomBorder] = useState(false);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    // Check if the child's height is greater than the parent's height
    if (boxRef.current) {
      const parentHeight = boxRef.current.clientHeight;
      const childHeight = boxRef.current.scrollHeight;
      const shouldHaveBorder = childHeight - 21 >= parentHeight;
      setHasBottomBorder(shouldHaveBorder);
    }
  }, [boxRef, update]);

  return (
    <>
      <HStack
        w={"100%"}
        h={["100%", "22rem"]}
        display={["block", "flex"]}
        direction={[null, "row"]}
        spacing={[2, 4]}
        minH={
          mode === SHARE_MODE
            ? ["100%", "20rem", "20rem"]
            : ["100%", "100%", "100%"]
        }
        minW={["100%", "77vw", "40rem"]}
        position="relative"
        style={{
          transition: "width 0.1s ease-in, height 0.1s ease-in",
        }}
      >
        <VStack
          w={mode === SHARE_MODE ? ["100%", "45%"] : ["100%", "45%"]}
          justifyContent={"flex-start"}
          gap={mode === SHARE_MODE ? [0, 0] : 0}
          h={["auto", "100%"]}
        >
          <Fade
            in={mode !== null}
            style={{ height: "auto", width: "100%" }}
            pos={"relative"}
            unmountOnExit
          >
            <Box
              position="relative"
              w={mode === SHARE_MODE ? ["100%", "100%"] : ["100%", "100%"]}
              h={["100%", "auto"]}
              zIndex={2}
            >
              <CustomText
                maxCharacters={41}
                w={"100%"}
                fontSize={"xl"}
                fontWeight={"medium !important"}
                align={"left"}
                noOfLines={3}
                wordBreak="break-word"
                letterSpacing={"0.009em !important"}
                style={{
                  transition: "width 0.1s ease-in, height 0.1s ease-in",
                }}
              >
                <>{fileName}</>
              </CustomText>
            </Box>
            <Text fontSize={"sm"} pt={2}>
              {cloudState === "Uploading" && <>{"Uploading…"}</>}
              {peerState !== "Active" && <>{"Encrypting…"}</>}
              {cloudState === "Uploaded" && <>{"Uploaded."}</>}
            </Text>
          </Fade>
          <Box
            display={"flex"}
            flex={[null, 5]}
            alignItems="center"
            justifyContent="center"
            position={["relative", "relative"]}
            w={mode === SHARE_MODE ? ["full", "100%"] : ["full", "100%"]}
            h={mode === SHARE_MODE ? ["100%", "100%"] : ["100%", "100%"]}
            pt={mode !== CREATE_MODE ? [0, 0] : [0, 2]}
            pl={mode === SHARE_MODE ? [0, 0] : [0, 0]}
            mb={mode !== CREATE_MODE ? [-2, 0] : [0, 0]}
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
                      mr={mode === CREATE_MODE ? [0, 0] : [0, 0]}
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
                    w={
                      mode === SHARE_MODE ? ["100%", "112%"] : ["100%", "112%"]
                    }
                    h={
                      mode === SHARE_MODE ? ["100%", "112%"] : ["100%", "112%"]
                    }
                    pos={"absolute"}
                    style={{
                      filter: isImageLoaded
                        ? `blur(${Math.round(16 - createProgress * 16)}px)` //`blur(${Math.round(6.66 - createProgress * 6.66)}px)`
                        : `blur(33px)`,
                      animation: "blurAnimation 0.15s infinite alternate", // Apply the animation
                      transition: "filter 0.76s ease-in",
                    }}
                  >
                    <Img
                      w={["100%", "100%"]}
                      h={"100%"}
                      ml={[0, 0]}
                      objectFit={"contain !important"}
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
          ref={boxRef}
          w={["full", "55%"]}
          h={"100%"}
          flex={[null, 5]}
          display={mode === SHARE_MODE ? "flex" : null}
          flexDir={mode === SHARE_MODE ? "column" : null}
          gap={mode === SHARE_MODE ? [6, 8] : ["full", "55%"]}
          position={"relative"}
          pl={mode === SHARE_MODE ? [0, "5%"] : [0, 0]}
          top={[null, null]}
          left={[null, null]}
          sx={{ marginInlineStart: "0 !important" }}
          zIndex={999}
          overflowY={"scroll"}
          overflowX={"hidden"}
          borderBottom={
            hasBottomBorder && mode !== SHARE_MODE
              ? [null, "1px solid"]
              : "none"
          }
        >
          <Box
            w={"100%"}
            h={mode === SHARE_MODE ? ["100%", "67%"] : "100%"}
            pt={
              mode === SHARE_MODE
                ? [0, fileName.length >= 41 ? "5.2em" : "1.5em"]
                : 0
            }
            display={"flex"}
            alignItems={"baseline"}
            justifyContent={"center"}
            flexDir={mode === SHARE_MODE ? ["column", null] : null}
            gap={mode === SHARE_MODE ? ["2.25em", null] : null}
          >
            <Fade
              in={mode !== SHARE_MODE}
              style={{ height: "auto", width: "100%" }}
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
                                        onClick={() => {
                                          arrayHelpers.remove(index);
                                          setUpdate(update ? false : true);
                                        }}
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
                                      onClick={() => {
                                        arrayHelpers.insert(index, "");
                                        setUpdate(update ? false : true);
                                      }}
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
                          !formModeLink && !!errors.emails && touched.emails
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
                                          onClick={() => {
                                            arrayHelpers.remove(index);
                                            setUpdate(update ? false : true);
                                          }} // remove a creator from the list
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
                                        onClick={() => {
                                          arrayHelpers.insert(index, "");
                                          setUpdate(update ? false : true);
                                        }} // insert an empty string at a position
                                        className={"p-btn p-m-btn"}
                                      >
                                        +
                                      </Button>
                                    </Flex>
                                    {/*                                     <ErrorMessage
                                      name={`emails.${index}.email`}
                                      component="div"
                                      className="invalid-feedback"
                                    /> */}
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
                    <Box mb={[4, 0]} pb={hasBottomBorder ? [0, 4] : 0}>
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
                            // TODO: If the email is marked required, do not interupt/stop the switch in order to validate the now previous formModeLink state
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
                justifyContent={["left", "flex-start"]}
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
                  formModeLink={formModeLink}
                />
              </Box>
            </Fade>
          </Box>
          <Box h={mode === SHARE_MODE ? ["auto", "33%"] : "auto"}>
            <Collapse
              in={mode === SHARE_MODE && mintState !== "Sealed"}
              style={{ height: "100%", width: "100%" }}
              unmountOnExit
            >
              <HStack
                mt={[4, 4]}
                w="full"
                h={mode === SHARE_MODE ? ["auto", "33%"] : "auto"}
                align="center"
                spacing={2}
              >
                <Icon
                  as={WarningIcon}
                  color={"blackAlpha.900"}
                  boxSize={8}
                  mr={3}
                />
                <Text
                  fontSize={["sm", "md"]}
                  zIndex={999}
                  textAlign={"left"}
                  color={"blackAlpha.900"}
                  noOfLines={3}
                  w={"full"}
                >
                  Please keep this window open until your file is signed and
                  sealed.
                </Text>
              </HStack>
            </Collapse>
            <Collapse
              in={mode === SHARE_MODE && mintState === "Sealed"}
              style={{ height: "100%", width: "100%" }}
              endingHeight={"100%"}
              unmountOnExit
            >
              <Stack
                w="full"
                h={"100%"}
                spacing={[3, 3]}
                alignItems={"flex-start"}
                justifyContent={"end"}
              >
                <Heading
                  h={"auto"}
                  as={"h4"}
                  fontSize={"lg !important"}
                  fontWeight={"normal !important"}
                  lineHeight={"1.44em"}
                  zIndex={999}
                  textAlign={"left"}
                  noOfLines={2}
                  w={"full"}
                >
                  {formModeLink ? (
                    <>
                      You can also securely share <br /> your file via this
                      link:
                    </>
                  ) : (
                    <>Securely share your file via this link:</>
                  )}
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
          </Box>
        </Box>
      </HStack>
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

  useEffect(() => {
    if (progress > 0.99 && mode === CREATE_MODE) {
      setIsIndeterminate(true);
    }
  }, [mode, progress]);

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
            top={[0, 0]}
            left={[0, 0]}
          >
            <CircularProgress
              size={"100%"}
              isIndeterminate={isIndeterminate}
              value={progress * 100}
              color="black.500"
              trackColor="orange.800"
              thickness="0.4px"
              capIsRound={true}
              min={1}
              w={mode === SHARE_MODE ? ["40%", "50%"] : ["40%", "50%"]}
              minW={["5rem", "8rem"]}
              mt={[0, 0]}
            >
              <CircularProgressLabel
                color="black.500"
                fontSize="xl"
                fontWeight={"light"}
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

const CreateMintProgress = ({
  peerState,
  cloudState,
  mintState,
  progress,
  formModeLink,
}) => {
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
          mb={["1.66em", "1.88em"]}
          disabled={peerState === "Active" ? false : true}
          title={peerState === "Inactive" ? "Encrypting" : "Encrypted"}
          size={["lg", "lg"]}
          description={""}
          colorScheme="gray"
        />
      </Box>
      <Box>
        <Check
          mb={["1.66em", "1.88em"]}
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
          title={
            formModeLink && mintState === "Sealed"
              ? `${mintState + " & Sent"}`
              : mintState
          }
          size={["lg", "lg"]}
          description={""}
          colorScheme="gray"
        />
      </Box>
    </VStack>
  );
};
