// Change or Add by: JLO 2026-05-16
"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Image,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import {
  Body,
  PrimaryMdButton,
  PrimarySmButton,
  SecondaryMdButton,
  Small,
} from "st-peter-ui";
import {
  LuCopy,
  LuDownload,
  LuUpload,
  LuMail,
  LuSmartphone,
} from "react-icons/lu";
import {
  FaFacebook,
  FaFacebookMessenger,
  FaViber,
  FaXTwitter,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa6";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import Card from "@/components/cards/Card";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import {
  REFERRAL_HISTORY,
  REFERRAL_LINK,
  REFERRAL_QR_URL,
  ReferralHistoryItem,
} from "../data/referral.mock";

const shareTargets = [
  { label: "Facebook", icon: FaFacebook, color: "#1877F2" },
  { label: "Messenger", icon: FaFacebookMessenger, color: "#0084FF" },
  { label: "Viber", icon: FaViber, color: "#7360F2" },
  { label: "X", icon: FaXTwitter, color: "#000000" },
  { label: "LinkedIn", icon: FaLinkedin, color: "#0A66C2" },
  { label: "WhatsApp", icon: FaWhatsapp, color: "#25D366" },
];

export default function ReferralPage() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK);
      toast.success("Referral link copied to clipboard.");
    } catch {
      toast.error("Unable to copy referral link.");
    }
  };

  const handleDownloadQr = async () => {
    try {
      const res = await fetch(REFERRAL_QR_URL);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "referral-qr.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download QR code.");
    }
  };

  const handleShare = (label: string) => {
    const shareUrl = encodeURIComponent(REFERRAL_LINK);
    const map: Record<string, string> = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      Messenger: `https://www.facebook.com/dialog/send?link=${shareUrl}`,
      Viber: `viber://forward?text=${shareUrl}`,
      X: `https://twitter.com/intent/tweet?url=${shareUrl}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      WhatsApp: `https://wa.me/?text=${shareUrl}`,
    };
    window.open(map[label], "_blank", "noopener,noreferrer");
  };

  return (
    <Flex flexDir="column" gap={6} my={6}>
      <Card.Root title="Referral Link">
        <Card.MainContent>
          <Flex
            gap={3}
            direction={{ base: "column", sm: "row" }}
            align={{ base: "stretch", sm: "center" }}
          >
            <Input
              value={REFERRAL_LINK}
              readOnly
              bg="gray.50"
              fontStyle="italic"
              color="gray.600"
            />
            <PrimaryMdButton onClick={handleCopy}>
              <LuCopy /> Copy
            </PrimaryMdButton>
          </Flex>
        </Card.MainContent>
      </Card.Root>

      <Card.Root title="QR Code">
        <Card.MainContent>
          <Flex direction="column" align="center" gap={4} py={2}>
            <Box
              p={3}
              borderWidth={1}
              borderColor="gray.200"
              borderRadius="md"
            >
              <Image
                src={REFERRAL_QR_URL}
                alt="Referral QR Code"
                boxSize="220px"
              />
            </Box>
            <PrimaryMdButton onClick={handleDownloadQr}>
              <LuDownload /> Download
            </PrimaryMdButton>
          </Flex>
        </Card.MainContent>
      </Card.Root>

      <Card.Root title="Send via Template">
        <Card.MainContent>
          <Flex gap={3} direction={{ base: "column", sm: "row" }}>
            <SecondaryMdButton onClick={() => {}}>
              <LuDownload /> Download Template
            </SecondaryMdButton>
            <PrimaryMdButton onClick={() => {}}>
              <LuUpload /> Upload Template
            </PrimaryMdButton>
          </Flex>
        </Card.MainContent>
      </Card.Root>

      <Card.Root title="Send To Email">
        <Card.MainContent>
          <Flex direction="column" gap={3}>
            <Small color="red.500">
              Multiple entry must be separated by semicolon &quot; ; &quot;
            </Small>
            <InputGroup startElement={<LuMail />}>
              <Input
                placeholder="Enter Email ..."
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
            </InputGroup>
            <Flex justify="flex-end" gap={2}>
              <SecondaryMdButton onClick={() => setEmail("")}>
                Clear
              </SecondaryMdButton>
              <PrimaryMdButton onClick={() => {}}>Send Mail</PrimaryMdButton>
            </Flex>
          </Flex>
        </Card.MainContent>
      </Card.Root>

      <Card.Root title="Send To Mobile">
        <Card.MainContent>
          <Flex direction="column" gap={3}>
            <Small color="red.500">
              Multiple entry must be separated by semicolon &quot; ; &quot;
            </Small>
            <InputGroup startElement={<LuSmartphone />}>
              <Input
                placeholder="Enter Mobile (0917)..."
                value={mobile}
                onChange={(e) => setMobile(e.currentTarget.value)}
              />
            </InputGroup>
            <Flex justify="flex-end" gap={2}>
              <SecondaryMdButton onClick={() => setMobile("")}>
                Clear
              </SecondaryMdButton>
              <PrimaryMdButton onClick={() => {}}>Send SMS</PrimaryMdButton>
            </Flex>
          </Flex>
        </Card.MainContent>
      </Card.Root>

      <Card.Root title="Share via">
        <Card.MainContent>
          <Flex gap={4} wrap="wrap">
            {shareTargets.map((t) => {
              const SocialIcon = t.icon;
              return (
                <Box
                  key={t.label}
                  as="button"
                  onClick={() => handleShare(t.label)}
                  color={t.color}
                  cursor="pointer"
                  _hover={{ opacity: 0.75 }}
                  aria-label={`Share via ${t.label}`}
                >
                  <SocialIcon size={36} />
                </Box>
              );
            })}
          </Flex>
        </Card.MainContent>
      </Card.Root>

      <Card.Root title="Referral History">
        <Card.MainContent>
          <DataTable
            columns={columns}
            data={REFERRAL_HISTORY}
            features={{
              search: false,
              filtering: false,
              sorting: false,
              pagination: true,
              selection: false,
              draggable: false,
              columnToggle: true,
              detailSidebar: false,
            }}
          />
        </Card.MainContent>
      </Card.Root>
    </Flex>
  );
}

const columns: ColumnDef<ReferralHistoryItem>[] = [
  {
    accessorKey: "dateSent",
    header: "Date Sent",
    enableColumnFilter: false,
    cell: (info) => <Body>{info.getValue<string>()}</Body>,
  },
  {
    accessorKey: "sendTo",
    header: "Send To",
    enableColumnFilter: false,
    cell: (info) => <Body>{info.getValue<string>()}</Body>,
  },
  {
    accessorKey: "channel",
    header: "Channel",
    enableColumnFilter: false,
    cell: (info) => <Body>{info.getValue<string>()}</Body>,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    enableColumnFilter: false,
    cell: (info) => <Body>{info.getValue<string>()}</Body>,
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    enableColumnFilter: false,
    cell: (info) => <Body>{info.getValue<string>()}</Body>,
  },
];
