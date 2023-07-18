import {
  extendTheme,
  theme as chakraTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import { menuTheme } from "./components/Menu";
import { styles } from "./styles.js";

const colorScheme = "orange";

export const theme = extendTheme(
  {
    colors: {
      background: {
        500: "#EEEEEE",
      },
      brand: {
        500: "#FF4809",
      },
      orange: {
        50: "#FFEBE5",
        100: "#FFE2D9",
        200: "#FFD9CC",
        300: "#FFCFBF",
        400: "#FF5C00",
        500: "#FF5200",
        600: "#FF4800",
        700: "#FF3E00",
        800: "#FF3400",
        900: "#6D2F00",
      },
      orangeAlpha: {
        50: "RGBA(255, 72, 9, 0.08)",
        100: "RGBA(255, 72, 9, 0.16)",
        200: "RGBA(255, 72, 9, 0.24)",
        300: "RGBA(255, 72, 9, 0.32)",
        400: "RGBA(255, 72, 9, 0.48)",
        500: "RGBA(255, 72, 9, 0.64)",
      },
      orangeAlpha: {
        50: "rgb(255, 235, 229, 0.08)",
        100: "rgb(255, 226, 217, 0.16)",
        200: "rgb(255, 217, 204, 0.24)",
        300: "rgb(255, 207, 191, 0.32)",
        400: "rgb(255, 92, 0, 0.48)",
        500: "rgb(255, 82, 0, 0.64)",
        600: "rgb(255, 72, 0, 0.72)",
        700: "rgb(255, 62, 0, 0.8)",
        800: "rgb(255, 52, 0, 0.88)",
        900: "rgb(109, 47, 0, 0.9)",
      },
      black: {
        50: "#F2F2F2",
        100: "#DBDBDB",
        200: "#C4C4C4",
        300: "#ADADAD",
        400: "#969696",
        500: "#1E1E1E",
        600: "#666666",
        700: "#4D4D4D",
        800: "#333333",
        900: "#1A1A1A",
      },
      gray: {
        100: "RGBA(252, 252, 248, 1)",
        500: "RGBA(224, 224, 220, 1)",
        600: "RGBA(210, 210, 200,  1)",
        800: "RGBA(108, 108, 96,  1)",
      },
      blackAlpha: {
        50: "RGBA(30, 30, 30, 0.16)",
        100: "RGBA(30, 30, 30, 0.24)",
        200: "RGBA(30, 30, 30, 0.36)",
        300: "RGBA(30, 30, 30, 0.48)",
        400: "RGBA(30, 30, 30, 0.64)",
        500: "RGBA(30, 30, 30, 0.80)",
        600: "RGBA(30, 30, 30, 1)",
      },
    },
    config: {
      initialColorMode: "light",
      useSystemColorMode: false,
    },
    breakpoints: {
      sm: "40em",
      md: "52em",
      lg: "64em",
      xl: "80em",
    },
    site: {
      colorScheme,
      primaryColor: chakraTheme.colors[colorScheme]["500"],
    },
    fonts: {
      body: `'Montserrat', sans-serif`,
      heading: `'Montserrat', sans-serif`,
      fancy: `'Balbes', sans-serif`,
      mono: "Menlo, monospace",
    },
    fontSizes: {
      xs: "0.625rem",
      sm: "0.75rem",
      md: "0.875rem",
      lg: "1rem",
      xl: "1.125rem",
      "2xl": "1.625em",
      "3xl": "1.85rem",
      "4xl": "2.525rem",
      "5xl": "2.875rem",
      "6xl": "3.625rem",
      "7xl": "4.375rem",
      "8xl": "5.875rem",
      "9xl": "6.375rem",
    },
    fontWeights: {
      hairline: 100,
      thin: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      normal: "normal",
      none: 1.48,
      shorter: 1.0764,
      short: 1.148,
      base: 1.4,
      tall: 1.5909,
      taller: "2",
      3: ".8057rem",
      4: "1.0994rem",
      5: "1.3931rem",
      6: "1.6868rem",
      7: "1.9805rem",
      8: "2.2742rem",
      9: "2.5679rem",
      10: "2.8616rem",
      11: "3.1553rem",
      12: "3.449rem",
    },

    letterSpacings: {
      tightest: "-0.06em",
      tighter: "-0.04em",
      tight: "-0.022em",
      normal: "0",
      wide: "0.022em",
      wider: "0.04em",
      widest: "0.06em",
    },
    styles,
    components: {
      Link: {
        baseStyle: {
          fontFamily: "body",
          fontWeight: "bold",
          fontSize: "md",
          fontFamily: "medium",
        },
        variants: {
          outline: {
            fontFamily: "body",
            fontWeight: "medium",
            _hover: {
              color: "orange.400",
              textDecoration: "none",
            },
          },
        },
        defaultProps: {
          fontSize: "2xl",
          variant: "outline",
        },
      },
      Button: {
        baseStyle: {
          fontFamily: "body",
          fontWeight: "medium",
          borderRadius: "base",
        },
        variants: {
          outline: {
            border: "1px solid",
            borderColor: "black.500",
            color: "none",
            borderRadius: "lg",
            borderWidth: "1px 3px 3px 1px",
            _disabled: {
              opacity: "1",
              color: "gray.600",
              borderColor: "gray.600",
            },
            _hover: {
              borderWidth: "1px 3px 3px 1px",
              color: "orange.400",
              borderColor: "orange.400",
              _disabled: {
                borderWidth: "1px 3px 3px 1px",
                color: "gray.600",
                opacity: "1",
                borderColor: "gray.600",
              },
            },
            _focus: {},
            _active: {
              borderWidth: "2px 1px 1px 2px",
              color: "orange.400",
            },
          },
          rounded: {
            border: "1px solid",
            borderColor: "black.500",
            color: "none",
            borderRadius: "3xl",
            padding: "0px 0px 2px 0px",
            margin: "0px 0px 0px 4px",
            borderWidth: "1px 3px 3px 1px",
            fontSize: "3xl",
            fontFamily: "light",
            _disabled: {
              color: "gray.600",
              borderColor: "gray.600",
            },
            _hover: {
              borderWidth: "1px 3px 3px 1px",
              color: "orange.400",
              borderColor: "orange.400",
              _disabled: {
                color: "gray.600",
                borderColor: "gray.600",
              },
            },
            _active: {
              borderWidth: "2px 1px 1px 2px",
              color: "orange.400",
              borderColor: "orange.400",
            },
          },
        },
        defaultProps: {
          size: "md",
          variant: "outline",
        },
      },
      Switch: {
        variants: {
          outline: {
            border: "1px solid",
            borderColor: "black.500",
            color: "none",
            borderRadius: "lg",
            borderWidth: "1px 3px 3px 1px",
            _disabled: {
              opacity: "1",
              color: "gray.600",
              borderColor: "gray.600",
            },
            _focus: {},
            _active: {
              borderWidth: "2px 1px 1px 2px",
              color: "orange.400",
            },
          },
        },
        defaultProps: {
          size: "lg",
          variant: "outline",
        },
      },
      Input: {
        baseStyle: {
          fontFamily: "body",
          fontWeight: "light",
          borderRadius: "base",
        },
        variants: {
          outline: {
            border: "1px solid",
            borderColor: "black.500",
            color: "none",
            borderRadius: "lg",
            borderWidth: "1px 1px 1px 1px",
            _disabled: {
              color: "blackAlpha.600",
            },
            _hover: {
              _disabled: {},
            },
            _focus: {},
            _active: {},
          },
        },
        defaultProps: {
          size: "md",
          variant: "outline",
        },
      },
      Textarea: {
        baseStyle: {
          fontFamily: "body",
          fontWeight: "light",
          borderRadius: "base",
          lineHeight: "base",
        },
        variants: {
          outline: {
            border: "1px solid",
            borderColor: "black.500",
            color: "none",
            borderRadius: "lg",
            borderWidth: "1px 1px 1px 1px",
            _disabled: {
              color: "blackAlpha.600",
            },
            _hover: {
              _disabled: {},
            },
            _focus: {},
            _active: {},
          },
        },
        defaultProps: {
          size: "md",
          variant: "outline",
        },
      },
      Menu: menuTheme,
    },
  },
  withDefaultColorScheme({ colorScheme })
);
