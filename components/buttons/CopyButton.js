import { Button, Icon, useClipboard } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { CopyIcon } from "../icons/CopyIcon.js";
import { useBreakpointValue } from "../../hooks/useBreakpointValue.js";

export const CopyButton = ({
  buttonProps = () => ({}),
  onClick = () => {},
  size,
  text,
  ...rest
}) => {
  const { hasCopied, onCopy } = useClipboard(text, { format: "text/plain" });
  /* 
  const checkVariants = {
    hide: { pathLength: 0 },
    show: { pathLength: 0.9 },
  }; */

  size = useBreakpointValue(size);

  const iconProps = {
    xs: {
      boxSize: 4,
      tickSize: "0.5em",
    },
    sm: {
      boxSize: 4,
      tickSize: "0.5em",
    },
    md: {
      boxSize: 5,
      tickSize: "0.74em",
    },
    lg: {
      boxSize: 6,
      tickSize: "0.74em",
    },
    xl: {
      boxSize: 7,
      tickSize: "0.85em",
    },
  };

  const { boxSize, tickSize } = iconProps[size];

  const handleClick = () => {
    onCopy();
    onClick();
  };

  return (
    <Button
      className="icon-only"
      type="button"
      m={0}
      p={0}
      variant={"rounded"}
      leftIcon={
        hasCopied ? (
          <Icon w={tickSize} h={tickSize} m={0} as={CheckIcon} />
        ) : (
          <Icon m={0} as={CopyIcon} boxSize={boxSize} />
        )
      }
      onClick={handleClick}
      size={size}
      {...rest}
      {...buttonProps(hasCopied)}
    ></Button>
  );
};
