export const styles = {
  global: {
    html: {
      bg: "#ACAFAF" /* Fallback color */,
      width: "100%",
      height: "100%",
      minHeight: "100%",
    },
    body: {
      position: "fixed",
      width: "100%",
      height: "100%",
      bg: "#ACAFAF" /* Fallback color */,
      bg: `-webkit-gradient(radial, center center, 0, center center, 100%, from(#F8F8F5), to(#ACAFAF))`,
      bg: `radial-gradient(ellipse at center,  #F8F8F5 66%, #E0E0DC 83%, #ACAFAF 100%)`,
      minHeight: "100%",
      color: "black.500",
      fontWeight: "light",
      fontSize: "sm",
      // Prevent margin on children from collapsing (and passing through)
      // <body> margin
      padding: ".1px",
      margin: "0",
      fontFamily: `'Montserrat', 'Balbes', sans-serif, Menlo, monospace`,
      letterSpacing: "wide",
    },
    "a, a:hover h4": {
      color: "inherit",
      textDecoration: "none",
    },
    "a h4:hover": {
      color: "orange.400",
    },
    "a.disabled, a.disabled:hover": {
      color: "gray",
      cursor: "not-allowed",
    },
    "a.chakra-link.disabled, a.chakra-link.disabled:hover": {
      cursor: "default",
    },
    ".pri .chakra-icon, .pri p": {
      opacity: "0.33",
    },
    ".pub .chakra-icon, .pub p": {
      opacity: "1",
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
      fontWeight: "thin",
      textAlign: "left",
      lineHeight: "short",
      marginBottom: "0.42em",
      letterSpacing: "0.022em",
    },
    "h2.fancy": {
      fontFamily: "fancy",
      fontSize: "3xl !important",
      letterSpacing: "wide !important",
      fontWeight: "bold",
    },
    h2: {
      fontSize: "2xl !important",
      letterSpacing: "wide !important",
      lineHeight: "base !important",
      fontWeight: "semibold !important",
    },
    h3: {
      fontSize: "xl !important",
      letterSpacing: "normal !important",
      fontWeight: "medium !important",
    },
    h4: {
      fontSize: "lg !important",
      letterSpacing: "normal !important",
      fontWeight: "normal !important",
    },
    p: {
      fontSize: "md",
      lineHeight: "tall",
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
    "::marker": {
      fontWeight: "semibold",
    },
    "img.file-stone": {
      objectFit: "cover",
      position: "relative",
    },
    ".container": {
      width: "100%",
      height: "100%",
    },
    ".share-state .chakra-input": {
      margin: "0px 0px 0px 0px !important",
    },
    ".bg::after": {
      mixBlendMode: "color-burn",
      content: '""',
      position: "fixed",
      width: "100%",
      height: "100%",
      minHeight: "100%",
      minWidth: "100%",
      left: 0,
      top: 0,
      backgroundImage: `url("/images/noise.png")`,
      zIndex: "-9999",
      opacity: "0.8",
      backgroundRepeat: "repeat",
    },

    ".invalid-feedback": {
      fontSize: "sm",
      color: "white !important",
      backgroundColor: "orange.400 !important",
      textAlign: "left",
      padding: "0px 0px 0px 0px",
      margin: "0px 0px 4px 0px",
      "::placeholder": {
        color: "white",
      },
    },
    ".chakra-switch__track": {
      height: "28px !important",
      width: "50px !important",
      border: "solid #1E1E1E",
      borderWidth: "1px",
      background: "transparent",
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
      background: `url(/images/icons/PlusIcon.svg) 5px 5px no-repeat !important`,
    },
    ".chakra-switch__track[data-checked], .chakra-switch__track[aria-checked=true]":
      {
        backgroundColor: "gray.300 !important",
        _checked: {
          backgroundColor: "gray.300 !important",
          shadow: "none !important",
        },
      },
    ".important .chakra-switch__track[data-checked], .important .chakra-switch__track":
      {
        backgroundColor: "gray.300 !important",
        _checked: {
          backgroundColor: "orange.400 !important",
          shadow: "none !important",
        },
      },
    ".important span.chakra-switch__thumb, .chakra-switch__track span.chakra-switch__thumb":
      {
        backgroundColor: "background.100 !important",
        _checked: {
          backgroundColor: "background.100",
        },
      },
    "span.chakra-switch__thumb:hover, .important span.chakra-switch__thumb:hover":
      {
        backgroundColor: "yellow.400 !important",
        _checked: {
          backgroundColor: "yellow.400 !important",
        },
      },
    ".chakra-switch__track[data-disabled]": {
      background: "transparent !important",
    },
    ".chakra-switch__track[data-disabled] span.chakra-switch__thumb:hover": {
      backgroundColor: "#ffffff !important",
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
        borderColor: "black.800 !",
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
      height: "100dvh",
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
      background: `radial-gradient(farthest-corner at center, RGBA(255, 255, 255, 0.44) 58%, RGBA(224, 224, 220, 0.66) 85%, RGBA(173, 173, 168, 0.33) 95%)`,
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
