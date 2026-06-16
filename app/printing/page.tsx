"use client";

import React from "react";
import { Flex, Box, Text, Strong, Grid, GridItem } from "@chakra-ui/react";
import { PrimaryMdButton } from "st-peter-ui";
import { LuPrinter } from "react-icons/lu";
import Page from "@/components/layout/page/Page";

const PrintingPage = () => {
  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    <Page.Root
      title="Contract and SFID Printing"
      description="Generate and print official sales agent service contracts and SFID documents."
    >
      <Page.ToolContent>
        <PrimaryMdButton onClick={() => window.print()} className={"print"}>
          <LuPrinter />
          Print
        </PrimaryMdButton>
      </Page.ToolContent>

      <Page.MainContent>
        <Page.Row>
          <Flex
            flex={1}
            align={"center"}
            justify={"center"}
            className="report-page"
          >
            <Flex
              id="print-section"
              className="report-page"
              w="1200px"
              h="100%"
              boxShadow={"md"}
              flexDir="column"
              p={20}
            >
              <Strong
                fontSize="16px"
                color="gray.600"
                letterSpacing={-1}
                alignSelf={"center"}
                className="report-title"
              >
                St. Peter Life Plan, Inc.
              </Strong>
              <Strong
                fontSize="14px"
                color="gray.600"
                letterSpacing={-1}
                alignSelf={"center"}
                className="report-subtitle"
              >
                OFFICIAL SALES AGENT SERVICE CONTRACT
              </Strong>

              <Flex flexDir={"column"} gap={4} mt={4}>
                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  This SALES AGENT SERVICE CONTRACT made and entered into by and
                  between:
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  <strong>ST. PETER LIFE PLAN, INC.,</strong> {"(SPLPI)"} and
                  Juan Luna, Filipino, of legal age, single/married, and a
                  resident of 21 Street Manila, 1900, hereinafter reffered to as
                  the SALES AGENT.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  alignSelf="center"
                  className="report-text"
                >
                  WITHNESSETH: and Agree That
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  1. <strong>CONTRACTUAL PERIOD - </strong> This Contract of
                  Service for all Sales Agents shall be for a period of forever
                  starting on January 01, 2026 and automatically expires on June
                  01, 2026 subject to turn-over and clearance. Branch/Region:
                  Head Office.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  2. <strong>TERMINATION - </strong> This Contract of Services
                  may be terminated or pre-terminated by either or both parties
                  prior to the expiry date subject to proper clearance,
                  remittance of all pending moneys or accountabilities and
                  turn-over. The SALES AGENT understands and agrees that this
                  Contract of Services may be terminated or not renewed for
                  failure to achieve sales and collection targets and other
                  productivity/goal results, and/or for offenses and any
                  violation of the provisions of this Contract.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  3. <strong>SALES COMMISIONS - </strong> In consideration of
                  this Contract of Services, the sales agent shall receive a
                  commission/incentive package and such subsidy or support based
                  on sales/collection productivity and volume and in accordance
                  with the scheme/schedule attached as "Annex A" hereto subject
                  to all applicable taxes as mandated by law and subject to the
                  attainment/achievement of the current sales and collection
                  targets and results. The SALES AGENT understands and agrees
                  that SPLPI may, upon due notice, adjust the rates and schedule
                  of commissions/incentives.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  4. <strong>SALES AND COLLECTION SERVICES - </strong> The SALES
                  AGENT shall sell, solicit, obtain offers to purchase, promote
                  and market SPLPI's Pre-Need products and life plans and shall
                  also collect, receive and remit all plan payments and
                  receivables from all planholders and all such receivables and
                  collectibles pertaining to SPLPI's business.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  5. <strong>NO EMPLOYMENT RELATIONSHIP - </strong> The SALES
                  AGENT hereby understands and agrees that he/she is a SALES
                  AGENT on commissioned basis and that this is an independent
                  Contract of Services and that there is no employer-employee
                  relationship between him/her and SPLPI and that nothing in
                  this contract of services can be interpreted to establish such
                  employment relationship.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  6. <strong>PUBLICATION - </strong> In case of pretermination,
                  termination, separation and/or non-renewal of this Contract of
                  Services, SPLPI reserves the right to publish in a newspaper
                  of general circulation the fact of such separation and the
                  SALES AGENT agrees to and expressly recognizes such right of
                  SPLPI.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  7. <strong>CONFIDENTIALITY - </strong> The SALES AGENT agrees
                  to keep strictly confidential all company information, data,
                  communication (verbal or written), company policies, rules,
                  regulations, systems, operations, marketing strategies and
                  methods, products etc.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  8. <strong>EXCLUSIVITY - </strong> The SALES AGENT agrees that
                  he/she will sell and promote only and exclusively the products
                  of SPLPI and will not apply for and not be employed or
                  associated with nor contracted for a period of three (3) years
                  from date of termination and/or non-renewal hereof, with any
                  other pre-need company, business competitor of SPLPI.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  9. <strong>REPRESENTATION - </strong> The SALES AGENT shall
                  shoulder his/her own selling and transportation expenses. Any
                  unauthorized disbursement or expense which may be incurred by
                  the SALES AGENT shall also be exclusively borne by the SALES
                  AGENT. He/She agrees not to make any representation, much less
                  misrepresentation or over-promise, with respect to all
                  products and product features of SPLPI other than those
                  expressly contained in the life plan contract, official
                  advertisements, literature, materials, and brochures
                  authorized and furnished by SPLPI. The SALES AGENT shall post
                  either a cash bond or a surety bond with a reputable bonding
                  company acceptable to SPLPI, to guarantee the faithful
                  performance of the services for which he/she is being
                  contracted hereunder.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  10. <strong>LIABILITY - </strong> SPLPI shall in no manner be
                  answerable or accountable for any accident, injury or sickness
                  of any kind which may occur to the SALES AGENT in the
                  performance of his/her obligations hereunder. The SALES AGENT
                  shall be solely liable for any and all damages, court suits,
                  demands and causes of action to SPLPI that may arise out of or
                  are due to or directly attributable to the fault or negligence
                  of the SALES AGENT.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  11. The SALES AGENT undertakes and promises that he/she shall
                  not file or initiate any case or action in connection with
                  his/her services with SPLPI. He/she promises and obliges to
                  comply with and promote all standards and expectations of
                  professionalism and company values relevant to his/her
                  contract of services.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  12. The SALES AGENT understands that there being no employment
                  relationship, he/she shall be responsible for applying as
                  "self-employed" for SSS, Pag-ibig and Philhealth and other
                  similar benefits and understands and agrees that such are not
                  obligations of SPLPI to him/her.
                </Text>

                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  IN WITNESS WHEREOF, the parties have signed this Contract of
                  Services at ________________________, Philippines , on this
                  _____ day of _______, 2026.
                </Text>
              </Flex>

              <Box mt={10}>
                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  <strong>ST. PETER LIFE PLAN, INC.</strong>
                </Text>
                <Text
                  fontSize="12px"
                  color="gray.600"
                  textAlign={"justify"}
                  className="report-text"
                >
                  By:
                </Text>
              </Box>

              <Grid templateColumns="repeat(3, 1fr)" mt={10}>
                <GridItem>
                  <Flex
                    borderBlockColor={"gray.500"}
                    borderTopWidth={2}
                    justify={"center"}
                    align={"center"}
                    flexDir={"column"}
                  >
                    <Text
                      color="gray.500"
                      fontSize="14px"
                      className="report-title"
                    >
                      REGIONAL MANAGER
                    </Text>
                  </Flex>
                </GridItem>

                <GridItem />

                <GridItem>
                  <Flex
                    borderBlockColor={"gray.500"}
                    borderTopWidth={2}
                    justify={"center"}
                    align={"center"}
                    flexDir={"column"}
                  >
                    <Text
                      color="gray.500"
                      fontSize="14px"
                      className="report-title"
                    >
                      SALES AGENT
                    </Text>
                  </Flex>
                </GridItem>
              </Grid>
            </Flex>
          </Flex>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
    </>
  );
};

export default PrintingPage;
