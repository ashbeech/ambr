import { Box, Flex, Heading, Image, VStack } from "@chakra-ui/react";

export default function BlogPost({ content, data }) {
  return (
    <Box className="" mt={[8, "4.5em"]} mb={8} w={"100%"}>
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
        <Box
          w={"90%"}
          minW={["", "38rem", "38rem"]}
          maxW={["", "38rem", "38rem"]}
          spacing={[4, 8]}
          h={"100%"}
        >
          <Image
            w={["100%", "100%"]}
            src={data.image}
            alt={data.title}
            pb={[6, 10]}
            objectFit={"cover"}
          />
          <Heading
            pb={[5, 8]}
            m={"0 !important"}
            as={"h1"}
            className="fancy"
            letterSpacing={["normal !important", "wider !important"]}
          >
            {data.title}
          </Heading>
          <VStack>
            <Box mb={[4, 6]} dangerouslySetInnerHTML={{ __html: content }} />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
