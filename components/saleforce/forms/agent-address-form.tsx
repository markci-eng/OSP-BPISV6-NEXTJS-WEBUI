import { InputFloatingLabel } from "st-peter-ui";
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
