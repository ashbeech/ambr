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
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"What is Ambr?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                Ambr is a file transfer service that uses the Polygon network, a
                carbon-neutral blockchain, to provide verifiable proof of origin
                and authenticity, ensuring the integrity and security of your
                work.
              </Text>

              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"Who should use Ambr?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                Ambr is designed for professionals who share their work with
                clients and those concerned about unauthorized use of their work
                by artificial intelligence or third parties.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {
                  "If I share a file with a client, will they need to create an account with Ambr to access it?"
                }
              </Text>
              <Text pt={3} pb={[6, 8]}>
                No, no account is required to download a file. They will be able
                to access the file either by the link in the email if you
                selected “Share via email” option or via the generated link you
                share with them yourself, however you choose.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {
                  "What happens if I lose the original file? Is there any way to recover the information?"
                }
              </Text>
              <Text pt={3} pb={[6, 8]}>
                After a file is shared using our service, the important
                information about the file, like its unique fingerprint and
                critical details, is still available. However, we currently
                don&apos;t store the actual original file itself after the
                sharing period expires. Once the time limit for the download
                link ends, it&apos;s not necessary to keep the file&apos;s
                record. We are working on adding a feature in the future that
                will allow you to permanently store the original file with us.
                This will make it more convenient if you want to share it
                publicly again after its download link has expired. For now, if
                you still have access to the original file, you can upload it
                again using the same link to verify its contents with the
                certificate. This will also re-activate the download link,
                allowing others to download it for an extended period of time.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"Why do you use two-factor authentication?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                We use two-factor authentication (2FA) for secure and easy
                access to Ambr. All you need is an email—no need to create
                another password. It&apos;s more secure than traditional
                username/password authentication. The first factor is your email
                address, and the second factor is a unique link you click on
                from your email inbox to prove your authentication.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {
                  "Can I track the files I&apos;ve sent or see a history of my transfers?"
                }
              </Text>
              <Text pt={3} pb={[6, 8]}>
                You can see your history by going to “My files”. File uploads
                expire after 48 hours so you will need to re-upload the original
                file in order to see information on files older than that.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {
                  "If I have concerns about privacy, how can I be sure that my files are safe and that only the intended recipient will have access to them?"
                }
              </Text>
              <Text pt={3} pb={[6, 8]}>
                If you&apos;re worried about privacy, you can be confident that
                your files are safe and you&apos;re in control of who you want
                to share them with. We take privacy seriously and have measures
                in place to protect your data. If you have any concerns or
                questions, feel free to reach out to our support team for more
                information. For more detail, please read our comprehesive{" "}
                <Link
                  href={"privacy"}
                  target="_blank"
                  title="Take a read of Ambr's Privacy Policy"
                >
                  Privacy Policy
                </Link>
                .
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"Is my file on the blockchain?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                The file&apos;s unique certificate, yes, but the full file
                itself, no. Your data privacy is our utmost priority, and it is
                why we host your file for a limited time, with only the
                file&apos;s certificate, including the information you give us
                is stored, encrypted, on the blockchain. That means no one can
                sneak a peek at your data or file unless you decide to share it
                with them.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {
                  "Do you offer any kind of user education or resources to help me maximise my use of Ambr?"
                }
              </Text>
              <Text pt={3} pb={[6, 8]}>
                Certainly! We provide helpful guides and resources to help you
                make the most of Ambr. These resources are designed to be
                beginner-friendly and will assist you in getting the most out of
                our platform. Whether you are new to Ambr or need some tips and
                tricks to enhance your experience, we&apos;ve got you covered
                with user education and resources!
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"How does Ambr work?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                Ambr employs blockchain technology to embed a digital timestamp
                in each file you transfer. This provides verifiable proof of
                origin and authenticity, enabling you to confidently share your
                work.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"Is blockchain technology bad for the environment?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                Ambr is deeply committed to sustainability. We use the Polygon
                network, a carbon-neutral blockchain, in our operations. It
                provides secure, scalable, and environmentally friendly
                solutions for our data provenance system. This proves that
                blockchain technology can be eco-friendly while providing
                efficient solutions to common problems.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"How do I sign in to Ambr?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                You don&apos;t need to register a new account to use Ambr.
                Simply sign in with your email and use our two-factor
                authentication process to ensure your account&apos;s security.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {
                  "Can Ambr prevent my work from being used by artificial intelligence or third parties?"
                }
              </Text>
              <Text pt={3} pb={[6, 8]}>
                While no system can entirely prevent unauthorised use,
                Ambr&apos;s data provenance capabilities make unauthorised use
                much less likely. Should your work be used without consent, the
                blockchain-embedded proof of origin and authenticity can provide
                significant evidence in resolving disputes.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"How long does Ambr store my files? "}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                Ambr stores your files for 48 hours. After that period, your
                original file will act as a key to unlock the stored
                information, so it&apos;s important for you to keep the
                original, unedited file safe
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"How much does Ambr cost?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
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
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"Are enterprise solutions available at Ambr?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                We are currently working on developing enterprise solutions.
                Stay tuned for updates and new feature releases.
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"I have a feature request. How can I share it with Ambr?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
                We&apos;re always keen to hear from our users. If you have a
                feature request or suggestion, please share it with us through
                our &apos;Contact Us&apos; page. Your feedback is essential to
                us in improving and expanding our services.{" "}
              </Text>
              <Text fontSize={"xl"} fontWeight={"medium"} mb={[2, 4]}>
                {"Who can I contact if I have more questions about Ambr?"}
              </Text>
              <Text pt={3} pb={[6, 8]}>
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
                &copy; {new Date().getFullYear()} Ambr
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
