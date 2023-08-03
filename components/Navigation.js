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
  customKey = null,
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("");
  const { isLoggedIn, logout, login } = useContext(MagicContext);
  const [isMobile] = useMediaQuery("(max-width: 40em)");
  const [filePage, setFilePage] = useState("");

  const disabled =
    chainState == "Active" &&
    mintState !== "Sealed" &&
    mintState !== "Signing Failed";

  const showTopup =
    (currentPage !== "top-up" &&
      currentPage !== "" &&
      fileTransfersRemaining <= 0) ||
    (currentPage !== "top-up" && fileTransfersRemaining >= 1);

  const showLogo = isLoggedIn || (!isLoggedIn && filePage);

  const handlePageChange = (page) => {
    if (!disabled) {
      setCurrentPage(page);
      router.push(`/${page}`, undefined, { shallow: true });
    }
  };

  useEffect(() => {
    setFilePage(
      !isLoggedIn &&
        currentPage !== "files" &&
        currentPage !== "top-up" &&
        currentPage !== "" &&
        customKey !== null
    );
  }, [customKey, currentPage, isLoggedIn]);

  useEffect(() => {
    const path = router.asPath.toString() || "/";
    setCurrentPage(path.substring(1));
  }, [router.asPath]);

  async function handleUser() {
    isLoggedIn ? await logout() : await login();
  }

  return (
    <Box zIndex={999} position={"relative"}>
      <Container
        w={["100%"]}
        pt={[3, 8]}
        pb={[3, 6]}
        maxW={["90%", "90%"]}
        sx={{
          paddingInlineStart: [0, 0, 0],
          paddingInlineEnd: [0, 0, 0],
        }}
      >
        <Flex as="header" justify={{ md: "space-between" }} w={"100%"}>
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
                    cursor={currentPage === "" ? "auto" : "pointer"}
                    className={disabled ? "disabled" : ""}
                    onClick={() => {
                      currentPage === "" ? "() => {}" : handlePageChange("");
                    }}
                    disabled={disabled}
                  >
                    <Icon
                      className={"logo"}
                      w={["50px", "65px"]}
                      h={["50px", "65px"]}
                      as={LogoIcon}
                      _hover={
                        currentPage === ""
                          ? { color: "black.500" }
                          : {
                              color: disabled ? "blackAlpha.500" : "orange.400",
                            }
                      }
                      color={disabled ? "blackAlpha.500" : "black.500"}
                      style={{
                        transition: "color 0.15s ease-in",
                      }}
                    />
                  </Link>
                </Box>
              )}
              {filePage && (
                <Box>
                  <Link
                    pb={[0, 0]}
                    pr={4}
                    className={
                      disabled || currentPage === "faq" ? "faq disabled" : "faq"
                    }
                    href={"faq"}
                    target={"_blank"}
                    rel={"noopener"}
                    disabled={currentPage === "faq"}
                  >
                    What is Ambr?
                  </Link>
                  <Button
                    onClick={() => {
                      handlePageChange("");
                    }}
                  >
                    {"Login"}
                  </Button>
                </Box>
              )}
              {!filePage && !isLoggedIn && (
                <HStack
                  w={"100%"}
                  display={"flex"}
                  flexDir={"right"}
                  alignItems={"center"}
                  justifyContent={"flex-end"}
                  textAlign={"right"}
                  pt={[2, null]}
                  pb={[0, 0]}
                  px={[".5%", null]}
                >
                  <Link
                    className={
                      disabled || currentPage === "faq" ? "faq disabled" : "faq"
                    }
                    href={"faq"}
                    target={"_blank"}
                    rel={"noopener"}
                    disabled={currentPage === "faq"}
                  >
                    What is Ambr?
                  </Link>
                </HStack>
              )}
              {isMobile ? (
                <>
                  {isLoggedIn && (
                    <Box>
                      <Menu direction={"rtl"} gutter={0}>
                        <MenuButton
                          isDisabled={disabled}
                          as={Button}
                          size={"md"}
                          aria-label={"Open Menu"}
                        >
                          Menu
                        </MenuButton>
                        <MenuList
                          pos={"relative"}
                          zIndex={999}
                          //inset={"0em auto auto -1.5em"}
                        >
                          {currentPage !== "" && (
                            <MenuItem
                              isDisabled={disabled}
                              fontSize={"md"}
                              className={disabled ? "share disabled" : "share"}
                              onClick={() => {
                                handlePageChange("");
                              }}
                            >
                              Transfer a File
                            </MenuItem>
                          )}
                          {currentPage !== "files" && (
                            <MenuItem
                              isDisabled={disabled}
                              fontSize={"md"}
                              className={disabled ? "files disabled" : "files"}
                              onClick={() => {
                                handlePageChange("files");
                              }}
                            >
                              Your Files
                            </MenuItem>
                          )}
                          {showTopup && (
                            <MenuItem
                              isDisabled={disabled}
                              fontSize={"md"}
                              className={
                                disabled ? "top-up disabled" : "top-up"
                              }
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
                              Top Up{" "}
                              {!fileTransfersRemaining ||
                              fileTransfersRemaining === -999
                                ? ``
                                : `(${fileTransfersRemaining})`}
                            </MenuItem>
                          )}
                          {currentPage !== "faq" && (
                            <MenuItem
                              isDisabled={disabled}
                              fontSize={"md"}
                              className={disabled ? "faq disabled" : "faq"}
                              p={0}
                            >
                              <Link
                                href={"faq"}
                                target={"_blank"}
                                rel={"noopener"}
                                fontSize={"sm"}
                                title="Take a read of Ambr's frequently asked questions"
                                fontWeight={"normal"}
                                w={"100%"}
                                h={"100%"}
                                px={6}
                                py={4}
                              >
                                FAQ
                              </Link>
                            </MenuItem>
                          )}
                          <MenuItem
                            isDisabled={disabled}
                            fontSize={"md"}
                            onClick={() => {
                              handleUser();
                            }}
                            target={"_blank"}
                          >
                            {!isLoggedIn ? "Login" : "Logout"}
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
                        <Link
                          pr={6}
                          className={
                            disabled || currentPage === ""
                              ? "share disabled"
                              : "share"
                          }
                          onClick={() => {
                            handlePageChange("");
                          }}
                          disabled={currentPage === ""}
                        >
                          Transfer a File
                        </Link>
                        <Link
                          pr={6}
                          className={
                            disabled || currentPage === "files"
                              ? "files disabled"
                              : "files"
                          }
                          onClick={() => {
                            handlePageChange("files");
                          }}
                          disabled={currentPage === "files"}
                        >
                          Your Files
                        </Link>
                        <Link
                          pr={6}
                          className={
                            disabled || !showTopup
                              ? "top-up disabled"
                              : "top-up"
                          }
                          onClick={() => {
                            handlePageChange("top-up");
                          }}
                          disabled={!showTopup}
                        >
                          {fileTransfersRemaining <= 0 && (
                            <Icon
                              as={InfoOutlineIcon}
                              boxSize={6}
                              color="orange.400"
                              pr={2}
                            />
                          )}
                          Top up{" "}
                          {!fileTransfersRemaining ||
                          fileTransfersRemaining === -999
                            ? ``
                            : `(${fileTransfersRemaining})`}
                        </Link>
                        <Link
                          pr={6}
                          className={
                            disabled || currentPage === "faq"
                              ? "faq disabled"
                              : "faq"
                          }
                          href={"faq"}
                          target={"_blank"}
                          rel={"noopener"}
                          disabled={currentPage === "faq"}
                        >
                          FAQ
                        </Link>
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
