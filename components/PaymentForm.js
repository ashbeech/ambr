import React, { useEffect, useState } from "react";
import { Box, Button, Fade, Spinner } from "@chakra-ui/react";
import { Formik, Form } from "formik";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

const PaymentForm = ({ onSuccess, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      console.log("paymentIntent.status: ", paymentIntent.status);
      setIsLoading(false);

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "requires_payment_method":
          break;
        // Handle other status cases if needed
        default:
          break;
      }
    });
  }, [stripe, clientSecret]);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        setMessage(error.message || "Sorry, there's an unexpected error.");
      } else if (paymentIntent.status === "succeeded") {
        setMessage("Payment successful");
        onSuccess(paymentIntent);
      } else {
        setMessage("An unexpected error occurred.");
      }
    } catch (error) {
      setMessage(error.message || "An unexpected error occurred.");
      console.error(error);
    }
    setIsLoading(false);
    setSubmitting(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  return (
    <>
      <Fade
        in={isLoading}
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "100%",
        }}
        unmountOnExit
      >
        <Box display={isLoading ? "flex" : "none"}>
          <Box
            pos={"absolute"}
            alignItems="center"
            justifyContent="center"
            zIndex={998}
            w={"100%"}
            h={"100%"}
            backgroundColor={"background.500"}
            opacity={"0.5"}
            borderRadius={"2xl"}
            className={"disabled"}
          ></Box>
        </Box>
      </Fade>

      <Box pt={2}>
        <Formik initialValues={{}} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form id="payment-form">
              {/*               {message && (
                <Box
                  color={"orange.400"}
                  fontSize={["lg", "md"]}
                  id="payment-message"
                >
                  {message}
                </Box>
              )} */}
              <Box mt={4}>
                <PaymentElement
                  id="payment-element"
                  options={paymentElementOptions}
                />
                <Button
                  type="submit"
                  w="full"
                  mt={4}
                  isLoading={isSubmitting || isLoading}
                  isDisabled={isSubmitting || isLoading || !stripe || !elements}
                  id="submit"
                >
                  {isLoading ? <Spinner size="sm" speed={"0.5s"} /> : "Pay Now"}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
};

export default PaymentForm;
