export const getMediaType = (_signature) => {
  switch (_signature) {
    case "52494646":
      return "image/webp";
    case "3C737667":
      return "image/svg+xml";
    case "776F726C":
    case "39333330":
      return "text/plain";
    case "00020":
      return "video/mp4";
    case "504B34":
    case "504B0304":
      return "application/zip";
    case "25504446":
      return "application/pdf";
    case "89504E47":
      return "image/png";
    case "FFD8FFDB":
    case "FFD8FFE0":
      return "image/jpeg";
    case "D0CF11E0":
      return "application/vnd.ms-powerpoint";
    default:
      return "Unknown filetype";
  }
};
