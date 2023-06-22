import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Code,
  Collapse,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Wrap,
  chakra,
} from "@chakra-ui/react";
import Debug from "debug";
import { useEffect, useState } from "react";

import { fetcher } from "../lib/fetcher.js";
import { getMediaType } from "../lib/media-type.js";

import { useBrowser } from "../hooks/useBrowser.js";

const debug = Debug("ambr:MediaViewer");

const imageMediaTypes = [
  // Modern formats
  "image/apng",
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpeg",

  // Next-gen formats
  "image/avif",
  "image/jxl",

  // Legacy formats
  "image/bmp",
  "image/tiff",

  // Icon
  "image/vnd.microsoft.icon",
  "image/x-icon",
];

const isImageMediaType = (mediaType) => {
  return imageMediaTypes.includes(mediaType);
};

const videoMediaTypes = [
  // 3GP
  "video/3gpp",
  "video/3gpp2",
  "video/3gp2",

  // MPEG
  "video/mpeg",

  // MP4
  "video/mp4",
  "video/x-m4v",

  // MKV
  "video/x-matroska",

  // Ogg
  "video/ogg",

  // Quicktime
  "video/quicktime",

  // WebM
  "video/webm",
];

const isVideoMediaType = (mediaType) => {
  return videoMediaTypes.includes(mediaType);
};

const audioMediaTypes = [
  // 3GP
  "audio/3gpp",
  "audio/3gpp2",
  "audio/3gp2",

  // ADTS
  "audio/aac",
  "audio/mpeg",

  // FLAC
  "audio/flac",
  "audio/x-flac",

  // MP3
  "audio/mp3",

  // MP4
  "audio/mp4",

  // Ogg
  "audio/ogg",

  // Quicktime
  "audio/quicktime",

  // WAVE
  "audio/wave",
  "audio/wav",
  "audio/x-wav",
  "audio/x-pn-wav",

  // WebM
  "audio/webm",
];

const isAudioMediaType = (mediaType) => {
  return audioMediaTypes.includes(mediaType);
};

const textMediaTypes = [
  "application/json",
  "application/xml",
  "application/javascript",
];

const isTextMediaType = (mediaType) => {
  return (
    textMediaTypes.includes(mediaType) ||
    mediaType.startsWith("text/") ||
    (mediaType.startsWith("application/") &&
      (mediaType.endsWith("+json") || mediaType.endsWith("+xml")))
  );
};

/**
 * Returns the media type of the given `path` if it is supported by the
 * <MediaViewer> component. Otherwise, returns null.
 */
export const getSupportedMediaType = (path) => {
  const mediaType = getMediaType(path);

  if (mediaType == null) {
    return null;
  }

  const isSupported =
    isImageMediaType(mediaType) ||
    isVideoMediaType(mediaType) ||
    isAudioMediaType(mediaType) ||
    isTextMediaType(mediaType);

  debug(`Media type ${mediaType} supported? ${isSupported}`);
  return isSupported ? mediaType : null;
};

export const MediaViewer = ({
  isOpen,
  onOpen,
  onClose,
  onDownload,
  src,
  path,
}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState(null);

  const { device } = useBrowser();

  useEffect(() => {
    if (src == null) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const { mediaType } = src;

    if (isImageMediaType(mediaType)) {
      setType("image");
    } else if (isVideoMediaType(mediaType)) {
      setType("video");
    } else if (isAudioMediaType(mediaType)) {
      setType("audio");
    } else if (isTextMediaType(mediaType)) {
      setType("text");
    } else {
      throw new Error(`MediaViewer does not support ${mediaType}`);
    }

    return () => {
      // When src is changed, reset tag name so next time src is set it won't
      // briefly render with the wrong tag name.
      setType(null);
    };
  }, [src]);

  useEffect(() => {
    // Set loading when open but src is not set.
    // Used to show loading during blob creation.
    if (isOpen && src == null) {
      setIsLoading(true);
    }
  }, [isOpen, src]);

  const handleDownload = () => {
    onDownload(path);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError({
      title: "No Preview Available",
    });
  };

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      size="2xl"
      // HACK: Fix <video> seeking in iPadOS. Remove this once issue is fixed:
      // https://github.com/chakra-ui/chakra-ui/issues/4312
      blockScrollOnMount={device !== "ipad" || type !== "video"}
    >
      <ModalOverlay
        backdropFilter="auto"
        backdropBlur="4px"
        backgroundColor={"blackAlpha.200"}
      />
      <ModalContent p={4} borderRadius={"2xl"}>
        <ModalHeader>{path}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box minH={12}>
            {isLoading && (
              <Center>
                <Spinner size="xl" />
              </Center>
            )}

            <Collapse in={!isLoading} animateOpacity={false}>
              {error == null && src?.url && (
                <Center>
                  {type === "image" && (
                    <MediaViewerImage
                      src={src.url}
                      onLoad={handleLoad}
                      onError={handleError}
                    />
                  )}
                  {type === "video" && (
                    <MediaViewerVideo
                      src={src.url}
                      onLoad={handleLoad}
                      onError={handleError}
                    />
                  )}
                  {type === "audio" && (
                    <MediaViewerAudio
                      src={src.url}
                      onLoad={handleLoad}
                      onError={handleError}
                    />
                  )}
                  {type === "text" && (
                    <MediaViewerText
                      src={src.url}
                      onLoad={handleLoad}
                      onError={handleError}
                    />
                  )}
                </Center>
              )}

              {error != null && (
                <Alert status="error">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{error.title}</AlertTitle>
                    {error.description && (
                      <AlertDescription>{error.description}</AlertDescription>
                    )}
                  </Box>
                </Alert>
              )}
            </Collapse>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Wrap>
            <Button onClick={handleDownload}>{"Download"}</Button>
          </Wrap>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const MediaViewerImage = ({ src, onLoad, onError }) => (
  <Box
    as="img"
    src={src}
    onLoad={onLoad}
    onError={onError}
    maxW="full"
    minH="50"
    maxH="calc(100vh - 300px)"
  />
);

const MediaViewerVideo = ({ src, onLoad, onError }) => (
  <Box
    as="video"
    src={src}
    onLoadedMetadata={onLoad}
    onError={onError}
    controls
    autoPlay
    maxW="full"
    minH="100"
    maxH="calc(100vh - 300px)"
  />
);

const MediaViewerAudio = ({ src, onLoad, onError }) => (
  <Box
    as="audio"
    src={src}
    onLoadedMetadata={onLoad}
    onError={onError}
    controls
    autoPlay
    w="full"
    minH="50"
    maxH="calc(100vh - 300px)"
  />
);

const MediaViewerText = ({ src, onLoad, onError }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      let data;
      try {
        data = await fetcher(src, { json: false });
      } catch (err) {
        onError(err);
        return;
      }
      setData(data);
      onLoad();
    })();
  }, [src, onLoad, onError]);

  return (
    <chakra.pre whiteSpace="pre-wrap" w="full">
      <Code display="block" p={4}>
        {data}
      </Code>
    </chakra.pre>
  );
};
