import { RowItem } from "@/components/info-card/row-item";
import { Grid } from "@chakra-ui/react";
import { InfoCardAccordion } from "osp-ui-kit";
import { LuPhone } from "react-icons/lu";

export interface ContactInfoProps {
  contacts: {
    Email: string[];
    MobileNo: string[];
    LandlineNo: string[];
  };
}

export function ContactInfo({
  contacts,
  isOpen,
  onToggle,
}: ContactInfoProps & { isOpen?: boolean; onToggle?: () => void }) {
  return (
    <InfoCardAccordion
      icon={<LuPhone />}
      title={"Contact Information"}
      subtitle="Contact Information"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <Grid templateColumns="1fr" gap={2}>
        <RowItem label="Email" value={contacts?.Email[0] ?? "—"} />
        <RowItem label="Mobile No" value={contacts?.MobileNo[0] ?? "—"} />
        <RowItem label="Landline No" value={contacts?.LandlineNo[0] ?? "—"} />
      </Grid>
    </InfoCardAccordion>
  );
}
