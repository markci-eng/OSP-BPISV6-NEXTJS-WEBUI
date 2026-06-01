import {
  Grid,
  GridItem,
  Separator,
  Strong,
  Tabs,
  Textarea,
  Text,
  Field,
  HStack,
} from "@chakra-ui/react";
import {
  Box,
  PrimaryMdButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import Page from "@/components/layout/page/Page";
import { TransferType, TrxMonth } from "../data/transaction-month";
import TransferAccountList from "./account-transfer-list";
import {
  salesForceHeaders,
  salesForceLookUp,
  SalesForceLookUpData,
} from "./sales-force-lookup_data";
import { useState } from "react";
import LookUp from "../../../components/common/reusable-lookup/dynamic-lookup";
import { TbTransferIn, TbTransferOut } from "react-icons/tb";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";


export default function AccountsTransferPage() {
  const [selectedAgent, setSelectedAgent] =
    useState<SalesForceLookUpData | null>(null);
  const [remarks, setRemarks] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const { messageBox } = useMessageDialog();

  const confirmTransfer = async () => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to transfer account(s)?",
      confirmText: "Yes",
      cancelText: "No",
      variant: "confirmation",
    });

    if (confirmed) {
      await handleTransfer();
    }
  };

  const handleTransfer = async () => {
    await messageBox({
      title: "SUCCESS",
      message: "Account(s) successfully transfered.",
      confirmText: "Ok",
      variant: "success",
    });
  };

  return (
    <Page.Root title="Transfer of Accounts">
      <Page.MainContent>
        <Page.Row>
        <Tabs.Root defaultValue="withinBranch" variant="enclosed">
          <Tabs.List>
            <Tabs.Trigger value="withinBranch">
              <HStack gap={2}>
                <TbTransferIn size={16} color="var(--chakra-colors-primary)" />
                <Text color="var(--chakra-colors-primary)">
                  Within the Branch
                </Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="otherBranch">
              <HStack gap={2}>
                <TbTransferOut size={16} color="var(--chakra-colors-primary)" />
                <Text color="var(--chakra-colors-primary)">
                  To Other Branch
                </Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          {/*Within the branch*/}
          <Tabs.Content value="withinBranch">
            <Box
              p={3}
              bg="white"
              boxShadow="sm"
              borderRadius="lg"
              borderWidth="0.5px"
            >
              <Strong color="var(--chakra-colors-primary)">
                Sales Agent\Transaction Month
              </Strong>
              <Separator my={2} />

              <Grid
                templateColumns={{
                  base: "1fr",
                  sm: "1fr",
                  md: "1fr 1fr",
                  lg: "max-content auto",
                }}
                gap={4}
                justifyContent="end"
              >
                <GridItem>
                  <SelectFloatingLabel
                    label="Select Transaction Month"
                    collection={TrxMonth}
                    w={{ base: "100%", md: "360px" }}
                  />
                </GridItem>

                <GridItem>
                  <Box mt={2}>
                    <LookUp<SalesForceLookUpData>
                      placeholder="Search Sales Agent 2"
                      modalTitle="Sales Force List"
                      data={salesForceLookUp}
                      headers={salesForceHeaders}
                      onSelect={setSelectedAgent}
                      getInputValue={(item) =>
                        `${item.AgentName} (${item.SalesForceCode})`
                      }
                    />
                  </Box>
                </GridItem>
              </Grid>
            </Box>

            <Box flex="1" overflow="auto">
              <TransferAccountList />
            </Box>

            <Box
              p={3}
              bg="white"
              boxShadow="sm"
              borderRadius="lg"
              borderWidth="0.5px"
            >
              <Strong color="var(--chakra-colors-primary)">Transfer To</Strong>
              <Separator my={2} />

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "1fr",
                  lg: "repeat(3,1fr)",
                }}
                gap={4}
                justifyContent="end"
              >
                <GridItem mt={2}>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter the reason here..."
                    resize="vertical"
                    height="40px"
                  />
                </GridItem>

                <GridItem>
                  <SelectFloatingLabel
                    label="Select Transaction Month"
                    collection={TrxMonth}
                  />
                  {/* <PrimaryMdButton>Transfer Account(s)</PrimaryMdButton> */}
                </GridItem>

                {/* Search Employee */}
                <GridItem mt={2}>
                  <Box>
                    <LookUp<SalesForceLookUpData>
                      placeholder="Search Transfer To"
                      modalTitle="Sales Force List"
                      data={salesForceLookUp}
                      headers={salesForceHeaders}
                      onSelect={setSelectedAgent}
                      getInputValue={(item) =>
                        `${item.AgentName} (${item.SalesForceCode})`
                      }
                    />
                  </Box>
                </GridItem>
              </Grid>
            </Box>

            <Grid
              templateColumns={{
                base: "1fr",
              }}
              gap={4}
            >
              {/* Button */}
              <GridItem justifySelf={{ base: "stretch", lg: "end" }} mt={3}>
                <PrimaryMdButton onClick={confirmTransfer}>
                  Transfer Account(s)
                </PrimaryMdButton>
              </GridItem>
            </Grid>
          </Tabs.Content>

          {/*Other branch*/}
          <Tabs.Content value="otherBranch">
            <Box
              p={3}
              bg="white"
              boxShadow="sm"
              borderRadius="lg"
              borderWidth="0.5px"
            >
              <Strong color="var(--chakra-colors-primary)">
                Transfer Type\Transaction Month\Sales Agent
              </Strong>
              <Separator my={2} />

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "1fr",
                  lg: "repeat(3,1fr)",
                }}
                gap={3}
                justifyContent="end"
              >
                <GridItem>
                  <SelectFloatingLabel
                    label="Select Transfer Type"
                    collection={TransferType}
                  />
                </GridItem>

                <GridItem>
                  <SelectFloatingLabel
                    label="Select Transaction Month"
                    collection={TrxMonth}
                  />
                </GridItem>

                <GridItem>
                  <Box mt={2}>
                    {/* <SearchEmployeeDialog /> */}
                    <LookUp<SalesForceLookUpData>
                      placeholder="Select Sales Force"
                      modalTitle="Sales Force List"
                      data={salesForceLookUp}
                      headers={salesForceHeaders}
                      onSelect={setSelectedAgent}
                      getInputValue={(item) =>
                        `${item.AgentName} (${item.SalesForceCode})`
                      }
                    />
                  </Box>
                </GridItem>
              </Grid>
            </Box>

            <Box flex="1" overflow="auto">
              <TransferAccountList />
            </Box>

            <Box
              p={3}
              bg="white"
              boxShadow="sm"
              borderRadius="lg"
              borderWidth="0.5px"
            >
              <Strong color="var(--chakra-colors-primary)">Transfer To</Strong>
              <Separator my={2} />

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "1fr",
                  lg: "repeat(3,1fr)",
                }}
                gap={4}
                justifyContent="end"
              >
                <GridItem mt={2}>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter the reason here..."
                    resize="vertical"
                    height="40px"
                  />
                </GridItem>

                <GridItem>
                  <SelectFloatingLabel
                    label="Select Transaction Month"
                    collection={TrxMonth}
                  />
                  {/* <PrimaryMdButton>Transfer Account(s)</PrimaryMdButton> */}
                </GridItem>

                {/* Search Employee */}
                <GridItem mt={2}>
                  <Box>
                    <LookUp<SalesForceLookUpData>
                      placeholder="Search Transfer To"
                      modalTitle="Sales Force List"
                      data={salesForceLookUp}
                      headers={salesForceHeaders}
                      onSelect={setSelectedAgent}
                      getInputValue={(item) =>
                        `${item.AgentName} (${item.SalesForceCode})`
                      }
                    />
                  </Box>
                </GridItem>
              </Grid>
            </Box>

            <Grid
              templateColumns={{
                base: "1fr",
              }}
              gap={4}
            >
              {/* Button */}
              <GridItem justifySelf={{ base: "stretch", lg: "end" }} mt={3}>
                <PrimaryMdButton onClick={confirmTransfer}>
                  Transfer Account(s)
                </PrimaryMdButton>
              </GridItem>
            </Grid>
          </Tabs.Content>
        </Tabs.Root>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
