import {
  chakra,
  Text,
  Box,
  Stack,
  SlideFade,
  Heading,
  forwardRef,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

import { useBreakpointValue } from "../hooks/useBreakpointValue.js";

const MotionBox = motion(Box);

export const Check = forwardRef(
  (
    {
      title,
      description,
      colorScheme = "orange",
      size = "md",
      disabled,
      ...rest
    },
    ref
  ) => {
    size = useBreakpointValue(size);

    const sizes = {
      sm: {
        checkmarkSize: 2,
        headingFontSize: "sm",
        descriptionFontSize: "sm",
        spacing: 2,
      },
      md: {
        checkmarkSize: 6,
        headingFontSize: "md",
        descriptionFontSize: "md",
        spacing: 4,
      },
      lg: {
        checkmarkSize: 9,
        headingFontSize: "lg",
        descriptionFontSize: "md",
        spacing: 4,
      },
    };

    const { checkmarkSize, headingFontSize, descriptionFontSize, spacing } =
      sizes[size];

    return (
      <Stack
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
        />
        <SlideFade in offsetX={-30} offsetY={0} delay={0.1}>
          <Stack spacing={1}>
            <Heading
              as={"h4"}
              fontWeight={
                disabled ? "semibold !important" : "medium !important"
              }
              color={disabled ? "orange.400" : "black.500"}
              position="relative"
            >
              {title}
            </Heading>
            <Box
              color={disabled ? "black.500" : "gray.500"}
              fontSize={descriptionFontSize}
              maxW={64}
            >
              <Text numberOfLines={1}>{description}</Text>
            </Box>
          </Stack>
        </SlideFade>
      </Stack>
    );
  }
);

export const Checkmark = ({
  size = 150,
  color = "orange",
  disabled,
  ...props
}) => {
  const boxVariants = {
    hide: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1 },
  };

  const checkVariants = {
    hide: { pathLength: 0 },
    show: { pathLength: 0.9 },
  };

  return (
    <MotionBox
      borderRadius="full"
      backgroundColor={"whiteAlpha.500"}
      borderColor={disabled ? "gray.500" : "black.500"}
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
        height={size}
        width={size}
      >
        {disabled === false && (
          <motion.path
            d="M38 74.707l24.647 24.646L116.5 45.5"
            fill="transparent"
            strokeWidth="12"
            stroke={!color ? color : "#FF4809"}
            strokeLinecap="round"
            variants={checkVariants}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
        )}
      </chakra.svg>
    </MotionBox>
  );
};
