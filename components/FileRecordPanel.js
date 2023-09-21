import {
  Flex,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Switch,
  Link,
  Icon,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
//import { ExternalLinkIcon } from "@chakra-ui/icons";
import { SealIcon } from "./icons/SealIcon";
//import { DownloadIcon } from "./icons/DownloadIcon";
import { PublicIcon } from "./icons/PublicIcon";
import { PrivateIcon } from "./icons/PrivateIcon";
import { VscClose } from "react-icons/vsc";
import { CopyButton } from "./buttons/CopyButton.js";

export function FileRecordPanel({
  title,
  client,
  key_concept,
  creators,
  numCreators,
  fileHash,
  txHash,
  txHashRaw,
  readableTimeStamp,
  cid,
  cidLink,
  formModeLink,
  isLoading,
  handleClickVerify,
  handleChange,
}) {
  const handleClickCopy = () => {};
  const publicView = !handleClickVerify || !handleChange ? false : true;

  return (
    <>
      <VStack
        mb={publicView ? [1, 0] : [0, 0]}
        w={"full"}
        h={publicView ? "88%" : "100%"}
        borderRadius={"md"}
        overflow={"visible"}
      >
        {publicView && (
          <Flex w="full" zIndex={998}>
            <Flex w={"full"} alignItems="center" justifyContent="space-between">
              <VStack display={"flex"} alignItems={"start"}>
                <HStack left={"-2px"} pos={"relative"}>
                  <SealIcon color={"orange.400"} boxSize={"1.4rem"} />
                  <Heading
                    as={"h3"}
                    fontWeight={"medium !important"}
                    letterSpacing={"normal !important"}
                    zIndex={999}
                    textAlign={"left"}
                    noOfLines={1}
                    w={"full"}
                  >
                    Certificate
                  </Heading>
                </HStack>
                {/* <Text>Recorded historic record of the shared file.</Text> */}
              </VStack>
              <Button
                onClick={handleClickVerify}
                colorScheme="black"
                size="sm"
                variant={"rounded"}
              >
                <Icon top={"1px"} pos={"relative"} as={VscClose} boxSize={4} />
              </Button>
            </Flex>
          </Flex>
        )}
        <Box
          className={"file-record"}
          alignItems={"start"}
          justifyContent={"space-between"}
          w="full"
          overflowY={[null, "scroll"]}
          overflowX={[null, "hidden"]}
          maxH={publicView ? [null, "100%"] : [null, "100%"]}
          fontSize={"md"}
          pt={publicView ? [1, 1] : [2, 2]}
          pb={publicView ? [2, 3] : [0, 2]}
          sx={{
            mt: "0 !important",
            mb: [3, "1 !important"],
          }}
          borderBottom={publicView ? ["", "1px"] : ["", ""]}
        >
          <VStack w="full" alignItems="start">
            <HStack w="full" minH={"1.8rem"}>
              <Text className={"title"} fontWeight={"semibold"} flex={1}>
                {"Date: "}
              </Text>
              <Text className={"content"} w="full" noOfLines={1} flex={8}>
                {readableTimeStamp}
              </Text>
            </HStack>
            {publicView && (
              <HStack w="full" alignItems="center" minH={"1.8rem"}>
                <Text whiteSpace={"nowrap"} fontWeight={"semibold"} flex={1}>
                  {"File: "}
                </Text>
                <Text noOfLines={1} flex={8}>
                  {title}
                </Text>
              </HStack>
            )}
            <HStack
              w="full"
              alignItems={key_concept.length > 37 ? "baseline" : "center"}
              pt={key_concept.length > 37 ? "0.33em" : "0"}
              minH={"1.8rem"}
            >
              <Text whiteSpace={"nowrap"} flex={1} fontWeight={"semibold"}>
                {"Desc: "}
              </Text>
              <Text flex={8}>{key_concept}</Text>
            </HStack>
            <HStack
              w="full"
              alignItems={publicView ? "center" : "top"}
              minH={publicView ? "1.8rem" : "1.8rem"}
            >
              <Text whiteSpace={"nowrap"} fontWeight={"semibold"} flex={1}>
                {"Client: "}
              </Text>
              <Text noOfLines={2} flex={8}>
                {client}
              </Text>
            </HStack>
            <HStack w="full" minH={"1.8rem"}>
              <Text whiteSpace={"nowrap"} fontWeight={"semibold"} flex={1}>
                {numCreators > 1 ? "Creators: " : "Creator: "}
              </Text>
              <Text noOfLines={2} flex={10}>
                {creators}
              </Text>
            </HStack>
            <HStack w="full">
              <Text
                className={"title"}
                fontWeight={"semibold"}
                whiteSpace={"nowrap"}
                flex={1}
              >
                {"Fingerprint: "}
              </Text>
              <Text noOfLines={1}>{fileHash}</Text>
              <CopyButton
                onClick={handleClickCopy}
                text={fileHash}
                colorScheme="black"
                size="sm"
                flex={1}
              />
            </HStack>
            <HStack w="full">
              <Text whiteSpace={"nowrap"} fontWeight={"semibold"} flex={1}>
                {"Blockchain Tx: "}
              </Text>
              <Link
                w="full"
                href={txHash}
                noOfLines={1}
                target={"_blank"}
                isExternal
              >
                {txHashRaw}
              </Link>
              {/* <ExternalLinkIcon pos={"relative"} top={"-1px"} w={4} h={4} /> */}
              <CopyButton
                onClick={handleClickCopy}
                text={txHashRaw}
                colorScheme="black"
                size="sm"
                flex={1}
              />
            </HStack>
            {/*             <HStack w="full">
              <Text whiteSpace={"nowrap"} fontWeight={"semibold"} flex={1}>
                {"Source: "}
              </Text>
              <Link
                w="full"
                href={cidLink}
                noOfLines={1}
                target={"_blank"}
                isExternal
              >
                {cid}
              </Link>
              <CopyButton
                onClick={handleClickCopy}
                text={cidLink}
                colorScheme="black"
                size="sm"
              />
            </HStack> */}
          </VStack>
        </Box>
      </VStack>
      {publicView && (
        <VStack
          w={"full"}
          h={[null, "12%"]}
          pos={["", "relative"]}
          bottom={[null, null]}
          mb={[4, 0]}
          display={["", "flex"]}
          alignItems="center"
          justifyContent="end"
        >
          <Box w={"100%"}>
            <Formik validateOnMount={true} enableReinitialize={true}>
              <Form>
                <Box
                  className={formModeLink ? "important pub" : "important pri"}
                  p={0}
                  zIndex={-999}
                  w={"100%"}
                >
                  <HStack
                    w={"100%"}
                    display="flex"
                    justifyContent="flex-start"
                    left={"-2px"}
                    pos={"relative"}
                  >
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
                    <Text fontWeight={"medium"} noOfLines={1}>
                      {formModeLink ? "Public" : "Private"}
                    </Text>
                  </HStack>
                </Box>
              </Form>
            </Formik>
          </Box>
        </VStack>
      )}
    </>
  );
}
