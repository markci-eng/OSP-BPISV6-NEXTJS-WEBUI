export interface Address {
  id: string;
  addressType: string;
  addressNo: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: string;
  isMailAddress?: boolean;
}
