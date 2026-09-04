"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { RowItem } from "@/components/info-card/row-item";
import { isAccountInGoodStanding } from "../../../data";
import type { Planholder } from "../../claims-data";

/* ------------------------------ formatting ------------------------------ */

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatPeso(amount: number): string {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

/* ------------------------------ info grid ------------------------------ */

interface InfoItem {
  label: string;
  value: ReactNode;
  /** Span the full row (e.g. long values like an address). */
  fullWidth?: boolean;
}

/** A card holding label · dotted leader · value rows. */
function InfoGrid({ items }: { items: InfoItem[] }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      p={{ base: 4, md: 5 }}
    >
      {items.map((item) => (
        <RowItem key={item.label} label={item.label} value={item.value} />
      ))}
    </Box>
  );
}

/** Small coloured status pill used for the boolean-ish summary values. */
function Pill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "green" | "red" | "amber" | "gray";
}) {
  const styles = {
    green: { bg: "green.50", color: "green.600" },
    red: { bg: "red.50", color: "red.600" },
    amber: { bg: "orange.50", color: "orange.600" },
    gray: { bg: "gray.100", color: "gray.600" },
  }[tone];
  return (
    <Box
      display="inline-flex"
      px={2}
      py="2px"
      borderRadius="full"
      fontSize="xs"
      fontWeight="semibold"
      bg={styles.bg}
      color={styles.color}
    >
      {children}
    </Box>
  );
}

/* ------------------------------ tab content ------------------------------ */

function summaryItems(planholder: Planholder): InfoItem[] {
  return [
    { label: "Termination Status", value: planholder.terminationStatus },
    {
      label: "Account Status",
      value: isAccountInGoodStanding(planholder.accountStatus) ? (
        <Pill tone="green">{planholder.accountStatusLabel}</Pill>
      ) : (
        <Pill tone="amber">{planholder.accountStatusLabel}</Pill>
      ),
    },
    { label: "Date of Birth", value: formatDate(planholder.dateOfBirth) },
    {
      label: "Age",
      value: planholder.age !== undefined ? `${planholder.age} yrs` : "—",
    },
    {
      label: "Insurability",
      value: planholder.insurability ? (
        <Pill tone="green">Insurable</Pill>
      ) : (
        <Pill tone="red">Not Insurable</Pill>
      ),
    },
    {
      label: "Contestability",
      value: (
        <Pill tone={planholder.contestability === "within" ? "amber" : "gray"}>
          {planholder.contestability === "within" ? "Within" : "Over"}
        </Pill>
      ),
    },
    { label: "Effectivity", value: formatDate(planholder.effectivityDate) },
    {
      label: "New Effectivity",
      value: formatDate(planholder.newEffectivityDate),
    },
    { label: "RI Date", value: formatDate(planholder.riDate) },
    { label: "LAF", value: planholder.laf ? planholder.laf : "—" },
  ];
}

function planDetailItems(planholder: Planholder): InfoItem[] {
  const d = planholder.planDetail;
  return [
    { label: "Contract Price", value: formatPeso(d.contractPrice) },
    { label: "TAP", value: formatPeso(d.tap) },
    { label: "Balance", value: formatPeso(d.balance) },
    { label: "Inst. Amount", value: formatPeso(d.instAmount) },
    { label: "Total Amount Paid", value: formatPeso(d.totalAmountPaid) },
    { label: "Due Date", value: formatDate(d.dueDate) },
    { label: "Inst. No.", value: d.instNo },
    { label: "Last RI Date", value: formatDate(d.lastRIDate) },
    { label: "Last Payment Date", value: formatDate(d.lastPaymentDate) },
  ];
}

function demographicItems(planholder: Planholder): InfoItem[] {
  const p = planholder.person;
  return [
    { label: "Date of Birth", value: formatDate(planholder.dateOfBirth) },
    { label: "Place of Birth", value: p?.placeOfBirth ?? "—" },
    {
      label: "Age",
      value: planholder.age !== undefined ? `${planholder.age} yrs` : "—",
    },
    { label: "Gender at Birth", value: p?.genderAtBirth ?? "—" },
    { label: "Preferred Gender", value: p?.preferredGender ?? "—" },
    { label: "Civil Status", value: p?.civilStatus ?? "—" },
    { label: "Height", value: p ? `${p.height} cm` : "—" },
    { label: "Weight", value: p ? `${p.weight} kg` : "—" },
  ];
}

/** Address & Contact panel — both fields in a single card. */
function ContactAddressPanel({ planholder }: { planholder: Planholder }) {
  const p = planholder.person;
  return (
    <InfoGrid
      items={[
        { label: "Address", value: p?.address ?? "—", fullWidth: true },
        { label: "Contact", value: p?.contact ?? "—" },
      ]}
    />
  );
}

/* ------------------------------ carousel ------------------------------ */

/**
 * Swipeable, tabbed information carousel — same interaction model as the
 * Death Claims table: horizontal scroll-snap panels, with the tab pills
 * acting as the pager.
 */
export function PlanholderInfoTabs({ planholder }: { planholder: Planholder }) {
  const tabs = [
    {
      key: "summary",
      label: "Summary",
      content: <InfoGrid items={summaryItems(planholder)} />,
    },
    {
      key: "plan",
      label: "Plan Detail",
      content: <InfoGrid items={planDetailItems(planholder)} />,
    },
    {
      key: "demographic",
      label: "Personal Info",
      content: <InfoGrid items={demographicItems(planholder)} />,
    },
    {
      key: "contact",
      label: "Address & Contact",
      content: <ContactAddressPanel planholder={planholder} />,
    },
  ];

  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    if (page !== active) setActive(page);
  };

  const goToPage = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  // Keep the panel in view if the tab set ever changes.
  useEffect(() => {
    trackRef.current?.scrollTo({
      left: active * (trackRef.current.clientWidth || 0),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Centre the active tab pill within the scrollable strip.
  useEffect(() => {
    const strip = stripRef.current;
    const pill = pillRefs.current[active];
    if (!strip || !pill) return;
    const stripRect = strip.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const target =
      strip.scrollLeft +
      (pillRect.left - stripRect.left) -
      (strip.clientWidth - pill.clientWidth) / 2;
    strip.scrollTo({ left: target, behavior: "smooth" });
  }, [active]);

  return (
    <Box>
      {/* Tab pills — scrollable strip; click to jump, highlight active. */}
      <Flex
        ref={stripRef}
        gap={2}
        mb={3}
        overflowX="auto"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        scrollbarWidth="none"
      >
        {tabs.map((tab, i) => {
          const isActive = i === active;
          return (
            <Box
              key={tab.key}
              ref={(el: HTMLDivElement | null) => {
                pillRefs.current[i] = el;
              }}
              role="button"
              tabIndex={0}
              onClick={() => goToPage(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goToPage(i);
              }}
              flexShrink={0}
              px={4}
              py="8px"
              borderRadius="lg"
              borderWidth="1px"
              textAlign="center"
              bg={isActive ? "#f4faf6" : "white"}
              borderColor={isActive ? BRAND_COLORS.darkGreen : "gray.200"}
              boxShadow="none"
              transition="all 0.15s ease"
              _hover={{
                borderColor: isActive ? BRAND_COLORS.darkGreen : "gray.300",
              }}
              cursor="pointer"
            >
              <Text
                fontSize="sm"
                fontWeight="600"
                lineHeight="1"
                whiteSpace="nowrap"
                color={isActive ? BRAND_COLORS.darkGreen : "gray.700"}
              >
                {tab.label}
              </Text>
            </Box>
          );
        })}
      </Flex>

      {/* Swipeable panels. */}
      <Flex
        ref={trackRef}
        onScroll={handleScroll}
        overflowX="auto"
        scrollSnapType="x mandatory"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        scrollbarWidth="none"
        align="stretch"
      >
        {tabs.map((tab) => (
          <Box key={tab.key} minW="100%" scrollSnapAlign="start">
            {tab.content}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

export default PlanholderInfoTabs;
