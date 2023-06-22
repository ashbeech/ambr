import { Select } from "@chakra-ui/react";
import { useState } from "react";
//import { useToastError } from '../hooks/useToast.js'

export const AsyncSelect = ({
  children,
  onChange = () => {},
  errorMessage,
  ...rest
}) => {
  //const toastError = useToastError()
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (event) => {
    const { value } = event.target;

    setIsLoading(true);

    try {
      await onChange(value);
    } catch (err) {
      /*       toastError(err, {
        title: errorMessage
      }) */
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select onChange={handleChange} disabled={isLoading} {...rest}>
      {children}
    </Select>
  );
};
