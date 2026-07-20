import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { Grid, Box, Strong } from "@chakra-ui/react";
import SectionTitle from "@/components/texts/SectionTitle";

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
    ...rest
  } = props;

  return (
    <Box>
      <SectionTitle>Address</SectionTitle>
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
        }}
        gap={{
          base: 0,
          md: 2,
        }}
      >
        <FloatingLabelInput label="Lot/Bldg/Unit No." value={lotNumber} />
        <FloatingLabelInput label="Street" value={street} />
        <FloatingLabelInput label="Barangay" value={barangay} />
        <FloatingLabelInput label="District" value={district} />
        <FloatingLabelInput label="City" value={city} />
        <FloatingLabelInput label="Province" value={province} />
        <FloatingLabelInput label="Zip Code" value={zipCode} />
      </Grid>
    </Box>
  );
};

export default AgentAddressForm;
