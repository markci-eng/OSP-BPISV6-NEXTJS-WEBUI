import React from "react";
import { Box, Flex, Grid, Strong, Text } from "@chakra-ui/react";
import FormTitle from "../texts/FormTitle";
import Caption from "../texts/Caption";
import SectionTitle from "../texts/SectionTitle";
import Card from "../cards/Card";
import LabelText from "../texts/LabelText";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SummaryTitleProps {
  title: string;
  subtitle?: string | null;
  bg?: string | null;
  color?: string | null;
}

interface SummaryHeaderProps {
  children: string;
  color?: string | null;
}

interface DataObject {
  label: string;
  value: any;
}

interface SummaryBoxProps {
  title: string;
  data: DataObject[];
  color?: string | null;
}

interface SummarySection {
  title: string;
  data: DataObject[];
  color?: string | null;
}

interface SummaryRootProps {
  title: string;
  subtitle?: string | null;
  titleColor?: string | null;
  bgColor?: string | null;
  data: SummarySection[];
  children?: React.ReactNode; // ← added
}

interface SummaryExtraProps {
  children: React.ReactNode;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Title = ({ title, subtitle, bg, color }: SummaryTitleProps) => (
  <Box
    borderTopRightRadius="xl"
    borderTopLeftRadius="xl"
    borderBottomWidth={1}
    borderColor="border"
    p={{ base: 3, md: 5 }}
  >
    <Flex>
      <Flex flexDir="column" gap={1} width="full">
        <FormTitle label={title} />
        <Caption>{subtitle ?? ""}</Caption>
      </Flex>
    </Flex>
  </Box>
);

const Header = ({ children, color }: SummaryHeaderProps) => (
  <Box w="full">
    <SectionTitle>{children}</SectionTitle>
  </Box>
);

const SectionBox = ({ title, data, color }: SummaryBoxProps) => (
  <Box>
    <Header color={color}>{title}</Header>
    <Grid
      templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
      gap={{ base: 1 }}
      p={{ base: 1 }}
    >
      {data.map((item, idx) => (
        <Box key={idx}>
          <LabelText label={item.label} value={item.value} />
        </Box>
      ))}
    </Grid>
  </Box>
);

const TopBox = ({ children }: SummaryExtraProps) => <Box>{children}</Box>;

const BottomBox = ({ children }: SummaryExtraProps) => <Box>{children}</Box>;

// ─── Root Component ───────────────────────────────────────────────────────────

const Summary = ({
  title,
  subtitle,
  titleColor,
  bgColor,
  data,
  children, // ← destructured
}: SummaryRootProps) => {
  // Separate TopBox and BottomBox from the rest of children
  const childArray = React.Children.toArray(children);

  const topBox = childArray.find(
    (child) => React.isValidElement(child) && child.type === TopBox,
  );
  const bottomBox = childArray.find(
    (child) => React.isValidElement(child) && child.type === BottomBox,
  );

  return (
    <Card.Root>
      <Card.MainContent>
        <Title
          title={title}
          subtitle={subtitle}
          color={titleColor}
          bg={bgColor}
        />
        {topBox} {/* ← rendered right after the title */}
        <Flex
          p={{ base: 4, md: 6 }}
          gap={{ base: 5, md: 6 }}
          w="full"
          flexDir="column"
        >
          {data.map((section) => (
            <SectionBox
              key={section.title}
              title={section.title}
              data={section.data}
              color={section.color}
            />
          ))}
        </Flex>
        {bottomBox} {/* ← rendered after all data sections */}
      </Card.MainContent>
    </Card.Root>
  );
};

// ─── Compound Attachment ──────────────────────────────────────────────────────

Summary.Title = Title;
Summary.Header = Header;
Summary.Box = SectionBox;
Summary.TopBox = TopBox;
Summary.BottomBox = BottomBox;

export default Summary;
