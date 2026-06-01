// Author: Jimwell Ocsio
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flex } from "@chakra-ui/react";
import { Small } from "st-peter-ui";

const SmallLink = Small as React.ComponentType<
  React.ComponentProps<typeof Small> & { href: string }
>;

const STORAGE_KEY = "pisv6:last-path";

const PALETTE = {
  v1: { base: "#B7CDB9", here: "#F4EFE3" },
  v2: { base: "#7B8079", here: "#006838" },
} as const;

const prettify = (segment: string) =>
  decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

type BreadcrumbProps = { variant?: "v1" | "v2" };

const Breadcrumb = ({ variant = "v2" }: BreadcrumbProps) => {
  const { base, here } = PALETTE[variant];
  const pathname = usePathname() || "/";
  const [lastPath, setLastPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && stored !== pathname) setLastPath(stored);
      sessionStorage.setItem(STORAGE_KEY, pathname);
    } catch {
      // ignore
    }
  }, [pathname]);

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [
    { href: "/", label: "Dashboard" },
    ...segments.map((seg, i) => ({
      href: "/" + segments.slice(0, i + 1).join("/"),
      label: prettify(seg),
    })),
  ];

  return (
    <Flex
      as="nav"
      aria-label="Breadcrumb"
      align="center"
      gap="8px"
      color={base}
      data-last-path={lastPath ?? undefined}
    >
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={c.href}>
            {i > 0 && (
              <Small as="span" opacity={0.5} aria-hidden="true">
                /
              </Small>
            )}
            {isLast ? (
              <Small as="span" aria-current="page" color={here} fontWeight={500}>
                {c.label}
              </Small>
            ) : (
              <SmallLink
                as={Link}
                href={c.href}
                color="inherit"
                textDecoration="none"
                _hover={{ color: here }}
              >
                {c.label}
              </SmallLink>
            )}
          </React.Fragment>
        );
      })}
    </Flex>
  );
};

export default Breadcrumb;
