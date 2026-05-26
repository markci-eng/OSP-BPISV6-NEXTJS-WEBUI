import { InputFloatingLabel } from "st-peter-ui";
import { Grid, Box } from "@chakra-ui/react";
import SectionTitle from "@/components/texts/SectionTitle";
import { FORM_LAYOUT } from "@/lib/theme/layout-tokens";

interface AgentAddressFormProps {
  lotNumber?: string;
  street: string;
  barangay: string;
  district?: string;
  city: string;
  province: string;
  zipCode: string;
}

const AgentAddressForm = (props: AgentAddressFormProps) => {
  const {
    lotNumber,
    street,
    barangay,
    district,
    city,
    province,
    zipCode,
  } = props;

  return (
    <Box>
      <SectionTitle>Address</SectionTitle>
      <Grid
        mt={2}
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
        }}
        gap={{ base: FORM_LAYOUT.fieldGap, md: FORM_LAYOUT.fieldGap }}
      >
        <InputFloatingLabel label="Lot/Bldg/Unit No." value={lotNumber} />
        <InputFloatingLabel label="Street" value={street} />
        <InputFloatingLabel label="Barangay" value={barangay} />
        <InputFloatingLabel label="District" value={district} />
        <InputFloatingLabel label="City" value={city} />
        <InputFloatingLabel label="Province" value={province} />
        <InputFloatingLabel label="Zip Code" value={zipCode} />
      </Grid>
    </Box>
  );
};

export default AgentAddressForm;
