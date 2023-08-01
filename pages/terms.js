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
            No jargon introduction
            <br />
            to our terms
          </Heading>
          <VStack
            w={["full", "80vw", "86vw", "50vw"]}
            minW={["", "", "43rem"]}
            maxW={["", "", "40rem"]}
            spacing={[4, 8]}
          >
            <Box mb={[4, 6]}>
              <Text pb={3}>
                Your time is valuable, so here&apos;s a simple summary of our
                Terms of Service. Please note that this summary does not replace
                the official legal documentation, but it provides you with a
                general idea of what&apos;s included. If you have any questions
                or concerns, feel free to contact us{" "}
                <Link
                  href={"mailto:legal@ambr.link"}
                  target="_blank"
                  title="Mail Ambr's legal department here"
                >
                  legal@ambr.link
                </Link>
                , and we&apos;ll be happy to help.
              </Text>
              <UnorderedList>
                <ListItem pt={3} pb={[2, 3]}>
                  <Text>
                    <Box as="span" fontWeight="bold">
                      Age Requirement:
                    </Box>{" "}
                    You must be at least 16 years old to use our tools and
                    services.
                  </Text>
                </ListItem>
                <ListItem pt={3} pb={[2, 3]}>
                  <Text>
                    <Box as="span" fontWeight="bold">
                      Ownership and Responsibility:
                    </Box>{" "}
                    Your content belongs to you, and you are responsible for it.
                    We will only handle your content as necessary for our
                    services to function properly.
                  </Text>
                </ListItem>
                <ListItem pt={3} pb={[2, 3]}>
                  <Text>
                    <Box as="span" fontWeight="bold">
                      Illegal Activities:
                    </Box>{" "}
                    If you engage in illegal activities, we have the right to
                    block, delete your content, and suspend your account.
                  </Text>
                </ListItem>
                <ListItem pt={3} pb={[2, 3]}>
                  <Text>
                    <Box as="span" fontWeight="bold">
                      Service Usage Risk:
                    </Box>{" "}
                    Please be aware that you use our service at your own risk.
                    We are not liable for any damages that may occur if things
                    go wrong.
                  </Text>
                </ListItem>
                <ListItem pt={3} pb={[2, 3]}>
                  <Text>
                    <Box as="span" fontWeight="bold">
                      Changes to Terms:
                    </Box>{" "}
                    We may update our terms, services, and fees periodically. If
                    you have an account and disagree with any changes, you can
                    cancel your account at any time.
                  </Text>
                </ListItem>
              </UnorderedList>
              <Text pt={3}>
                These terms are designed to be fair, provide transparency, and
                ensure everything runs smoothly to provide you a valuable
                service.
              </Text>
            </Box>
            <Text as={"h1"} mb={"0 !important"}>
              {"Terms of Service"}
            </Text>
            <Text>Version: 12-07-23</Text>
            <Text>
              If you share your work with clients or are perhaps concerned that
              your work may be used without consent by artificial intelligence
              (AI),{" "}
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
              We prioritise the privacy, safety, and security of your data in
              every aspect of Ambr&apos;s design. Our commitment to security is
              outlined in our{" "}
              <Link
                href={"security"}
                target="_blank"
                title="Take a read of Ambr's Security Statement"
              >
                Security Statement
              </Link>
              , where you can verify our approach firsthand. Your usage and
              access to our services, software, websites (including browser
              extensions), and/or applications (collectively referred to as
              “Services“) are governed by these Terms of Service (collectively,
              the “Agreement“ or “Terms“), a legal agreement between This is
              Bullish Ltd. (“This is Bullish“, DBA Ambr, its affiliates, and any
              of its or their respective successors or assigns (collectively,
              “Ambr,“ “our,“ “we,“ or “us“). These Services may be provided to
              you online, in the form of mobile and/or desktop applications, or
              integrated within third-party services. They enable you to upload,
              submit, store, share, receive, collect, capture, and visualise
              your ideas, texts, graphics, videos, data, information, files,
              presentation decks, and other content, including third-party
              content you utilise (“Content“). You retain all rights,
              responsibilities, and liabilities for your Content, and Ambr/This
              is Bullish Ltd does not claim ownership over it. The Services are
              provided to you, the user, by us, with our headquarters located at
              11 New Road, Hornsea, East Riding of Yorkshire, HU18 1PG,
              registered in the United Kingdom, at Companies House, under
              company number 14186533.
            </Text>
            <Box>
              <Text as={"h2"} mb={[6, 8]}>
                {"1. Applicability"}
              </Text>
              <Text className="decimal-list">
                1.1. You are only allowed to use the Services when aged 16 or
                older.
              </Text>

              <Text className="decimal-list">
                1.2. Please read the Terms carefully. By using the Services
                (directly with us or through a third-party application, plug-in,
                extension, or integration), you agree and accept these Terms and
                our Notice and Take Down Policy (described in full below) (“NTD
                Policy”). In relation to the minimal use of personal data, and
                cookies (for the sole purpose of improving the Services) our{" "}
                <Link
                  href={"privacy"}
                  target="_blank"
                  title="Take a read of Ambr's Privacy Policy"
                >
                  Privacy Policy
                </Link>{" "}
                applies.
              </Text>

              <Text className="decimal-list">
                1.3. If the Services include, are used in connection with, or
                are integrated into the services of third parties, the terms and
                conditions, notice and take down policies, and/or privacy
                policies of those third parties may apply in addition to these
                Terms. If you are using the Services on behalf of your employer
                or another organisation, you are agreeing to the terms of that
                organisation, and you represent and warrant that you have the
                authority to do so. Ambr is not responsible for any third-party
                services, terms, and/or policies.
              </Text>

              <Text className="decimal-list">
                1.4. If you want to file a complaint or notice about unlawful
                Content being stored or shared via the Services or the Ambr API,
                please refer to our NTD Policy (described below).
              </Text>

              <Text className="decimal-list">
                1.5. If you become aware of a vulnerability in any of the
                Services please submit your findings to bugs@ambr.link,
                providing sufficient information to reproduce the problem. We
                welcome disclosure reports from automated tools / scans, we
                cannot offer a reward.
              </Text>

              <Text className="decimal-list">
                1.6. It is important to refrain from exploiting or abusing any
                vulnerabilities discovered within the Services, disclose the
                problem only to Ambr until it is resolved, and avoid engaging in
                any attacks or actions involving third-party applications that
                may compromise security. Kindly provide adequate information to
                reproduce the problem to assist us in promptly resolving the
                issue.
              </Text>

              <Text className="decimal-list">
                1.7. If you want to use the Ambr API (as described in the API
                Terms of Use), our API Terms of Use apply in addition to these
                Terms.
              </Text>

              <Text className="decimal-list">
                1.8. We may update the Terms from time to time, and your
                continued use of our Services confirms your acceptance of our
                updated Terms. Our Terms cover the entire agreement between you
                and Ambr regarding our Services. If you do not agree with our
                Terms, you should stop using our Services.
              </Text>

              <Text className="decimal-list">
                1.9. These Terms supersede any prior oral and written
                quotations, terms, communications, agreements, and
                understandings between you and Ambr.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={[6, 8]}>
                {"2. Content Sharing and Storage"}
              </Text>
              <Text className="decimal-list">
                2.1. Ambr enables you to share your Content with others,
                simultaneously providing a verifiable, tokenised metadata record
                of its origin and history (the “Certificate“).
              </Text>
              <Text className="decimal-list">
                2.2. To share your Content, you need to upload it and can either
                provide us with a limited number of email addresses of
                recipients (“email transfer“) or choose to distribute a download
                link yourself (“link transfer“). If you use link transfer, you
                will not be informed of any downloads by others
              </Text>
              <Text className="decimal-list">
                2.3. Ambr treats Content as private and confidential and does
                not control the use of download links, regardless of whether
                they are originally distributed by us or by you. You are solely
                responsible for the Content you upload and share.
              </Text>
              <Text className="decimal-list">
                2.4. Ambr does not provide a public search function, catalog, or
                listing to find Content.
              </Text>
              <Text className="decimal-list">
                2.5. Ambr allows you to share Content up to a maximum total
                capacity. Uploaded Content is stored on Ambr&apos;s servers for
                a limited period, after which the ability to download the
                original file from those servers expires.
              </Text>
              <Text className="decimal-list">
                2.6. You are solely responsible for creating backup copies of
                and replacing any Content you upload and/or store on the
                Services.
              </Text>
              <Text className="decimal-list">
                2.7. After the expiry period, Ambr permanently deletes the
                original uploaded file(s), however its corresponding Certificate
                remains accessible using its original, unique link via the
                Services. Should the original file be re-uploaded to its
                corresponding unique link, the file(s) once again become
                available and retrievable for a further extended period.
              </Text>
              <Text className="decimal-list">
                2.8. By default, the sensitive contents of Certificates are only
                displayed privately to the owner via the Services. However, if
                you as the owner choose to disclose a file&apos;s Certificate
                publicly or share any of its associated Content publicly, via
                social media platforms or otherwise, you fully assume all legal
                responsibility for any claims or consequences that may arise.
                This is including, but not limited to, violations of GDPR and
                laws regarding the right to privacy. Ambr and its Services shall
                not be held liable for any legal ramifications resulting from
                such actions.
              </Text>
              <Text className="decimal-list">
                2.9. The basic functionality of Ambr File Sharing is free, but
                once an account&apos;s free Shares have been exhausted, in order
                to continue using the Services, further Shares must be
                purchased.
              </Text>
              <Text className="decimal-list">
                2.10. As part of our Services, when you create an account with
                Ambr, a corresponding and unique cryptographic private and
                public key pair is generated (your “Wallet“). Your Wallet
                provides evidence of ownership/possession of your shared Content
                in digital asset form. To use the Services, including your
                Wallet, you will need to provide your email address, and access
                a verification link or pin code sent to you.
              </Text>
              <Text className="decimal-list">
                2.11. Registration is required to access the Services. Upon
                registration, every user will be allocated a Wallet, which
                serves as a foundational component of the Services. It is your
                responsibility to protect your account information, ensure its
                accuracy, and keep it up-to-date. Ambr is not liable for any
                inaccuracy, loss or damage arising from unauthorised access and
                use of your account.
              </Text>
              <Text className="decimal-list">
                2.12. Ambr does not store any user account Wallet&apos;s private
                key in its database and will never request your private key from
                you. We employ Hardware Security Modules (HSM) and proprietary
                technology, to encrypt your private key and ensure its security
                and confidentiality.
              </Text>
              <Text className="decimal-list">
                2.13. Content you share with others through the Services is
                securely and immutably recorded as a unique, encrypted
                fingerprint on a distributed public ledger, maintained by a
                network of computers, collectively known as a blockchain. This
                record, referred to as the Content&apos;s Certificate, is
                tokenised, directly linked to and transferred into the
                possession of your Wallet, to ensure its origin, authenticity,
                and integrity.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={[6, 8]}>
                {"3. Content Ownership, Indemnity, Liability, and Licensing"}
              </Text>
              <Text className="decimal-list">
                3.1. Ambr does not claim any ownership of the Content you
                create, use, store, or share through the Services, and you are
                solely responsible for it. You are also responsible for sharing
                it with the correct recipients. Any liability for damages
                relating to the Content lies with the individual that creates,
                uses, stores, transfers, and/or shares it within the Services.
                You acknowledge that download and/or access links can be
                forwarded and that recipients having access to such links, can
                access the Content it is connected with.
              </Text>
              <Text className="decimal-list">
                3.2. Ambr is not liable for any damages or personal injury
                resulting from the Content created, used, stored, transferred,
                or shared by you within the Services, including copyright
                protected works and/or trademarks, and the temporary
                unavailability or removal of your Content or account.
              </Text>
              <Text className="decimal-list">
                3.3. Ambr does not assume responsibility for third-party content
                published within the services or for any content, products, or
                services offered on external websites linked within the
                services. Your use of external websites or content outside of
                Ambr is done at your own risk.
              </Text>
              <Text className="decimal-list">
                3.4. The Services allow you to protect Content or transfers with
                a secret link and/or a password. You are solely responsible for
                the confidentiality and/or distribution of secret links and/or
                passwords.
              </Text>
              <Text className="decimal-list">
                3.5. If choosing to export the private key to your Wallet, you
                assume full responsibility for safeguarding the security of both
                the private key and your Wallet. Ambr has no access to your raw
                private key information and cannot unilaterally initiate
                transfers or access your Wallet. We are not your brokers,
                intermediaries, agents, advisors, or custodians, and we do not
                have a fiduciary relationship or obligation to you regarding any
                other decisions or activities that you effect when using your
                Wallet or our Services. We are not responsible for any
                activities that you engage in when using your Wallet, and you
                should understand the risks associated. You are solely
                responsible for any and all Transfer Initiations that are
                initiated through your Wallet and we make no, and hereby
                disclaim all, representations, warranties, claims and assurances
                as to any Transfer Initiations.
              </Text>
              <Text className="decimal-list">
                3.6. By using the Services you warrant that you have, for any
                Content you create, use, store or share using the Services, all
                required permissions (including from copyright and other
                intellectual property rights owners) to distribute, sublicense,
                transfer, store and/or make the Content online available as part
                of the Services.
              </Text>

              <Text className="decimal-list">
                3.7. You will defend, indemnify, and hold harmless Ambr from any
                claims, liabilities, damages, losses, and expenses arising from
                your access to or use of the Services or your breach of these
                Terms, including any claims related to Content created, used,
                stored, or shared using the Services.
              </Text>
              <Text className="decimal-list">
                3.8. Ambr requires a license from you with regards to the
                Content FOR THE SOLE PURPOSE OF OPERATING, ENABLING, AND
                IMPROVING THE SERVICES. Solely for this explicit purpose and
                until you delete the Content from the Services, you agree and
                acknowledge that by using the Services, you grant us an
                unlimited, worldwide, royalty-free license to (i) use, host,
                store, scan, search, sort, index, create previews and (ii)
                reproduce, communicate, publish, publicly display, distribute
                and edit (including but not limited to scaling, cropping,
                adapting and translating) the Content. THE LICENSE PART UNDER
                (ii) DOES NOT APPLY TO AMBR FILE SHARING as set out in clause 2
                of these Terms. For the avoidance of doubt, Ambr will not sell
                or advertise the Content: Ambr only requires the license FOR THE
                SOLE PURPOSE OF OPERATING, ENABLING, AND IMPROVING THE SERVICES.
              </Text>
              <Text className="decimal-list">
                3.9. Ambr values your rights and expects you to respect the
                rights of others, including Ambr, its contributors, and third
                parties. This includes respecting the right to privacy, business
                intelligence, trade secrets, and intellectual property rights,
                such as trademarks, copyrights, trade names, and logos. By using
                Ambr, you agree not to engage in or facilitate any unlawful or
                criminal activities or violate the terms outlined below.
              </Text>
              <Text className="decimal-list">
                3.10. As a condition of using Ambr, you agree not to create,
                use, store, or share any content that:
              </Text>
              <Text className="decimal-list indented">
                3.10.1. features CSAI (child sexual abuse imagery);
              </Text>
              <Text className="decimal-list indented">
                3.10.2. Is obscene, defamatory, libellous, slanderous, profane,
                indecent, discriminatory, threatening, abusive, harmful, lewd,
                vulgar, or unlawful.
              </Text>
              <Text className="decimal-list indented">
                3.10.3. Promotes racism, violence, or hatred.
              </Text>
              <Text className="decimal-list indented">
                3.10.4. Contains factual inaccuracies, false information,
                misleading content, misrepresentations, or deceptive elements.
              </Text>
              <Text className="decimal-list indented">
                3.10.5. Violates intellectual property rights, privacy rights
                (including data protection rights), or any other rights.
              </Text>
              <Text className="decimal-list indented">
                3.10.6. Infringes upon or violates any applicable law or
                regulation.
              </Text>
              <Text className="decimal-list indented">
                3.10.7. Constitutes &apos;hate speech&apos;, targeting
                individuals or groups based on their race, sex, creed, national
                origin, religious affiliation, sexual orientation, language, or
                any other characteristic.
              </Text>
              <Text className="decimal-list">
                3.11. Additionally, you agree not to:
              </Text>
              <Text className="decimal-list indented">
                3.11.1. Abuse, harass, stalk, intimidate, threaten, commit
                violence, or engage in any unlawful activities, or encourage
                others to do so.
              </Text>
              <Text className="decimal-list indented">
                3.11.2. Impersonate or falsely claim affiliation with any person
                or entity.
              </Text>
              <Text className="decimal-list indented">
                3.11.3. Access any non-public areas of Ambr.
              </Text>
              <Text className="decimal-list indented">
                3.11.4. Interfere with any access or use restrictions.
              </Text>
              <Text className="decimal-list indented">
                3.11.5. Use any data mining, data gathering, or extraction
                methods, or collect information about Ambr users without
                permission.
              </Text>
              <Text className="decimal-list indented">
                3.11.6. Send viruses, worms, malware, ransomware, junk email,
                spam, chain letters, phishing emails, unsolicited messages,
                promotions, or advertisements of any kind and for any purpose.
              </Text>
              <Text className="decimal-list indented">
                3.11.7. Interfere with, damage, or disrupt Ambr or engage in any
                actions that may lead to such interference or damage.
              </Text>
              <Text className="decimal-list indented">
                3.11.8. Attempt to probe, scan, compromise, or test the
                vulnerability of Ambr or any related service, system, or
                network, or breach any security or authentication measures.
              </Text>
              <Text className="decimal-list indented">
                3.11.9. Use automated means to access or use Ambr without our
                permission.
              </Text>
              <Text className="decimal-list indented">
                3.11.10. Reverse engineer or decompile any part of Ambr.
              </Text>
              <Text className="decimal-list indented">
                3.11.11. Resell, sublicense, rent, lease, offer, or
                commercialise Ambr without our permission.
              </Text>
              <Text className="decimal-list indented">
                3.11.12. Allow others to use your Ambr account.
              </Text>
              <Text className="decimal-list">
                3.12. Users are also prohibited from engaging in activities that
                abuse, harass, impersonate, access non-public areas, interfere
                with access or use restrictions, use data mining methods, send
                harmful content, interfere with or damage Ambr&apos;s services,
                reverse engineer any part of Ambr, resell or commercialise Ambr
                without permission, allow others to use their Ambr account, or
                engage in other prohibited actions.
              </Text>
              <Text className="decimal-list">
                3.13. By using the Services, you represent and certify that you
                are not the target of any economic sanctions administered by the
                U.S. Government, the UK Government, the European Union, or other
                governmental authority (“collectively, “Governmental
                Authority”), including designation on a list of prohibited or
                restricted parties maintained by such governmental authorities.
                You are solely responsible for compliance with all applicable
                laws and you will not use the Services for any purposes
                prohibited by U.S., UK, European Union, or other applicable
                laws.
              </Text>
              <Text className="decimal-list">
                3.14. You are required to uphold the good name and reputation of
                Ambr and ensure that your use of the services does not infringe
                upon the rights or harm the reputation of Ambr and its
                licensors.
              </Text>
              <Text className="decimal-list">
                3.15. All intellectual property rights pertaining to the Ambr
                services, including software, graphics, logos, trademarks,
                domain names, copyrights, and patents, are owned by This is
                Bullish Ltd. and/or its licensors. You are strictly prohibited
                from using, modifying, copying, distributing, removing,
                mirroring, decompiling, or reverse engineering any of the
                intellectual property associated with Ambr.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={[6, 8]}>
                {"4. Disclaimer, Termination, and Account Registration"}
              </Text>
              <Text className="decimal-list">
                4.1. Ambr provides the Services “AS-IS“, without any warranty of
                any kind. Ambr makes no warranty that the Services will be
                uninterrupted, secure, or error-free. Your use of the Services
                is at your own risk.
              </Text>
              <Text className="decimal-list">
                4.3. Ambr does not provide legal protection equivalent to that
                offered by a patent office. Users are responsible for seeking
                appropriate legal protection for their intellectual property.
                Ambr encourages users to consult with legal professionals or
                relevant authorities to obtain official patent protection or
                other necessary legal safeguards.
              </Text>
              <Text className="decimal-list">
                4.2. The term “Certificate“ used by Ambr is solely as a
                communicative device within the user interface. It does not
                imply any legal connotations or guarantees beyond its intended
                descriptive purpose as a function of raw data retrieval.
              </Text>
              <Text className="decimal-list">
                4.4. Ambr reserves the right to investigate, block, or
                permanently delete Content and/or account information, without
                prior notice or liability, if you breach these Terms or act in
                violation of any applicable law or regulation.
              </Text>
              <Text className="decimal-list">
                4.5. The Services may provide integration with third-party
                services. You acknowledge that: (i) Ambr is not responsible for
                any acts or omissions of such third-party services; (ii) that
                Ambr is not an agent of such third-party services; and (iii)
                your use of those services is subject to any applicable terms
                and conditions between you and the providers of such services.
              </Text>
              <Text className="decimal-list">
                4.6. Ambr may change, terminate, or expand its Services from
                time to time without prior notice. Certain features or
                functionality of the Services may be limited or eliminated in
                Ambr&apos;s discretion.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={[6, 8]}>
                {"5. Notice and Takedown Policy"}
              </Text>
              <Text className="decimal-list">
                5.1. If you believe Content in Ambr infringes any person&apos;s
                rights, or applicable UK laws every effort has been made to
                ensure that content in does not infringe any person&apos;s
                rights, or applicable UK laws. Should you discover Content that
                you believe to be illegal, or infringes any of your statutory
                rights, you may contact legal@ambr.link stating the following:
              </Text>

              <Text className="decimal-list indented">
                5.1.1. Your contact details.
              </Text>
              <Text className="decimal-list indented">
                5.1.2. The full details of the material.
              </Text>
              <Text className="decimal-list indented">
                5.1.3. The exact and full URL (web address) where you found the
                material.
              </Text>
              <Text className="decimal-list indented">
                5.1.4. If the request relates to copyright, provide proof that
                you are the rights holder and a statement that, under penalty of
                perjury, you are the rights holder or are an authorised
                representative.
              </Text>
              <Text className="decimal-list indented">
                5.1.5. The reason for your request, including but not limited
                to, copyright law, privacy laws, data protection, obscenity,
                defamation etc.
              </Text>
              <Text className="decimal-list">
                5.2. On receipt of your complaint, Ambr staff will:
              </Text>
              <Text className="decimal-list indented">
                5.2.1. Make an initial assessment of its validity
              </Text>
              <Text className="decimal-list indented">
                5.2.2. Acknowledge receipt of the complaint by email
              </Text>
              <Text className="decimal-list indented">
                5.2.3. For all but spurious complaints, cease access to the item
                that is subject to complaint
              </Text>
              <Text className="decimal-list indented">
                5.2.4. Refer the complaint to Ambr&apos;s Legal Advisor for
                comment and advice
              </Text>
              <Text className="decimal-list indented">
                5.2.5. Seek to verify your identity and authority as
                complainant.
              </Text>
              <Text className="decimal-list">
                5.3. If the authenticity of your complaint is verified and has
                been advised that it is ostensibly legitimate, the Content will
                be removed from public access within the ability, leaving behind
                only the encrypted Certificate describing the record.
              </Text>
              <Text className="decimal-list">
                5.4. If the Legal Advisor confirms that it does not breach any
                law then the item will be reinstated.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={[6, 8]}>
                {"6. Payment & Refunds"}
              </Text>
              <Text className="decimal-list">
                6.1. Once a file or Content shared through Ambr has been
                recorded to the blockchain and marked as &apos;Sealed&apos;, the
                corresponding Ambr File Share associated with that file or
                Content will be permanently deducted from your total File
                Shares.
              </Text>
              <Text className="decimal-list">
                6.2. Additional Ambr File Shares can be purchased, and payment
                will be charged to your designated payment method. Payment for
                Ambr File Shares is explicitly a representation of access to
                certain features within the Services and does not imply any
                monetary value inherent to a file&apos;s Certificate.
              </Text>
              <Text className="decimal-list">
                6.3. Once an Ambr File Share has been &apos;Sealed&apos;, no
                refunds or exchanges will be provided for the deducted File
                Share. It is your responsibility to ensure the accuracy and
                appropriateness of your file or Content before initiating the
                &apos;Sealing&apos; process.
              </Text>
              <Text className="decimal-list">
                6.4. Depending on the payment method chosen, the payment
                processor may charge certain fees related to the processing of
                your payment.
              </Text>
              <Text className="decimal-list">
                6.5. If you pay for Services through Stripe, Google Pay, Apple
                Pay, the Apple App Store, or Google Play Store, the terms of the
                third-party payment processor will also apply.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={[6, 8]}>
                {"7. Waiver, Severability, and Assignment"}
              </Text>
              <Text className="decimal-list">
                7.1. Ambr&apos;s failure to enforce a provision does not waive
                its right to do so later.
              </Text>
              <Text className="decimal-list">
                7.2. If any provision of these Terms is found to be illegal,
                unenforceable, or invalid, the rest of the Terms will remain in
                full force and effect to the extent permissible under the
                relevant laws. The invalid part will be deemed deleted and
                substituted by a valid provision that comes closest to the
                economic effect of the invalid part.
              </Text>
              <Text className="decimal-list">
                7.3. You may not assign any of your rights under these Terms.
                Ambr is entitled to assign its rights to its affiliates or
                subsidiaries or to any successor in interest of any business
                associated with the Services without your consent or
                restriction.
              </Text>
            </Box>
            <Box>
              <Text as={"h2"} mb={[6, 8]}>
                {"8. Applicable Law and Jurisdiction"}
              </Text>
              <Text className="decimal-list">
                8.1. These Terms and any non-contractual obligations arising
                from them will be governed by and construed in accordance with
                the laws of the UK, including mandatory consumer protection
                laws. These Terms will not limit any consumer protection rights
                you may have under the mandatory laws of your country of
                residence.
              </Text>
              <Text className="decimal-list">
                8.2. Any disputes arising from these Terms will be exclusively
                submitted to the competent court in the UK, excluding the
                application of UK&apos;s private international law.
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
