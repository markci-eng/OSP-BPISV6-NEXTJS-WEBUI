export interface AddressEntry {
  id: string;
  unit: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: string;
}

export type ContactType = "Email" | "Mobile Number" | "Landline Number";

export interface ContactEntry {
  id: string;
  type: ContactType | "";
  value: string;
}

export const CONTACT_TYPE_INPUT_PROPS: Record<
  ContactType,
  { type: string; inputMode?: "email" | "tel" | "numeric" }
> = {
  Email: { type: "email", inputMode: "email" },
  "Mobile Number": { type: "mobile", inputMode: "numeric" },
  "Landline Number": { type: "tel", inputMode: "tel" },
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyAddress = (): AddressEntry => ({
  id: uid(),
  unit: "",
  street: "",
  barangay: "",
  district: "",
  city: "",
  province: "",
  zipCode: "",
});

export const emptyContact = (): ContactEntry => ({
  id: uid(),
  type: "",
  value: "",
});

export const FEET_OPTIONS = Array.from({ length: 6 }, (_, i) => String(i + 3)); // 3-8 ft
export const INCH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i)); // 0-11 in

export const parseHeight = (height?: string) => {
  const match = height?.match(/(\d+)'\s*(\d+)/);
  return { feet: match?.[1] ?? "", inches: match?.[2] ?? "" };
};

export const formatHeight = (feet: string, inches: string) =>
  feet && inches ? `${feet}'${inches}"` : "";
