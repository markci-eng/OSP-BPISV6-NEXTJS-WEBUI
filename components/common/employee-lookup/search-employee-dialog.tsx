import {
  ButtonGroup,
  CloseButton,
  Dialog,
  Flex,
  IconButton,
  Input,
  InputGroup,
  Kbd,
  Pagination,
  Portal,
  Separator,
  Table,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight, LuSearch } from "react-icons/lu";
import { Small } from "st-peter-ui";
import { employeeLookup } from "./data/employee-lookup";
import { useEffect, useState } from "react";

export function SearchEmployeeDialog({
  selectedEmployee = null,
  onSelectChange,
}: {
  selectedEmployee?: string | null;
  onSelectChange?: (salesForceID: string | null) => void;
}) {
  const [selectedSalesForceID, setSelectedSalesForceID] = useState<
    string | null
  >(selectedEmployee);
  const [page, setPage] = useState(1);
  const [filteredEmployees, setFilteredEmployees] = useState(employeeLookup);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (filteredEmployees.length === 0) return;

    if (selectedSalesForceID === null) {
      setSelectedSalesForceID(filteredEmployees[0].salesForceID);
    } else if (
      filteredEmployees.filter(
        (item) => item.salesForceID === selectedSalesForceID,
      ).length === 0
    ) {
      setSelectedSalesForceID(filteredEmployees[0].salesForceID);
    }
  }, [filteredEmployees]);

  useEffect(() => {
    if (!open) {
      onSelectChange?.(selectedSalesForceID);
    }
  }, [open]);

  return (
    <Dialog.Root
      size={"cover"}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Dialog.Trigger asChild>
        <Flex
          align={"start"}
          justify={"space-between"}
          p={"10px"}
          border={"1px solid #bbbbbbff"}
          borderRadius={"md"}
          bg={"gray.50"}
          cursor={"pointer"}
          maxW={"100%"}
        >
          <Small
            color="gray.500"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            Search Sales Force ID or Employee Name . . .
          </Small>
          <LuSearch color="#747474" />
        </Flex>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title fontSize={"md"}>Search Employee</Dialog.Title>
            </Dialog.Header>
            <Separator />
            <Dialog.Body display="flex" flexDirection="column" minH={0}>
              <InputGroup
                startElement={<LuSearch />}
                endElement={<Kbd>↩ Enter</Kbd>}
              >
                <Input
                  size="sm"
                  placeholder="Search Sales Force ID or Employee Name . . ."
                  onKeyDown={(e) => {
                    const query = e.currentTarget.value.toUpperCase();
                    console.log("Search query:", query);

                    if (query.length === 1) {
                      setFilteredEmployees(employeeLookup);
                    }

                    if (e.key === "Enter") {
                      setFilteredEmployees(
                        employeeLookup.filter(
                          (item) =>
                            item.salesForceID.includes(query) ||
                            item.firstName.includes(query) ||
                            item.lastName.includes(query) ||
                            item.middleName.includes(query),
                        ),
                      );
                    }
                  }}
                />
              </InputGroup>

              <Table.ScrollArea
                mt={3}
                borderWidth="1px"
                borderRadius="md"
                flex="1"
                minH={0}
                overflow="auto"
              >
                <Table.Root size="sm" stickyHeader interactive>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader minW={"70px"}>
                        Sales Force ID
                      </Table.ColumnHeader>
                      <Table.ColumnHeader>Last Name</Table.ColumnHeader>
                      <Table.ColumnHeader>First Name</Table.ColumnHeader>
                      <Table.ColumnHeader>Middle Name</Table.ColumnHeader>
                      <Table.ColumnHeader>Position Code</Table.ColumnHeader>
                      <Table.ColumnHeader>Branch</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredEmployees
                      .slice((page - 1) * 100, page * 100)
                      .map((item, idx) => (
                        <Table.Row
                          key={item.salesForceID}
                          cursor={"pointer"}
                          onClick={() =>
                            setSelectedSalesForceID(item.salesForceID)
                          }
                          onDoubleClick={() => setOpen(false)}
                          bg={
                            selectedSalesForceID === item.salesForceID
                              ? "var(--chakra-colors-primary-disabled)"
                              : idx % 2 === 0
                                ? "var(--chakra-colors-gray-100)"
                                : "white"
                          }
                          color={
                            selectedSalesForceID === item.salesForceID
                              ? "var(--chakra-colors-primary-hover)"
                              : "gray.800"
                          }
                          _hover={{
                            bg:
                              selectedSalesForceID === item.salesForceID
                                ? "var(--chakra-colors-primary-disabled)"
                                : "var(--chakra-colors-gray-200)",
                          }}
                        >
                          <Table.Cell>{item.salesForceID}</Table.Cell>
                          <Table.Cell>{item.lastName}</Table.Cell>
                          <Table.Cell>{item.firstName}</Table.Cell>
                          <Table.Cell>{item.middleName}</Table.Cell>
                          <Table.Cell>{item.positionCode}</Table.Cell>
                          <Table.Cell>{item.branch}</Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Dialog.Body>
            <Dialog.Footer>
              <Pagination.Root
                count={filteredEmployees.length}
                page={page}
                pageSize={100}
                onPageChange={(e) => setPage(e.page)}
              >
                <ButtonGroup variant="ghost" size="sm">
                  <Pagination.PrevTrigger asChild>
                    <IconButton>
                      <LuChevronLeft />
                    </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                    render={(page) => (
                      <IconButton
                        variant={{ base: "ghost", _selected: "outline" }}
                      >
                        {page.value}
                      </IconButton>
                    )}
                  />

                  <Pagination.NextTrigger asChild>
                    <IconButton>
                      <LuChevronRight />
                    </IconButton>
                  </Pagination.NextTrigger>
                </ButtonGroup>
              </Pagination.Root>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
