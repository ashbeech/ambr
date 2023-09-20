import {
  Box,
  Span,
  Flex,
  Text,
  Image,
  Heading,
  VStack,
  HStack,
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
                  <span className="name">By {data.author}</span> |{" "}
                  <span className="pos">{data.position}</span>
                </Text>
              </HStack>
              <Box dangerouslySetInnerHTML={{ __html: content }} />
            </VStack>
          </Box>
        </Box>
        <Image
          pos={"absolute"}
          top={0}
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
