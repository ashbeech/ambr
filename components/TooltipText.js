import { chakra, Tooltip } from "@chakra-ui/react";
import { useTheme } from "@emotion/react";

export const TooltipText = ({ children, ...rest }) => {
  const { colorScheme } = useTheme().site;

  return (
    <Tooltip hasArrow size="lg" {...rest}>
      <chakra.span
        fontWeight="bold"
        color={`${colorScheme}.100`}
        cursor="help"
        textDecoration="underline"
        sx={{
          textDecorationSkip: "skip",
          textDecorationSkipInk: "all",
          textDecorationThickness: 1,
          textUnderlineOffset: 2,
          textDecorationStyle: "dotted",
        }}
      >
        {children}
      </chakra.span>
    </Tooltip>
  );
};
