// components/BlogPost.js
import grayMatter from "gray-matter";
import remark from "remark";
import html from "remark-html";

export default function BlogPost({ content, data }) {
  return (
    <div>
      <h1>{data.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
