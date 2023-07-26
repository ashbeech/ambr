import { Text as ChakraText } from "@chakra-ui/react";
import { Children, isValidElement } from "react";

export const CustomText = ({ children, maxCharacters, ...rest }) => {
  const handleTextOverflow = (text, maxCharacters) => {
    if (text.length <= maxCharacters) {
      return text;
    }

    const truncatedText = text.slice(0, maxCharacters - maxCharacters / 2);
    return truncatedText + " ... " + text.slice(-maxCharacters / 2);
  };

  // Convert the children into a string
  const text = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => child.props.children)
    .join("");

  return (
    <ChakraText {...rest}>{handleTextOverflow(text, maxCharacters)}</ChakraText>
  );
};
