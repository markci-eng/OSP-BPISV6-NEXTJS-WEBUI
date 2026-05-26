import { Box } from "@chakra-ui/react";
import React from "react";
import { Body } from "st-peter-ui";

interface ProfileHeaderLabelProps {
  isActive: boolean;
  value: string;
}

const ProfileHeaderLabel = ({ isActive, value }: ProfileHeaderLabelProps) => {
  return (
    <>
      <Box
        w="8px"
        h="8px"
        borderRadius="full"
        bg={isActive ? "green.300" : "gray.300"}
      />
      <Body color="gray.500">{value}</Body>
    </>
  );
};

export default ProfileHeaderLabel;
