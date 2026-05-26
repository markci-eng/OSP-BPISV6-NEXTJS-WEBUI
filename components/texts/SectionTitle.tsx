import React from "react";
import { Body } from "st-peter-ui";

interface SectionTitleProps {
  children?: React.ReactNode;
}

const SectionTitle = ({ children }: SectionTitleProps) => {
  return (
    <Body fontWeight="semibold" color="var(--chakra-colors-primary)">
      {children}
    </Body>
  );
};

export default SectionTitle;
