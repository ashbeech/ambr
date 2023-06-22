import { Tooltip } from "@chakra-ui/react";
import { cloneElement } from "react";

export const TooltipBox = ({ children, ...rest }) => {
  const element = cloneElement(children, {
    cursor: "help",
  });

  return (
    <Tooltip hasArrow size="lg" {...rest}>
      {element}
    </Tooltip>
  );
};
