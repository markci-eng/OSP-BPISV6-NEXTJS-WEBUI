// components/steps/LifePlanApplicationWrapper.tsx
"use client";

import { Box, Button, Flex } from "@chakra-ui/react";
import LifePlanApplication1 from "./lifeplan-application1";
import LifePlanApplication2 from "./lifeplan-application2";
import LifePlanApplication3 from "./lifeplan-application3";
import { FaRegAddressCard } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";

import { Tabs } from "@chakra-ui/react";

const LifePlanApplicationWrapper = () => {
  return (
    <Tabs.Root defaultValue="step1" variant="line">
      <Tabs.List>
        <Tabs.Trigger value="step1">
          <FaRegUser />
          Personal Info
        </Tabs.Trigger>
        <Tabs.Trigger value="step2">
          <FaRegAddressCard />
          Residential Address
        </Tabs.Trigger>
        <Tabs.Trigger value="step3">
          <IoIosInformationCircleOutline />
          Employment
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="step1">
        <LifePlanApplication1 />
      </Tabs.Content>
      <Tabs.Content value="step2">
        <LifePlanApplication2 />
      </Tabs.Content>
      <Tabs.Content value="step3">
        <LifePlanApplication3 />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default LifePlanApplicationWrapper;
