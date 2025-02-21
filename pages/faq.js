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
} from "@chakra-ui/react";
import { getUser } from "../lib/UserManager";
import LogoLoader from "../components/icons/LogoLoader";
import { MagicContext } from "../components/MagicContext.js";
import Navigation from "../components/Navigation.js";
import VideoPlayer from "../components/YouTube";

export default function FaqPanel() {
  const { magic, publicAddress, isLoggedIn } = useContext(MagicContext);
  const [fileTransfersRemaining, setSharesRemaining] = useState(-999);
  const [loading, setLoading] = useState(true);

  const initLoader = async (user) => {
    //console.log("Getting user: ", user);

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

  const faqPanel = () => {
    return (
      <Flex
        w={"full"}
        h={"100%"}
        pos={"relative"}
        direction="column"
        alignItems="center"
        justifyContent="center"
        align="center"
      >
        <Box w={["90%", "100%"]} h={"100%"}>
          <Heading
            pb={[1, 6]}
            as={"h1"}
            className="fancy"
            letterSpacing={["normal !important", "wider !important"]}
          >
            Frequently asked questions
          </Heading>
          <VStack spacing={[4, 8]}>
            <Box mb={[4, 6]}>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"What's Ambr?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                Nobody should have the power to take credit for your creative
                work, diverting its value away from you. Ambr is the only way to
                send files, simultaneously placing you, the creator, in
                unparalleled control of the work you&apos;re sharing. Every
                shared file through Ambr is equipped with a tamper-proof,
                time-stamped digital fingerprint of your work, along with who
                you shared it with, all securely tied to you. Ambr strengthens
                your claim to creative ownership and your right to the value of
                your hard work.
              </Text>
              <Box w={"100%"} px={"1px"} pb={[8, 10]}>
                <VideoPlayer videoId={"TuIlBDg9Zho"} />
              </Box>

              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Who should use Ambr?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                Ambr is made for creatives to share their work with confidence.
                This could be passing around working files with clients, but it
                can also be used by anyone concerned with the unauthorised use
                of their work by third parties, including artificial
                intelligence (AI).
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "If I share a file with a client, will they need to create an account with Ambr to access it?"
                }
              </Text>
              <Text pt={3} pb={[8, 10]}>
                No, no account is required to download a file. They will be able
                to access the file either by the emailed link if you selected
                the &quot;Transfer&quot; option at upload, or alternatievly via
                the link you share with them yourself—however you choose.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"How does Ambr work?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                When you share a file through Ambr it securely and immutably
                records a unique, encrypted `fingerprint` of the file and the
                transfer event to a blockchain. Sharing a file through Ambr
                ensures you have easy access to the highest level of verifiable
                proof of origin, and authenticity.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"How do I sign in to Ambr?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                You don&apos;t need to register a new account to use Ambr.
                Simply sign in with your email and use our two-factor
                authentication process to ensure your security when using
                Ambr&apos;s services.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Why do you use two-factor authentication?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                We use two-factor authentication (2FA) for easy and secure
                access to Ambr. All you need is an email; there is no need to
                create a password. 2FA is also more secure than traditional
                username-password authentication. The first factor of 2FA is
                your email address, and the second is the unique link you click
                on from your email inbox.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "Can Ambr prevent my work from being used by artificial intelligence or third parties?"
                }
              </Text>
              <Text pt={3} pb={[8, 10]}>
                While no system can entirely prevent unauthorised use,
                Ambr&apos;s data provenance capabilities make unauthorised use
                much less likely. Should your work be used without consent, the
                blockchain-embedded proof of origin and authenticity can provide
                significant evidence in resolving disputes.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "Can I track the files I've sent or see a history of my transfers?"
                }
              </Text>
              <Text pt={3} pb={[8, 10]}>
                You can see your history by going to &quot;Your files&quot;.
                Note that a file&apos;s download link expires after 72 hours (3
                days) from upload, but you can re-upload the original file to
                the link after that to extend the download window once more.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"How long does Ambr store my files? "}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                Ambr stores your files for 72 hours (3 days). After that period,
                you can re-upload any exact copy of the file to the same link
                and have the download period extend for an additional 72 hours.
                Re-uploading a file also acts as verification thatb your file
                matches the original recorded by the certificate. This can act
                as evidence of the work within down th line, so it&apos;s
                important for you to keep an original, unedited file to hand.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "What happens if I lose my original file? Is there any way to recover the information?"
                }
              </Text>
              <Text pt={3} pb={[8, 10]}>
                After sharing a file, and once the download link expires, Ambr
                only retains the key evidential information about the file and
                its transfer, like the file&apos;s unique fingerprint, and
                timestamp of the transfer, etc, but not the actual original file
                itself.
                <br />
                <br />
                We are actively developing this feature, however. In the
                meantime we recommend you keep a copy of your original files.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Is my file on the blockchain?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                Your file&apos;s unique hash fingerprint is stored on the
                blockchain, but storing the full file in an encrypted form on a
                blockchain would not be practical and wouldn&apos;t add any
                extra benefit because Ambr already records all the necessary
                information in the file&apos;s certificate.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Is blockchain technology bad for the environment?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                Ambr is deeply committed to sustainability. We use the Polygon
                network, a carbon-neutral blockchain, in our operations. It
                provides secure, scalable, and environmentally friendly
                solutions for our data provenance system. This proves that
                blockchain technology can be eco-friendly while providing
                efficient solutions to common problems.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"How much does Ambr cost?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                Ambr offers your first 5 file transfers for free. After that, we
                offer x25 or x50 file transfers to top up, available{" "}
                <Link
                  href={"top-up"}
                  target="_blank"
                  title="Top up your Ambr file transfers"
                >
                  here{" "}
                </Link>
                via one-time payments.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Are enterprise solutions available at Ambr?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                We are currently working on developing enterprise solutions.
                Stay tuned for updates and new feature releases.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"I have a feature request. How can I share it with Ambr?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                We&apos;re always keen to hear your experience of Ambr. If you
                have a feature request or suggestion, please share it with us{" "}
                <Link
                  href={"mailto:feedback@bullish.design"}
                  target="_blank"
                  title="Contact us with your feedback to help improve Ambr"
                >
                  feedback@ambr.link
                </Link>
                . Your feedback is essential to us in improving and expanding
                our services.{" "}
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "If I have concerns about privacy, how can I be sure that my files are safe and that only the intended recipient will have access to them?"
                }
              </Text>
              <Text pt={3} pb={[8, 10]}>
                Our commitment to your privacy and data security is at the core
                of Ambr&apos;s guiding principles. Any important information you
                share with us is encrypted to ensure nothing leaves you in a
                readable format, without your consent.
                <br />
                <br /> Despite our{" "}
                <Link
                  href="https://observatory.mozilla.org/analyze/ambr.link"
                  target="_blank"
                  fontWeight={"bold"}
                >
                  A+ security rating
                </Link>{" "}
                we encourage you to verify for yourself, our comprehesive{" "}
                <Link
                  href={"security"}
                  target="_blank"
                  title="Take a read of Ambr's Security Statement"
                >
                  security
                </Link>
                {" and "}
                <Link
                  href={"privacy"}
                  target="_blank"
                  title="Take a read of Ambr's Privacy Policy"
                >
                  privacy
                </Link>{" "}
                policies. Also feel free to reach out to{" "}
                <Link
                  href={"mailto:privacy@bullish.design"}
                  target="_blank"
                  title="Contact Ambr's privacy team"
                >
                  privacy@ambr.link
                </Link>{" "}
                with any questions.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Who can I contact if I have more questions about Ambr?"}
              </Text>
              <Text pt={3} pb={[8, 10]}>
                If you have further questions about Ambr, feel free to contact
                us via email{" "}
                <Link
                  href={"mailto:support@bullish.design"}
                  target="_blank"
                  title="Contact Ambr's support team"
                >
                  support@ambr.link
                </Link>
                . We&apos;re here to help!
              </Text>
            </Box>
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
                fontWeight={"lighter"}
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
            {faqPanel()}
          </Box>
        </>
      )}
    </Box>
  );
}
