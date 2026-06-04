import { Box, Link } from "@chakra-ui/react";

function formatPhilippineNumber(contactNo: string): string {
  const digits = contactNo.replace(/[^+\d]/g, "");
  // Normalize to local 10-digit number
  let local = digits;
  if (digits.startsWith("+63")) local = digits.slice(3);
  else if (digits.startsWith("63")) local = digits.slice(2);
  else if (digits.startsWith("0")) local = digits.slice(1);
  // Format: +63 XXX-XXX-XXXX
  if (local.length === 10) {
    return `+63 ${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return contactNo;
}

export function ContactNumber({ contactNo }: { contactNo: string }) {
  const formatted = formatPhilippineNumber(contactNo);
  return (
    <Link href={`tel:${contactNo.replace(/[^+\d]/g, "")}`}>
      <Box
        // as="a"
        px={2}
        py={1}
        fontSize="xs"
        borderRadius="full"
        bg="blue.50"
        color="blue.600"
        display="flex"
        alignItems="center"
        gap={1}
        cursor="pointer"
        _hover={{ bg: "blue.100" }}
      >
        📞 {formatted}
      </Box>
    </Link>
  );
}
