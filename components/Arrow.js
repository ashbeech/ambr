import {
  chakra,
  Box,
  Stack,
  Text,
  Spinner,
  VStack,
  HStack,
  Flex,
  SlideFade,
  Heading,
  forwardRef,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

import { useBreakpointValue } from "../hooks/useBreakpointValue.js";

const MotionBox = motion(Box);

export const Arrow = forwardRef(
  (
    {
      title,
      description,
      colorScheme = "orange",
      size = "md",
      disabled,
      mode,
      progress,
      ...rest
    },
    ref
  ) => {
    size = useBreakpointValue(size);

    const sizes = {
      lg: {
        checkmarkSize: "24",
        headingFontSize: "lg",
        descriptionFontSize: "md",
        spacing: 2,
      },
      xl: {
        checkmarkSize: "32",
        headingFontSize: "xl",
        descriptionFontSize: "lg",
        spacing: 2,
      },
    };

    const { checkmarkSize, headingFontSize, descriptionFontSize, spacing } =
      sizes[size];

    return (
      <VStack
        direction="row"
        disabled={disabled}
        align="center"
        spacing={spacing}
        ref={ref}
        {...rest}
      >
        <Checkmark
          disabled={disabled}
          size={checkmarkSize}
          color={`${colorScheme}.500`}
          mode={mode}
          progress={progress}
        />
        {/*         {mode !== "idle" && (
          <SlideFade in offsetX={-30} offsetY={0} delay={0.1}>
            <Stack spacing={1}>
              <Heading
                fontSize={headingFontSize}
                color={disabled ? "orange.400" : "black.500"}
                fontWeight="semibold"
                position="relative"
                fontFamily={"body"}
              >
                {title}
              </Heading>
              <Box
                color={disabled ? "black.500" : "gray.500"}
                fontSize={descriptionFontSize}
                maxW={64}
              >
                {description}
              </Box>
            </Stack>
          </SlideFade>
        )} */}
      </VStack>
    );
  }
);

export const Checkmark = ({
  size = 150,
  color = "orange.400",
  disabled,
  mode,
  progress,
  ...props
}) => {
  //console.log(mode, progress);

  const boxVariants = {
    hide: { pathLength: 0, scale: 0, opacity: 0 },
    show: { pathLength: 0.9, scale: 1, opacity: 1 },
  };

  const checkVariants = {
    hide: { opacity: 0, pathLength: 0, y: 5 },
    show: { opacity: 1, pathLength: 0.925, y: 0 },
  };

  const arrowVariants = {
    hide: { pathLength: 1, opacity: 1, y: 0 },
    show: { pathLength: 10, opacity: 0, y: 100 },
  };

  return (
    <>
      <Flex
        w={"100%"}
        h={"100%"}
        direction="column"
        alignItems="center"
        justifyContent="center"
        align="center"
      >
        {!disabled &&
          progress !== null &&
          mode !== "idle" &&
          mode !== "downloaded" && (
            <Flex
              w={"100%"}
              h="100%"
              pos={"absolute"}
              direction="column"
              alignItems="center"
              justifyContent="center"
              align="center"
            >
              {progress <= 100 && (
                <>
                  <Box>
                    {" "}
                    <Spinner
                      size="xl"
                      speed={progress === 100 ? "8s" : undefined}
                    />
                  </Box>

                  <Box>
                    <Text fontWeight="light" fontSize="sm">
                      {progress < 1 ? "Preparing" : `${Math.floor(progress)}%`}
                    </Text>
                  </Box>
                </>
              )}
            </Flex>
          )}
        <MotionBox
          borderRadius="full"
          backgroundColor={"whiteAlpha.500"}
          borderColor={!disabled && mode !== "idle" ? "black.500" : "black.500"}
          borderWidth={"1px 3px 3px 1px"}
          initial="hide"
          animate="show"
          variants={boxVariants}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          {...props}
        >
          <chakra.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 150 150"
            w={"100%"}
            h={"100%"}
          >
            {!disabled && mode !== "downloaded" && mode === "idle" && (
              <motion.path
                d="M87.332725,115.204474L75.00007,127.901025L62.243655,115.204474M75,127.090557c0-15.11715.00007-98.321259.00007-98.321259"
                fill="transparent"
                strokeWidth="2"
                stroke={!color ? color : "#000000"}
                strokeLinecap={"square"}
                variants={checkVariants}
                transition={{ type: "spring", stiffness: 160, damping: 25 }}
              />
            )}
            {!disabled && progress === null && mode !== "idle" && (
              <motion.path
                d="M87.332725,115.204474L75.00007,127.901025L62.243655,115.204474M75,127.090557c0-15.11715.00007-0.321259.00007-98.321259"
                fill="transparent"
                strokeWidth="1"
                stroke={!color ? color : "#000000"}
                strokeLinecap={"square"}
                variants={arrowVariants}
                transition={{ type: "spring", stiffness: 160, damping: 10 }}
              />
            )}
            {!disabled && mode === "downloaded" && (
              <motion.path
                d="M38 74.707l24.647 24.646L116.5 45.5"
                fill="transparent"
                strokeWidth="2"
                stroke={!color ? color : "#000000"}
                strokeLinecap={"square"}
                variants={checkVariants}
                transition={{ type: "spring", stiffness: 140, damping: 20 }}
              />
            )}
          </chakra.svg>
        </MotionBox>
      </Flex>
    </>
  );
};
