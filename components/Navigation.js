import {
  Box,
  Flex,
  Button,
  Container,
  Link,
  useMediaQuery,
  HStack,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
  Icon,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { LogoIcon } from "./icons/LogoIcon";
import { MagicContext } from "./MagicContext";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";

export default function Navigation({
  fileTransfersRemaining,
  chainState,
  mintState,
}) {
  const [currentPage, setCurrentPage] = useState("");
  const { isLoggedIn, logout, login } = useContext(MagicContext);
  const router = useRouter();
  const [isMobile] = useMediaQuery("(max-width: 40em)");

  const filePage =
    !isLoggedIn &&
    currentPage !== "files" &&
    currentPage !== "top-up" &&
    currentPage !== "";

  const disabled =
    chainState == "Active" &&
    mintState !== "Sealed" &&
    mintState !== "Signing Failed";

  const showTopup =
    (currentPage !== "top-up" &&
      currentPage !== "" &&
      fileTransfersRemaining <= 0) ||
    (currentPage !== "top-up" && fileTransfersRemaining >= 1);

  const showLogo = isLoggedIn || (currentPage !== "" && !isLoggedIn);

  const handlePageChange = (page) => {
    if (!disabled) {
      setCurrentPage(page);
      router.push(`/${page}`, undefined, { shallow: true });
    }
  };

  useEffect(() => {
    const path = router.asPath.toString() || "/";
    setCurrentPage(path.substring(1));
  }, [router.asPath]);

  async function handleUser() {
    isLoggedIn ? await logout() : await login();
  }

  return (
    <Box zIndex={999} position={"relative"}>
      <Container w={"100%"} px={[6, 6, 6, 6, 8]} py={[2, 6]} maxW={"8xl"}>
        <Flex
          as="header"
          pt={[2, 4]}
          pb={[1, 4]}
          justify={{ md: "space-between" }}
          w={"100%"}
        >
          <Box w={"100%"}>
            <HStack
              display={"flex"}
              alignItems={"center"}
              justifyContent={"start"}
            >
              {showLogo && (
                <Box mr={"auto"}>
                  <Link
                    pos={"relative"}
                    left={"-6px"}
                    className={disabled ? "disabled" : ""}
                    onClick={() => {
                      handlePageChange("");
                    }}
                  >
                    <Icon
                      w={"70px"}
                      h={"70px"}
                      as={LogoIcon}
                      _hover={{ color: "orange.400" }}
                      color="black.500"
                      sx={{
                        transition: "color 0.15s ease-in",
                      }}
                      pr={2}
                    />
                  </Link>
                </Box>
              )}
              {filePage && (
                <Box>
                  <Button
                    onClick={() => {
                      handlePageChange("");
                    }}
                  >
                    {"Login"}
                  </Button>
                </Box>
              )}
              {isMobile ? (
                <>
                  {isLoggedIn && (
                    <Box>
                      <Menu>
                        <MenuButton
                          isDisabled={disabled}
                          as={Button}
                          size={"md"}
                          aria-label={"Open Menu"}
                        >
                          Menu
                        </MenuButton>
                        <MenuList pos={"relative"} top={"-0.2rem"} zIndex={999}>
                          {currentPage !== "files" && (
                            <MenuItem
                              isDisabled={disabled}
                              fontSize={"md"}
                              onClick={() => {
                                handlePageChange("files");
                              }}
                            >
                              My Files
                            </MenuItem>
                          )}
                          {showTopup && (
                            <MenuItem
                              isDisabled={disabled}
                              fontSize={"md"}
                              onClick={() => {
                                handlePageChange("top-up");
                              }}
                            >
                              {fileTransfersRemaining <= 0 && (
                                <Icon
                                  as={InfoOutlineIcon}
                                  boxSize={6}
                                  color="orange.400"
                                  pr={2}
                                />
                              )}
                              Top-up{" "}
                              {!fileTransfersRemaining ||
                              fileTransfersRemaining === -999
                                ? ``
                                : `(${fileTransfersRemaining})`}
                            </MenuItem>
                          )}
                          <MenuItem
                            isDisabled={disabled}
                            fontSize={"md"}
                            onClick={() => {
                              handleUser();
                            }}
                          >
                            {!isLoggedIn ? "Login" : "Logout"}
                            {
                              // TODO: Add `Sign up, Free` as display when user is completely new, un-reconised
                            }
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  {isLoggedIn && (
                    <>
                      <HStack
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"start"}
                      >
                        {currentPage !== "files" && (
                          <Link
                            pr={6}
                            className={disabled ? "files disabled" : "files"}
                            onClick={() => {
                              handlePageChange("files");
                            }}
                          >
                            My Files
                          </Link>
                        )}
                        {showTopup && (
                          <Link
                            pr={6}
                            className={disabled ? "top-up disabled" : "top-up"}
                            onClick={() => {
                              handlePageChange("top-up");
                            }}
                          >
                            {fileTransfersRemaining <= 0 && (
                              <Icon
                                as={InfoOutlineIcon}
                                boxSize={6}
                                color="orange.400"
                                pr={2}
                              />
                            )}
                            Top-up{" "}
                            {!fileTransfersRemaining ||
                            fileTransfersRemaining === -999
                              ? ``
                              : `(${fileTransfersRemaining})`}
                          </Link>
                        )}
                        <Button
                          onClick={() => handleUser()}
                          isDisabled={disabled}
                        >
                          {!isLoggedIn ? "Login" : "Logout"}
                        </Button>
                      </HStack>
                    </>
                  )}
                </>
              )}
            </HStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
