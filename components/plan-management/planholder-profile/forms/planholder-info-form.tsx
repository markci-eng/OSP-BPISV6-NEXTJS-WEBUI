"use client";
import React from "react";
import { Flex } from "@chakra-ui/react";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { PersonalInfoSection } from "@/components/forms/PersonalInfoSection";
import { AddressListSection } from "@/components/forms/AddressListSection";
import { ContactListSection } from "@/components/forms/ContactListSection";
import { FormFooterActions } from "@/components/forms/FormFooterActions";

interface PlanholderEditFormProps {
  selectedAgent?: SalesAgent;
  onCancel?: () => void;
  onSubmitted?: () => void;
  successLink?: string;
  hideActions?: boolean;
}

const PlanholderEditForm: React.FC<PlanholderEditFormProps> = ({
  selectedAgent,
  onCancel,
  onSubmitted,
  successLink,
  hideActions,
}) => {
  return (
    <Flex flexDir="column" gap={4}>
      <PersonalInfoSection selectedPerson={selectedAgent} entityLabel="planholder" />
      <AddressListSection selectedPerson={selectedAgent} entityLabel="planholder" />
      <ContactListSection selectedPerson={selectedAgent} entityLabel="planholder" />

      {!hideActions && (
        <FormFooterActions
          entityLabel="planholder"
          onCancel={onCancel}
          onSubmitted={onSubmitted}
          successLink={successLink}
        />
      )}
    </Flex>
  );
};

export default PlanholderEditForm;
