"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Box, Button, Text, Grid, Popover, Portal } from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export interface DateRangePickerProps {
  label?: string;
  startDate?: Date;
  endDate?: Date;
  onChange: (range: { startDate?: Date; endDate?: Date }) => void;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  className?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

export function DateRangePicker({
  label,
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  required = false,
  className,
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
}: DateRangePickerProps) {
  const handleStartDateChange = (date?: Date) => {
    let newEnd = endDate;

    if (date && endDate && endDate < date) {
      newEnd = undefined;
    }

    onChange({ startDate: date, endDate: newEnd });
  };

  const handleEndDateChange = (date?: Date) => {
    onChange({ startDate, endDate: date });
  };

  return (
    <Box className={className} w="full" maxW="full">
      {label && (
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1.5}>
          {label}
          {required && (
            <Text as="span" color="red.500" ml={1}>
              *
            </Text>
          )}
        </Text>
      )}

      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
        gap={3}
        w="full"
      >
        <DateField
          label="Start Date"
          value={startDate}
          onChange={handleStartDateChange}
          placeholder={startPlaceholder}
          minDate={minDate}
          maxDate={maxDate}
        />

        <DateField
          label="End Date"
          value={endDate}
          onChange={handleEndDateChange}
          placeholder={endPlaceholder}
          minDate={startDate || minDate}
          maxDate={maxDate}
        />
      </Grid>
    </Box>
  );
}

interface DateFieldProps {
  label: string;
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder: string;
  minDate?: Date;
  maxDate?: Date;
}

function DateField({
  label,
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
}: DateFieldProps) {
  return (
    <Box minW={0}>
      <Text
        fontSize="xs"
        fontWeight="medium"
        color="gray.500"
        textTransform="uppercase"
        mb={1}
      >
        {label}
      </Text>

      <Popover.Root positioning={{ placement: "bottom-start" }}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            w="full"
            minW={0}
            h="40px"
            justifyContent="flex-start"
            fontWeight="normal"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            <CalendarIcon
              size={16}
              style={{ marginRight: 8, opacity: 0.6, flexShrink: 0 }}
            />
            <Box as="span" overflow="hidden" textOverflow="ellipsis">
              {value ? format(value, "PPP") : placeholder}
            </Box>
          </Button>
        </Popover.Trigger>

        <Portal>
          <Popover.Positioner>
            <Popover.Content
              p={3}
              w="fit-content"
              maxW="calc(100vw - 24px)"
              overflowX="auto"
            >
              <DayPicker
                mode="single"
                selected={value}
                onSelect={onChange}
                disabled={(date) => {
                  if (minDate && date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
              />
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Box>
  );
}
