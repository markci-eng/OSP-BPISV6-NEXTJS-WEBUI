// Author: Jimwell Ocsio
import { Box, Flex, type BoxProps } from "@chakra-ui/react";
import React from "react";
import PageScrollShell from "./PageScrollShell";

/* ===== ToolContent — right-side header slot ===== */
type ToolContentProps = BoxProps & { children: React.ReactNode };
const ToolContent = ({ children, ...rest }: ToolContentProps) => (
    <Box flexShrink={0} {...rest}>
        {children}
    </Box>
);

/* ===== Row — a section inside MainContent. Spacing between rows is fixed by MainContent. ===== */
type RowStyleProps = "display" | "flexDirection";
type RowProps = Omit<BoxProps, RowStyleProps> & { children: React.ReactNode };
const Row = ({ children, ...rest }: RowProps) => (
    <Box w="100%" {...rest}>
        {children}
    </Box>
);

/* ===== MainContent — page body. Stacks Page.Row children with a fixed gap. ===== */
type MainContentStyleProps = "display" | "flexDirection" | "gap" | "direction";
type MainContentProps = Omit<BoxProps, MainContentStyleProps> & { children: React.ReactNode };
const MainContent = ({ children, ...rest }: MainContentProps) => (
    <Flex direction="column" gap="20px" w="100%" {...rest}>
        {children}
    </Flex>
);

/* ===== Root — Server Component. Splits known slots and hands them to a client scroll shell. ===== */
type RootStyleProps = "overflowY" | "overflowX" | "h" | "maxH";
type RootProps = Omit<BoxProps, RootStyleProps> & {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    description?: React.ReactNode;
    swapOnScroll?: boolean;
    scrolledValue?: React.ReactNode;
    children: React.ReactNode;
};

const Root = ({ children, title, subtitle, description, swapOnScroll, scrolledValue, ...rest }: RootProps) => {
    let toolContent: React.ReactNode = null;
    let mainContent: React.ReactNode = null;

    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        if (child.type === ToolContent) toolContent = child;
        if (child.type === MainContent) mainContent = child;
    });

    return (
        <PageScrollShell
            title={title}
            subtitle={subtitle}
            description={description}
            swapOnScroll={swapOnScroll}
            scrolledValue={scrolledValue}
            toolContent={toolContent}
            mainContent={mainContent}
            boxProps={rest}
        />
    );
};

const Page = { Root, ToolContent, MainContent, Row };

export default Page;
