import { Box, Flex, Text, VStack } from "@chakra-ui/react";

export default function PrivacyPanel() {
  const privacyPanel = () => {
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
        <Box w={"100%"} h={"100%"}>
          <VStack
            w={["full", "80vw", "86vw", "50vw"]}
            minW={["", "", "43rem"]}
            maxW={["", "", "40rem"]}
            spacing={8}
          >
            <Text as={"h1"} mb={"0 !important"}>
              {"Privacy Policy"}
            </Text>
            <Text>Version: [Date]</Text>
            <Text>
              Ambr is designed with a clear purpose in mind: to provide you with
              a powerful tool—data provenance. It enables you to confidently
              share your work, knowing that easy access to verifiable proof of
              origin and authenticity is at your fingertips. We believe in
              providing you transparent services that you can not only trust,
              but also verify. Our commitment to your privacy and data security
              is at the core of Ambr&apos;s guiding principles. We&apos;ve
              designed and built Ambr so that all sensitive data is encrypted
              before transmission, in transit, as well as at rest in storage,
              ensuring nothing you wouldn&apos;t want others reading leaves your
              side in a plain-text readable format, without your consent.
              <br />
              <br />
              This following statement covers the processing activities of the
              Ambr services, software, websites (including browser extensions)
              and/or applications (together: “Services”). The Services allow you
              to create, share, collect, capture and/or visualise your ideas,
              texts, graphics, videos, data, information, files, decks or other
              content (together: “Content”). The Services may be provided to you
              online, in the form of a mobile and/or desktop application(s)
              and/or may be integrated in a third-party service. By using any of
              the Services you agree to have read and understood our Privacy
              Policy as below.
            </Text>
            <Box>
              <Text as={"h2"} mb={8}>
                {"1. What personal information do we collect?"}
              </Text>

              <Text>
                We collect the absolute minimum personal information possible in
                order to allow your use and the facilitation of our Services.
                <br />
                <br />
                There are several ways in which we may collect personal
                information from you: you may submit it, or we will select it
                automatically through our Services. Different types of personal
                information may be collected depending on the way you use our
                Services and which Services you use. Please check the section
                “What are your rights as a user” to find out how you can change,
                access or delete your personal information where reasonably
                feasible.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"1.1. Personal information you submit"}
              </Text>
              <Text pb={6}>
                Each processing activity has a valid activity and purpose,
                described below:
              </Text>
              <Text className="decimal-list indented">
                1.1.1. Contact Information: When you create a user account on
                Ambr we only encrypt and store your email address, we do not
                collect any personal names or any other personal data.
              </Text>
              <Text className="decimal-list indented">
                1.1.2. Content and Certificates: You may choose to upload or
                create Content which contains personal information about you and
                others. When you upload and share file(s) through Ambr, you have
                the option to provide associated details such as a client&apos;s
                name, the file&apos;s key concept describing its contents,
                creator and co-creator names (if applicable), as well as
                optional recipient email addresses. All this information,
                including the file itself and its corresponding Certificate, is
                encrypted on your device prior to transmission and storage to
                ensure its privacy and security.{" "}
              </Text>
              <Text>
                If you upload, send or create personal information via one of
                our Services, Ambr will only process it to provide its Service,
                the uploader or creator is responsible for the legitimacy of the
                Content, and our{" "}
                <a href="terms" target="_self">
                  Terms of Service
                </a>{" "}
                must be followed.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"2. Why do we use your personal information?"}
              </Text>
              <Text pb={6}>
                We use your personal information in order to provide and improve
                our Services, to comply with legal obligations, and to keep our
                Services safe and secure. We do not use your personal
                information for marketing and (interest based) advertising, or
                share such information with 3rd-parties. Please find below
                specifically how we may use your personal information, and on
                what legal grounds we base its use.
              </Text>
              <Text as={"h4"} pb={6}>
                {"2.1. Activities & Purposes"}
              </Text>
              <Text pb={6}>
                Each processing activity has a valid activity and purpose,
                described below:
              </Text>
              <Text className="decimal-list indented">
                2.1.1. Service: the most important reason for using your
                personal information is, of course, to offer you our Services as
                mentioned in our Terms of Service, e.g. to create or visualise
                your Content or share your ideas and to let you access and use
                your Content across different devices.
              </Text>
              <Text className="decimal-list indented">
                2.1.2. Support: we provide a wide range of support services to
                help you out whenever you&apos;re in need, for instance when you
                need technical assistance. If it&apos;s needed to offer support,
                the Support-team can, on your request, access your Content in
                order to help you out.
              </Text>
              <Text className="decimal-list indented">
                2.1.3. Account & billing: creating and upholding your personal
                account e.g. to enable you to access your Content across
                different devices, facilitating payments and perform accounting,
                auditing & billing activities.
              </Text>
              <Text className="decimal-list indented">
                2.1.4. Safety, integrity & security: Ambr follows up on abuse
                reports, fraud investigations and could investigate your
                compliance with our of our Terms of Service. Furthermore, we
                detect & block Child Sexual Abuse Imagery (CSAI). Cases of
                potential CSAI will be reported directly to law enforcement
                agencies. Furthermore, we protect ourselves against fraud and
                other illegal activities. In all these cases we withhold the
                right to preserve your Content and share it, together with other
                identifying information, with law enforcement agencies. Finally,
                we could use your personal information for internal control to
                safeguard our and your safety, integrity and security. For
                instance, in case of any suspicion of violations of our Terms of
                Service.
              </Text>
              <Text className="decimal-list indented">
                2.1.5. Improvement & development: we evaluate the use of our
                Services to improve our Services, fix bugs, develop new products
                and services. We do this either by market research (for instance
                by reaching-out with surveys) or by performing analyses on
                anonymised data. We do this in order to understand how our user
                base as a whole interacts with our Services, but also to review
                the effect of our marketing and to improve those Services and
                such marketing accordingly.
              </Text>
              <Text className="decimal-list indented">
                2.1.6. Legal: in so far as necessary, we might use your personal
                information to defend Ambr in legal proceedings in relation to
                or as a result of your use of our Services, following a court
                order, abiding by any law, regulation or governmental request,
                cooperating with law enforcement, cooperating in fraud
                investigations of third parties, safeguarding national security,
                defence, public security, and to uphold our Terms of Service.
              </Text>
            </Box>
            <Box>
              <Text as={"h4"} pb={6}>
                {"2.2. Legal Grounds"}
              </Text>
              <Text pb={6}>
                Each processing activity has a valid legal ground, which is
                described below:
              </Text>
              <Text className="decimal-list indented">
                2.2.1. Contractual obligations with you: regarding the
                activities and purposes mentioned under 2.1.1., 2.1.2. and
                2.1.3. We need to process personal information to offer our
                Services through our websites, mobile application, and
                extensions, e.g. to provide (technical) support.
              </Text>
              <Text className="decimal-list indented">
                2.2.2. Legal obligations: regarding the activities and purposes
                under 2.1.3., 2.1.4. and 2.1.6. We&apos;re legally obliged to
                process your personal information for accounting purposes, to
                respond to legal requests and Notice-and-takedown (NTD) or
                Digital Millennium Copyright Act (DMCA) requests.
              </Text>
              <Text className="decimal-list indented">
                2.2.3. Consent: (partially) regarding activities and purposes
                mentioned under 2.1.2. (e.g. accessing your Content for
                support).
              </Text>
              <Text className="decimal-list indented">
                2.2.4. Legitimate interests: (partially) regarding activities
                and purposes under 2.1.1. & 2.1.3. (e.g. to provide cross device
                access). For the purposes mentioned under 2.1.4. in order to
                provide safe Services, to prevent fraud and react against
                illegal use of our Services. For our innovative interests as
                mentioned under 2.1.5., and legal & compliance interests stated
                under 2.1.6.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"3. What parties do we share personal information with?"}
              </Text>
              <Text pb={6}>
                We work with third-parties to provide and improve our Services.
                We may share or allow you to share your information as part of
                some of the Services.
              </Text>
              <Text className="decimal-list indented">
                3.1. Service providers: such as our web server provider, user
                support, payment and email processors. These providers are bound
                by their Privacy Policies to safeguard that information. If you
                use other Third-Party Services in connection with our Services,
                their Terms and Privacy Policies govern your use of those
                services.
              </Text>
              <Text className="decimal-list indented">
                3.2. People and (social) media of your choice: you may choose to
                share your Content with others, such as teammates, within our
                Services or on (social) media like Twitter.
              </Text>
              <Text className="decimal-list indented">
                3.3. Law enforcement agencies or regulators: we are obliged to
                share your personal information in case of a legal request. In
                case we run across CSAI or when we&apos;re notified on other
                illegal Content we&apos;ll also share your personal information
                with law enforcement agencies.
              </Text>
              <Text className="decimal-list indented">
                3.4. Integrated services: if you decide to integrate (one of)
                our Services with another service (such as Slack or your social
                media account) we will connect that service with ours. In order
                to provide such service, we will need to share some of your
                personal information with that service. The terms and privacy &
                cookie statement of these third parties applies, at least for
                their part of the connection.
              </Text>
              <Text className="decimal-list indented">
                3.5. Ambr entities: we share personal information between
                entities which are part of the Ambr group in order to provide
                our Services and for all purposes mentioned under “Why do we use
                your personal information?”.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"4. Why and how are cookies used?"}
              </Text>
              <Text pb={6}>
                We are dedicated to making our Services safe, valuable,
                unobtrusive and beautiful for you and the minimal cookies we may
                use are for the purpose of facilitating your use of the Services
                and to find out how the Services may be improved—nothing more.
                <br />
                <br />
                Feel free to block cookies, however you may not be able to take
                full advantage of the Services we can provide.
                <br />
                <br />
                The use of any cookies will serve one or multiple of the
                following purposes:
              </Text>
              <Text className="decimal-list indented">
                4.1. Strictly Necessary or Essential Cookies: These cookies are
                necessary for the Site to function and cannot be switched off in
                our systems e.g. we use cookies to authenticate you. When you
                log on to our websites, authentication cookies are set which let
                us know who you are during a browsing session. We have to load
                essential cookies for legitimate interests pursued by us in
                delivering our Service&apos;s essential functionality to you.
              </Text>
              <Text className="decimal-list indented">
                4.2. Functionality Cookies: These cookies are used to enable
                certain additional functionality on our Site, such as storing
                your preferences and assisting us in providing support or
                payment services to you so we know your browser or operating
                system. This functionality improves user experience and enables
                us to provide better Services and a more efficient Platform.
              </Text>
              <Text className="decimal-list indented">
                4.3. Performance and Analytics Cookies: These cookies allow us
                to count visits and traffic sources so we can measure and
                improve the performance of our Services. They help us to know
                which pages are the most and least popular and see how visitors
                navigate the Services. Performance cookies are used to help us
                with our analytics, including to compile statistics and
                analytics about your use of and interaction with the Services,
                including details about how and where our Services are accessed,
                how often you visit or use the Services, the date and time of
                your visits, your actions on the Services, and other similar
                traffic, usage, and trend data.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"5. Can you use Ambr for private or sensitive files?"}
              </Text>
              <Text pb={6}>
                In short, yes. We treat your Content with respect. We don&apos;t
                provide any public search function, catalogue or listing to find
                yours or anyone else&apos;s Content. All Content is encrypted in
                transit and rest. We trust you understand that we&apos;re
                obliged to delete your Content when we receive a
                NTD/DMCA-request or when we receive a legitimate legal request.
                Please be mindful when distributing download/access links -
                whoever it is passed on to or has access to a download/access
                link can access or download the Content.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"6. What retention procedures are in place?"}
              </Text>
              <Text as={"h4"} pb={6}>
                {"6.1. Personal information"}
              </Text>
              <Text pb={6}>
                Ambr retains your personal information (encrypted) as long as
                its necessary to provide our Services to you (e.g. upholding
                your user account), to conduct our business activities and
                fulfil our legitimate interests, such as providing safe and
                secure services, to fix bugs and to reach-out to you, to comply
                with applicable laws (e.g. retaining financial information for 7
                years for tax purposes) and legal requests and to resolve
                (legal) disputes.
              </Text>
              <Text as={"h4"} pb={6}>
                {"6.2. Files you transfer"}
              </Text>
              <Text pb={6}>
                When using Ambr File Sharing your Content will be deleted after
                24 hours, unless you have an Enterprise account in which case
                your transfer data is stored by default for 28 days or until the
                expiry date you set manually. After this period, a stored
                original file (encrypted) is automatically deleted from our
                servers. For the purposes of providing our Services, any
                personal information that accompanies your file&apos;s transfer,
                in the form of its historic metadata record, is persistently
                stored in its encrypted state. We utilise IPFS (InterPlanetary
                File System) for the storage of such encrypted Content. IPFS is
                a decentralised storage system that offers enhanced security and
                redundancy. However, it is important to note that encrypted
                Content once stored on IPFS will be be impractical or impossible
                to delete. We take technical measures to protect your data and
                ensure its confidentiality, but it is essential for you to be
                aware of these limitations outlined regarding data deletion on
                IPFS; once your encrypted Content is stored on IPFS, it is
                functional to Ambr&apos;s Services that it remains persist in
                the network so even if a reference in your Ambr account is
                erased.
                <br />
                <br />
                By using Ambr and acknowledging this Privacy Policy, you
                understand and accept that the storage of encrypted personal
                information on IPFS may result in the retention of data even
                after deletion attempts. You release Ambr from any liability or
                responsibility for the consequences of such data being lost or
                inadvertently shared with unintended parties.
                <br />
                <br />
                The only way however that this historic record can become human
                readable is through decryption when the original, unique key
                that was generated by the user at the Content&apos;s creation,
                is presented.
                <br />
                <br />
                We do not use your email address or IP address for analytical
                purposes, but we do create a random pseudonym for both and use
                that pseudonym instead. That way we don&apos;t have to handle
                directly identifiable personal information.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {
                  "6.3. Content you create, use, store or share through the Services other than file sharing"
                }
              </Text>
              <Text pb={6}>
                The Content you create, use, store or share on our Services,
                other than our File Sharing Service, is, in principle, retained
                until you stop interacting with our Service(s), when you delete
                your Content from the Service(s), when you delete the Service(s)
                from your device(s) or when you delete your account. Always
                check out the website(s) or app(s) of the Service(s) you use for
                specific information.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"7. How safe is it to use our Services?"}
              </Text>
              <Text pb={6}>
                Ambr takes technical and organisational measures to protect your
                personal information against loss or other forms of unlawful
                processing. We make sure that personal information can only be
                read, copied, modified or removed by properly authorised staff
                under consensual support enquiries or legal obligation. We
                monitor internal activity to ensure the safety and accuracy of
                personal information. Ambr staff are required to conduct
                themselves in a manner consistent with the company’s guidelines
                regarding confidentiality, ethics, and appropriate usage of
                personal information. Staff are required to sign a
                confidentiality agreement. During an upload, while it's stored
                on our servers and during a download, Content is encrypted and
                only sent over a secure connection (https). The servers we use
                to store your Content for you are GDPR compliant and secure.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"8. Can minors use our Services?"}
              </Text>
              <Text pb={6}>
                You are only allowed to use our website, apps and/or Services
                when aged 16 and over. When you’re younger than 16 you may use
                our website, apps and/or Services only after parental approval
                or approval of your legal representative. Minors under the age
                of 13 in the USA are not allowed to use our Services.{" "}
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={8}>
                {"9. What are your rights as a user?"}
              </Text>
              <Text pb={6}>
                If you need more info on your personal information, please let
                us know. We may ask for proof of identity. If you change your
                mind and no longer want us to process your personal information,
                let us know. You can ask Ambr to:
              </Text>
              <Text className="decimal-list indented">
                9.1.1. access, receive a copy of or correct your personal
                information;
              </Text>
              <Text className="decimal-list indented">
                9.1.2. in certain cases, erase your personal information or
                block or restrict our use of it;
              </Text>
              <Text className="decimal-list indented">
                9.1.3. in certain cases, send your personal information to other
                third parties.
              </Text>
              <Text pb={6}>
                You can do this by sending an email to{" "}
                <a href="mailto:privacy@ambr.link">privacy@ambr.link</a>. Please
                state clearly in the subject that your request concerns a
                privacy matter and more specific whether it is a request to
                access, correction or deletion. Bear in mind that under
                circumstances Ambr requests for additional information to
                determine your identity.
              </Text>
              <Text as={"h4"} pb={6}>
                {"9.2. Right to object"}
              </Text>
              <Text pb={6}>
                You have a right to object to our use of your personal
                information, for instance when the legal base for processing is
                based on one of our legitimate interests (see subsection “Legal
                grounds”). If you inform us that you do not longer wish us to
                process your personal information or to be approached, Ambr will
                move your personal information to a separate file. Your personal
                information will no longer be used for the above mentioned
                purposes, unless our legitimate interest, e.g. safety &
                security, outweighs your right to objection, or in the case of
                encrypted data stored on IPFS; deletion is unfeasible. You can
                request this via{" "}
                <a href="mailto:privacy@ambr.link">privacy@ambr.link</a>. Please
                state clearly that your request concerns a privacy matter and
                more specifically that you exercise your right to object. If you
                think we have infringed your privacy rights, you can lodge a
                complaint with the relevant supervisory authority. You can lodge
                your complaint in particular in the country where you live, your
                place of work or place where you believe we infringed your
                right(s).
              </Text>
              <Text as={"h4"} pb={6}>
                {"9.3. Withdrawal of consent"}
              </Text>
              <Text>
                When you&apos;ve provided your consent for us to process your
                personal information, you can withdraw your consent at any time,
                without affecting the lawfulness of processing activities based
                on consent before its withdrawal. If you withdraw your consent,
                we will no longer process the personal information which we’ve
                received based on your consent.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} pb={6}>
                {"10. Revisions to the Privacy Policy"}
              </Text>
              <Text>
                Note that Ambr may revise this Privacy Policy from time to time.
                Each revised version shall be dated and posted on the website.
                Ambr recommends that you review the website from time to time
                and take note of any changes. If you do not agree with the
                Privacy Policy, you should not or no longer access or use the
                website and/or service. By continuing to use the website and/or
                service you accept any changes made to the Privacy Policy.
              </Text>
            </Box>
            <Box w={"100%"}>
              <Text as={"h2"} pb={6}>
                {"How to contact Ambr"}
              </Text>
              <Text>
                Please reach out to us regarding any privacy-related questions,
                via <a href="mailto:privacy@ambr.link">privacy@ambr.link</a>.
              </Text>
            </Box>
            <Box
              w={"100%"}
              borderTop={"1px solid"}
              borderColor={"black.500"}
              pt={8}
            >
              <Text className={"copyright"}>
                {"Copyright 2023 This is Bullish Ltd. All rights reserved."}
              </Text>
            </Box>
          </VStack>
        </Box>
      </Flex>
    );
  };
  return (
    <Box className="glass" mt={20} mb={8}>
      <Box>{privacyPanel()}</Box>
    </Box>
  );
}
