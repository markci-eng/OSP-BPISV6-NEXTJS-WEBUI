"use client";
import React from "react";
import {
  VStack,
  HStack,
  SimpleGrid,
  Box,
  Text,
  Select,
  createListCollection,
  Portal,
  Field,
} from "@chakra-ui/react";
import {InputFloatingLabel} from "st-peter-ui";
import { Body, H4 } from "st-peter-ui";
const provinceOptions = [
  "Abra",
  "Agusan del Norte",
  "Agusan del Sur",
  "Aklan",
  "Albay",
  "Antique",
  "Apayao",
  "Aurora",
  "Basilan",
  "Bataan",
  "Batanes",
  "Batangas",
  "Benguet",
  "Biliran",
  "Bohol",
  "Bukidnon",
  "Bulacan",
  "Cagayan",
  "Camarines Norte",
  "Camarines Sur",
  "Camiguin",
  "Capiz",
  "Catanduanes",
  "Cavite",
  "Cebu",
  "Cotabato",
  "Davao de Oro",
  "Davao del Norte",
  "Davao del Sur",
  "Davao Occidental",
  "Davao Oriental",
  "Dinagat Islands",
  "Eastern Samar",
  "Guimaras",
  "Ifugao",
  "Ilocos Norte",
  "Ilocos Sur",
  "Iloilo",
  "Isabela",
  "Kalinga",
  "La Union",
  "Laguna",
  "Lanao del Norte",
  "Lanao del Sur",
  "Leyte",
  "Maguindanao del Norte",
  "Maguindanao del Sur",
  "Marinduque",
  "Masbate",
  "Metro Manila",
  "Misamis Occidental",
  "Misamis Oriental",
  "Mountain Province",
  "Negros Occidental",
  "Negros Oriental",
  "Northern Samar",
  "Nueva Ecija",
  "Nueva Vizcaya",
  "Occidental Mindoro",
  "Oriental Mindoro",
  "Palawan",
  "Pampanga",
  "Pangasinan",
  "Quezon",
  "Quirino",
  "Rizal",
  "Romblon",
  "Samar",
  "Sarangani",
  "Siquijor",
  "Sorsogon",
  "South Cotabato",
  "Southern Leyte",
  "Sultan Kudarat",
  "Sulu",
  "Surigao del Norte",
  "Surigao del Sur",
  "Tarlac",
  "Tawi-Tawi",
  "Zambales",
  "Zamboanga del Norte",
  "Zamboanga del Sur",
  "Zamboanga Sibugay",
].map((prov) => ({ label: prov, value: prov }));

const cityOptions = [
  "Quezon City",
  "Manila",
  "Davao City",
  "Caloocan",
  "Cebu City",
  "Zamboanga City",
  "Taguig",
  "Antipolo",
  "Pasig",
  "Valenzuela",
  "Las Piñas",
  "Makati",
  "San Jose del Monte",
  "Bacolod",
  "Muntinlupa",
  "Cagayan de Oro",
  "Dasmariñas",
  "Pasay",
  "General Santos",
  "Santa Rosa",
  "Iloilo City",
  "Parañaque",
  "Bacoor",
  "Mandaluyong",
  "Angeles",
  "Imus",
  "Lapu-Lapu",
  "Mandaue",
  "Baguio",
  "San Fernando",
  "Biñan",
  "Butuan",
  "San Pedro",
  "Navotas",
  "Tanauan",
  "Malabon",
  "Ormoc",
  "Legazpi",
  "Olongapo",
  "Cabuyao",
  "Tacloban",
  "Naga",
  "San Pablo",
  "Valencia",
  "Roxas",
  "Tarlac City",
  "Lucena",
  "Tagum",
  "Calamba",
  "Puerto Princesa",
  "Gapan",
  "Cotabato City",
  "Santiago",
  "Tuguegarao",
  "Bayawan",
  "Dipolog",
  "Pagadian",
  "Kidapawan",
  "Koronadal",
  "Surigao",
  "Dagupan",
  "Digos",
  "Candon",
  "Tabaco",
  "Baybay",
  "San Carlos",
  "Gingoog",
  "Sorsogon City",
  "Cauayan",
  "Science City of Muñoz",
  "Calapan",
  "San Jose",
  "Urdaneta",
  "Bayugan",
  "San Fernando (La Union)",
  "Bais",
  "Talisay",
  "Polomolok",
  "Panabo",
  "Danao",
  "Santa Maria",
  "Silay",
  "Cavite City",
  "Bogo",
  "Tabuk",
  "Trece Martires",
  "Ligao",
  "Canlaon",
  "Dumaguete",
  "Malaybalay",
  "Baclayon",
  "San Juan",
  "Laoag",
  "Mati",
  "Bangued",
  "Baler",
  "Vigan",
  "Puerto Galera",
  "Marawi",
  "Basilan City",
  "Isabela City",
  "Lamitan",
  "Jolo",
  "Bongao",
  "Ipil",
].map((city) => ({ label: city, value: city }));

// For demo, use cityOptions for district/barangay as well (replace with real data as needed)
const districtOptions = cityOptions;
const barangayOptions = cityOptions;

const provinceCollection = createListCollection({ items: provinceOptions });
const cityCollection = createListCollection({ items: cityOptions });
const districtCollection = createListCollection({ items: districtOptions });
const barangayCollection = createListCollection({ items: barangayOptions });

const LifePlanApplication2 = () => {
  return (
    <>
      <VStack align="stretch" gap={4} mb={4}>
        <Box>
          <Body fontWeight="bold">
            Residential Address
          </Body>
        </Box>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
        <Field.Root>
          <InputFloatingLabel id="lotNumber" label="Lot #" />
        </Field.Root>
        <Field.Root>
          <InputFloatingLabel id="street" label="Street" />
        </Field.Root>
        <VStack align="stretch" gap={4}>
          <Select.Root collection={provinceCollection} width="100%">
            <Select.HiddenSelect />
            {/* <Select.Label>Province</Select.Label> */}
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Province" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {provinceOptions.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </VStack>
        <VStack align="stretch" gap={4}>
          <Select.Root collection={cityCollection} width="100%">
            <Select.HiddenSelect />
            {/* <Select.Label>City</Select.Label> */}
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select City" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {cityOptions.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </VStack>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <VStack align="stretch" gap={4} mb={4}>
          <Select.Root collection={districtCollection} width="100%">
            <Select.HiddenSelect />
            {/* <Select.Label>District</Select.Label> */}
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select District" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {districtOptions.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </VStack>
        <VStack align="stretch" gap={4} mb={4}>
          <Select.Root collection={barangayCollection} width="100%">
            <Select.HiddenSelect />
            {/* <Select.Label>Barangay</Select.Label> */}
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select Barangay" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {barangayOptions.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </VStack>
      </SimpleGrid>

      {/* Add Chakra Input fields for Lot #, Street, Zip Code here if needed */}
    </>
  );
};

export default LifePlanApplication2;
