import React from "react";
import { Body } from "st-peter-ui";

interface LabelProps {
  value: string;
}

const Label = ({ value }: LabelProps) => {
  return <Body>{value}</Body>;
};

export default Label;
