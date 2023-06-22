import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  button: {
    bg: "none",
    fontFamily: "body",
    fontWeight: "bold",
    borderRadius: "2xl",
    border: "1px solid #1E1E1E",
    _hover: {
      bg: "orange.400",
    },
    _active: {
      bg: "none",
    },
    _focus: {
      bg: "none",
    },
    overflow: "hidden",
  },
  list: {
    bg: "background.500",
    borderColor: "#1E1E1E",
    borderWidth: "1px 3px 3px 1px",
    borderRadius: "xl",
    boxShadow: "none",
    padding: 0,
    minWidth: "3xs",
    maxWidth: "xs",
    zIndex: -9,
    overflow: "hidden",
  },
  item: {
    fontFamily: "body",
    borderRadius: "none",
    fontSize: "lg",
    paddingX: 6,
    paddingY: 4,
    _hover: {
      bg: "orange.400",
      color: "#EEEEEE",
    },
    _active: {
      bg: "none",
    },
    _focus: {
      bg: "none",
    },
  },
  groupTitle: {
    fontFamily: "body",
    fontSize: "md",
    fontWeight: "semibold",
    paddingX: 4,
    paddingY: 2,
  },
  command: {
    fontFamily: "body",
    fontSize: "md",
    paddingX: 4,
    paddingY: 2,
  },
  divider: {
    borderColor: "#EEEEEE",
    marginY: 1,
  },
});
// export the base styles in the component theme
export const menuTheme = defineMultiStyleConfig({ baseStyle });
