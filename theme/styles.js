export const styles = {
  global: {
    html: {
      height: "100%",
    },
    body: {
      bg: "white.400",
      color: "black.500",
      minHeight: "100%",
      fontWeight: "light",
      fontSize: "sm",
      // Prevent margin on children from collapsing (and passing through)
      // <body> margin
      padding: ".1px",
      margin: "0",
      fontFamily: `'Montserrat', 'Balbes', sans-serif, Menlo, monospace`,
      letterSpacing: "wide",
    },
    a: {
      color: "inherit",
      textDecoration: "none",
    },
    "a.disabled, a.disabled:hover": {
      color: "gray",
      cursor: "not-allowed",
    },
    h1: {
      fontFamily: "heading",
      fontSize: "4xl",
      textAlign: "left",
      lineHeight: "short",
      marginBottom: "0.42em",
      letterSpacing: "-0.0em",
    },
    "h1.fancy": {
      fontFamily: "fancy",
      fontSize: "4xl",
      textAlign: "left",
      lineHeight: "short",
      marginBottom: "0.42em",
      letterSpacing: "0.015em",
    },
    "h2.fancy": {
      fontFamily: "fancy",
      fontSize: "3xl !important",
      letterSpacing: "wide",
      fontWeight: "bold",
    },
    h2: {
      fontSize: "2xl !important",
      letterSpacing: "wide !important",
      fontWeight: "semibold !important",
    },
    h3: {
      fontSize: "2xl !important",
      letterSpacing: "normal !important",
      fontWeight: "medium !important",
    },
    h4: {
      fontSize: "xl !important",
      letterSpacing: "normal !important",
      fontWeight: "medium !important",
    },
    p: {
      fontSize: "md",
    },
    ol: {
      listStyle: "number",
      fontWeight: "light",
      marginLeft: "1.1em",
      lineHeight: "none",
      textAlign: "left",
      fontSize: "md",
    },
    ul: {
      fontWeight: "light",
      marginLeft: "1.1em",
      lineHeight: "none",
      textAlign: "left",
      fontSize: "md",
    },
    li: {
      paddingTop: "0.55em",
      paddingBottom: "0.55em",
    },
    "img.file-stone": {
      objectFit: "cover",
      position: "relative",
    },
    ".container": {
      width: "100%",
      height: "100%",
    },
    ".chakra-ui-light": {
      width: "100%",
      height: "100%",
      overflow: "hidden",
      background: "#ACAFAF" /* Fallback color */,
      background: `-webkit-gradient(radial, center center, 0, center center, 100%, from(#F8F8F5), to(#ACAFAF))`,
      background: `radial-gradient(ellipse at center,  #F8F8F5 66%, #E0E0DC 83%, #ACAFAF 100%)`,
    },
    "html::after": {
      mixBlendMode: "color-burn",
      content: '""',
      position: "absolute",
      width: "100%",
      height: "100%",
      minHeight: "100%",
      left: 0,
      top: 0,
      //backgroundImage: `url("/images/noise.png")`,
      zIndex: "-9999",
      opacity: "0.8",
      backgroundRepeat: "repeat",
    },

    ".invalid-feedback": {
      fontSize: "md",
      textAlign: "left",
      padding: "0px 0px 0px 0px",
      margin: "0px 0px 4px 0px",
    },
    ".chakra-switch__track": {
      height: "28px !important",
      width: "50px !important",
      border: "solid #1E1E1E",
      borderWidth: "1px",
      background: "transparent !important",
      padding: "0px !important",
      margin: "1px 2px 1px 0px !important",
    },
    "span.chakra-switch__thumb": {
      border: "solid #1E1E1E",
      borderWidth: "1px 3px 3px 1px",
      height: "30px !important",
      width: "30px !important",
      position: "relative !important",
      left: "-1px !important",
      top: "-1px !important",
      background: `#ffffff url(/images/icons/PlusIcon.svg) 5px 5px no-repeat !important`,
    },
    ".important .chakra-switch__track": {
      _checked: {
        backgroundColor: "#ff2b00 !important",
        shadow: "none !important",
      },
    },
    ".important span.chakra-switch__thumb": {
      _checked: {
        backgroundColor: "#ffffff !important",
      },
    },
    ".chakra-switch__track[aria-checked=true], .chakra-switch__track[data-checked]":
      {
        background: "transparent !important",
      },
    ".chakra-input, .chakra-textarea": {
      fontWeight: "light",
      color: "black.500",
      borderRadius: "lg !important",
      borderWidth: "1px",
      shadow: "none !important",
      margin: "0px 0px 4px 0px",
      borderColor: "blackAlpha.600 !important",
      _focus: {
        borderColor: "blackAlpha.600 !important",
        shadow: "none !important",
      },
    },
    ".chakra-input[aria-invalid=true]": {
      borderRadius: "lg !important",
      shadow: "none !important",
      _focus: {
        borderColor: "red !important",
        shadow: "none !important",
      },
    },
    "::placeholder": {
      /* Chrome, Firefox, Opera, Safari 10.1+ */ color: "gray.800",
      opacity: "1" /* Firefox */,
    },

    ":-ms-input-placeholder": {
      /* Internet Explorer 10-11 */ color: "gray.800",
    },

    "::-ms-input-placeholder": {
      /* Microsoft Edge */ color: "gray.800",
    },
    ".scrollable": {
      overflowY: "scroll !important",
    },
    ".h2.code-highlight": {
      fontFamily: "monospace",
      backgroundColor: "orange.100",
      padding: "0.2em 0.4em",
      borderRadius: "4px",
      fontSize: "lg",
    },
    ".home-stone": {
      height: "100% !important",
      width: "100vw",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
      backgroundImage: `url("/images/ambr-stone.png")`,
    },
    ".underPanel": {
      backgroundPositionX: "196px",
      backgroundPositionY: "60px",
      backgroundImage: `url("/images/ambr-bg.png")`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "344px 344px",
    },
    ".center": {
      display: "flex",
      justifContent: "center",
      alignItems: "center",
      height: "200px",
      border: "3px solid green",
    },
    ".glass": {
      //background: `radial-gradient(farthest-corner at center, RGBA(255, 255, 255, 0.2) 55%, RGBA(224, 224, 220, 0.2) 66%, RGBA(173, 173, 168, 0.2) 100%)`,
      background: "transparent !important",
    },
    ".icon-only .chakra-button__icon": {
      margin: "0 !important",
      padding: "0",
    },
    ".decimal-list": {
      marginBottom: "1.65em !important",
    },
    ".decimal-list.indented": {
      paddingLeft: "1.65em !important",
    },
    "@media screen and (max-width: 600px)": {
      ".underPanel": {
        backgroundImage: "none",
      },
    },
  },
};
