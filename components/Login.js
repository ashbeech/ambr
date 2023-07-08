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
            maxW={"26rem"}
            pt={4}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            flexDirection={["column", "row"]}
          >
            <Input
              flex={!visitedBefore ? ["", ""] : ["", 8]}
              w={["full", "65%"]}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsValidEmail(true); // Reset validation on input change
              }}
              placeholder="Your Email Address"
              mr={[0, 2]}
              _placeholder={
                isValidEmail ? { color: "black.500" } : { color: "white" }
              }
              color={isValidEmail ? "black.500" : "white"}
              backgroundColor={isValidEmail ? "gray.500" : "red.500"}
            />
            <Button
              flex={!visitedBefore ? ["", ""] : ["", 2]}
              overflow={"hidden"}
              top={[1, "-2px"]}
              w={["full", ""]}
              size={"md"}
              onClick={handleLogin}
            >
              {!visitedBefore ? "Enter for Free" : "Enter"}
            </Button>
          </Flex>
          <HStack>
            <Box>
              <Text fontSize={"sm"}>
                By clicking Enter, you agree to our Terms of Service and Privacy
                Policy.
              </Text>
            </Box>
          </HStack>
        </>
      )}
    </>
  );
}

export default Login;
