import React, { useState, useEffect } from "react";
import {
  Heading,
  Text,
  Box,
  Center,
  Flex,
  Fade,
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
import PaymentForm from "./PaymentForm.js";
import { Arrow } from "./Arrow.js";
import LogoLoader from "./icons/LogoLoader";
import { makeHash } from "../lib/make-hash.js";
import { stripeProducts } from "../config.js";

//console.log("Stripe will be being loaded.");
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
    if (desc) {
      // Match any number, integer, or decimal in the desc string
      const match = desc.match(/(\d+(\.\d+)?)/);
      if (match) {
        return parseFloat(match[1]);
      } else {
        return console.error("No number found.");
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
        <Fade in={!fullyLoaded}>
          <Box
            minW={["100%", "40rem"]}
            minH={["28rem", "26rem", "24rem"]}
            pos={"relative"}
            inset={0}
            overflow={"hidden"}
            display={"grid"}
            place-items={"center"}
          >
            <Center h="100%">
              <LogoLoader />
            </Center>
          </Box>
        </Fade>
      ) : (
        <HStack
          w={"100%"}
          h={"100%"}
          display={["block", "flex"]}
          minH={["28rem", "26rem", "24rem"]}
          minW={["100%", "82vw", "40rem"]}
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
                  w={["full", "42%"]}
                  h={"100%"}
                  overflow={"visible"}
                  pos={["relative", "absolute"]}
                  zIndex={998}
                >
                  <Box h={"12%"}>
                    <Heading
                      as={"h1"}
                      className="fancy"
                      fontSize={["4xl", "4xl"]}
                      marginBottom={"0em !important"}
                      noOfLines={1}
                      mt={0}
                      textAlign={["center !important", "left !important"]}
                    >
                      Top Up
                    </Heading>
                  </Box>
                  <Flex
                    flexDir={"column"}
                    dir={"column"}
                    alignItems={"flex-start"}
                    justifyContent={["space-around", "center"]}
                    w={"100%"}
                    h={["100%", "88%"]}
                    minH={["20rem", null]}
                  >
                    <Box
                      w={"100%"}
                      h={"auto"}
                      display={"flex"}
                      flexDir={"column"}
                      gap={"0.15em"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      pr={["5%", "10%"]}
                    >
                      {descRender === undefined ? (
                        ""
                      ) : (
                        <Box
                          display={"flex"}
                          justifyContent={"center"}
                          h={["7.5em", "8em"]}
                        >
                          <Text
                            fontWeight={"medium"}
                            fontSize={"5.4em"}
                            h={"100%"}
                          >
                            +
                          </Text>
                          <Heading
                            as={"h1"}
                            className="fancy"
                            fontSize={"8xl !important"}
                            marginBottom={"0 !important"}
                            textAlign={"center !important"}
                            fontWeight={"light !important"}
                            m={"0 !important"}
                            noOfLines={1}
                          >
                            {descRender}
                          </Heading>
                        </Box>
                      )}
                      <Box>
                        <Text
                          fontWeight="medium"
                          position="relative"
                          align="center"
                          fontSize={["lg", "xl"]}
                          noOfLines={1}
                        >
                          File transfers
                        </Text>
                        <Text
                          fontWeight="medium"
                          position="relative"
                          align="center"
                          fontSize={["lg", "xl"]}
                          noOfLines={1}
                        >
                          for only
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontWeight={"medium"}
                          fontSize={"4xl"}
                          alignItems={"flex-start"}
                        >
                          {!costRender ? "" : costRender}
                        </Text>
                      </Box>
                    </Box>
                    <Flex
                      direction="column"
                      alignItems="center"
                      justifyContent="center"
                      w={["100%", ""]}
                      h={["100%", "100%"]}
                      pos={"absolute"}
                      top={[null, 0]}
                      overflow={"visible !important"}
                    >
                      <Box
                        overflow={"visible"}
                        width={["100%", "115%"]}
                        height={["100%", "115%"]}
                        pos={"absolute"}
                        pt={[0, "0.33em"]}
                        pl={["1.25em", 0]}
                        style={{
                          filter: `blur(${Math.round(6.66)}px)`,
                          transition: "filter 0.76s ease-in",
                        }}
                        zIndex={-1}
                      >
                        <Img
                          w={["100%", "100%"]}
                          h={"100%"}
                          objectFit={"contain !important"}
                          src={`/images/amber-7.png`}
                          position={"relative"}
                          alt={`Ambr Stone`}
                          className="file-stone"
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Box>
                {!paymentSuccess && clientSecret && (
                  <Box
                    h={"100%"}
                    w={["full", "58%"]}
                    position={["relative", "absolute"]}
                    top={[null, 0]}
                    left={[null, "42%"]}
                    sx={{ marginInlineStart: "0 !important" }}
                  >
                    <VStack h={"100%"} maxWidth={"100%"} w={"100%"}>
                      <Box px={"0"} position={"relative"} w={"100%"} h={"100%"}>
                        <Box
                          pos={"relative"}
                          overflowY={["auto", "scroll"]}
                          overflowX={"hidden"}
                          h={"100%"}
                          w={"100%"}
                          px={"3px"}
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
      )}
    </>
  );
};
