import { Tabs } from "@chakra-ui/react";
import { IconType } from "react-icons";

export interface TabListProps {
  tabs: {
    icon: IconType;
    label: string;
    value: string;
  }[];
}

export function TabLists({ tabs }: TabListProps) {
  return (
    <Tabs.List>
      {tabs.map((tab, idx) => (
        <Tabs.Trigger
          key={idx}
          value={tab.value}
          _selected={{
            fontWeight: "semibold",
            color: "var(--chakra-colors-primary)",
          }}
        >
          <tab.icon /> {tab.label}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  );
}
