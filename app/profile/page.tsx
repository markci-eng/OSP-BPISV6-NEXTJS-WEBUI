"use client";
import { UserProfile } from "@splpi/new-sales-page-component";

export default function Page() {
  return (
    <UserProfile
      profile={{
        accountNo: "SPLP123456789",
        firstName: "YHUAN SHIN",
        middleName: "FRANZA",
        lastName: "TEJIMA",
        email: "yhuanshin@example.com",
        phone: "123-456-7890",
        address: "123 Main St, City, State 12345",
      }}
      referral={{
        code: "REF123456",
        link: "https://example.com/referral",
        totalRewards: "$100.00",
        qrImageSrc: undefined,
      }}
      payouts={[
        {
          channel: "Bank Transfer",
          accountNo: "1234567890",
          branch: "Main Branch",
        },
      ]}
      agents={[
        {
          referralCode: "AGENT123",
          agentName: "Agent Name",
          mobile: "123-456-7890",
          email: "",
        },
      ]}
    />
  );
}
