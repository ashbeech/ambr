import {
  Text,
  Box,
  Flex,
  VStack,
  Center,
  Image,
  ScaleFade,
} from "@chakra-ui/react";
import LogoLoader from "../components/icons/LogoLoader";
import { useEffect, useState, useContext } from "react";
import { SafeContainer } from "../components/SafeContainer.js";
import { getUser } from "../lib/UserManager";
import Navigation from "../components/Navigation.js";
import { MagicContext } from "../components/MagicContext.js";

export default function ErrorPanel() {
  const { magic, publicAddress, isLoggedIn } = useContext(MagicContext);
  const [loading, setLoading] = useState(true);
  const [fileTransfersRemaining, setSharesRemaining] = useState(-999);

  const mintState = null;
  const chainState = null;

  // Must ensure that the user is logged in before loading the page
  useEffect(() => {
    // Check existence of Magic, if not, don't load the page
    if (magic === null) return;
    if (magic !== null && isLoggedIn && publicAddress === "") return;
    if (magic !== null && isLoggedIn && publicAddress) setLoading(false);
    if (magic !== null && !isLoggedIn && publicAddress === "")
      setLoading(false);

    if (magic !== null && isLoggedIn && fileTransfersRemaining === -999) {
      getUser(publicAddress)
        .then((user) => setSharesRemaining(user.fileTransfersRemaining))
        .catch((error) => console.error(error));
    }
  }, [magic, publicAddress, isLoggedIn, fileTransfersRemaining]);

  const errorPanel = (_isAuthenticated) => {
    return (
      <>
        {loading && (
          <ScaleFade in={loading} initialScale={0} unmountOnExit>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100vh"
            >
              <Center h="100%">
                <LogoLoader />
              </Center>
            </Box>
          </ScaleFade>
        )}
        {!loading && (
          <Flex
            direction="column"
            justify={"space-between"}
            align-items="center"
            justify-content="center"
            position="relative"
            minW="100vw"
            minH="100vh"
            h={"100vh"}
            overflowX={"hidden"}
            overflowY={"scroll"}
          >
            <Box>
              <Navigation
                fileTransfersRemaining={fileTransfersRemaining}
                mintState={mintState}
                chainState={chainState}
              />
              <Box pb={20}>
                <Box
                  w={"100%"}
                  h={"100%"}
                  maxW={["90%", "100%"]}
                  display={["", "flex"]}
                  alignItems="center"
                  justifyContent="center"
                  position={["relative", "absolute"]}
                  top={0}
                  right={0}
                  left={0}
                  bottom={0}
                  margin="auto"
                >
                  <SafeContainer
                    position={"relative"}
                    display={"block"}
                    w={"100%"}
                    maxW={["", "3xl"]}
                    sx={{
                      paddingInlineStart: "0 !important",
                      paddingInlineEnd: "0 !important",
                    }}
                  >
                    <VStack w={"100%"} h={"100%"}>
                      <Box w={["85%", "60%"]} h={"100%"} p={6}>
                        <Image
                          src={"/images/404.png"}
                          alt="Share ideas worth protecting."
                        />
                      </Box>
                      <Center w={["85%", "60%"]} h="100%">
                        <Text
                          textAlign="center"
                          as={"h3"}
                          fontSize={["xl !important", "2xl !important"]}
                          mb={4}
                        >
                          <i>
                            {`"`}
                            Your clicks were so preoccupied with whether or not
                            they could, they didn&apos;t stop to think if they
                            should.
                            {`"`}
                          </i>
                        </Text>
                      </Center>
                    </VStack>
                  </SafeContainer>
                </Box>
              </Box>
            </Box>
          </Flex>
        )}
      </>
    );
  };

  return (
    <Box className="container">
      <Box>{errorPanel(isLoggedIn)}</Box>
    </Box>
  );
}
