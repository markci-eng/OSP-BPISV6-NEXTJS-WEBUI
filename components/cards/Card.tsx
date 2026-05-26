// Created By: JLO
import { Box, Flex, Separator } from "@chakra-ui/react";
import React from "react";
import SectionTitle from "../texts/SectionTitle";

const ButtonSection = ({ children }: { children: React.ReactNode }) => {
  return <Flex gap={1}>{children}</Flex>;
};

const MainContent = ({ children }: { children: React.ReactNode }) => {
  return <Box flex="1">{children}</Box>;
};

const Root = ({
  title,
  children,
}: {
  title?: string | null;
  children: React.ReactNode;
}) => {
  let buttonSection: React.ReactNode = null;
  let mainContent: React.ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === ButtonSection) buttonSection = child;
      if (child.type === MainContent) mainContent = child;
    }
  });

  return (
    <Box
      w="full"
      h="full"
      display="flex"
      flexDirection="column"
      p={{
        base: 3,
        md: 4,
      }}
      borderRadius="md"
      borderWidth={1}
      borderColor="gray.200"
    >
      {title && (
        <>
          <Flex align="center" justify="space-between">
            <SectionTitle>{title}</SectionTitle>
            {buttonSection}
          </Flex>
          <Separator
            my={{
              base: 1,
              md: 2,
            }}
          />
        </>
      )}
      {mainContent}
    </Box>
  );
};

const Card = { Root, ButtonSection, MainContent };

export default Card;
