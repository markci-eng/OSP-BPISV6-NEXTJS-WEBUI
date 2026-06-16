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

// 🔹 Helper: Always return a journey or fallback
export function getJourney(type: string): JourneyStep[] {
  return journeys[type] || fallbackJourney;
}
