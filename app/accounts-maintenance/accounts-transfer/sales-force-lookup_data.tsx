
import { ColumnDef,StringOrTemplateHeader} from '@tanstack/react-table';
import { Box, HStack, Text } from "@chakra-ui/react";
import React from 'react'

export type SalesForceLookUpData = {
    SalesForceCode: string;
    AgentName: string;
    PosCode: string;
};


export const salesForceLookUp: SalesForceLookUpData[] = [
  { SalesForceCode: "SF001", AgentName: "Juan Dela Cruz", PosCode: "SA2" },
  { SalesForceCode: "SF002", AgentName: "Maria Santos", PosCode: "SA2" },
  { SalesForceCode: "SF003", AgentName: "Pedro Reyes", PosCode: "SA2" },
  { SalesForceCode: "SF004", AgentName: "Ana Lopez", PosCode: "SA2" },
  { SalesForceCode: "SF005", AgentName: "Carlos Garcia", PosCode: "SA2" },
  { SalesForceCode: "SF006", AgentName: "Luisa Mendoza", PosCode: "SA2" },
  { SalesForceCode: "SF007", AgentName: "Jose Bautista", PosCode: "SA2" },
  { SalesForceCode: "SF008", AgentName: "Rosa Navarro", PosCode: "SA2" },
  { SalesForceCode: "SF009", AgentName: "Miguel Torres", PosCode: "SA2" },
  { SalesForceCode: "SF010", AgentName: "Carmen Ramos", PosCode: "SA2" },
  { SalesForceCode: "SF011", AgentName: "Daniel Flores", PosCode: "SA2" },
  { SalesForceCode: "SF012", AgentName: "Patricia Aquino", PosCode: "SA2" },
  { SalesForceCode: "SF013", AgentName: "Victor Castillo", PosCode: "SA2" },
  { SalesForceCode: "SF014", AgentName: "Liza Villanueva", PosCode: "SA2" },
  { SalesForceCode: "SF015", AgentName: "Mark Evangelista", PosCode: "SA2" },
  { SalesForceCode: "SF016", AgentName: "Angela Soriano", PosCode: "SA2" },
  { SalesForceCode: "SF017", AgentName: "Paolo Herrera", PosCode: "SA2" },
  { SalesForceCode: "SF018", AgentName: "Jenny Cruz", PosCode: "SA2" },
  { SalesForceCode: "SF019", AgentName: "Robert Lim", PosCode: "SA2" },
  { SalesForceCode: "SF020", AgentName: "Grace Tan", PosCode: "SA2" },
];

const salesForceColumns: ColumnDef<SalesForceLookUpData>[] = [
  {
    accessorKey: "SalesForceCode",
    header: "Sales Force Code",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "AgentName",
    header: "Agent Name",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  },
  {
    accessorKey: "PosCode",
    header: "Position",
    enableColumnFilter: true,
    cell: (info) => <Text>{info.getValue<string>()}</Text>,
  }
];

export const salesForceHeaders = [
  { label: "Sales Force Code", field: "SalesForceCode" },
  { label: "Agent Name", field: "AgentName" },
  { label: "Position Code", field: "PosCode" },
];




