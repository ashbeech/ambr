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
import { products } from "../config.js";

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
  const [productsInfo, setProductInfo] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [recieptID, setReceiptID] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cost, setCost] = useState(0);
  const [refreshing, setRefreshing] = useState(true);
  const loaded = false;
  const fullyLoaded = loaded === false && productsInfo && clientSecret;

  const router = useRouter();

  const appearance = {
    theme: "flat",
    variables: {
      fontSizeBase: "0.85rem",
      colorBackground: "#F8F8F8",
      colorDanger: "#FF4809",
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
    appearance,
    clientSecret,
  };

  /*   useEffect(() => {
    if (!clientSecret) {
      // Create PaymentIntent as soon as user loads
      fetcher
        .post("/api/payment", {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idHash: makeHash(publicAddress),
            items: [{ id: "prod_O1IwO8cwxTjNGp" }],
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
 */

  useEffect(() => {
    const fetchProductInfo = async (ids) => {
      try {
        const response = await fetch("/api/get-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: ids,
          }),
        });
        const prods = await response.json();
        console.log("response: ", prods);
        setProductInfo(prods);
      } catch (error) {
        console.error("Error fetching clientSecret:", error);
        // Handle the error
      }
      setRefreshing(false);
    };

    fetchProductInfo(products);
  }, []);

  useEffect(() => {
    console.log("productsInfo: ", productsInfo);
  }, [productsInfo]);

  useEffect(() => {
    const fetchClientSecret = async () => {
      if (selectedProduct) {
        try {
          // Fetch the clientSecret from the server using the selected product ID
          const response = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idHash: makeHash(publicAddress),
              items: [selectedProduct],
              currency: "gbp", // Replace with the desired currency
            }),
          });
          const data = await response.json();
          console.log("Frontend PaymentIntent Feedback: ", data);
          setClientSecret(data.client_secret);
        } catch (error) {
          console.error("Error fetching clientSecret:", error);
          // Handle the error
        }
        setRefreshing(false);
      }
    };

    fetchClientSecret();
  }, [selectedProduct, publicAddress]);

  const handleProductSelection = (productId) => {
    console.log("productId: ", productId);
    setRefreshing(true);
    setSelectedProduct(productId);
  };

  function extractTransfersFromDescription(description) {
    // Use a regular expression to find the number followed by "Transfers"
    const regex = /\b(\d+)\s+Transfers\b/i;
    const match = description.match(regex);

    if (match && match[1]) {
      // Convert the extracted number to an integer and return it
      return parseInt(match[1]);
    } else {
      // Return a default value or handle the case when no number is found
      return 0;
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
      if (paymentIntent.description === "") {
        console.error("Payment failed: No description.");
        return;
      }
      console.log(`Payment successful. ID: ${paymentIntent.id}`);
      console.log("PaymentIntent Returned:", paymentIntent);
      setPaymentSuccess(true); // Set the payment success state to true
      const numberOfTransfers = extractTransfersFromDescription(
        paymentIntent.description
      );
      onUpdateFileTransfersRemaining(
        fileTransfersRemaining + numberOfTransfers
      );
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

  /*   const costRender = formatAmount(cost, currency);
  const descRender = formatDesc(description); */

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
          {fullyLoaded && !paymentSuccess && !paymentError && (
            <>
              <Box
                w={["full", "50%"]}
                h={"100%"}
                overflow={"visible"}
                pos={["relative", "relative"]}
                zIndex={998}
              >
                <Box h={"12%"}>
                  <Heading
                    as={"h1"}
                    className="fancy"
                    fontSize={["4xl", "4xl"]}
                    marginBottom={"0em !important"}
                    noOfLines={2}
                    mt={0}
                    textAlign={["center !important", "left !important"]}
                  >
                    Top up your file transfers
                  </Heading>
                </Box>
                <Box
                  display={"grid"}
                  w={["100%"]}
                  h={["100%", "100%"]}
                  minH={["18rem", "18rem"]}
                  flexDir={"column"}
                  gap={[2, 4]}
                  alignItems={"center"}
                  justifyContent={["inherit", "inherit"]}
                  pt={[4, 4]}
                  pb={[4, 0]}
                >
                  {/* Map over products and render product boxes */}
                  {selectedProduct &&
                    productsInfo !== null &&
                    productsInfo.map(
                      ({ id, price, transfers, currency }, index) => (
                        <Button
                          w={["100%"]}
                          h={["100%", "100%"]}
                          pos={"relative"}
                          display={"flex"}
                          maxH={["10rem", "10rem"]}
                          key={index}
                          variant={
                            selectedProduct.includes(id) ? "active" : "outline"
                          }
                          colorScheme={"outline"}
                          onClick={() => handleProductSelection(id)}
                          isDisabled={refreshing}
                          disabled={refreshing}
                          paddingInlineStart={"0 !important"}
                          paddingInlineEnd={"0 !important"}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position={"relative"}
                            w={["100%"]}
                            h={["100%"]}
                          >
                            <Img
                              src={"images/amber-7.png"}
                              position={"relative"}
                              w={["33%", "33%"]}
                              h={["100%", "100%"]}
                              objectFit={["contain !important"]}
                              backgroundSize={"100%"}
                              alt={`Ambr Stone`}
                              className="file-stone"
                              top={-1}
                              pl={3}
                              pr={0}
                              py={3}
                            />
                            <Text
                              w={["33%", "33%"]}
                              as={"h1"}
                              fontSize={"3.3em !important"}
                              top={1}
                              pos={"relative"}
                              mb={"0 !important"}
                              className="fancy"
                            >
                              {`x${transfers}`}
                            </Text>
                            <Text
                              fontSize={["2xl", "2xl"]}
                              fontWeight={"medium"}
                              w={["33%", "33%"]}
                            >
                              {`${formatAmount(price, currency)}`}
                            </Text>
                          </Box>
                        </Button>
                      )
                    )}
                </Box>
              </Box>
              {!paymentSuccess && (
                <Box
                  h={"100%"}
                  w={["full", "50%"]}
                  position={["relative", "relative"]}
                  top={[null, 0]}
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
                        {clientSecret && (
                          <Elements
                            options={options}
                            stripe={stripePromise}
                            key={clientSecret}
                          >
                            <PaymentForm
                              clientSecret={clientSecret}
                              onSuccess={handlePaymentSuccess}
                            />
                          </Elements>
                        )}
                      </Box>
                    </Box>
                  </VStack>
                </Box>
              )}
            </>
          )}
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
        </HStack>
      )}
    </>
  );
};
