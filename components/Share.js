import {
  Box,
  Button,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  HStack,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
//import { ImShare } from "react-icons/im";
import { AiOutlineMail, AiOutlineQrcode } from "react-icons/ai";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

import { logEvent } from "../lib/analytics.js";
//import { deepEqual } from "../lib/deep-equal.js";

import { useBrowser } from "../hooks/useBrowser.js";
import { useBreakpointValue } from "../hooks/useBreakpointValue.js";

//import { ShareIconAndroid } from "./icons/ShareIconAndroid.js";
//import { ShareIconIos } from "./icons/ShareIconIos.js";

//import { ButtonLink } from "../components/ButtonLink.js";
import { CopyButton } from "../components/buttons/CopyButton.js";

const QR_CODE_SIZE = [175, 260];

const QRCodePlaceholder = () => <Box boxSize={QR_CODE_SIZE} />;

const QRCode = dynamic(() => import("qrcode.react"), {
  loading: () => <QRCodePlaceholder />,
});

export const Share = React.memo(({ url, size = "md", ...rest }) => {
  size = useBreakpointValue(size);

  const [shareSupport, setShareSupport] = useState(true);

  useEffect(() => {
    setShareSupport(typeof navigator.share === "function");
  }, []);

  const handleClickCopy = () => {
    logEvent("share", { type: "copy" });
  };

  return (
    <Stack spacing={[2, null, 4]} {...rest}>
      <HStack direction={["column", null, "row"]}>
        <ShareInput url={url} size={size} flex={["inherit", null, 1]} />
        <CopyButton
          onClick={handleClickCopy}
          text={url}
          size={size}
          buttonProps={(hasCopied) => ({
            colorScheme: hasCopied ? "orange" : undefined,
          })}
        />
      </HStack>
    </Stack>
  );
}); // <-- deepEqual

Share.displayName = "Share";

const ShareInput = ({ url, size, ...rest }) => {
  const browser = useBrowser();
  const inputElem = useRef(null);

  const handleInputFocus = () => {
    // Safari automatically selects read-only inputs so calling it again
    // interferes
    if (browser.browser === "safari") return;

    inputElem.current.select();
  };

  return (
    <Input
      dir="ltr"
      size={size}
      fontSize={"md"}
      value={url || ""}
      readOnly
      onFocus={handleInputFocus}
      ref={inputElem}
      borderColor="blackAlpha.500"
      borderRadius={"2em !important"}
      _hover={{
        borderColor: "orange.400",
      }}
      _placeholder={{
        color: "orange.600",
      }}
      {...rest}
    />
  );
};

/*
const EmailButton = ({ url, onClick = () => {}, size, ...rest }) => {
  //const isMobileBreakpoint = useBreakpointValue([true, true, false]);

  const subject = "Email Subject";
  const body = url;

  const href = `mailto:?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  const handleClick = () => {
    onClick();
    logEvent("share", { type: "email" });
  };

  return (
    <Button
      leftIcon={<Icon as={AiOutlineMail} boxSize={size === "sm" ? 7 : 6} />}
      onClick={handleClick}
      href={href}
      //size={isMobileBreakpoint ? "lg" : "md"}
      size={"lg"}
      target="_blank"
      {...rest}
    >
      {"Email"}
    </Button>
  );
}; */
/* 
const ShareButton = ({ url, onClick = () => {}, size, ...rest }) => {
  const { os } = useBrowser();

  let shareIcon = null;
  if (os === "mac" || os === "ios") {
    shareIcon = <Icon as={ShareIconIos} boxSize={size === "lg" ? 6 : 5} />;
  } else if (os === "android") {
    //shareIcon = <Icon as={ShareIconAndroid} boxSize={size === "lg" ? 7 : 6} />;
    shareIcon = <Icon as={ShareIconIos} boxSize={size === "lg" ? 6 : 5} />;
  } else if (os === "windows") {
    shareIcon = <Icon as={ImShare} boxSize={size === "lg" ? 7 : 6} />;
  }

  const handleClick = async () => {
    if (typeof navigator.share !== "function") return;

    let success = false;
    try {
      await navigator.share({
        title: "You've got a file",
        url,
      });
      success = true;
    } catch {}

    onClick();

    if (success) {
      logEvent("share", { type: "navigator.share" });
    }
  };

  return (
    <Button leftIcon={shareIcon} onClick={handleClick} size={size} {...rest}>
      {"Share"}
    </Button>
  );
}; */

/* const QRCodeButton = ({ url, size, ...rest }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  //const isMobileBreakpoint = useBreakpointValue([true, false, false]);
  const qrCodeSize = useBreakpointValue(QR_CODE_SIZE);

  const handleClick = () => {
    onOpen();
    logEvent("share", { type: "qr" });
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={AiOutlineQrcode} boxSize={size === "sm" ? 8 : 7} />}
        //size={isMobileBreakpoint ? "lg" : "md"}
        size={"lg"}
        onClick={handleClick}
        {...rest}
      >
        {"QR Code"}
      </Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay
          backdropFilter="auto"
          backdropBlur="4px"
          backgroundColor={"blackAlpha.200"}
        />
        <ModalContent p={4} borderRadius={"2xl"}>
          <ModalHeader align="center">{"Scan to Download"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody align="center">
            <Box
              p={useBreakpointValue([5, 6])}
              //bgGradient="linear(to-l, #7928CA, #FF0080)"
              borderRadius="3xl"
              w="fit-content"
            >
              <Box
                p={useBreakpointValue([7, 10])}
                background="white"
                borderRadius="2xl"
              >
                {url ? (
                  <QRCode
                    value={url}
                    level="M"
                    size={qrCodeSize}
                    renderAs="svg"
                  />
                ) : (
                  <QRCodePlaceholder />
                )}
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
}; */
