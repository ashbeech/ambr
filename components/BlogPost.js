import {
  Box,
  Link,
  Flex,
  Text,
  Image,
  Heading,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";

export default function BlogPost({ content, data }) {
  return (
    <Box mt={[8, "5.5em"]} mb={8} w={"100%"}>
      <Flex
        w={"100%"}
        h={"100%"}
        pos={"relative"}
        direction="column"
        alignItems="center"
        justifyContent="center"
        align="center"
        className="article"
      >
        <Box w={["90%", "80%"]} maxW={"82rem"} pb={[5, 8]} h={"100%"}>
          <Flex w={"100%"} m={"0 !important"}>
            <Heading
              textIndent={["0", "-20%", "-15%", "-15%", "-15%"]}
              w={"100%"}
              pl={[0, "28%", "28%", "36%", "36%"]}
              as={"h1"}
              mb={[0, "0.33em !important"]}
              fontSize={[
                "6xl !important",
                "5.5em !important",
                "6.5em !important",
                "7.5em !important",
                "9em !important",
              ]}
              className="fancy"
              letterSpacing={["normal !important", "normal !important"]}
              lineHeight={["shorter", "short !important", "1.12em"]} // Adjust line height as needed
            >
              {data.title}
            </Heading>
          </Flex>
          <Box
            display={"flex"}
            flexDirection={["column !important", "row  !important"]}
            alignItems={"start"}
            gap={[0, "5%"]}
          >
            <VStack
              pos={"relative"}
              top={[0, "-4.5em", "-6em", "-8em", "-9em"]}
              w={["100%", "33%"]}
              h={"100%"}
            >
              <Flex>
                <Text className={"intro"}>{data.intro}</Text>
              </Flex>
              <Image
                w={["100%", "100%"]}
                src={data.image}
                alt={data.title}
                pb={[6, 10]}
                objectFit={"contain"}
              />
            </VStack>
            <VStack
              w={["100%", "100%", "100%", "67%"]}
              h={"100%"}
              pr={[0, 0, 0, "20%"]}
              alignItems={"baseline"}
            >
              <Box
                pos={"relative"}
                w={["100%", "50%"]}
                borderTop={"1px solid"}
              ></Box>
              <HStack w={"100%"} pt={[3, 3]} pb={[4, "8em"]}>
                <Image
                  w={"50px"}
                  h={"50px"}
                  src={data.avatar}
                  alt={data.author}
                  objectFit={"cover"}
                  style={{ borderRadius: "50%" }}
                />
                <Text
                  className={"author"}
                  fontSize={"md !important"}
                  m={"0 !important"}
                  alignSelf={"center"}
                >
                  <Box as="span" className="name">
                    By {data.author}
                  </Box>{" "}
                  |{" "}
                  <Box as="span" className="pos">
                    {data.position}
                  </Box>
                </Text>
              </HStack>
              <Box dangerouslySetInnerHTML={{ __html: content }} />
              <HStack gap={1} m={"0em 0 1.65em 0"}>
                <Link fontSize={"lg"} lineHeight={"base"} m={0} href="/">
                  {
                    "Thanks for reading, if it resonated you can join us in sharing work fearlessly through Ambr today, it's free to start."
                  }
                </Link>
              </HStack>
              <Box
                w={"100%"}
                alignItems={"center"}
                justifyContent={"center"}
                textAlign={"center"}
                borderTop={"1px solid"}
                borderColor={"black.500"}
                pt={[4, 8]}
              >
                <Text
                  className={"copyright"}
                  fontSize={"sm !important"}
                  fontWeight={"lighter !important"}
                >
                  &copy; {new Date().getFullYear()}{" "}
                  <Link
                    fontSize={"sm"}
                    fontWeight={"lighter"}
                    href={"https://ambr.link"}
                    target="_self"
                    title="Ambr — Share ideas worth protecting."
                  >
                    Ambr
                  </Link>
                </Text>
              </Box>
            </VStack>
          </Box>
        </Box>
        <Image
          pos={"absolute"}
          top={["9em", 0]}
          left={0}
          zIndex={-999}
          src={"/images/blurred-ambr-001.png"}
          alt={data.title + " | Ambr"}
          objectFit={"none"}
          overflow={"visible"}
        />
      </Flex>
    </Box>
  );
}
