import { chakra, Icon, Box, Button, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useEffect, useState, useRef /* isValidElement */ } from "react";
//import { VscFiles, VscFolderOpened } from "react-icons/vsc";
//import Debug from 'debug'
import dragDrop from "drag-drop";
//import { captureException } from "../lib/sentry.js";
import { useBrowser } from "../hooks/useBrowser.js";
//import { useBreakpointValue } from "../hooks/useBreakpointValue.js";

//const debug = Debug('ambr:FilePicker')

export const FilePicker = ({ onFiles = () => {}, description, ...rest }) => {
  //const isDesktopBreakpoint = useBreakpointValue([false, false, true]);
  const [isDragHover, setIsDragHover] = useState(false);
  const elem = useRef(null);

  const { fileInput, showFilePicker /* showDirectoryPicker */ } =
    useFileInput(onFiles);

  const { isMobile, device } = useBrowser();

  const drag = true; //!isMobile || device === "ipad";

  // Support drag and drop
  useEffect(() => {
    if (!drag) return;

    const cleanupElem = dragDrop(elem.current, {
      onDrop: (files) => onFiles(files),
      onDragEnter: () => setIsDragHover(true),
      onDragLeave: () => setIsDragHover(false),
    });

    // To improve UX, also allow drops anywhere on the page
    const cleanupBody = dragDrop(document.body, onFiles);

    return () => {
      cleanupElem();
      cleanupBody();
    };
  }, [drag, onFiles]);

  // Support pasting from clipboard
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData.items;
      dragDrop.processItems(items, (err, files) => {
        if (err) {
          //captureException(err);
          return;
        }
        if (files.length > 0) {
          onFiles(files);
        }
      });
    };
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [onFiles]);

  // Prevent clicks within <AddFilesButton> from propagating to our onClick
  // handler and triggering an extra call to showFilePicker
  const stopPropagation = (event) => event.stopPropagation();
  //const buttonSize = useBreakpointValue(["lg", "md"]);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={"center"}
      overflow={"visible"}
      h={drag ? ["100%", "full"] : ["auto", "full"]}
      borderStyle={drag && "dashed"}
      borderColor={drag && "black.500"}
      borderWidth={drag && 1}
      borderRadius="2xl"
      backgroundColor={isDragHover ? "whiteAlpha.600" : "none"}
      cursor="default"
      ref={elem}
      onClick={drag ? showFilePicker : () => {}}
      {...rest}
      p={[0, 4]}
      mb={[0, 0]}
    >
      <Box onClick={stopPropagation}>
        <Button
          onClick={showFilePicker}
          maxW={"100%"}
          leftIcon={<Icon as={AddIcon} boxSize={3} />}
        >
          <Text>{description ? description : "Select a file"}</Text>
          {fileInput}
        </Button>
      </Box>
    </Box>
  );
};

const useFileInput = (onFiles = () => {}) => {
  const inputElem = useRef(null);

  const handleChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      onFiles(files);
    }
  };

  const fileInput = (
    <chakra.input
      type="file"
      display="none"
      onChange={handleChange}
      ref={inputElem}
    />
  );

  const showFilePicker = () => {
    //debug('showFilePicker')
    inputElem.current.multiple = true;
    inputElem.current.webkitdirectory = false;
    inputElem.current.click();
  };

  const showDirectoryPicker = () => {
    //debug('showDirectoryPicker')
    inputElem.current.multiple = false;
    inputElem.current.webkitdirectory = true;
    inputElem.current.click();
  };

  return {
    fileInput,
    showFilePicker,
    showDirectoryPicker,
  };
};
