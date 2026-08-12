import { Button, Flex, FlexProps } from "@chakra-ui/react";
import { LuRefreshCw } from "react-icons/lu";
import { Body, Small } from "osp-ui-kit";

export type StateCardStatus = "empty" | "error";

type StateCardProps = {
  status?: StateCardStatus;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
} & FlexProps;

export const StateCard = ({
  status = "empty",
  title,
  description,
  onRetry,
  retryLabel = "Retry",
  children,
  ...props
}: StateCardProps) => {
  const isError = status === "error";
  const resolvedTitle =
    title ?? (isError ? "Unable to load data" : undefined);
  const resolvedDescription =
    description ??
    (isError ? "Something went wrong while fetching this section." : undefined);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py={{ base: 8, md: 12 }}
      px={4}
      border="1px dashed"
      borderColor={isError ? "red.200" : "gray.200"}
      borderRadius="md"
      textAlign="center"
      color="gray.500"
      gap={2}
      h={"full"}
      {...props}
    >
      {resolvedTitle && (
        <Body fontWeight="semibold" color={isError ? "red.500" : undefined}>
          {resolvedTitle}
        </Body>
      )}

      {resolvedDescription && <Small>{resolvedDescription}</Small>}

      {isError && onRetry && (
        <Button
          size="sm"
          variant="outline"
          colorPalette="red"
          mt={2}
          onClick={onRetry}
        >
          <LuRefreshCw size={14} />
          {retryLabel}
        </Button>
      )}

      {children}
    </Flex>
  );
};
