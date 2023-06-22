export const truncateString = (str) => {
  if (str.length <= 28) {
    return str;
  }

  const start = str.slice(0, 14);
  const end = str.slice(-14);
  return `${start}...${end}`;
};
