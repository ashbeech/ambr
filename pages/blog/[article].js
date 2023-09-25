import { useEffect, useState, useContext } from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";
import grayMatter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { Fade, Box, Center } from "@chakra-ui/react";
import BlogPost from "../../components/BlogPost";
import { getUser } from "../../lib/UserManager";
import LogoLoader from "../../components/icons/LogoLoader";
import { MagicContext } from "../../components/MagicContext.js";
import Navigation from "../../components/Navigation.js";
import { origin, siteTitle } from "../../config.js";

export default function BlogArticle({ content, data, link }) {
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

  return (
    <Box w={"100%"}>
      <Head>
        <meta property="og:title" content={siteTitle + " - " + data.title} />
        <meta property="og:description" content={data.intro} />
        <meta property="og:image" content={origin + data.preview} />
        <meta property="og:url" content={link} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={siteTitle} />
        <meta name="twitter:title" content={siteTitle + " - " + data.title} />
        <meta name="twitter:image" content={origin + data.preview} />
        <meta name="twitter:image:alt" content={data.intro} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
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
          <BlogPost content={content} data={data} link={link} />
        </>
      )}
    </Box>
  );
}

export async function getStaticPaths() {
  const postsDirectory = path.join(process.cwd(), "posts");
  const filenames = fs.readdirSync(postsDirectory);

  const paths = filenames.map((filename) => ({
    params: { article: filename.replace(".md", "") },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { article } = params;
  const filePath = path.join(process.cwd(), "posts", `${article}.md`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = grayMatter(fileContent);

  // Ensure that data.date is a valid Date object
  if (data.date && typeof data.date === "string") {
    data.date = new Date(data.date); // Convert the string to a Date object
  }

  // Convert the Date object to a string representation
  data.date = data.date.toISOString();

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    props: {
      content: contentHtml,
      data,
      link: `${origin}/blog/${article}`,
    },
  };
}
