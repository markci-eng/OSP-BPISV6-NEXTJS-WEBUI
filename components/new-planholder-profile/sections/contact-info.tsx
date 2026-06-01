import Card from "@/components/cards/Card";
import LabelText from "@/components/texts/LabelText";
import { Grid, Separator } from "@chakra-ui/react";

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
        <Grid
          templateColumns="1fr"
          gap={2}
        >
          <LabelText label="Email" value={contacts?.Email[0] ?? "—"} />
          <Separator />
          <LabelText label="Mobile No" value={contacts?.MobileNo[0] ?? "—"} />
          <Separator />
          <LabelText
            label="Landline No"
            value={contacts?.LandlineNo[0] ?? "—"}
          />
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
}
