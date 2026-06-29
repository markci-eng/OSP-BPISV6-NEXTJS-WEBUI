import { createListCollection } from "@chakra-ui/react";

export const TrxMonth = createListCollection({
  items: [
    { label: "January 2026", value: "JAN26" },
    { label: "February 2026", value: "FEB26" },
    { label: "March 2026", value: "MAR26" },
    { label: "April 2026", value: "APR26" },
    { label: "June 2026", value: "JUN26" },
    { label: "July 2026", value: "JUL26" },
    { label: "August 2026", value: "AUG26" },
    { label: "September 2026", value: "SEP26" },
    { label: "October 2026", value: "OCT26" },
    { label: "November 2026", value: "NOV26" },
    { label: "December 2026", value: "DEC26" },
  ],
});

export const STLList = createListCollection({
  items: [
    { label: "John Michael Dumaua", value: "STL001" },
    { label: "Jonathan Pan", value: "STL002" },
    { label: "Ian Itorma", value: "STL003" },
    { label: "Grae Sensano", value: "STL004" },
    { label: "Jerome Jardio", value: "STL005" },
    { label: "Jimwell Ocsio", value: "STL006" },
    { label: "Mark Ibe", value: "STL007" },
  ],
});

export const TransferType = createListCollection({
  items: [
    { label: "Planholder", value: "Planholder" },
    { label: "Sales Agent 2", value: "Sales Agent 2" },
  ],
});
