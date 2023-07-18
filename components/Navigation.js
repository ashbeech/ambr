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
                          : { color: disabled ? "gray.500" : "orange.400" }
                      }
                      color={disabled ? "gray.500" : "black.500"}
                      style={{
                        transition: "color 0.15s ease-in",
                      }}
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
                        {currentPage !== "" && (
                          <Link
                            pr={6}
                            className={disabled ? "share disabled" : "share"}
                            onClick={() => {
                              handlePageChange("");
                            }}
                          >
                            Transfer a File
                          </Link>
                        )}
                        {currentPage !== "files" && (
                          <Link
                            pr={6}
                            className={disabled ? "files disabled" : "files"}
                            onClick={() => {
                              handlePageChange("files");
                            }}
                          >
                            Your Files
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
