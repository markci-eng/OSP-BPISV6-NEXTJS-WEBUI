import Card from "@/components/cards/Card";
import InfoItem from "@/components/common/info-item/info-item";
import { Box, Flex, Grid, Separator, Strong } from "@chakra-ui/react";
import { LuMail, LuPhone, LuSmartphone } from "react-icons/lu";
import { Body } from "st-peter-ui";

const ContactRow = ({
  icon,
  values,
}: {
  icon: React.ReactNode;
  values: string[];
}) => (
  <Flex align="center" mt={2} gap={3}>
    <Box color="#747474">{icon}</Box>

    {values.length ? (
      values.map((v, i) => (
        <Body key={i} color="gray.600">
          {v}
        </Body>
      ))
    ) : (
      <Body color="gray.600">—</Body>
    )}
  </Flex>
);

export interface ContactInfoProps {
  contacts: {
    Email: string[];
    MobileNo: string[];
    LandlineNo: string[];
  };
}

export function ContactInfo({ contacts }: ContactInfoProps) {
  return (
    <Card.Root title={"Contact Information"}>
      <Card.MainContent>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
          <InfoItem
            label="Email"
            value={contacts?.Email[0] ?? "—"}
            icon={LuMail}
          />
          <InfoItem
            label="Mobile No"
            value={contacts?.MobileNo[0] ?? "—"}
            icon={LuSmartphone}
          />
          <InfoItem
            label="Landline No"
            value={contacts?.LandlineNo[0] ?? "—"}
            icon={LuPhone}
          />
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
}
