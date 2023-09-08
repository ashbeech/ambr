// pages/blog/[article].js
import fs from "fs";
import path from "path";
import grayMatter from "gray-matter";
import { remark } from "remark";
import html from "remark-html"; // Make sure you import 'remark-html' correctly

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

  // Convert the Date object to a string
  const dateAsString = data.date.toISOString(); // or any other suitable format

  // Update the data with the serialized date
  data.date = dateAsString;

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    props: {
      content: contentHtml,
      data,
    },
  };
}
