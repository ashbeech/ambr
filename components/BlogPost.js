import {
  Box,
  Link,
  Flex,
  Text,
  Image,
  Heading,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { Share } from "./Share.js";
import { siteTwitterUrl } from "../config.js";

export default function BlogPost({ content, data, link }) {
  // Function to render hyperlinks from raw HTML string
  const createMarkup = (htmlString) => {
    return { __html: htmlString };
  };

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
        <Box w={["90%", "75%"]} maxW={"82rem"} pb={[5, 8]} h={"100%"}>
          <Flex w={"100%"} m={"0 !important"}>
            <Heading
              textIndent={["0", "-20%", "-15%", "-15%", "-15%"]}
              w={"100%"}
              pl={[0, "28%", "28%", "36%", "36%"]}
              as={"h1"}
              mb={[0, "0.33em !important"]}
              fontSize={[
                "6xl !important",
                "4.8em !important",
                "5.8em !important",
                "6.8em !important",
                "8.5em !important",
              ]}
              className="fancy"
              letterSpacing={["normal !important", "normal !important"]}
              lineHeight={["shorter", "short !important", "1.12em"]} // Adjust line height as needed
            >
              {data.title.split(" ").length === 4 ? (
                <>
                  {data.title.split(" ").slice(0, 2).join(" ")}
                  <br />
                  {data.title.split(" ").slice(2).join(" ")}
                </>
              ) : (
                data.title
              )}
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
              pr={[0, 0, 0, "10%"]}
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
              <Box className="body">
                <Box dangerouslySetInnerHTML={createMarkup(content)} />
                <Box as={"p"}>
                  <Text as={"a"} href={siteTwitterUrl} target="_blank">
                    <Box as={"span"} sx={{ fontStyle: "italic" }}>
                      {data.author}
                    </Box>
                  </Text>
                </Box>
              </Box>
              <Heading
                as={"h3"}
                fontWeight={"medium !important"}
                zIndex={999}
                textAlign={"left"}
                noOfLines={1}
                w={"full"}
                pb={2}
              >
                {"Link to this article"}
              </Heading>
              <Share
                url={link}
                w="full"
                maxW="3xl"
                size={["md", "lg"]}
                justify="center"
              />
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
          left={"-150px"}
          zIndex={-999}
          src={"/images/blurred-ambr-001.png"}
          alt={data.title + " | Ambr"}
          objectFit={"contain"}
        />
      </Flex>
    </Box>
  );
}
