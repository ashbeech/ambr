import { useState, useEffect, useContext } from "react";
import { MagicContext } from "./MagicContext";
import { hasVisitedBefore } from "../lib/hasVisitedBefore";
import { Box, Flex, Input, Button, Text, Link, HStack } from "@chakra-ui/react";

function Login() {
  const [email, setEmail] = useState("");
  const { isLoggedIn, login } = useContext(MagicContext);
  const [visitedBefore, setVisitedBefore] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);

  useEffect(() => {
    async function checkVisitedStatus() {
      try {
        const visitedBefore = await hasVisitedBefore();
        setVisitedBefore(visitedBefore);

        if (!visitedBefore) {
          const request = window.indexedDB.open("appDB", 1);

          request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(["visits"], "readwrite");
            const objectStore = transaction.objectStore("visits");
            objectStore.add({ timestamp: Date.now() });

            transaction.oncomplete = () => {
              db.close();
            };
          };

          request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
          };

          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore("visits", { autoIncrement: true });
          };
        }
      } catch (error) {
        console.error("IndexedDB error:", error);
      }
    }

    checkVisitedStatus();
  }, []);

  async function handleLogin() {
    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    try {
      await login(email);
    } catch (error) {
      console.error(error);
    }
  }

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  return (
    <>
      {!isLoggedIn && (
        <>
          <Flex
            w={"100%"}
            maxW={"28rem"}
            pt={4}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            flexDirection={["column", "row"]}
          >
            <Input
              flex={!visitedBefore ? ["", 6] : ["", 8]}
              w={["full", null]}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsValidEmail(true); // Reset validation on input change
              }}
              maxLength={256}
              placeholder={
                !visitedBefore
                  ? "Enter your email address"
                  : "Your email address"
              }
              mr={[0, 2]}
              _placeholder={
                isValidEmail ? { color: "black.500" } : { color: "white" }
              }
              color={isValidEmail ? "black.500" : "white"}
              backgroundColor={isValidEmail ? "gray.500" : "orange.400"}
            />
            <Button
              flex={!visitedBefore ? ["", 6] : ["", 4]}
              overflow={"hidden"}
              top={[1, "-2px"]}
              w={["full", null]}
              minW={"auto !important"}
              size={"md"}
              onClick={handleLogin}
            >
              {!visitedBefore ? "Start Sharing (It's FREE)" : "Start Sharing"}
            </Button>
          </Flex>
          <HStack>
            <Box mt={[5, 0]}>
              <Text fontSize={"sm"}>
                By clicking to enter, you agree to our{" "}
                <Link
                  fontSize={"sm"}
                  fontWeight={"light"}
                  textDecoration={"underline"}
                  href={"terms"}
                  target="_blank"
                  _hover={{ textDecoration: "underline", color: "white" }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  fontSize={"sm"}
                  fontWeight={"light"}
                  textDecoration={"underline"}
                  href={"privacy"}
                  target="_blank"
                  _hover={{ textDecoration: "underline", color: "white" }}
                >
                  Privacy Policy
                </Link>
                .
              </Text>
            </Box>
          </HStack>
        </>
      )}
    </>
  );
}

export default Login;
