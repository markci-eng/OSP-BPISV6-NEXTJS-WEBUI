"use client";

import {
  Box,
  Collapsible,
  createListCollection,
  Flex,
  Grid,
  GridItem,
  Separator,
  Table,
  TableScrollArea,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import {
  H4,
  SelectFloatingLabel,
  PrimaryMdFlexButton,
} from "st-peter-ui";

import { SearchEmployeeDialog } from "@/components/common/employee-lookup/search-employee-dialog";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import {
  drsItems,
  tableColumns,
  tableItems,
} from "../../payment/data/paymentDetails";
import InfoItem from "@/components/common/info-item/info-item";
import { DepositHdr } from "@/app/payment/data/payment.types";
import { Page } from "@/components/page/page";
import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import LabelText from "@/components/texts/LabelText";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

export default function Disbursement() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedType, setselectedType] = useState("");

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedDRS, setSelectedDRS] = useState<DepositHdr | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("selectedDRS");

    if (data) {
      setSelectedDRS(JSON.parse(data));
      setSelectedId(JSON.parse(data).name);
      console.log(selectedId);
      sessionStorage.removeItem("selectedDRS");
    }
  }, []);

  const sortedDrsItems = useMemo(() => {
    return [...drsItems].sort((a, b) => (b as any).id - (a as any).id);
  }, []);

  const disbursementType = createListCollection({
    items: [
      { label: "COMMISSION", value: "COM" },
      { label: "TRANSPORTATION EXPENSE", value: "TE" },
    ],
  });

  // ✅ Filter Subject for Release per DRS
  const filteredTableItems = useMemo(() => {
    if (!selectedId) return [];
    return tableItems.filter((x: any) => x.drsName === selectedId);
  }, [selectedId]);

  // ✅ Toggle selection
  const toggleSelect = (item: any) => {
    setSelectedRows((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      if (exists) return prev.filter((x) => x.id !== item.id);
      return [...prev, item];
    });
  };

  // ✅ Add to bottom table
  const handleAddToList = () => {
    setSelectedItems((prev) => {
      const newItems = selectedRows
        .filter((row) => !prev.some((x) => x.id === row.id))
        .map((row) => ({
          ...row,
          drsId: selectedId,
          type: selectedType,
        }));

      return [...prev, ...newItems];
    });

    setSelectedRows([]);
  };

  // ✅ Totals computation
  const totals = useMemo(() => {
    const com = selectedItems
      .filter((x) => x.type === "COM")
      .reduce((sum, item) => sum + Number(item.Amount || 0), 0);

    const te = selectedItems
      .filter((x) => x.type === "TE")
      .reduce((sum, item) => sum + Number(item.Amount || 0), 0);

    return { com, te };
  }, [selectedItems]);
  const breadCrumb = [
    {
      label: "Home",
    },
    {
      label: "Disbursement",
    },
    {
      label: "COM/TE",
    },
  ];
  return (
    <Page
      breadcrumbItems={breadCrumb}
      title={"Disbursement"}
      description="Manage commission and transportation expense releases from digital remittance slips."
    >
      <Grid
        gap={{ base: 4, lg: 5 }}
        templateColumns={{
          base: "1fr",
          lg: "380px 1fr",
          xl: "420px 1fr",
        }}
        alignItems="start"
      >
        {/* LEFT PANEL */}
        <GridItem minW={0} overflow="hidden" h={"full"}>
          <Card.Root title={"Digital Remittance Slip"}>
            <Card.MainContent>
              <Box mt={3}>
                <SearchEmployeeDialog />
              </Box>

              <Separator my={3} />

              {/* LEFT TABLE */}
              <TableScrollArea maxH="500px">
                <Table.Root
                  size="sm"
                  variant="outline"
                  interactive
                  stickyHeader
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Reference Number</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">
                        Amount
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {sortedDrsItems.map((item) => {
                      const isSelected = selectedId === item.name;

                      return (
                        <Table.Row
                          key={item.id}
                          cursor="pointer"
                          bg={isSelected ? BRAND_COLORS.successBg : undefined}
                          borderLeft={
                            isSelected
                              ? `4px solid ${BRAND_COLORS.primaryGreen}`
                              : undefined
                          }
                          onClick={() => {
                            setSelectedId(item.name);
                            setSelectedRows([]);
                            setSelectedItems([]);
                          }}
                          _hover={{ bg: BRAND_COLORS.subtleBg }}
                        >
                          <Table.Cell>{item.name}</Table.Cell>
                          <Table.Cell textAlign="end">{item.Amount}</Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </TableScrollArea>
            </Card.MainContent>
          </Card.Root>
        </GridItem>

        {/* RIGHT PANEL */}
        <GridItem h="full" overflow="hidden">
          <Card.Root>
            <Card.MainContent>
              {!selectedId && (
                <EmptyStateCard
                  title={"No DRS Selected"}
                  description="  Select a DRS from the left to view details"
                />
              )}

              {/* ✅ KEEP ANIMATION */}
              <Collapsible.Root open={selectedId !== ""}>
                <Collapsible.Content>
                  <Box>
                    <Box
                      bg={BRAND_COLORS.subtleBg}
                      px={{ base: 3, md: 4 }}
                      py={3}
                      borderRadius={STANDARD_RADIUS.md}
                      border="1px solid"
                      borderColor={BRAND_COLORS.neutralBorder}
                      boxShadow={STANDARD_SHADOWS.level1}
                    >
                      <H4>DRS: {selectedId}</H4>
                    </Box>

                    <Separator />

                    <Box py={{ base: 3, md: 4 }}>
                      <SelectFloatingLabel
                        label="Disbursement Type"
                        collection={disbursementType}
                        onValueChanged={(e) => setselectedType(e[0])}
                      />

                      <Box mt={4}>
                        <DataTable
                          data={filteredTableItems}
                          columns={tableColumns}
                          title="Subject For Release"
                          features={{
                            search: false,
                            sorting: false,
                            columnToggle: false,
                            draggable: false,
                            filtering: false,
                          }}
                          size="sm"
                        />
                      </Box>
                      <Flex
                        direction={{ base: "column", md: "row" }}
                        justify={{ base: "flex-end" }}
                        my={4}
                        gap={{ base: 2, xl: 4 }}
                        width="full"
                      >
                        <Box width={{ base: "full", md: "auto" }}>
                          <PrimaryMdFlexButton
                            onClick={handleAddToList}
                            disabled={selectedRows.length === 0}
                          >
                            Add to List
                          </PrimaryMdFlexButton>
                        </Box>
                      </Flex>

                      <DataTable
                        data={selectedItems}
                        columns={tableColumns}
                        title={`${selectedType || "Selected"} Details`}
                      />

                      <Separator my={4} />

                      <Flex
                        gap={{ base: 2, xl: 4 }}
                        // align="center"
                        direction={{ base: "column", md: "row" }}
                      >
                        <LabelText
                          label="Total Com"
                          value={totals.com.toFixed(2)}
                        />
                        <LabelText
                          label="Total TE"
                          value={totals.te.toFixed(2)}
                        />

                        <Box
                          ml="auto"
                          width={{ base: "full", md: "auto" }}
                          minW={"32"}
                        >
                          <PrimaryMdFlexButton>SAVE</PrimaryMdFlexButton>
                        </Box>
                      </Flex>
                    </Box>
                  </Box>
                </Collapsible.Content>
              </Collapsible.Root>
            </Card.MainContent>
          </Card.Root>
        </GridItem>
      </Grid>
    </Page>
  );
}
