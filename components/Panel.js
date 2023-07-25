import { Box } from "@chakra-ui/react";

export const Panel = (props) => (
  <Box
    px={[6, 10]}
    backgroundColor={"whiteAlpha.400"}
    py={[6, 10]}
    pb={[6, null]}
    border="solid #1E1E1E"
    borderRadius={["2em", "2.5rem"]}
    borderWidth="1px 4px 4px 1px"
    {...props}
  />
);
