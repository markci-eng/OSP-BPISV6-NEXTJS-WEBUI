// Author By: Jimwell Ocsio

import { Box } from "@chakra-ui/react";
import { TextProps } from "./props/TextProps";

const Caption = ({ children, ...rest }: TextProps) => {
  return (
    <Box
      color="#7B8079"
      {...rest}
      lineHeight="1.40"
      fontSize="12.5px"
      fontWeight="400"
    >
      {children}
    </Box>
  );
};

export default Caption;
