import { extname } from "path";
import { getType } from "mime";

export const getMediaType = (path) => {
  const mediaType = getType(path);

  if (mediaType != null) {
    return mediaType;
  }

  // Add additional media types to recognize
  const ext = extname(path).toLowerCase();

  switch (ext) {
    case ".jxl":
      return "image/jxl";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".doc":
    case ".docx":
      return "application/msword";
    case ".xls":
    case ".xlsx":
      return "application/vnd.ms-excel";
    case ".ppt":
    case ".pptx":
      return "application/vnd.ms-powerpoint";
    case ".txt":
      return "text/plain";
    case ".mp3":
      return "audio/mp3";
    case ".wav":
      return "audio/wav";
    case ".mp4":
      return "video/mp4";
    case ".mov":
      return "video/quicktime";
    case ".zip":
      return "application/zip";
    default:
      return null;
  }
};
