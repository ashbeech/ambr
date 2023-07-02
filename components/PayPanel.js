import React, { useState, useEffect } from "react";
import {
  Heading,
  Text,
  Box,
  Center,
  Flex,
  Fade,
  ScaleFade,
  Stack,
  HStack,
  VStack,
  Button,
  Skeleton,
  Img,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { fetcher } from "../lib/fetcher";
import { Panel } from "./Panel.js";
import PaymentForm from "./PaymentForm.js";
import { Arrow } from "./Arrow.js";
import LogoLoader from "./icons/LogoLoader";
import { makeHash } from "../lib/make-hash.js";
import { stripeProducts } from "../config.js";

console.log("Stripe will be being loaded.");
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

/*
TODO: If there is no webhook listener active then it should feed that back and prevent payment through this form. IMPORTANT
*/

export const PayPanel = ({
  fileTransfersRemaining,
  onUpdateFileTransfersRemaining,
  setPath,
  publicAddress,
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [recieptID, setReceiptID] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cost, setCost] = useState(0);
  const [description, setDescription] = useState("");
  const loaded = false;
  const fullyLoaded = loaded === false && cost;

  const router = useRouter();

  const appearance = {
    theme: "flat",
    variables: {
      colorPrimary: "#FF5C00",
      fontSizeBase: "0.85rem",
      colorBackground: "#F8F8F8",
      colorDanger: "#FF5C00",
      colorText: "#929292",
      spacingUnit: "0.23rem",
      borderRadius: "10px",
      fontFamily: `'Montserrat', 'Balbes', sans-serif, Menlo, monospace`,
    },
    rules: {
      ".Label": {
        color: "#1E1E1E",
      },
      ".Input": {
        border: "1px solid #1E1E1E",
        fontWeight: "light",
        color: "#929292",
        boxShadow: "none",
        letterSpacing: "0.01em",
      },
      ".Input--invalid": {
        border: "1px",
      },
      ".Error": {
        paddingTop: "4px",
      },
    },
  };
  const options = {
    clientSecret,
    appearance,
  };

  /*   // Must ensure that the user is logged in before loading the page
  useEffect(() => {
    // Check existence of Magic, if not, don't load the page
    if (magic === null) return;
    if (magic !== null && isLoggedIn && publicAddress === "") return;
    if (magic !== null && isLoggedIn && publicAddress) setLoading(false);
    if (magic !== null && !isLoggedIn && publicAddress === "")
      setLoading(false);

    if (magic !== null && isLoggedIn && fileTransfersRemaining === -999) {
    }
  }, [magic, publicAddress, isLoggedIn, fileTransfersRemaining]); */

  useEffect(() => {
    if (!clientSecret) {
      // Create PaymentIntent as soon as user loads
      fetcher
        .post("/api/payment", {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idHash: makeHash(publicAddress),
            items: [{ id: stripeProducts[0] }],
          }),
          retry: false,
        })
        .then((response) => {
          setClientSecret(response.client_secret);
          setCost(response.amount);
          setCurrency(response.currency);
          setDescription(response.description);
          console.log("Frontend PaymentIntent Feedback: ", response);
        })
        .catch((err) => {
          // handle error
          console.error("Error: ", err);
          setPaymentError("Payment request failed. Please try again.");
        });
    }
  }, [clientSecret, publicAddress]);

  function formatDesc(desc) {
    //console.log("PayPanel desc: ", desc);
    if (desc) {
      const match = desc.match(/\+(\d+(\.\d+)?)/);
      if (match) {
        return parseFloat(match[1]);
      } else {
        return console.error("No match found.");
      }
    }
  }

  function formatAmount(amount, currency) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    });
    loaded = true;
    return formatter.format(amount / 100);
  }

  const handlePaymentSuccess = async (paymentIntent) => {
    // Handle successful payment
    try {
      console.log(`Payment successful. ID: ${paymentIntent.id}`);
      console.log("PaymentIntent Returned:", paymentIntent);
      setPaymentSuccess(true); // Set the payment success state to true
      onUpdateFileTransfersRemaining(fileTransfersRemaining + 25);
      setReceiptID(paymentIntent.id);
      setPaymentError(null);
    } catch (error) {
      console.error("Error during payment:", error);
      setPaymentSuccess(false); // Set the payment success state to false
      setPaymentError("Payment failed. Please try again.");
    }
  };

  const resetPaymentForm = async () => {
    // Reset the payment form
    setClientSecret("");
    setPaymentSuccess(false);
    setPaymentError(null);
  };

  const sendAFile = async () => {
    router.push("/");
    setPath("/");
  };

  const reloadPaymentForm = async () => {
    router.reload();
  };

  const costRender = formatAmount(cost, currency);
  const descRender = formatDesc(description);

  return (
    <>
      {!fullyLoaded ? (
        <ScaleFade in={!fullyLoaded} initialScale={0} unmountOnExit>
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
      ) : (
        <Panel className="glass" overflow="visible">
          <HStack
            w={"100%"}
            h={"100%"}
            display={["block", "flex"]}
            minH={["28rem", "26rem", "25rem"]}
            minW={["100%", "82vw", "36rem"]}
            direction={[null, "row"]}
            spacing={[2, 4]}
            position="relative"
          >
            {!fullyLoaded && (
              <Stack
                direction={["column", "row"]}
                alignItems={["center", "flex-start"]}
                justifyContent={["center", "flex-start"]}
                w="100%"
                h="100%"
                pos="absolute"
              >
                <Box w={["100%", "50%"]} h={"100%"} mr={[0, 4]} mb={[2, 0]}>
                  <Skeleton
                    startColor={"gray.500"}
                    endColor={"gray.600"}
                    borderRadius={"md"}
                    w={"100%"}
                    h={"100%"}
                    maxH={"100%"}
                    minH={"100%"}
                  />
                </Box>
                <VStack w={["100%", "50%"]} h={"100%"} spacing={[2]}>
                  <Skeleton
                    startColor={"gray.500"}
                    endColor={"gray.600"}
                    borderRadius={"md"}
                    w={"100%"}
                    h={"44px"}
                    maxH={"100%"}
                    p
                  />
                  <Skeleton
                    startColor={"gray.500"}
                    endColor={"gray.600"}
                    borderRadius={"md"}
                    w={"100%"}
                    h={"100%"}
                    maxH={"100%"}
                  />
                </VStack>
              </Stack>
            )}
            {fullyLoaded && paymentError && (
              <Box w={"100%"} pb={[2, 0]}>
                <Fade in={paymentError}>
                  <Flex
                    direction={"column"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    w={"100%"}
                    position="relative"
                  >
                    <Heading
                      as={"h1"}
                      zIndex={998}
                      textAlign={"center"}
                      noOfLines={2}
                      w={"full"}
                      fontWeight={"normal !important"}
                      fontSize={["3xl", "3xl"]}
                      mb={4}
                    >
                      Payment Unsuccessful
                    </Heading>
                    <Text
                      fontSize={["md !important", "lg !important"]}
                      textAlign={"center"}
                      fontWeight={"light !important"}
                      maxW={"75%"}
                    >
                      {paymentError}
                    </Text>
                    <Box w={"100%"} h={"100%"}>
                      <Flex
                        direction={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        h={"100%"}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          position={"relative"}
                          w={["90%", "50%", "50%", "50%"]}
                          h={["90%", "50%", "50%", "50%"]}
                        >
                          <Img
                            src={"images/amber-7.png"}
                            position={"relative"}
                            w={["100%", "100%"]}
                            h={["100%", "100%"]}
                            objectFit={[
                              "cover !important",
                              "contain !important",
                              "contain !important",
                              "cover !important",
                              "cover !important",
                            ]}
                            backgroundSize={"100%"}
                            alt={`Ambr Stone`}
                            className="file-stone"
                          />
                        </Box>
                      </Flex>
                    </Box>
                    <VStack spacing={[4, 4]}>
                      <HStack spacing={[2, 4]}>
                        <Button onClick={reloadPaymentForm}>Try Again</Button>
                      </HStack>
                    </VStack>
                  </Flex>
                </Fade>
              </Box>
            )}
            {fullyLoaded &&
              paymentSuccess && ( // Render a success message if the paymentSuccess state is true
                <Box w={"100%"} pb={[2, 0]}>
                  <Fade in={paymentSuccess}>
                    <Flex
                      direction={"column"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      w={"100%"}
                      position="relative"
                    >
                      <Heading
                        as={"h1"}
                        zIndex={998}
                        textAlign={"center"}
                        noOfLines={2}
                        w={"full"}
                        fontWeight={"normal !important"}
                        fontSize={["3xl", "3xl"]}
                        mb={4}
                      >
                        Payment Successful
                      </Heading>
                      <Text
                        fontSize={["md !important", "lg !important"]}
                        textAlign={"center"}
                        fontWeight={"light !important"}
                        maxW={"75%"}
                      >
                        You&apos;ve unlocked 25 additional file transfers to use
                        sharing your amazing work with {fileTransfersRemaining}{" "}
                        file transfers total.
                      </Text>
                      <Box w={"100%"} h={"100%"}>
                        <Flex
                          direction={"column"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          h={"100%"}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position={"relative"}
                            w={["90%", "50%", "50%", "50%"]}
                            h={["90%", "50%", "50%", "50%"]}
                          >
                            <Img
                              src={"images/amber-7.png"}
                              position={"relative"}
                              w={["100%", "100%"]}
                              h={["100%", "100%"]}
                              objectFit={[
                                "cover !important",
                                "contain !important",
                                "contain !important",
                                "cover !important",
                                "cover !important",
                              ]}
                              overflow={"visible !important"}
                              backgroundSize={"100%"}
                              alt={`Ambr Stone`}
                              className="file-stone"
                            />
                          </Box>
                          <Arrow
                            size={["xl"]}
                            w={["33%", "20%", "33%"]}
                            h={"auto"}
                            maxW={["33%", "33%", "20%", "20%"]}
                            disabled={false}
                            colorScheme="gray"
                            mode={"downloaded"}
                            position="absolute"
                            left={0}
                            right={0}
                            m="auto"
                          />
                        </Flex>
                      </Box>
                      <VStack spacing={[4, 4]}>
                        <HStack spacing={[2, 4]}>
                          <Button onClick={sendAFile}>Share a File</Button>
                          <Button onClick={resetPaymentForm}>+ Add More</Button>
                        </HStack>
                        <Text className={"reciept-id"}>
                          Receipt ID: {recieptID}
                        </Text>
                      </VStack>
                    </Flex>
                  </Fade>
                </Box>
              )}
            {fullyLoaded &&
              !paymentSuccess &&
              !paymentError &&
              descRender !== undefined && (
                <>
                  <Box
                    w={["full", "50%"]}
                    h={"100%"}
                    overflow={"visible"}
                    position={["static", "absolute"]}
                  >
                    <Box h={["100%", "25%"]}>
                      <Heading
                        as={"h1"}
                        fontSize={["4xl", "4xl"]}
                        fontWeight={"medium"}
                        marginBottom={"0.21em !important"}
                        noOfLines={1}
                      >
                        Top-up
                      </Heading>
                      <Text
                        w={["100%", "100%"]}
                        pr={4}
                        fontSize={"md"}
                        align={"left"}
                        noOfLines={[1, 2]}
                      >
                        {fileTransfersRemaining
                          ? "You have only " +
                            fileTransfersRemaining +
                            " file transfers remaining."
                          : "To share more of your work through Ambr you'll need to top-up."}
                      </Text>
                    </Box>
                    <Flex
                      direction={"column"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      w={"100%"}
                      h={["100%", "75%"]}
                      mt={[6, 0, 0, 0, 0]}
                      mb={[4, 0, 0, 0, 0]}
                    >
                      <Box w={"100%"} h={"auto"} pr={["13%", "14%"]}>
                        <Heading
                          as={"h1"}
                          className="fancy"
                          fontSize={[
                            "8xl !important",
                            "8xl !important",
                            "7xl !important",
                            "8xl !important",
                            "8xl !important",
                          ]}
                          marginBottom={"0 !important"}
                          textAlign={"center !important"}
                          fontWeight={"light !important"}
                          m={"0 !important"}
                          noOfLines={1}
                        >
                          {descRender === undefined ? "" : `+${descRender}`}
                        </Heading>
                        <Text
                          fontWeight={"medium"}
                          position={"relative"}
                          top={[
                            "-1rem",
                            "-1.2rem",
                            "-0.75rem",
                            "-1.2rem",
                            "-1.2rem",
                          ]}
                          align={"center"}
                          fontSize={["2xl", "xl", "md", "xl", "xl"]}
                          noOfLines={1}
                        >
                          {"Ambr File Transfers"}
                        </Text>
                        <HStack
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"flex-start"}
                          position={"relative"}
                          top={[
                            "-0.6rem",
                            "-1rem",
                            "-0.6rem",
                            "-1rem",
                            "-1rem",
                          ]}
                          left={["2rem", "0rem", "0rem", "0rem", "0rem"]}
                        >
                          <Text
                            pt={[
                              "0.4rem",
                              "0.4rem",
                              "0.3rem",
                              "0.4rem",
                              "0.4rem",
                            ]}
                            pr={[
                              "0.2rem",
                              "0.2rem",
                              "0rem",
                              "0.2rem",
                              "0.2rem",
                            ]}
                            fontSize={["sm", "sm", "xs", "sm", "sm"]}
                          >
                            for only
                          </Text>
                          <Text
                            fontSize={["3xl", "3xl", "2xl", "3xl", "3xl"]}
                            alignItems={"flex-start"}
                          >
                            {!costRender ? "" : costRender}
                          </Text>
                        </HStack>
                        <Flex
                          direction="column"
                          alignItems="center"
                          justifyContent="center"
                          w={["100%", ""]}
                          h={["60%", "100%"]}
                          pos={"absolute"}
                          top={0}
                          zIndex={-998}
                          mt={[0, 8, 8, 5, 5]}
                          overflow={"visible !important"}
                        >
                          <Box
                            position="relative"
                            w={["100%", "111%"]}
                            h={["100%", "111%"]}
                          >
                            <Img
                              position={"relative"}
                              w={["100%", "100%"]}
                              h={["100%", "100%"]}
                              minW={["100%", "none"]}
                              minH={["18rem", "none"]}
                              maxH={["22rem", "none"]}
                              src={"images/amber-7.png"}
                              objectFit={[
                                "cover !important",
                                "contain !important",
                              ]}
                              overflow={"visible !important"}
                              backgroundSize={"100%"}
                              alt={`Ambr Stone`}
                              className="file-stone"
                            />
                          </Box>
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                  {!paymentSuccess && clientSecret && (
                    <Box
                      h={"100%"}
                      w={["full", "50%"]}
                      position={["relative", "absolute"]}
                      top={[null, 0]}
                      left={[null, "50%"]}
                      sx={{ marginInlineStart: "0 !important" }}
                    >
                      <VStack h={"100%"} maxWidth={"100%"} w={"100%"}>
                        <Box
                          px={"0"}
                          position={"relative"}
                          w={"100%"}
                          h={"100%"}
                        >
                          {/*                           <Heading
                            as={"h3"}
                            zIndex={998}
                            textAlign={"left"}
                            noOfLines={3}
                            h={"6%"}
                          >
                            Pay by Card
                          </Heading> */}
                          <Box
                            pos={"relative"}
                            overflowY={["auto", "scroll"]}
                            overflowX={"hidden"}
                            h={"100%"}
                            pr={"1px"}
                          >
                            <Elements options={options} stripe={stripePromise}>
                              <PaymentForm
                                clientSecret={clientSecret}
                                onSuccess={handlePaymentSuccess}
                              />
                            </Elements>
                          </Box>
                        </Box>
                      </VStack>
                    </Box>
                  )}
                </>
              )}
          </HStack>
        </Panel>
      )}
    </>
  );
};
