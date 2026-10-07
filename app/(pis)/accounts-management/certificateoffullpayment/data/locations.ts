/**
 * The address tree the Edit PH Info dialog picks from — province, then
 * municipality/city, then district, then barangay (user, 2026-10-02).
 *
 * MOCK, and deliberately small: enough provinces to show the cascade working,
 * not a gazetteer. When a location source turns up, it maps onto this shape and
 * the dialog does not change.
 */
export interface CofpDistrict {
  name: string;
  barangays: string[];
}

export interface CofpCity {
  name: string;
  districts: CofpDistrict[];
}

export interface CofpProvince {
  name: string;
  cities: CofpCity[];
}

export const COFP_LOCATIONS: CofpProvince[] = [
  {
    name: "METRO MANILA",
    cities: [
      {
        name: "QUEZON CITY",
        districts: [
          { name: "DISTRICT 1", barangays: ["BAGO BANTAY", "PALTOK", "SAN ANTONIO"] },
          { name: "DISTRICT 4", barangays: ["KAMUNING", "SACRED HEART", "SOUTH TRIANGLE"] },
        ],
      },
      {
        name: "MAKATI",
        districts: [
          { name: "DISTRICT 1", barangays: ["BEL-AIR", "POBLACION", "SAN ANTONIO"] },
          { name: "DISTRICT 2", barangays: ["GUADALUPE NUEVO", "PEMBO", "WEST REMBO"] },
        ],
      },
    ],
  },
  {
    name: "CAVITE",
    cities: [
      {
        name: "IMUS",
        districts: [
          { name: "DISTRICT 3", barangays: ["ALAPAN I-A", "BUCANDALA I", "MALAGASANG I-A"] },
        ],
      },
      {
        name: "DASMARIÑAS",
        districts: [
          { name: "DISTRICT 4", barangays: ["SALITRAN I", "SAMPALOC I", "ZONE I"] },
        ],
      },
      {
        name: "BACOOR",
        districts: [
          { name: "DISTRICT 2", barangays: ["MOLINO I", "NIOG I", "TALABA I"] },
        ],
      },
    ],
  },
  {
    name: "CEBU",
    cities: [
      {
        name: "CEBU CITY",
        districts: [
          { name: "NORTH DISTRICT", barangays: ["APAS", "LAHUG", "TALAMBAN"] },
          { name: "SOUTH DISTRICT", barangays: ["GUADALUPE", "LABANGON", "PARDO"] },
        ],
      },
    ],
  },
  {
    name: "DAVAO DEL SUR",
    cities: [
      {
        name: "DAVAO CITY",
        districts: [
          { name: "BUHANGIN", barangays: ["BUHANGIN", "CABANTIAN", "TIGATTO"] },
          { name: "TUGBOK", barangays: ["CATALUNAN PEQUEÑO", "MINTAL", "TUGBOK"] },
        ],
      },
    ],
  },
  {
    name: "ZAMBOANGA DEL SUR",
    cities: [
      {
        name: "ZAMBOANGA CITY",
        districts: [
          { name: "DISTRICT 1", barangays: ["CALARIAN", "SAN ROQUE", "STA. MARIA"] },
          { name: "DISTRICT 2", barangays: ["PUTIK", "TETUAN", "TUMAGA"] },
        ],
      },
    ],
  },
  {
    name: "LEYTE",
    cities: [
      {
        name: "TACLOBAN CITY",
        districts: [
          { name: "DISTRICT 1", barangays: ["ABUCAY", "MARASBARAS", "SAN JOSE"] },
        ],
      },
      {
        name: "ORMOC CITY",
        districts: [
          { name: "DISTRICT 4", barangays: ["COGON COMBADO", "IPIL", "LINAO"] },
        ],
      },
    ],
  },
];

/** The cities under a province — empty until one is picked. */
export function citiesOf(province: string): CofpCity[] {
  return COFP_LOCATIONS.find((p) => p.name === province)?.cities ?? [];
}

/** The districts under a city. */
export function districtsOf(province: string, city: string): CofpDistrict[] {
  return citiesOf(province).find((c) => c.name === city)?.districts ?? [];
}

/** The barangays under a district. */
export function barangaysOf(
  province: string,
  city: string,
  district: string,
): string[] {
  return (
    districtsOf(province, city).find((d) => d.name === district)?.barangays ?? []
  );
}

/** Every province → city → district → barangay path, flattened for seeding. */
export const COFP_LOCATION_PATHS = COFP_LOCATIONS.flatMap((province) =>
  province.cities.flatMap((city) =>
    city.districts.flatMap((district) =>
      district.barangays.map((barangay) => ({
        province: province.name,
        city: city.name,
        district: district.name,
        barangay,
      })),
    ),
  ),
);
