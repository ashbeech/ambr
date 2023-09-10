import { Box, Flex, Heading, VStack } from "@chakra-ui/react";

export default function BlogPost({ content, data }) {
  return (
    <Box className="" mt={[12, 20]} mb={8} w={"100%"}>
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
        <Box w={"100%"} h={"100%"} pl={[8, 0]} pr={[8, 0]}>
          <Heading
            pb={[2, 8]}
            as={"h1"}
            className="fancy"
            letterSpacing={["normal !important", "wider !important"]}
          >
            {data.title}
          </Heading>
          <VStack
            w={["full", "80vw", "86vw", "50vw"]}
            minW={["", "", "38rem"]}
            maxW={["", "", "38rem"]}
            spacing={[4, 8]}
          >
            <Box mb={[4, 6]} dangerouslySetInnerHTML={{ __html: content }} />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
