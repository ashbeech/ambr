import fs from "fs";
import path from "path";
import grayMatter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import BlogPost from "../../components/BlogPost";

export default function BlogArticle({ content, data }) {
  return <BlogPost content={content} data={data} />;
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
    },
  };
}
