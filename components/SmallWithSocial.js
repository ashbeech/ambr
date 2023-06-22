import { Box, Container, Text, Center } from "@chakra-ui/react";
//import { useBreakpointValue } from "../hooks/useBreakpointValue.js";

export default function SmallWithSocial() {
  //const isMobileBreakpoint = useBreakpointValue([true, false, false]);

  return (
    <Box
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        right: 0,
      }}
    >
      <Container pt={6} pb={6} pl={0} pr={0} w={"100%"} maxW={"100%"}>
        <Center mr={0}>
          <Text fontSize="sm" as="i" color="subtle">
            &copy; {new Date().getFullYear()}{" "}
            <i>This is Bullish Ltd. All rights reserved.</i>.
          </Text>
        </Center>
      </Container>
    </Box>
  );
}
