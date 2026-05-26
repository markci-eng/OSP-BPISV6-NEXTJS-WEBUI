import React from "react";
import { Body } from "st-peter-ui";

interface CaptionProps {
  value: string;
}

const Caption = ({ value }: CaptionProps) => {
  return <Body>{value}</Body>;
};

export default Caption;
