/* eslint-disable import/first */
import { useEffect, useState } from "react";
import NextApp from "next/app";
import Head from "next/head";
import { useToast } from "../hooks/useToast.js";
import { useBrowser } from "../hooks/useBrowser";
import { AmbrContext } from "../components/AmbrContext";
import { MagicProvider } from "../components/MagicContext";
import {
  ChakraProvider,
  ColorModeScript,
  VStack,
  Grid,
  Box,
  Center,
} from "@chakra-ui/react";
import LogoLoader from "../components/icons/LogoLoader";
import Fonts from "../theme/fonts";
import { theme } from "../theme/index";
import "../theme/global.css";
import {
  origin,
  siteTitle,
  socialHandle,
  siteDescription,
  tagline,
} from "../config.js";

const { primaryColor } = theme?.site ?? "#FFF";

console.log("      ▄                             ▄▄");
console.log("      ▀▓▓                           ▓▓");
console.log("     ▀  ▓▓      ▓▓▄   ▀▓▄   ▄▀▀▓▄   ▓▓▄▄▄▄▀▀▓▓▄    ▀▌▄▀▀▀▀▓▓▄");
console.log("   ▄▀   ▓▓▓     ▓▓      ▓▓     ▐▓▌  ▓▓        ▀▓▓▄  ▓▌");
console.log("  ▄   ▄▓▓▀▓▌    ▓▓      ▐▓      ▓▌  ▓▓          ▓▓  ▓▌");
console.log(" ▀  ▄▓▀    ▓▌   ▓▓      ▐▓      ▓▌  ▓▓          ▓▓  ▓▌");
console.log("▐▄▄▓▀      ▐▓▌  ▓▓      ▐▓      ▓▌  ▓▓█▄▄  ▄▄▄▓▀    ▓▌");
console.log(" ");
console.log("Share ideas worth protecting.");
console.log(" ");

export default function AmbrApp({ Component, pageProps, err }) {
  let { title, description, initialContext, ...props } = pageProps;

  if (title == null) title = `${siteTitle} - ${tagline}`;
  else title += ` - ${siteTitle}`;

  if (description == null) description = siteDescription;

  const [loading, setLoading] = useState(true);
  const [scrollDisabled, setScrollDisabled] = useState(true);

  // NOTE: Suffix must be added here if page requires scrolling beyond viewport.
  useEffect(() => {
    setLoading(false);
    if (
      globalThis.location?.pathname === "/privacy" &&
      globalThis.location?.pathname === "/terms" &&
      globalThis.location?.pathname === "/faq"
    ) {
      setScrollDisabled(false);
    }
  }, []);

  return (
    <Box className="bg">
      {loading && (
        <Box
          minH={"100%"}
          pos={"fixed"}
          inset={0}
          overflow={"hidden"}
          display={"grid"}
          place-items={"center"}
        >
          <Center h={"100%"}>
            <LogoLoader />
          </Center>
          <Box
            w={"100%"}
            maxH={"25%"}
            pl={8}
            pr={8}
            pb={[8, 4]}
            bottom={[0, 0]}
            position={["absolute", "absolute"]}
            textAlign={"center"}
            justifyContent={"center"}
          ></Box>
        </Box>
      )}
      {!loading && (
        <MagicProvider>
          <Fonts />
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <ChakraProvider theme={theme}>
            <Box className={scrollDisabled ? "scrollable" : ""}>
              <Grid>
                <VStack>
                  <AmbrContext.Provider value={{ ...initialContext }}>
                    <App w={"100%"}>
                      <Component {...props} err={err} />
                    </App>
                    <Head>
                      <title>{title}</title>
                      <meta charSet="UTF-8" />
                      <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
                      />
                      <meta
                        httpEquiv="ScreenOrientation"
                        content="autoRotate:disabled"
                      ></meta>
                      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                      {/*                       <meta
                        httpEquiv="Content-Security-Policy"
                        content="upgrade-insecure-requests"
                      /> */}
                      <meta
                        name="apple-mobile-web-app-status-bar-style"
                        content="black-translucent"
                      />
                      <meta name="application-name" content={siteTitle} />
                      <link
                        rel="shortcut icon"
                        href={origin + "/android-chrome-192x192.png"}
                      />
                      <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href={origin + "/apple-touch-icon.png"}
                      />
                      <link
                        rel="icon"
                        type="image/png"
                        sizes="32x32"
                        href={origin + "/favicon-32x32.png"}
                      />
                      <link
                        rel="icon"
                        type="image/png"
                        sizes="16x16"
                        href={origin + "/favicon-16x16.png"}
                      />
                      <link
                        rel="manifest"
                        href={origin + "/site.webmanifest"}
                        crossOrigin="use-credentials"
                      />
                      {/*<link
                    rel="mask-icon"
                    href="/safari-pinned-tab.svg"
                    color={primaryColor}
                  />
                   */}
                      <meta
                        name="msapplication-TileColor"
                        content={primaryColor}
                      />
                      <meta name="theme-color" content={primaryColor} />
                      {!globalThis.location?.pathname.startsWith("/blog/") && (
                        <>
                          <meta name="title" content={title} />
                          <meta name="description" content={description} />
                          <meta property="og:title" content={title} />
                          <meta
                            property="og:description"
                            content={description}
                          />
                          <meta
                            property="og:image"
                            content={origin + "/images/social-share-home.png"}
                          />
                          <meta property="og:site_name" content={siteTitle} />
                          <meta property="og:type" content="website" />
                          <meta name="twitter:title" content={title} />
                          <meta
                            name="twitter:image"
                            content={origin + "/images/social-share-home.png"}
                          />
                          <meta
                            name="twitter:image:alt"
                            content={description}
                          />
                          <meta
                            name="twitter:card"
                            content="summary_large_image"
                          />
                        </>
                      )}
                      <meta name="twitter:site" content={socialHandle} />
                      <meta name="twitter:creator" content={socialHandle} />
                      <link rel="icon" href={origin + "/favicon.ico"} />
                    </Head>
                  </AmbrContext.Provider>
                </VStack>
              </Grid>
            </Box>
          </ChakraProvider>
        </MagicProvider>
      )}
    </Box>
  );
}

/**
 * App-level hooks and components that depend on global providers and context.
 */
const App = (props) => {
  const browser = useBrowser();
  const toast = useToast();

  // Periodically check if this release is bad so we can reload the browser
  useEffect(() => {
    const interval = setInterval(async () => {}, 10 * 60_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Warn user of an unsupported or outdated browser
  useEffect(() => {
    if (browser.isUnsupported) {
      toast({
        title: "Unsupported Browser",
        description: "Ambr will likely not function as expected.",
        status: "error",
      });
    } else if (browser.isOutdated) {
      toast({
        title: "Old Browser",
        description: "Ambr will likely not function as expected.",
        status: "error",
      });
    }
  }, [toast, browser]);

  // Install service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/service-worker.js", { updateViaCache: "none" })
      .then(
        function (registration) {
          /*           console.log(
            "Service Worker registration successful with scope: ",
            registration.scope
          ); */
        },
        function (err) {
          console.error("Service Worker registration failed: ", err);
        }
      );
  }, [browser]);

  return <Box {...props} />;
};

AmbrApp.getInitialProps = async (appContext) => {
  const { pageProps, ...restAppProps } = await NextApp.getInitialProps(
    appContext
  );

  return {
    pageProps: {
      ...pageProps,
      initialContext: {
        userAgent: appContext.ctx.req?.headers["user-agent"],
      },
    },
    ...restAppProps,
  };
};
