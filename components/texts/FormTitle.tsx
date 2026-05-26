import { Strong } from "@chakra-ui/react";
import React from "react";
import { H4 } from "st-peter-ui";

interface FormTitleProps {
  label: string;
}

const FormTitle = ({ label }: FormTitleProps) => {
  return <H4>{label}</H4>;
};

export default FormTitle;
