import {
  Box,
  Flex,
  Text,
  Heading,
  UnorderedList,
  ListItem,
  VStack,
  Link,
} from "@chakra-ui/react";

export default function TermsPanel() {
  const termsPanel = () => {
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
        <Box w={"100%"} h={"100%"} pl={[8, 0]} pr={[8, 0]}>
          <Heading
            pb={[1, 6]}
            as={"h1"}
            className="fancy"
            letterSpacing={["normal !important", "wider !important"]}
          >
            Frequently asked questions
          </Heading>
          <VStack
            w={["full", "80vw", "86vw", "50vw"]}
            minW={["", "", "43rem"]}
            maxW={["", "", "40rem"]}
            spacing={[4, 8]}
          >
            <Box mb={[4, 6]}>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"What is Ambr?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                Ambr is a secure file transfer service that lets you send files
                to anyone in the world with a simple link, whilst simultaeously
                providing verifiable proof of origin and authenticity for your
                hard work in the backgound when you need it.
              </Text>

              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Who should use Ambr?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                Ambr is made for creatives to share their work with confidence,
                which could be working files with clients, but Ambr can also be
                used by anyone concerned with the unauthorised use of their work
                by third parties, including artificial intelligence (AI).
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "If I share a file with a client, will they need to create an account with Ambr to access it?"
                }
              </Text>
              <Text pt={3} pb={[3, 8]}>
                No, no account is required to download a file. They will be able
                to access the file either by the emailed link if you selected
                the “Transfer” option at upload, or via the link you share with
                them yourself, however you choose.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"How does Ambr work?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                Ambr employs blockchain technology to embed a digital timestamp
                in each file you transfer. This provides verifiable proof of
                origin and authenticity, enabling you to confidently share your
                work.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"How do I sign in to Ambr?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                You don&apos;t need to register a new account to use Ambr.
                Simply sign in with your email and use our two-factor
                authentication process to ensure your security when using
                Ambr&apos;s services.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Why do you use two-factor authentication?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
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
              <Text pt={3} pb={[3, 8]}>
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
              <Text pt={3} pb={[3, 8]}>
                You can see your history by going to “Your files”. Note that a
                file&apos;s download link expires after 24 hours from upload,
                but you can re-upload the original file to the link after that
                to extend the download window once more.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"How long does Ambr store my files? "}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                Ambr stores your files for 48 hours. After that period, your
                original file will act as a key to unlock the stored
                information, so it&apos;s important for you to keep the
                original, unedited file safe
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "What happens if I lose my original file? Is there any way to recover the information?"
                }
              </Text>
              <Text pt={3} pb={[3, 8]}>
                After sharing a file, and once the downlaod link expires, Ambr
                only permantaly retains the key evidential information about the
                file and its transfer, like the file&apos;s unique fingerprint,
                and timestamp of the transfer, etc, but not the actual original
                file itself.
                <br />
                <br />
                We are actively developing this feature however, but in the
                meantime we recommend you keep a copy of your original files.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Is my file on the blockchain?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                The file&apos;s unique certificate, yes, but the full file
                itself, no.
                <br />
                <br />
                Recording an encrypted version of your original file on a
                blockchain would not only be impractical, but also provide no
                real value above the information Ambr already records in the
                file&apos;s certificate.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Is blockchain technology bad for the environment?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
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
              <Text pt={3} pb={[3, 8]}>
                Ambr offers your first 5 file transfers for free. After that, we
                offer x25 or x50 file transfers to top up, available{" "}
                <Link
                  href={"top-up"}
                  target="_blank"
                  title="Top up your Ambr file transfers"
                >
                  here
                </Link>
                via one-time payments.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Are enterprise solutions available at Ambr?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                We are currently working on developing enterprise solutions.
                Stay tuned for updates and new feature releases.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"I have a feature request. How can I share it with Ambr?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                We&apos;re always keen to hear from our users. If you have a
                feature request or suggestion, please share it with us through
                our &apos;Contact Us&apos; page. Your feedback is essential to
                us in improving and expanding our services.{" "}
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "If I have concerns about privacy, how can I be sure that my files are safe and that only the intended recipient will have access to them?"
                }
              </Text>
              <Text pt={3} pb={[3, 8]}>
                Our commitment to your privacy and data security is at the core
                of Ambr&apos;s guiding principles. We&apos;ve designed and built
                Ambr so that all sensitive data is encrypted before
                transmission, in transit, as well as at rest when in storage.
                This ensures nothing you wouldn&apos;t want others snooping on
                leaves your side in a readable format, without your consent.
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
                  href={"privacy"}
                  target="_blank"
                  title="Take a read of Ambr's Privacy Policy"
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
                policy. Also feel free to reach out to{" "}
                <Link
                  href={"mailto:privacy@ambr.link"}
                  target="_blank"
                  title="Contact Ambr's privacy team"
                >
                  privacy@ambr.link
                </Link>{" "}
                with any questions.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {
                  "Do you offer any kind of user education or resources to help me maximise my use of Ambr?"
                }
              </Text>
              <Text pt={3} pb={[3, 8]}>
                Certainly! We provide helpful guides and resources to help you
                make the most of Ambr. These resources are designed to be
                beginner-friendly and will assist you in getting the most out of
                our platform. Whether you are new to Ambr or need some tips and
                tricks to enhance your experience, we&apos;ve got you covered
                with user education and resources!
              </Text>

              <Text fontSize={"xl"} fontWeight={"medium"} mb={[1, 0]}>
                {"Who can I contact if I have more questions about Ambr?"}
              </Text>
              <Text pt={3} pb={[3, 8]}>
                If you have further questions about Ambr, feel free to contact
                our customer service team through the &apos;Contact Us&apos;
                page on our website. We&apos;re here to help!
              </Text>
            </Box>
            <Box
              w={"100%"}
              borderTop={"1px solid"}
              borderColor={"black.500"}
              pt={8}
            >
              <Text className={"copyright"} fontWeight={"lighter"}>
                &copy; {new Date().getFullYear()}{" "}
                <Link
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
    <Box className="" mt={[12, 20]} mb={8} w={"100%"}>
      <Box>{termsPanel()}</Box>
    </Box>
  );
}
