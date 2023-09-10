import { Global } from "@emotion/react";

const Fonts = () => (
  <Global
    styles={`
    @font-face {
    font-family: 'Balbes';
    src: url('/fonts/Balbes.woff2') format('woff2'),
        url('/fonts/Balbes.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}


@font-face {
    font-family: 'Montserrat';
    src: url('/fonts/Montserrat-VariableFont_wght.woff2') format('woff2'),
        url('/fonts/Montserrat-VariableFont_wght.woff') format('woff');
    font-weight: 300;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Montserrat';
    src: url('/fonts/Montserrat-Italic-VariableFont_wght.woff2') format('woff2'),
        url('/fonts/Montserrat-Italic-VariableFont_wght.woff') format('woff');
    font-weight: 300;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'Montserrat';
    src: url('/fonts/Montserrat-Bold.woff2') format('woff2'),
        url('/fonts/Montserrat-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Montserrat';
    src: url('/fonts/Montserrat-BoldItalic.woff2') format('woff2'),
        url('/fonts/Montserrat-BoldItalic.woff') format('woff');
    font-weight: bold;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'Montserrat';
    src: url('/fonts/Montserrat-MediumItalic.woff2') format('woff2'),
        url('/fonts/Montserrat-MediumItalic.woff') format('woff');
    font-weight: 500;
    font-style: italic;
    font-display: swap;
}

@font-face {
    font-family: 'Montserrat';
    src: url('/fonts/Montserrat-Medium.woff2') format('woff2'),
        url('/fonts/Montserrat-Medium.woff') format('woff');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
} 


@font-face {
    font-family: 'Montserrat';
    src: url('/fonts/Montserrat-ExtraLight.woff2') format('woff2'),
        url('/fonts/Montserrat-ExtraLight.woff') format('woff');
    font-weight: 200;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Montserrat';
    src: url('/fonts/Montserrat-ExtraLightItalic.woff2') format('woff2'),
        url('/fonts/Montserrat-ExtraLightItalic.woff') format('woff');
    font-weight: 200;
    font-style: italic;
    font-display: swap;
}

      `}
  />
);

export default Fonts;
