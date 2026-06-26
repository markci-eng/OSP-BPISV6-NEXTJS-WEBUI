import { JourneyStep } from "./JourneyTimeline";

// 🔹 Fallback Journey (used for unknown types)
export const fallbackJourney: JourneyStep[] = [
  {
    step: 1,
    title: "Submission",
    description: "Request filed by requester",
    dateTime: "9/8/2025, 11:16 AM",
    status: "Done",
  },
  {
    step: 2,
    title: "Acknowledgment",
    description: "Acknowledged by the office",
    dateTime: "9/8/2025, 11:20 AM",
    status: "Done",
  },
  {
    step: 3,
    title: "Review",
    description: "Details reviewed and verified",
    dateTime: "9/8/2025, 11:21 PM",
    status: "Done",
  },
  {
    step: 4,
    title: "Processing",
    description: "Approvals carried out",
    dateTime: "9/8/2025, 11:30 AM",
    status: "Done",
  },
  {
    step: 5,
    title: "Finalization",
    description: "Ready for release",
    dateTime: "9/8/2025, 12:00 PM",
    status: "Done",
  },
  {
    step: 6,
    title: "Completed",
    description: "Request closed and requester notified",
    dateTime: "9/8/2025, 01:00 PM",
    status: "Done",
  },
];

// 🔹 Journeys by request type
export const journeys: Record<string, JourneyStep[]> = {
  // Retrieval Request (RR)
  RR: [
    {
      step: 1,
      title: "Family to FCR (First Contact)",
      description: "Family reported passing to First Contact Representative",
      dateTime: "2025-03-31 08:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "FCR to Dispatcher",
      description: "Case endorsed to dispatcher for assignment",
      dateTime: "2025-03-31 09:45 AM",
      status: "Current",
    },
    {
      step: 3,
      title: "Dispatcher to Driver",
      description: "Dispatcher assigned a driver for retrieval",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 4,
      title: "Driver Chapel Departure",
      description: "Driver departed chapel to pickup location",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 5,
      title: "Driver Site Arrival",
      description: "Driver arrived at family location",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Driver Site Departure",
      description: "Driver departed family location with remains",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Driver Chapel Arrival (w/ Remains)",
      description: "Driver returned to chapel with remains",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 8,
      title: "Family Chapel Arrival",
      description: "Family arrived at chapel",
      dateTime: "",
      status: "Pending",
    },
  ],

  // Trip Ticket — per-record journeys keyed by full ticket number

  // TT-0001 "In Progress" — RETRIEVAL, driver en route to site
  "TT-0001": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for retrieval of Juan Dela Cruz",
      dateTime: "2026-04-10 06:30 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assigned",
      description: "Driver assigned to vehicle ABC-1234",
      dateTime: "2026-04-10 06:45 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Departed Chapel",
      description: "Vehicle left chapel heading to St. Luke's Medical Center",
      dateTime: "2026-04-10 07:00 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Arrived at Site",
      description: "Driver arrived at St. Luke's Medical Center",
      dateTime: "",
      status: "Current",
    },
    {
      step: 5,
      title: "Departed Site",
      description: "Vehicle departed site with remains",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Arrived at Chapel",
      description: "Vehicle returned to chapel with remains",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "",
      status: "Pending",
    },
  ],

  // TT-0002 "Timed-In" — AUTOPSY, fully completed
  "TT-0002": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for autopsy transport of Maria Santos",
      dateTime: "2026-04-09 05:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assigned",
      description: "Driver assigned to vehicle XYZ-5678",
      dateTime: "2026-04-09 05:15 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Departed Chapel",
      description: "Vehicle left chapel heading to Manila Memorial Hospital",
      dateTime: "2026-04-09 05:30 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Arrived at Site",
      description: "Driver arrived at Manila Memorial Hospital",
      dateTime: "2026-04-09 06:15 AM",
      status: "Done",
    },
    {
      step: 5,
      title: "Departed Site",
      description:
        "Vehicle departed hospital with remains after autopsy release",
      dateTime: "2026-04-09 09:30 AM",
      status: "Done",
    },
    {
      step: 6,
      title: "Arrived at Chapel",
      description: "Vehicle returned to chapel with remains",
      dateTime: "2026-04-09 10:15 AM",
      status: "Done",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "2026-04-09 10:20 AM",
      status: "Done",
    },
  ],

  // TT-0003 "Timed-In" — VIEWING (OUTSIDE, RESIDENCE), fully completed
  "TT-0003": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for outside viewing of Pedro Ramirez",
      dateTime: "2026-04-08 07:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assigned",
      description: "Driver assigned to vehicle DEF-9087",
      dateTime: "2026-04-08 07:10 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Departed Chapel",
      description:
        "Vehicle left chapel with casket heading to Quezon City Residence",
      dateTime: "2026-04-08 07:30 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Arrived at Residence",
      description:
        "Driver arrived at Quezon City Residence for outside viewing",
      dateTime: "2026-04-08 08:20 AM",
      status: "Done",
    },
    {
      step: 5,
      title: "Viewing Concluded",
      description:
        "Outside viewing completed; remains loaded back onto vehicle",
      dateTime: "2026-04-08 04:00 PM",
      status: "Done",
    },
    {
      step: 6,
      title: "Arrived at Chapel",
      description: "Vehicle returned to chapel with remains",
      dateTime: "2026-04-08 04:50 PM",
      status: "Done",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "2026-04-08 04:55 PM",
      status: "Done",
    },
  ],

  // TT-0004 "Pending" — CHAPEL VIEWING, not yet dispatched
  "TT-0004": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for chapel viewing of Ana Lopez",
      dateTime: "2026-04-11 08:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assignment",
      description: "Awaiting driver assignment for vehicle dispatch",
      dateTime: "",
      status: "Current",
    },
    {
      step: 3,
      title: "Depart to Chapel",
      description: "Vehicle to depart to St. Peter Chapel Commonwealth",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 4,
      title: "Arrive at Chapel",
      description: "Vehicle arrives at destination chapel",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 5,
      title: "Setup & Viewing",
      description: "Chapel setup completed; viewing in progress",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "",
      status: "Pending",
    },
  ],

  // TT-0005 "Timed-In" — INTERMENT, fully completed
  "TT-0005": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for interment of Roberto Lim",
      dateTime: "2026-04-07 06:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assigned",
      description: "Driver assigned to vehicle QWE-1111",
      dateTime: "2026-04-07 06:15 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Departed Chapel",
      description:
        "Vehicle left chapel with casket heading to Manila North Cemetery",
      dateTime: "2026-04-07 07:00 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Arrived at Cemetery",
      description: "Vehicle arrived at Manila North Cemetery",
      dateTime: "2026-04-07 08:00 AM",
      status: "Done",
    },
    {
      step: 5,
      title: "Interment Ceremony",
      description: "Final rites and burial ceremony conducted",
      dateTime: "2026-04-07 09:30 AM",
      status: "Done",
    },
    {
      step: 6,
      title: "Returned to Chapel",
      description: "Vehicle returned to chapel after interment",
      dateTime: "2026-04-07 10:30 AM",
      status: "Done",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "2026-04-07 10:35 AM",
      status: "Done",
    },
  ],

  // TT-0006 "In Progress" — WAKE VISIT, driver at the residence
  "TT-0006": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for wake visit of Carlos Bautista",
      dateTime: "2026-04-12 01:00 PM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assigned",
      description: "Driver assigned to vehicle RTY-2222",
      dateTime: "2026-04-12 01:10 PM",
      status: "Done",
    },
    {
      step: 3,
      title: "Departed Chapel",
      description: "Vehicle left chapel heading to QC Residence",
      dateTime: "2026-04-12 01:30 PM",
      status: "Done",
    },
    {
      step: 4,
      title: "Arrived at Residence",
      description: "Driver arrived at QC Residence for wake visit",
      dateTime: "2026-04-12 02:15 PM",
      status: "Done",
    },
    {
      step: 5,
      title: "Wake Visit In Progress",
      description: "Staff on-site assisting with wake arrangements",
      dateTime: "2026-04-12 02:20 PM",
      status: "Current",
    },
    {
      step: 6,
      title: "Departed Residence",
      description: "Vehicle departing residence back to chapel",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "",
      status: "Pending",
    },
  ],

  // TT-0007 "Timed-In" — TRANSFER (INTER-CHAPEL), fully completed
  "TT-0007": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for inter-chapel transfer of Luis Garcia",
      dateTime: "2026-04-06 08:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assigned",
      description: "Driver assigned to vehicle UIO-3333",
      dateTime: "2026-04-06 08:10 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Departed Origin Chapel",
      description: "Vehicle left origin chapel with remains",
      dateTime: "2026-04-06 08:30 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Arrived at Destination Chapel",
      description: "Vehicle arrived at St. Peter Chapel Cubao",
      dateTime: "2026-04-06 09:15 AM",
      status: "Done",
    },
    {
      step: 5,
      title: "Remains Transferred",
      description: "Remains handed over and checked in at destination chapel",
      dateTime: "2026-04-06 09:30 AM",
      status: "Done",
    },
    {
      step: 6,
      title: "Returned to Base",
      description: "Vehicle returned to base chapel",
      dateTime: "2026-04-06 10:15 AM",
      status: "Done",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "2026-04-06 10:20 AM",
      status: "Done",
    },
  ],

  // TT-0008 "Timed-In" — DELIVERY (EQUIPMENT), fully completed
  "TT-0008": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for equipment delivery",
      dateTime: "2026-04-05 09:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assigned",
      description: "Driver assigned to vehicle PAS-4444",
      dateTime: "2026-04-05 09:10 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Equipment Loaded",
      description: "Equipment loaded onto vehicle at chapel warehouse",
      dateTime: "2026-04-05 09:30 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Departed Chapel",
      description: "Vehicle left chapel heading to Equipment Warehouse",
      dateTime: "2026-04-05 09:45 AM",
      status: "Done",
    },
    {
      step: 5,
      title: "Arrived at Warehouse",
      description: "Vehicle arrived at Equipment Warehouse",
      dateTime: "2026-04-05 10:30 AM",
      status: "Done",
    },
    {
      step: 6,
      title: "Equipment Delivered",
      description: "Equipment unloaded and receipt acknowledged",
      dateTime: "2026-04-05 10:45 AM",
      status: "Done",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "2026-04-05 11:30 AM",
      status: "Done",
    },
  ],

  // TT-0009 "Pending" — REFUELING, awaiting dispatch
  "TT-0009": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for refueling run",
      dateTime: "2026-04-13 07:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assignment",
      description: "Awaiting driver assignment for vehicle FGH-5555",
      dateTime: "",
      status: "Current",
    },
    {
      step: 3,
      title: "Depart to Fuel Station",
      description: "Vehicle to depart to Fuel Station Commonwealth",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 4,
      title: "Refueling",
      description: "Vehicle refueling at station",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 5,
      title: "Return to Chapel",
      description: "Vehicle returns to chapel after refueling",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "",
      status: "Pending",
    },
  ],

  // TT-0010 "In Progress" — PICK-UP OF EMPLOYEES, driver en route
  "TT-0010": [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed for employee pick-up",
      dateTime: "2026-04-14 05:30 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assigned",
      description: "Driver assigned to vehicle JKH-6666",
      dateTime: "2026-04-14 05:40 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Departed Chapel",
      description: "Vehicle left chapel heading to Employee Residence",
      dateTime: "2026-04-14 06:00 AM",
      status: "Current",
    },
    {
      step: 4,
      title: "Arrived at Residence",
      description: "Vehicle arrives at employee pick-up point",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 5,
      title: "Employees Boarded",
      description: "Employees picked up and boarded the vehicle",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Arrived at Chapel",
      description: "Vehicle returned to chapel with employees",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "",
      status: "Pending",
    },
  ],

  // Generic TT fallback for any trip ticket not explicitly mapped
  TT: [
    {
      step: 1,
      title: "Trip Ticket Created",
      description: "Trip ticket filed and details recorded",
      dateTime: "",
      status: "Done",
    },
    {
      step: 2,
      title: "Driver Assignment",
      description: "Awaiting driver and vehicle assignment",
      dateTime: "",
      status: "Current",
    },
    {
      step: 3,
      title: "Departed Chapel",
      description: "Vehicle departed chapel to destination",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 4,
      title: "Arrived at Destination",
      description: "Vehicle arrived at destination",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 5,
      title: "Departed Destination",
      description: "Vehicle departed destination",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Returned to Chapel",
      description: "Vehicle returned to base chapel",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Trip Completed",
      description: "Driver timed-in; trip ticket closed",
      dateTime: "",
      status: "Pending",
    },
  ],

  // ACE (St. Peter ACE)
  ACE: [
    {
      step: 1,
      title: "Submission",
      description: "ST. PETER ACE request filed",
      dateTime: "2025-03-31 09:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Acknowledgment",
      description: "Request acknowledged by office",
      dateTime: "",
      status: "Done",
    },
    {
      step: 3,
      title: "Review",
      description: "Details under review for ST. PETER ACE",
      dateTime: "",
      status: "Done",
    },
    {
      step: 4,
      title: "Processing",
      description: "ST. PETER ACE request under verification",
      dateTime: "",
      status: "Current",
    },
    {
      step: 5,
      title: "Finalization",
      description: "ST. PETER ACE request ready for release",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Completed",
      description: "ST. PETER ACE request approved",
      dateTime: "",
      status: "Pending",
    },
  ],

  // Amnesty
  AMNESTY: [
    {
      step: 1,
      title: "Submission",
      description: "FOR AMNESTY request filed",
      dateTime: "2025-03-31 10:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Acknowledgment",
      description: "Request acknowledged by office",
      dateTime: "",
      status: "Done",
    },
    {
      step: 3,
      title: "Review",
      description: "FOR AMNESTY request under review",
      dateTime: "",
      status: "Done",
    },
    {
      step: 4,
      title: "Processing",
      description: "FOR AMNESTY request under validation",
      dateTime: "",
      status: "Current",
    },
    {
      step: 5,
      title: "Finalization",
      description: "FOR AMNESTY request approved",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Completed",
      description: "FOR AMNESTY request finalized",
      dateTime: "",
      status: "Pending",
    },
  ],

  // COFP Replacement
  CFPREP: [
    {
      step: 1,
      title: "Submission",
      description: "COFP REPLACEMENT request filed",
      dateTime: "2025-03-31 11:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Acknowledgment",
      description: "Request acknowledged by office",
      dateTime: "",
      status: "Done",
    },
    {
      step: 3,
      title: "Review",
      description: "COFP REPLACEMENT request under review",
      dateTime: "",
      status: "Done",
    },
    {
      step: 4,
      title: "Processing",
      description: "COFP REPLACEMENT request being processed",
      dateTime: "",
      status: "Current",
    },
    {
      step: 5,
      title: "Finalization",
      description: "COFP REPLACEMENT request ready for release",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Completed",
      description: "COFP REPLACEMENT request finalized",
      dateTime: "",
      status: "Pending",
    },
  ],

  // Credit Memo
  CM: [
    {
      step: 1,
      title: "Submission",
      description: "CREDIT MEMO request submitted",
      dateTime: "2025-03-31 11:30 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Acknowledgment",
      description: "Request acknowledged by office",
      dateTime: "",
      status: "Done",
    },
    {
      step: 3,
      title: "Review",
      description: "CREDIT MEMO request under review",
      dateTime: "",
      status: "Done",
    },
    {
      step: 4,
      title: "Processing",
      description: "CREDIT MEMO request under validation",
      dateTime: "",
      status: "Current",
    },
    {
      step: 5,
      title: "Finalization",
      description: "CREDIT MEMO request approved",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Completed",
      description: "CREDIT MEMO request closed",
      dateTime: "",
      status: "Pending",
    },
  ],

  // Memorial Service (MS) — full 10-step process flow
  MS: [
    {
      step: 1,
      title: "Booking / Retrieval Request",
      description:
        "Memorial service booked; retrieval request submitted by family",
      dateTime: "2026-06-15 08:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Confirmation by Chapel Personnel",
      description:
        "Chapel personnel contacted family and confirmed the retrieval request",
      dateTime: "2026-06-15 09:30 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Creation of Retrieval Ticket",
      description: "Retrieval trip ticket created and driver assigned",
      dateTime: "2026-06-15 10:00 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Arrival of Deceased",
      description: "Remains arrived at the chapel; driver timed-in",
      dateTime: "2026-06-15 12:30 PM",
      status: "Done",
    },
    {
      step: 5,
      title: "Creation of Embalming Ticket",
      description:
        "Embalming ticket created with family preferences and instructions",
      dateTime: "2026-06-15 01:00 PM",
      status: "Done",
    },
    {
      step: 6,
      title: "Contracting",
      description:
        "Service info finalized; memorial service contract details saved",
      dateTime: "2026-06-16 10:00 AM",
      status: "Current",
    },
    {
      step: 7,
      title: "Contracted",
      description: "Contract signed, printed, and viewing in progress",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 8,
      title: "Settlement before Interment",
      description:
        "Remaining charges reviewed and payment settled (2 days before interment)",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 9,
      title: "Interment",
      description:
        "On the day of interment; final rites and burial or cremation",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 10,
      title: "Service Ended",
      description: "Interment trip ticket created; memorial service concluded",
      dateTime: "",
      status: "Pending",
    },
  ],

  // Embalming — per-record journeys keyed by full ID so each reflects its actual status

  // "For Creation of Ticket" — request just came in, ticket not yet created
  "EMB-20260622-001": [
    {
      step: 1,
      title: "Request Received",
      description: "Embalming request filed and initial details recorded",
      dateTime: "2026-06-22 07:30 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Ticket Creation",
      description:
        "Embalming ticket being prepared with instructions and preferences",
      dateTime: "",
      status: "Current",
    },
    {
      step: 3,
      title: "Embalmer Assignment",
      description: "Licensed embalmer and assistant to be assigned",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 4,
      title: "Embalming In Progress",
      description: "Embalming procedure at the preparation room",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 5,
      title: "Embalming Completed",
      description: "Procedure finished; chemicals and outcome documented",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Supervisor Verification",
      description: "Supervisor inspects presentation quality and compliance",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Casketing",
      description: "Remains placed in selected casket with final grooming",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 8,
      title: "Ready For Viewing",
      description: "Preparation complete; chapel ready for family visitation",
      dateTime: "",
      status: "Pending",
    },
  ],

  // "In Progress" — embalmer assigned and actively working
  "EMB-20260622-002": [
    {
      step: 1,
      title: "Request Received",
      description: "Embalming request filed and initial details recorded",
      dateTime: "2026-06-21 08:15 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Ticket Created",
      description:
        "Embalming ticket assigned with instructions and preferences",
      dateTime: "2026-06-21 08:30 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Embalmer Assigned",
      description: "Miguel Garcia assigned; light cosmetics per family request",
      dateTime: "2026-06-21 08:45 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Embalming In Progress",
      description:
        "Procedure underway — natural look with light cosmetics only",
      dateTime: "2026-06-21 09:00 AM",
      status: "Current",
    },
    {
      step: 5,
      title: "Embalming Completed",
      description: "Procedure finished; chemicals and outcome documented",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Supervisor Verification",
      description: "Supervisor inspects presentation quality and compliance",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Casketing",
      description: "Remains placed in selected casket with final grooming",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 8,
      title: "Ready For Viewing",
      description: "Preparation complete; chapel ready for family visitation",
      dateTime: "",
      status: "Pending",
    },
  ],

  // "For Verification" — embalming done, awaiting supervisor sign-off
  "EMB-20260622-003": [
    {
      step: 1,
      title: "Request Received",
      description: "Embalming request filed and initial details recorded",
      dateTime: "2026-06-21 02:00 PM",
      status: "Done",
    },
    {
      step: 2,
      title: "Ticket Created",
      description:
        "Embalming ticket assigned — hair dye: dark brown per family",
      dateTime: "2026-06-21 02:20 PM",
      status: "Done",
    },
    {
      step: 3,
      title: "Embalmer Assigned",
      description: "Jose Reyes assigned to the case",
      dateTime: "2026-06-21 02:45 PM",
      status: "Done",
    },
    {
      step: 4,
      title: "Embalming In Progress",
      description: "Procedure started at preparation room",
      dateTime: "2026-06-21 03:00 PM",
      status: "Done",
    },
    {
      step: 5,
      title: "Embalming Completed",
      description:
        "Normal outcome; Standard Set B chemicals used; hair dye applied",
      dateTime: "2026-06-21 06:45 PM",
      status: "Done",
    },
    {
      step: 6,
      title: "Supervisor Verification",
      description: "Awaiting supervisor inspection of presentation quality",
      dateTime: "",
      status: "Current",
    },
    {
      step: 7,
      title: "Casketing",
      description: "Remains placed in selected casket with final grooming",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 8,
      title: "Ready For Viewing",
      description: "Preparation complete; chapel ready for family visitation",
      dateTime: "",
      status: "Pending",
    },
  ],

  // "Ready For Viewing" — fully completed, all steps done
  "EMB-20260622-004": [
    {
      step: 1,
      title: "Request Received",
      description: "Embalming request filed and initial details recorded",
      dateTime: "2026-06-20 09:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Ticket Created",
      description: "Embalming ticket assigned — autopsy case, handle with care",
      dateTime: "2026-06-20 09:15 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Embalmer Assigned",
      description: "Ricardo Santos assigned; Antonio Cruz assisting",
      dateTime: "2026-06-20 10:00 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Embalming In Progress",
      description: "Procedure started at preparation room",
      dateTime: "2026-06-20 10:30 AM",
      status: "Done",
    },
    {
      step: 5,
      title: "Embalming Completed",
      description:
        "Normal outcome; hand position adjusted due to autopsy incision",
      dateTime: "2026-06-20 02:12 PM",
      status: "Done",
    },
    {
      step: 6,
      title: "Supervisor Verification",
      description: "Passed — presentation acceptable, deviation justified",
      dateTime: "2026-06-20 03:00 PM",
      status: "Done",
    },
    {
      step: 7,
      title: "Casketing",
      description: "Remains placed in casket CSK-00451 with final grooming",
      dateTime: "2026-06-20 03:30 PM",
      status: "Done",
    },
    {
      step: 8,
      title: "Ready For Viewing",
      description: "Preparation complete; chapel ready for family visitation",
      dateTime: "2026-06-20 04:00 PM",
      status: "Done",
    },
  ],

  // "For Rework" — verification failed, sent back for correction
  "EMB-20260622-005": [
    {
      step: 1,
      title: "Request Received",
      description: "Embalming request filed and initial details recorded",
      dateTime: "2026-06-21 10:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Ticket Created",
      description:
        "Embalming ticket assigned with instructions and preferences",
      dateTime: "2026-06-21 10:15 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Embalmer Assigned",
      description: "Miguel Garcia assigned to the case",
      dateTime: "2026-06-21 10:45 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Embalming In Progress",
      description: "Procedure started at preparation room",
      dateTime: "2026-06-21 11:00 AM",
      status: "Done",
    },
    {
      step: 5,
      title: "Embalming Completed",
      description:
        "Completed with complications — minor discoloration on left hand",
      dateTime: "2026-06-21 02:00 PM",
      status: "Done",
    },
    {
      step: 6,
      title: "Supervisor Verification",
      description:
        "Failed — visible discoloration on left hand noted by Supervisor M. Lim",
      dateTime: "2026-06-21 02:30 PM",
      status: "Done",
    },
    {
      step: 7,
      title: "Rework — Cosmetic Correction",
      description:
        "Sent back for cosmetic correction on left hand discoloration",
      dateTime: "",
      status: "Current",
    },
    {
      step: 8,
      title: "Re-Verification",
      description: "Supervisor to re-inspect after rework is completed",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 9,
      title: "Casketing",
      description: "Remains placed in selected casket with final grooming",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 10,
      title: "Ready For Viewing",
      description: "Preparation complete; chapel ready for family visitation",
      dateTime: "",
      status: "Pending",
    },
  ],

  // Generic EMB fallback for any embalming ID not explicitly mapped
  EMB: [
    {
      step: 1,
      title: "Request Received",
      description: "Embalming request filed and initial details recorded",
      dateTime: "",
      status: "Done",
    },
    {
      step: 2,
      title: "Ticket Created",
      description:
        "Embalming ticket assigned with instructions and preferences",
      dateTime: "",
      status: "Current",
    },
    {
      step: 3,
      title: "Embalmer Assigned",
      description: "Licensed embalmer and assistant to be assigned",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 4,
      title: "Embalming In Progress",
      description: "Embalming procedure at the preparation room",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 5,
      title: "Embalming Completed",
      description: "Procedure finished; chemicals and outcome documented",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Supervisor Verification",
      description: "Supervisor inspects presentation quality and compliance",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Casketing",
      description: "Remains placed in selected casket with final grooming",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 8,
      title: "Ready For Viewing",
      description: "Preparation complete; chapel ready for family visitation",
      dateTime: "",
      status: "Pending",
    },
  ],

  // Same expansion for CSV, DATACORR, RI, ROP, SRI, TF (all follow fallbackJourney pattern)
  CSV: fallbackJourney,
  DATACORR: fallbackJourney,
  RI: [
    {
      step: 1,
      title: "Submission",
      description: "Reinstatement request filed by requester",
      dateTime: "2025-03-31 09:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Acknowledgment",
      description: "Request acknowledged by customer service",
      dateTime: "2025-03-31 09:10 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Eligibility Review",
      description: "Policy details reviewed for reinstatement eligibility",
      dateTime: "2025-03-31 09:20 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Payment Processing",
      description: "Reinstatement payment processed",
      dateTime: "2025-03-31 09:40 AM",
      status: "Current",
    },
    {
      step: 5,
      title: "Validation",
      description: "Final checks by underwriting",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Finalization",
      description: "Policy reinstated and ready for release",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Completion",
      description: "Reinstatement completed and requester notified",
      dateTime: "",
      status: "Pending",
    },
  ],

  // 🔹 Return of Premium (ROP)
  ROP: [
    {
      step: 1,
      title: "Submission",
      description: "Return of Premium request filed by requester",
      dateTime: "2025-03-31 10:00 AM",
      status: "Done",
    },
    {
      step: 2,
      title: "Acknowledgment",
      description: "Request acknowledged by office",
      dateTime: "2025-03-31 10:05 AM",
      status: "Done",
    },
    {
      step: 3,
      title: "Review",
      description: "Eligibility and contract details verified",
      dateTime: "2025-03-31 10:20 AM",
      status: "Done",
    },
    {
      step: 4,
      title: "Processing",
      description: "Return of Premium amount calculated",
      dateTime: "2025-03-31 10:40 AM",
      status: "Current",
    },
    {
      step: 5,
      title: "Validation",
      description: "Final validation checks completed",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 6,
      title: "Finalization",
      description: "Return of Premium approved for release",
      dateTime: "",
      status: "Pending",
    },
    {
      step: 7,
      title: "Completion",
      description: "Payment released and requester notified",
      dateTime: "",
      status: "Pending",
    },
  ],

  SRI: fallbackJourney,
  TF: fallbackJourney,
};

export interface JourneyMeta {
  name: string;
  transactionType: string;
}

export const journeyMeta: Record<string, JourneyMeta> = {
  RR: { name: "Juan Dela Cruz", transactionType: "Retrieval Request" },
  "TT-0001": {
    name: "Juan Dela Cruz",
    transactionType: "Trip Ticket — Retrieval",
  },
  "TT-0002": { name: "Maria Santos", transactionType: "Trip Ticket — Autopsy" },
  "TT-0003": {
    name: "Pedro Ramirez",
    transactionType: "Trip Ticket — Outside Viewing",
  },
  "TT-0004": {
    name: "Ana Lopez",
    transactionType: "Trip Ticket — Chapel Viewing",
  },
  "TT-0005": {
    name: "Roberto Lim",
    transactionType: "Trip Ticket — Interment",
  },
  "TT-0006": {
    name: "Carlos Bautista",
    transactionType: "Trip Ticket — Wake Visit",
  },
  "TT-0007": {
    name: "Luis Garcia",
    transactionType: "Trip Ticket — Inter-Chapel Transfer",
  },
  "TT-0008": {
    name: "N/A",
    transactionType: "Trip Ticket — Equipment Delivery",
  },
  "TT-0009": { name: "N/A", transactionType: "Trip Ticket — Refueling" },
  "TT-0010": { name: "N/A", transactionType: "Trip Ticket — Employee Pick-Up" },
  TT: { name: "N/A", transactionType: "Trip Ticket" },
  ACE: { name: "Maria Santos", transactionType: "St. Peter ACE" },
  AMNESTY: { name: "Pedro Ramirez", transactionType: "For Amnesty" },
  CFPREP: { name: "Ana Lopez", transactionType: "COFP Replacement" },
  CM: { name: "Roberto Lim", transactionType: "Credit Memo" },
  MS: { name: "Fernando Cruz", transactionType: "Memorial Service" },
  "EMB-20260622-001": { name: "Vicente Aquino", transactionType: "Embalming" },
  "EMB-20260622-002": { name: "Maricel Navarro", transactionType: "Embalming" },
  "EMB-20260622-003": { name: "Esteban Dizon", transactionType: "Embalming" },
  "EMB-20260622-004": { name: "Cecilia Tan", transactionType: "Embalming" },
  "EMB-20260622-005": { name: "Mario Santos", transactionType: "Embalming" },
  EMB: { name: "N/A", transactionType: "Embalming" },
  CSV: { name: "N/A", transactionType: "CSV Request" },
  DATACORR: { name: "N/A", transactionType: "Data Correction" },
  RI: { name: "N/A", transactionType: "Reinstatement" },
  ROP: { name: "N/A", transactionType: "Return of Premium" },
  SRI: { name: "N/A", transactionType: "SRI Request" },
  TF: { name: "N/A", transactionType: "Transfer Request" },
};

// 🔹 Helper: Always return a journey or fallback
export function getJourney(type: string): JourneyStep[] {
  const upper = type.toUpperCase();
  const prefix = type.split("-")[0].toUpperCase();
  return journeys[upper] || journeys[prefix] || fallbackJourney;
}

export function getJourneyMeta(type: string): JourneyMeta | null {
  const upper = type.toUpperCase();
  const prefix = type.split("-")[0].toUpperCase();
  return journeyMeta[upper] || journeyMeta[prefix] || null;
}
