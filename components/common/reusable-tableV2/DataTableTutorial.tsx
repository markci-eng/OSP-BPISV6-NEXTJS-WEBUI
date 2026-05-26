"use client";

import { Box } from "st-peter-ui";
import DataTable from "./DataTable";
import { Plus, Trash2, Ban, ArrowRightLeft } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { BulkAction, multiSelectFilter, RowAction } from "./types";
import React from "react";
import { toast } from "sonner";

{
  /* Tutorial DataTable

    | Introduction |
    This is a tutorial component for the DataTable. It demonstrates how to use the DataTable component with a specific data type (AssignedDocRow) and an empty columns array. You can customize the columns and data as needed for your application.

    1. Import the necessary components and types.
    2. Define the DataTableTutorial component.
    3. Use the DataTable component with the type to be used (eg. AssignedDocRow), passing in an empty columns array and an empty data array for demonstration purposes.
    4. Export the DataTableTutorial component for use in other parts of the application.
    5. Customize the columns and data as needed to fit your specific use case.
    6. The DataTable component will handle the rendering of the table based on the provided columns and data, allowing for features such as filtering, sorting, and pagination as configured in the DataTable component.
    7. This tutorial serves as a starting point for implementing the DataTable in your application, and you can expand upon it by adding more complex columns, data fetching logic, and additional features as needed.
    8. Remember to ensure that the DataTable component is properly configured to handle the features you want to use, such as filtering, sorting, and pagination, by passing the appropriate props to the DataTable component.
    9. This tutorial is meant to be a basic example, and you can further enhance it by adding more complex logic, styling, and functionality as needed for your specific use case.
    10. Always refer to the documentation of the DataTable component for more details on how to use it effectively in your application.
    11. Happy coding!
  
    DataTable Features:
    - Column Grouping: The DataTable component supports grouping columns together for better organization and readability. You can define column groups in the columns array by using the "columns" property to nest columns under a group header.
    - Custom Cell Rendering: The DataTable component allows for custom cell rendering by using the "cell" property in the column definition. This allows you to customize how the data is displayed in each cell, such as adding icons, formatting dates, or displaying badges based on the cell value.
    - Exporting Data: The DataTable component can be configured to allow users to export the data in various formats, such as CSV or Excel. This can be done by implementing a custom export function and passing it to the DataTable component.
    - Server-Side Data Fetching: The DataTable component can be used with server-side data fetching, allowing you to fetch data from an API or database and display it in the table. This can be done by implementing a data fetching function and passing it to the DataTable component, along with handling pagination and filtering on the server side.

    Table of Contents:
    1. Sample Interface and Data for the DataTable Tutorial
    2. DataTableTutorial Component
      2.1 Create a Columns Array for the DataTable
      2.2 Customize the Drawer Content for the DataTable
      2.3 Create the Row Actions for the DataTable
      2.4 Create the Bulk Actions for the DataTable
    3. Render the DataTable Component
    4. Configure the Features of the DataTable

    Additional Information: 
    Some of the features mentioned in the tutorial may require additional setup or configuration in the DataTable component, such as defining filter functions for filtering, or implementing the logic for row actions and bulk actions. 
    Be sure to refer to the DataTable component documentation and the types file for more details on how to implement these features effectively in your application.

    Note: This is purely customizable and has a default design in the DataTable component. You can choose to implement it or not based on your needs.

   */
}

// Section 1 - Sample Interface and Data for the DataTable Tutorial

// Sample Interface and Data for the DataTable Tutorial
// This is a sample interface and data for demonstration purposes. You can replace it with your actual data and interface as needed.
export type Person = {
  id: string;
  name: string;
  age: number;
  email: string;
  status: "Active" | "Inactive";
};

export const data: Person[] = [
  {
    id: "P001",
    name: "John Doe",
    age: 28,
    email: "john.doe@example.com",
    status: "Active",
  },
  {
    id: "P002",
    name: "Jane Smith",
    age: 34,
    email: "jane.smith@example.com",
    status: "Inactive",
  },
  {
    id: "P003",
    name: "Michael Lee",
    age: 22,
    email: "michael.lee@example.com",
    status: "Active",
  },
  {
    id: "P004",
    name: "Sarah Kim",
    age: 30,
    email: "sarah.kim@example.com",
    status: "Active",
  },
  {
    id: "P005",
    name: "David Brown",
    age: 41,
    email: "david.brown@example.com",
    status: "Inactive",
  },
  {
    id: "P006",
    name: "Emily Davis",
    age: 27,
    email: "emily.davis@example.com",
    status: "Active",
  },
  {
    id: "P007",
    name: "Chris Wilson",
    age: 36,
    email: "chris.wilson@example.com",
    status: "Inactive",
  },
  {
    id: "P008",
    name: "Olivia Martinez",
    age: 25,
    email: "olivia.martinez@example.com",
    status: "Active",
  },
  {
    id: "P009",
    name: "Daniel Garcia",
    age: 33,
    email: "daniel.garcia@example.com",
    status: "Active",
  },
  {
    id: "P010",
    name: "Sophia Anderson",
    age: 29,
    email: "sophia.anderson@example.com",
    status: "Inactive",
  },
];

// Section 2 - DataTableTutorial Component

// Section 2.1 - Create a Columns Array for the DataTable
// This is a sample columns array for demonstration purposes. You can customize it based on your actual data and requirements.
// The columns array defines the structure of the table, including the header and how to access the data for each column.

const columns: ColumnDef<Person>[] = [
  {
    // The accessorKey is used to specify which property of the data object should be displayed in this column. The header is the text that will be displayed in the table header for this column. The meta property can be used to provide additional information about the column, such as responsive priority and whether it should always be visible.
    accessorKey: "id",

    // The header is the text that will be displayed in the table header for this column. In this case, it will display "ID" as the header for the column that shows the id of each person.
    header: "ID",

    // The meta property can be used to provide additional information about the column.
    // In this case, we are setting a responsive priority of 1, which means this column will be given the highest priority when determining which columns to show on smaller screens.
    // We are also setting alwaysVisible to true, which means this column will always be visible regardless of the screen size.
    // The filterVariant is set to "multiSelect", which means that when filtering this column, it will allow for multiple selections in the filter dropdown.
    meta: {
      responsivePriority: 1,
      alwaysVisible: true,
      filterVariant: "multiSelect",
    },

    // The enableColumnFilter property is set to true, which means that this column will have a filter input in the table header that allows users to filter the data based on the values in this column.
    enableColumnFilter: true,

    // The filterFn property is set to multiSelectFilter, which means that when filtering this column, it will use the multiSelectFilter function to determine how to filter the data based on the selected values in the filter dropdown.
    filterFn: multiSelectFilter,

    // The cell property is a function that defines how to render the cell for this column. In this case, we are using the getValue function to get the value of the id for each row and rendering it in a Box component with bold font weight.
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return <Box fontWeight="bold">{value}</Box>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    meta: { responsivePriority: 2, alwaysVisible: true },
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "age",
    header: "Age",
    meta: { responsivePriority: 3, alwaysVisible: false },
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { responsivePriority: 4, alwaysVisible: false },
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { responsivePriority: 5, alwaysVisible: true },
    enableColumnFilter: true,
    filterFn: multiSelectFilter,
  },
];

// Section 2.2 - Customize the Drawer Content for the DataTable
// This is a sample implementation of the drawer content for the DataTable. You can customize it based on your actual data and requirements.
// The drawer content is displayed when a row in the table is clicked, and it can show more detailed information about the selected row.

function renderDrawerContent(row: Person) {
  return (
    <Box p={4}>
      <Box fontSize="lg" fontWeight="bold" mb={2}>
        {row.name} ({row.id})
      </Box>
      <Box mb={1}>
        <strong>Age:</strong> {row.age}
      </Box>
      <Box mb={1}>
        <strong>Email:</strong> {row.email}
      </Box>
      <Box mb={1}>
        <strong>Status:</strong> {row.status}
      </Box>
    </Box>
  );
}

const DataTableTutorial = () => {
  // Section 2.3 - Create the Row Actions for the DataTable
  // This is a sample implementation of row actions for the DataTable. You can customize it based on your actual data and requirements.
  // Row actions are actions that can be performed on each row of the table, such as editing or deleting a row. They are typically displayed in a dropdown menu when clicking on a row or an action button in the row.
  const rowActions = React.useMemo<RowAction<Person>[]>(
    () => [
      {
        id: "view",
        label: "View Details",
        onClick: (row) => {
          alert(`View Details action clicked for ${row.name}`);
        },
      },
      {
        id: "edit",
        label: "Edit",
        onClick: (row) => {
          alert(`Edit action clicked for ${row.name}`);
        },
        hidden: (row) => row.status === "Inactive", // Example: Hide edit action for inactive rows
      },
      {
        id: "delete",
        label: "Delete",
        variant: "destructive",
        onClick: (row) => {
          alert(`Delete action clicked for ${row.name}`);
        },
        disabled: (row) => row.status === "Active", // Example: Disable delete action for active rows
      },
      {
        id: "custom",
        label: "Custom Action",
        onClick: (row) => {
          alert(`Custom Action clicked for ${row.name}`);
        },
        separator: true, // Example: Add a separator before this action in the dropdown menu
      },
    ],
    [],
  );

  // Section 2.4 - Create the Bulk Actions for the DataTable
  // This is a sample implementation of bulk actions for the DataTable. You can customize it based on your actual data and requirements.
  // Bulk actions are actions that can be performed on multiple selected rows of the table, such as deleting multiple rows at once. They are typically displayed in a dropdown menu when selecting multiple rows in the table.
  const bulkActions = React.useMemo<BulkAction<Person>[]>(
    () => [
      {
        id: "bulk-delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        onClick: (rows) => {
          toast.success(`Deleted ${rows.length} row(s)`);
        },
      },
    ],
    [],
  );

  return (
    // Section 3 - Render the DataTable Component
    // This is where we render the DataTable component, passing in the columns, data, and other props as needed.
    // The DataTable component will handle the rendering of the table based on the provided columns and data, and it will also handle features such as filtering, sorting, pagination, and more based on the configuration of the DataTable component.

    <Box py={{ base: 2, sm: 4 }} color="black">
      <Box maxW="full">
        {/* DataTable Component - Needs a type parameter to identify the data type */}
        <DataTable<Person>
          //
          // The columns prop is where we pass in the columns array that we defined earlier, which specifies the structure of the table and how to access the data for each column.
          columns={columns}
          //
          // The data prop is where we pass in the data for the table.
          data={data}
          //
          // The getRowId prop is an optional prop that specifies how to get the unique identifier for each row in the table. This is important for features like selection and row actions, as it allows the DataTable component to keep track of which rows are selected and which actions are being performed on which rows. In this example, we are using the id property of each person as the unique identifier for the rows in the table.
          getRowId={(row) => row.id}
          //
          // The renderDetail prop is where we pass in the function that defines how to render the drawer content when a row is clicked. In this case, we are passing in the renderDrawerContent function that we defined earlier.
          renderDetail={renderDrawerContent}
          //
          // The rowActions prop is where we pass in the row actions that we defined earlier, which specify the actions that can be performed on each row of the table.
          rowActions={rowActions}
          //
          // The bulkActions prop is where we pass in the bulk actions that we defined earlier, which specify the actions that can be performed on multiple selected rows of the table.
          bulkActions={bulkActions}
          //
          // SECTION 4 - Configure the Features of the DataTable

          // This is the content section where we can set the Title and Description of our DataTable.
          title="DataTable Tutorial"
          description="This is a tutorial for the DataTable component."
          //
          // The size prop is where we can set the size of the table. In this example, we are setting it to "md" for medium size. The DataTable component will adjust the padding and font size of the table based on the size prop. You can choose from "sm", "md", or "lg" for small, medium, or large sizes respectively.
          size="md"
          //
          // The following are optional props that you can pass to the DataTable component to enable or disable specific features of the table. You can customize these based on your needs.
          // The features prop is where we can enable or disable specific features of the DataTable component, such as filtering, sorting, pagination, column toggle, selection, draggable rows, and detail sidebar. In this example, we are enabling all features by passing in the DEFAULT_FEATURES constant that we defined in the types file. You can customize this based on your needs by passing in an object with the specific features you want to enable or disable.
          features={{
            // The search feature allows users to search for specific values in the table. When enabled, it will display a search input above the table that allows users to enter search terms, and the table will filter the data based on the search input.
            search: true,
            //
            // The filtering feature allows users to filter the data in the table based on the values in each column. When enabled, it will display filter inputs in the table header for each column that has filtering enabled.
            filtering: true,
            //
            // The sorting feature allows users to sort the data in the table by clicking on the column headers. When enabled, it will allow users to sort the data in ascending or descending order based on the values in each column.
            sorting: true,
            //
            // The pagination feature allows users to navigate through large datasets by dividing the data into pages. When enabled, it will display pagination controls at the bottom of the table that allow users to navigate between pages of data.
            pagination: true,
            //
            // The columnToggle feature allows users to show or hide specific columns in the table. When enabled, it will display a column toggle button in the table header that allows users to select which columns they want to display or hide.
            columnToggle: true,
            //
            // The selection feature allows users to select one or more rows in the table. When enabled, it will display checkboxes in the table rows that allow users to select individual rows, as well as a checkbox in the table header that allows users to select or deselect all rows at once.
            selection: true,
            //
            // The draggable feature allows users to reorder the rows in the table by dragging and dropping them. When enabled, it will allow users to click and drag a row to a new position in the table, and the order of the rows will be updated accordingly.
            draggable: true,
            //
            // The detailSidebar feature allows users to view more detailed information about a selected row in a sidebar. When enabled, it will display a sidebar on the right side of the table that shows the content defined in the renderDetail function for the selected row.
            detailSidebar: true,
          }}
          //
          // The headerButton prop is where we can pass in a custom button to be displayed in the table header. In this example, we are passing in a button with the label "Test Button" and an icon of Plus from the lucide-react library. When the button is clicked, it will display a success toast message saying "Hello World!" using the sonner library. You can customize this button based on your needs by changing the label, icon, and onClick handler.
          headerButton={{
            label: "Test Button",
            icon: Plus,
            onClick: () => {
              toast.success(`Hello World!`);
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default DataTableTutorial;
