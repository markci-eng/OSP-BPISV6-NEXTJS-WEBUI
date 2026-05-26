import { ButtonGroup, CloseButton, Dialog, Flex, IconButton, Input, InputGroup, Kbd, Pagination, Portal, Separator, Table } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight, LuSearch, LuX } from "react-icons/lu";
import { Small } from "st-peter-ui";
import { planholderLookup } from "../../../app/plan-management/data/planholder-lookup";
import { useEffect, useState } from "react";
import { PlanholderLookup } from "./planholder-lookup.type";

export function SearchPlanholderDialog({selectedLpa = null, onSelectChange} : {selectedLpa?: string | null, onSelectChange?: (lpaNo: string | null) => void}) {
  const [selectedLPANumber, setSelectedLPANumber] = useState<string | null>(selectedLpa);
  const [selectedPlanholder, setSelectedPlanholder] = useState<PlanholderLookup | null>(null);
  const [filteredPlanholders, setFilteredPlanholders] = useState(planholderLookup);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if(!open) {
      onSelectChange?.(selectedLPANumber);
    }
  }, [open]);

  useEffect(() => {
    setSelectedPlanholder(filteredPlanholders.find(item => item.lpaNumber === selectedLPANumber) ?? null);
  }, [selectedLPANumber]);

  return (
    <Dialog.Root
      size={"cover"}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      {selectedLPANumber ? (
        <Flex
          align={"start"}
          justify={"space-between"}
          p={"10px"}
          border={"1px solid #bbbbbbff"}
          borderRadius={"md"}
          bg={"gray.50"}
          cursor={"pointer"}
          width={"460px"}
        >
          <Small color={"var(--chakra-colors-primary-hover)"}>
            {`[${selectedLPANumber}] ${selectedPlanholder?.lastName}, ${selectedPlanholder?.firstName} ${selectedPlanholder?.middleName}`}
          </Small>
          {<LuX color="#747474" onClick={() => setSelectedLPANumber(null)} />}
        </Flex>
      ) : (
        <Dialog.Trigger asChild>
          <Flex
            align={"start"}
            justify={"space-between"}
            p={"10px"}
            border={"1px solid #bbbbbbff"}
            borderRadius={"md"}
            bg={"gray.50"}
            cursor={"pointer"}
            maxW={"460px"}
          >
            <Small color={"gray.500"} whiteSpace={"nowrap"} overflow={"hidden"} textOverflow={"ellipsis"}>
              {"Search LPA Number or Planholder Name . . ."}
            </Small>
            {<LuSearch color="#747474" />}
          </Flex>
        </Dialog.Trigger>
      )}

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title fontSize={"md"}>Search Planholder</Dialog.Title>
            </Dialog.Header>
            <Separator />
            <Dialog.Body display="flex" flexDirection="column" minH={0}>
              <InputGroup
                startElement={<LuSearch />}
                endElement={<Kbd>↩ Enter</Kbd>}
              >
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  size="sm"
                  placeholder="Search LPA Number or Planholder Name . . ."
                  textTransform="uppercase"
                  onKeyDown={(e) => {
                    const query = e.currentTarget.value.toUpperCase();
                    console.log("Search query:", query);

                    if (query.length === 1) {
                      setFilteredPlanholders(planholderLookup);
                    }

                    if (e.key === "Enter") {
                      setFilteredPlanholders(
                        planholderLookup.filter(
                          (item) =>
                            item.lpaNumber.includes(query) ||
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
                        LPA Number
                      </Table.ColumnHeader>
                      <Table.ColumnHeader>Last Name</Table.ColumnHeader>
                      <Table.ColumnHeader>First Name</Table.ColumnHeader>
                      <Table.ColumnHeader>Middle Name</Table.ColumnHeader>
                      <Table.ColumnHeader>Plan Description</Table.ColumnHeader>
                      <Table.ColumnHeader>Mode</Table.ColumnHeader>
                      <Table.ColumnHeader>Effectivity Date</Table.ColumnHeader>
                      <Table.ColumnHeader>Branch</Table.ColumnHeader>
                      <Table.ColumnHeader>Account Status</Table.ColumnHeader>
                      <Table.ColumnHeader>
                        Termination Status
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredPlanholders
                      .slice((page - 1) * 100, page * 100)
                      .map((item, idx) => (
                        <Table.Row
                          key={item.lpaNumber}
                          cursor={"pointer"}
                          onClick={() => setSelectedLPANumber(item.lpaNumber)}
                          onDoubleClick={() => setOpen(false)}
                          bg={
                            selectedLPANumber === item.lpaNumber
                              ? "var(--chakra-colors-primary-disabled)"
                              : idx % 2 === 0
                                ? "var(--chakra-colors-gray-100)"
                                : "white"
                          }
                          color={
                            selectedLPANumber === item.lpaNumber
                              ? "var(--chakra-colors-primary-hover)"
                              : "gray.800"
                          }
                          _hover={{
                            bg:
                              selectedLPANumber === item.lpaNumber
                                ? "var(--chakra-colors-primary-disabled)"
                                : "var(--chakra-colors-gray-200)",
                          }}
                        >
                          <Table.Cell>{item.lpaNumber}</Table.Cell>
                          <Table.Cell>{item.lastName}</Table.Cell>
                          <Table.Cell>{item.firstName}</Table.Cell>
                          <Table.Cell>{item.middleName}</Table.Cell>
                          <Table.Cell>{item.planDescription}</Table.Cell>
                          <Table.Cell>{item.mode}</Table.Cell>
                          <Table.Cell>
                            {item.effectivityDate.toLocaleDateString()}
                          </Table.Cell>
                          <Table.Cell>{item.branch}</Table.Cell>
                          <Table.Cell>{item.accountStatus}</Table.Cell>
                          <Table.Cell>{item.terminationStatus}</Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Dialog.Body>
            <Dialog.Footer>
              <Pagination.Root
                count={filteredPlanholders.length}
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
