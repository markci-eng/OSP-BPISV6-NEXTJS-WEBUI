// Change or Add by: JLO 2026-05-16

export interface ReferralHistoryItem {
  id: string;
  dateSent: string;
  sendTo: string;
  channel: string;
  startDate: string;
  endDate: string;
}

export const REFERRAL_CODE = "BALD8627";

export const REFERRAL_LINK = `https://online.stpeter.com.ph/Account/Referral?referralcode=${REFERRAL_CODE}`;

export const REFERRAL_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
  REFERRAL_LINK,
)}`;

export const REFERRAL_HISTORY: ReferralHistoryItem[] = [
  {
    id: "1",
    dateSent: "2026-05-10",
    sendTo: "juan.delacruz@gmail.com",
    channel: "Email",
    startDate: "2026-05-10",
    endDate: "2026-06-10",
  },
  {
    id: "2",
    dateSent: "2026-05-08",
    sendTo: "0917 123 4567",
    channel: "SMS",
    startDate: "2026-05-08",
    endDate: "2026-06-08",
  },
  {
    id: "3",
    dateSent: "2026-05-05",
    sendTo: "maria.santos@yahoo.com",
    channel: "Email",
    startDate: "2026-05-05",
    endDate: "2026-06-05",
  },
  {
    id: "4",
    dateSent: "2026-05-02",
    sendTo: "Facebook",
    channel: "Social",
    startDate: "2026-05-02",
    endDate: "2026-06-02",
  },
  {
    id: "5",
    dateSent: "2026-04-28",
    sendTo: "0928 765 4321",
    channel: "SMS",
    startDate: "2026-04-28",
    endDate: "2026-05-28",
  },
];
