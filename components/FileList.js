/* eslint-env browser */
import {
  Box,
  Text,
  //Flex,
  Button,
  Skeleton,
  Spinner,
  Stack,
  useDisclosure,
  //Img,
} from "@chakra-ui/react";
import { truncateString } from "../lib/truncateString.js";
import { useState, useEffect } from "react";
//import { extname } from "path";
import { MediaViewer, getSupportedMediaType } from "./MediaViewer.js";

// Run once when this file is imported
if (typeof CSS !== "undefined" && typeof CSS.registerProperty === "function") {
  try {
    // HACK: Safari 14 throws an exception "SyntaxError: The given initial value
    // does not parse for the given syntax." when CSS.registerProperty's
    // initialValue is a percentage.
    CSS.registerProperty({
      name: "--filelist-progress",
      syntax: "<percentage>",
      inherits: false,
      initialValue: "0%",
    });
    CSS.registerProperty({
      name: "--filelist-r",
      syntax: "<number>",
      inherits: false,
      initialValue: "0",
    });
    CSS.registerProperty({
      name: "--filelist-g",
      syntax: "<number>",
      inherits: false,
      initialValue: "0",
    });
    CSS.registerProperty({
      name: "--filelist-b",
      syntax: "<number>",
      inherits: false,
      initialValue: "0",
    });
  } catch {}
}

export const FileList = ({
  files,
  isDisabled,
  onDownload,
  downloadProgress,
  ...rest
}) => {
  if (files == null) files = [];
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const [viewerSrc, setViewerSrc] = useState(null);
  const [viewerPath, setViewerPath] = useState(null);

  useEffect(() => {
    // Clean up blob URLs
    if (!viewerSrc?.url.startsWith("blob:")) {
      return;
    }

    return () => {
      URL.revokeObjectURL(viewerSrc.url);
    };
  }, [viewerSrc]);

  const handleFileClick = async (path) => {
    const mediaType = getSupportedMediaType(path);

    if (mediaType != null) {
      setViewerPath(path);
      onOpen();
      const previewUrl = await files
        .find((file) => file.path === path)
        .getPreviewUrl();
      if (previewUrl == null) {
        // This should only happen on cleanup or error
        handleViewerClose();
        return;
      }

      setViewerSrc({
        mediaType: mediaType,
        url: previewUrl,
      });
    } else {
      onDownload(path);
    }
  };

  const handleViewerClose = () => {
    onClose();
    setViewerSrc(null);
    setViewerPath(null);
  };

  return (
    <Stack spacing={2} {...rest}>
      {files.length === 0 && (
        <>
          <Skeleton
            startColor="gray.500"
            endColor="gray.600"
            height="40px"
            borderRadius={"md"}
            py={2}
            px={4}
          >
            placeholder
          </Skeleton>
        </>
      )}
      {files.map((file, i) => (
        <FileListFile
          key={file.path}
          file={file}
          isDisabled={isDisabled}
          onFileClick={handleFileClick}
          downloadProgress={downloadProgress}
        />
      ))}
      <MediaViewer
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={handleViewerClose}
        onDownload={onDownload}
        src={viewerSrc}
        path={viewerPath}
      />
    </Stack>
  );
};

const FileListFile = ({ file, isDisabled, onFileClick, downloadProgress }) => {
  // Starting color
  const start = {
    r: 255,
    g: 141,
    b: 0,
  };

  // Ending colors when progress is 100%
  const end = {
    r: 255,
    g: 41,
    b: 0,
  };

  const progressColor = getProgressColor(start, end, downloadProgress);

  const handleClick = () => {
    if (isDisabled) return;
    onFileClick(file.path);
  };

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  const truncatedString = truncateString(file.name);

  return (
    <Button
      as="button"
      textAlign="start"
      onClick={handleClick}
      py={1}
      px={1.5}
      align="left"
      borderRadius="xl"
      borderWidth={1}
      backgroundColor="none"
      opacity={isDisabled ? 0.6 : 1}
      bgGradient={
        "linear(to-r, " +
        `rgba(${start.r}, ${start.g}, ${start.b}, var(--filelist-alpha)) 0%, ` +
        "rgba(var(--filelist-r), var(--filelist-g), var(--filelist-b), var(--filelist-alpha)) var(--filelist-progress), " +
        "rgba(255, 255, 255, 0) var(--filelist-progress)" +
        ")"
      }
      style={{
        "--filelist-progress": `${downloadProgress}%`,
        "--filelist-r": progressColor.r,
        "--filelist-g": progressColor.g,
        "--filelist-b": progressColor.b,
      }}
      transition="--filelist-progress 0.5s linear, --filelist-r 0.5s linear, --filelist-g 0.5s linear, --filelist-b 0.5s linear"
      sx={{
        "--filelist-alpha": 0.7,
      }}
      _hover={{
        "--filelist-alpha": 1,
        //backgroundColor: "gray.500",
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      <Box ms={2.5} flex={1} title={file.name}>
        <Text textAlign="left" fontWeight={"light"} noOfLines={1}>
          {truncatedString}
        </Text>
      </Box>
      <Box ms={2} color={file.progress > 0 ? "black.500" : "blackAlpha.600"}>
        {file.progress > 0 ? (
          <Stack direction="row" align="center" spacing={3}>
            {downloadProgress !== 100 && (
              <>
                <Box>
                  <Text fontWeight={"light"} fontSize={"md"}>
                    {`${Math.floor(downloadProgress)}%`}
                  </Text>
                </Box>
                <Spinner
                  size="sm"
                  speed={downloadProgress === 100 ? "4s" : undefined}
                />
              </>
            )}
          </Stack>
        ) : (
          <Box>
            {/*i18n.format(file.length, 'bytes')*/}
            <Text fontWeight={"light"}>{formatBytes(file.length, 0)}</Text>
          </Box>
        )}
      </Box>
    </Button>
  );
};

function getProgressColor(start, end, progress) {
  if (progress == null) progress = 0;

  return {
    r: start.r + (end.r - start.r) * progress,
    g: start.g + (end.g - start.g) * progress,
    b: start.b + (end.b - start.b) * progress,
  };
}
