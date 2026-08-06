"use client";

import { SuccessPage } from "osp-ui-kit";
import React from "react";

export default function Page() {
  return (
    <SuccessPage
      title="DRS Successfully Created"
      description=""
      primaryActionLabel="Go back to Home"
      onPrimaryAction={function (): void {
        throw new Error("Function not implemented.");
      }}
      secondaryActionLabel="Track My Request"
      onSecondaryAction={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  );
}
