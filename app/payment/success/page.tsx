"use client";

import { SuccessPage } from "@splpi/operations";
import React from "react";
{
  /* { title, description, transactionId, totalAmount, dateTime, onClickHome, onClickProceed, variant, } */
}
export default function Page() {
  return (
    <SuccessPage
      title="DRS Successfully Created"
      onClickHome={function (): void {
        throw new Error("Function not implemented.");
      }}
      onClickProceed={function (): void {
        throw new Error("Function not implemented.");
      }}
      variant={"application"}
    />
  );
}
