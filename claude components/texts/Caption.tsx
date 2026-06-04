import { Text, type TextProps } from "@chakra-ui/react";

const Caption = ({ children, ...rest }: TextProps) => (
  <Text fontSize="xs" color="gray.500" lineHeight="1.5" {...rest}>
    {children}
  </Text>
);

export default Caption;
