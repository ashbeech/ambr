import { useEffect, useState, useContext } from "react";
import {
  Fade,
  Box,
  Flex,
  Center,
  Text,
  Heading,
  VStack,
  Link,
  OrderedList,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { getUser } from "../lib/UserManager";
import LogoLoader from "../components/icons/LogoLoader";
import { MagicContext } from "../components/MagicContext.js";
import Navigation from "../components/Navigation.js";

export default function SecurityPanel() {
  const { magic, publicAddress, isLoggedIn } = useContext(MagicContext);
  const [fileTransfersRemaining, setSharesRemaining] = useState(-999);
  const [loading, setLoading] = useState(true);

  const initLoader = async (user) => {
    if (!user || !user?.id) {
      await getUser(publicAddress)
        .then((user) => initLoader(user))
        .catch((error) => console.error(error));
    } else {
      setSharesRemaining(user.fileTransfersRemaining);
      setLoading(false);
    }
  };
  // Must ensure that the user is logged in before loading the page
  useEffect(() => {
    // Check existence of Magic, if not, don't load the page
    if (magic === null) return;
    if (magic !== null && isLoggedIn && publicAddress === "") return;
    if (magic !== null && !isLoggedIn && publicAddress === "")
      setLoading(false);

    if (
      magic !== null &&
      isLoggedIn &&
      publicAddress &&
      (fileTransfersRemaining === -999 || fileTransfersRemaining === undefined)
    ) {
      //console.log("Getting user", publicAddress);
      getUser(publicAddress)
        .then((user) => initLoader(user))
        .catch((error) => console.error(error));
    }
  }, [magic, publicAddress, isLoggedIn, fileTransfersRemaining]); // eslint-disable-line

  const securityPanel = () => {
    return (
      <Flex
        w={"100%"}
        h={"100%"}
        pos={"relative"}
        direction="column"
        alignItems="center"
        justifyContent="center"
        align="center"
      >
        <Box w={["90%", "100%"]} h={"100%"} pl={[0, 0]} pr={[0, 0]}>
          <Heading
            pb={[1, 6]}
            as={"h1"}
            className="fancy"
            lineHeight={["1.48rem"]}
            fontWeight={"semibold !important"}
            letterSpacing={["widest !important", "normal !important"]}
          >
            Don&apos;t Trust.{" "}
            <Box as="span" color={"orange.400"} textDecoration={"underline"}>
              Verify.
            </Box>
          </Heading>
          <VStack
            w={["full", "80vw", "86vw", "50vw"]}
            minW={["", "", "43rem"]}
            maxW={["", "", "40rem"]}
            spacing={[8, 10]}
          >
            <Box mb={[1, 1]}>
              <Text>
                Privacy and security is not an option for us—it is just how Ambr
                works.
                <br />
                <br />
                If you share your work with clients or are perhaps concerned
                that your work may be used without consent by artificial
                intelligence (AI),{" "}
                <Box as="span" fontWeight="italic">
                  Ambr
                </Box>{" "}
                is for you.{" "}
                <Box as="span" fontWeight="italic">
                  Ambr
                </Box>{" "}
                provides a file transfer service with verifiable proof of origin
                and authenticity built-in. No extra steps, complexity, or third
                parties—just share your work confidently with state-of-the-art
                data provenance.
                <br />
                <br />
                We don&apos;t believe or hold value in the approach of
                &quot;just trust me, bro&quot;, so here&apos;s a transparent
                guide to Ambr&apos;s security design. If you have any questions,
                feel free to contact us{" "}
                <Link href="mailto:opsec@ambr.link" target="_blank">
                  opsec@ambr.link
                </Link>
                , and we&apos;ll be happy to help.
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"Web security"}
              </Text>
              <Text pb={6}>
                Ambr is configured with state-of-the-art security options to
                lock down the site as much as possible.
                <br />
                <br />
                <Link
                  href="https://observatory.mozilla.org/analyze/ambr.link"
                  target="_blank"
                  fontWeight={"bold"}
                >
                  Mozilla Observatory rates our site configuration an A+.
                </Link>
                <br />
                <br />
                Here are a few of the security features we deploy.
              </Text>
              <Box pb={4}>
                <code className="h2 code-highlight">
                  Cross-Origin-Resource-Policy
                </code>
              </Box>
              <Text pb={[4, 6]}>
                Ambr uses this{" "}
                <Link
                  href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin_Resource_Policy_(CORP)"
                  target="_blank"
                >
                  header
                </Link>{" "}
                to prevent other origins from accessing data on{" "}
                <code>ambr.link</code>. This is a mitigation for side-channel
                hardware vulnerabilities such as Meltdown and Spectre.
              </Text>
              <Box pb={4}>
                <code className="h2 code-highlight">
                  Cross-Origin-Embedder-Policy
                </code>
              </Box>
              <Text pb={[4, 6]}>
                Ambr uses this{" "}
                <Link
                  href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy"
                  target="_blank"
                >
                  header
                </Link>{" "}
                to enable cross-origin isolation. Cross-origin isolation ensures
                that supported browsers always load Ambr in a separate renderer
                process, which protects against side-channel hardware
                vulnerabilities such as Meltdown and Spectre.
              </Text>
              <Box pb={4}>
                <code className="h2 code-highlight">
                  Content-Security-Policy
                </code>
              </Box>
              <Text pb={[4, 6]}>
                Ambr uses Content Security Policy to prevent the site from being
                tricked into accessing resources (such as scripts, webpages,
                etc.) that could be used in{" "}
                <Link
                  href="https://en.wikipedia.org/wiki/Cross-site_scripting"
                  target="_blank"
                >
                  Cross Site Sripting
                </Link>{" "}
                attacks.
                <br />
                We have a very strict policy that blocks execution of inline
                JavaScript, JavaScript&apos;s <code>eval()</code> function,
                browser plug-ins, active and passive HTTP content, clickjacking
                attacks, <code>&lt;base&gt;</code> tag attacks,{" "}
                <code>&lt;form&gt;</code> submissions to exfiltrate data, and
                more.
              </Text>
              <Box pb={4}>
                <code className="h2 code-highlight">Permissions-Policy</code>
              </Box>
              <Text>
                Ambr uses this{" "}
                <Link
                  href="https://www.w3.org/TR/permissions-policy-1/"
                  target="_blank"
                >
                  header
                </Link>{" "}
                to disable some web browser features that we don&apos;t need,
                like camera and microphone access.
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"No ads. No trackers. No joke."}
              </Text>
              <Text>
                There are no ads and no creepy tracking in Ambr. We want you to
                focus on sharing your work with those that matter.
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"Web Cryptography API"}
              </Text>
              <Text>
                We use the browser&apos;s built in cryptography primitives via
                the{" "}
                <Link
                  href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
                  target="_blank"
                >
                  Web Crypto API
                </Link>
                to encrypt files in the browser before they are sent to the
                recipient.
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"Supply Chain Security"}
              </Text>
              <Text>
                In order to protect you as an Ambr user, we audit every open
                source package we use to detect and block dozens of package
                issues. Most supply chain attacks follow a similar pattern
                (stealing environment variables, sending data to the network,
                etc.) so we use tools to catch all of the recent NPM supply
                chain attacks. The tool analyses the actual behaviour of the
                package instead of relying on stale data in a CVE database.
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"Streaming Encryption and Decryption"}
              </Text>
              <Text>
                For streaming encryption and decryption, we use{" "}
                <Link
                  href="https://tools.ietf.org/html/rfc8188"
                  target="_blank"
                >
                  Encrypted Content-Encoding
                </Link>{" "}
                for HTTP.
                <br />
                <br />
                This standard provides{" "}
                <Link
                  href="https://en.wikipedia.org/wiki/Authenticated_encryption"
                  target="_blank"
                >
                  authenticated encryption
                </Link>
                to ensure that your files can&apos;t be seen or modified by an
                attacker once they leave your browser.
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"Transport Layer Security (TLS)"}
              </Text>
              <Text>
                TLS (formerly known as SSL) is the industry-standard encryption
                protocol used to encrypt communications between your browser and
                our servers. It ensures that Ambr&apos;s code cannot be modified
                by attackers, providing an additional layer of protection on top
                of the client-side and server-side encryption to ensure data
                uploads and downloads are private.
                <br />
                <br />
                We support TLS 1.3 for modern devices and TLS 1.2 for all
                remaining devices. Deprecated versions of TLS and SSL are not
                used.
                <br />
                <br />
                Qualys SSL Labs rates our TLS implementation an A+.{" "}
                <Link
                  href="https://www.ssllabs.com/ssltest/analyze.html?d=ambr.link"
                  target="_blank"
                >
                  You can see the report for yourself here
                </Link>
                .
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"Encryption at rest"}
              </Text>
              <Text>
                In addition to Ambr&apos;s on-device encryption, your files are
                protected by an additional layer of encryption on our servers.
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"Certificate Transparency Logs"}
              </Text>
              <Text>
                We monitor the{" "}
                <Link
                  href="https://tools.ietf.org/html/rfc6962"
                  target="_blank"
                >
                  Certificate Transparency
                </Link>{" "}
                logs for certificate misissuance.
              </Text>
            </Box>
            <Box w={"100%"} pb={[2, 3]}>
              <Text as={"h2"} mb={[4, 6]}>
                {"DNS Certification Authority Authorisation (CAA) Policy"}
              </Text>
              <Text>
                A{" "}
                <Link
                  href="https://tools.ietf.org/html/rfc6844"
                  target="_blank"
                >
                  Certification Authority Authorisation (CAA) policy
                </Link>
                allows a DNS domain name holder to specify the Certification
                Authorities (CAs) authorised to issue certificates for that
                domain.
                <br />
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text
                as={"h2"}
                className={"fancy"}
                fontWeight={"semibold !important"}
                letterSpacing={["widest !important", "wider !important"]}
                mb={[4, 6]}
              >
                {"Step-by-step"}
              </Text>
              <Text pb={6}>Here is a high-level design document for Ambr.</Text>
              <Text as={"h2"} pb={[3, 6]}>
                {"From the uploader's perspective"}
              </Text>
              <OrderedList pb={[6, 10]}>
                <ListItem>
                  The client generates a main secret key and a salt using the
                  Web Crypto API.
                </ListItem>
                <ListItem>
                  A SHA-1 hash of the uploaded file is generated. A 1:1 pixel
                  representation of the file, that can be considered its unique
                  fingerprint. If any pixel is changed, this SHA-1 hash will not
                  match.
                </ListItem>
                <ListItem>
                  The client uses the main secret key and salt to derive more
                  keys via HKDF SHA-256
                  <UnorderedList>
                    <ListItem>
                      File keys: An encryption key and one salt for each files,
                      via{" "}
                      <Link
                        href="https://tools.ietf.org/html/rfc8188"
                        target="_blank"
                      >
                        RFC 8188
                      </Link>{" "}
                      (AES-GCM)
                    </ListItem>
                    <ListItem>
                      Metadata key: An encryption key for the file metadata
                      (AES-GCM)
                    </ListItem>
                    <ListItem>
                      Reader authorisation token: A token for authenticating
                      download requests (HMAC SHA-256)
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client asks the server to create a &quot;Room&quot;.
                  <UnorderedList>
                    <ListItem>
                      The server generates a<code>roomId</code>.
                    </ListItem>
                    <ListItem>
                      The server responds to the client with the
                      <code>roomId</code>.
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client encrypts each file separately using the derived
                  file key and the per-file salt.
                </ListItem>
                <ListItem>
                  The client creates a .torrent file using the encrypted files
                  as the contents.
                </ListItem>
                <ListItem>
                  The client encrypts the .torrent file using the derived
                  metadata key and a random IV.
                </ListItem>
                <ListItem>
                  The client uploads the salt, the encrypted files, the
                  encrypted .torrent file, the reader authorisation token, and
                  the torrent info hash to the server.
                  <UnorderedList>
                    <ListItem>
                      This request is authenticated by the server using the
                      &quot;writer authorisation token&quot;
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client asks the server for a storage service upload URL.
                  <UnorderedList>
                    <ListItem>
                      This request is authenticated by the server using the
                      &quot;writer authorisation token&quot;.
                    </ListItem>
                    <ListItem>
                      The server responds to the client with an authenticated
                      upload URL for uploading files to storage service.
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client uploads the encrypted files to storage service
                  where they are stored at rest with an additional layer of
                  at-rest encryption.
                </ListItem>
                <ListItem>
                  The key file metadata (including the SHA-1 hash) and private
                  form input is encrypted, timestamped and uploaded to IPFS.
                </ListItem>
                <ListItem>
                  Client calls the server to initiate a blockchain transaction;
                  minting a unique token that&apos;s inextricably linked to the
                  IPFS data, and finally transferred into the ownership of the
                  uploading user&apos;s wallet.
                </ListItem>
                <ListItem>
                  Server listens for blockchain transaction state change, if
                  successful, responding to client that the transfer has been
                  sealed.
                </ListItem>
              </OrderedList>
              <Text as={"h2"} pb={[3, 6]}>
                {"From the downloader's perspective"}
              </Text>
              <OrderedList>
                <ListItem>
                  The client reads the <code>roomId</code> and the main secret
                  key from the URL, which follows the pattern{" "}
                  <code>
                    https://ambr.link/&#123;roomId&#125;#&#123;secretKey&#125;
                  </code>
                </ListItem>
                <ListItem>
                  The client asks server for the salt that corresponds to{" "}
                  <code>roomId</code>.
                  <UnorderedList>
                    <ListItem>
                      This request is not authenticated by the server.
                    </ListItem>
                    <ListItem>
                      The server responds to the client with the salt.
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client uses the main secret key and salt to derive the
                  following keys (the same ones that the uploader derived):
                  <UnorderedList>
                    <ListItem>
                      File keys: An encryption key and one salt for each files,
                      via{" "}
                      <Link
                        href="https://tools.ietf.org/html/rfc8188"
                        target="_blank"
                      >
                        RFC 8188
                      </Link>{" "}
                      (AES-GCM).
                    </ListItem>
                    <ListItem>
                      Metadata key: An encryption key for the file metadata
                      (AES-GCM).
                    </ListItem>
                    <ListItem>
                      Reader authorisation token: A token for authenticating
                      download requests (HMAC SHA-256).
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client asks the server for the encrypted .torrent file
                  <UnorderedList>
                    <ListItem>
                      This request is authenticated by the server using the
                      &quot;reader authorisation token&quot;.
                    </ListItem>
                    <ListItem>
                      The server responds with the encrypted .torrent file.
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client decrypts the .torrent file using the derived
                  metadata key and the IV (which is embedded in the ciphertext)
                </ListItem>
                <ListItem>
                  The client asks the server for a storage service download URL
                  for <code>roomId</code>.
                  <UnorderedList>
                    <ListItem>
                      This request is authenticated by the server using the
                      &quot;reader authorisation token&quot;.
                    </ListItem>
                    <ListItem>
                      The server responds with an authenticated download URL to
                      fetch files from the storage service.
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client asks server for WebRTC offers (to connect to
                  WebTorrent peers) for the given torrent info hash
                  <UnorderedList>
                    <ListItem>
                      The server checks that torrent info hash corresponds to a
                      valid room and if so, responds with WebRTC offers for
                      peers in the given room.
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  The client downloads files from the storage service and WebRTC
                  peers simultaneously, coordinated by{" "}
                  <Link href="https://webtorrent.io/" target="_blank">
                    WebTorrent
                  </Link>{" "}
                  library
                </ListItem>
                <ListItem>
                  WebTorrent hashes all received torrent pieces and compares
                  them to the expected hashes, which are present in the .torrent
                  file
                  <UnorderedList>
                    <ListItem>
                      File data which fails piece verification is discarded.
                    </ListItem>
                  </UnorderedList>
                </ListItem>
                <ListItem>
                  Data which has been validated by WebTorrent is decrypted using
                  the derived file key and per-file salts (which are embedded in
                  the ciphertext)
                  <UnorderedList>
                    <ListItem>
                      This decryption process uses authenticated encryption (RFC
                      8188) so it will also fail if data is tampered with.
                    </ListItem>
                  </UnorderedList>
                </ListItem>
              </OrderedList>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} mb={[4, 6]}>
                {"How can I report a security vulnerability?"}
              </Text>
              <Text>
                If you&apos;ve found a security vulnerability in Ambr, please
                report it to{" "}
                <Link
                  href="mailto:ifoundabugin@ambr.link"
                  target="_blank"
                  title="Hi, I found a bug in Ambr!"
                >
                  ifoundabugin@ambr.link
                </Link>
                .
              </Text>
            </Box>
            <Box
              w={"100%"}
              alignItems={"center"}
              justifyContent={"center"}
              textAlign={"center"}
              borderTop={"1px solid"}
              borderColor={"black.500"}
              pt={8}
            >
              <Text className={"copyright"} fontWeight={"lighter"}>
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
      </Flex>
    );
  };
  return (
    <Box w={"100%"}>
      {loading && (
        <Fade in={loading}>
          <Box
            h={"100dvh"}
            minH={"100%"}
            pos={"fixed"}
            inset={0}
            overflow={"hidden"}
            display={"grid"}
            place-items={"center"}
          >
            <Center h="100%">
              <LogoLoader />
            </Center>
          </Box>
        </Fade>
      )}
      {!loading && (
        <>
          <Navigation
            fileTransfersRemaining={fileTransfersRemaining}
            mintState={null}
            chainState={null}
            customKey={null}
          />
          <Box
            w={["full", "80vw", "86vw", "full"]}
            minW={["", "", "43rem"]}
            maxW={["", "", "43rem"]}
            mt={[8, "5.5em"]}
            mx={[0, "auto"]}
            mb={8}
          >
            {securityPanel()}
          </Box>
        </>
      )}
    </Box>
  );
}
