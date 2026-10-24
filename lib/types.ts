export const STATUSES = ["Applied", "Followed up", "Interview", "Offer", "Rejected", "Closed"] as const;
export type Status = (typeof STATUSES)[number];

export const SOURCES = ["Email", "Indeed", "Naukri", "LinkedIn", "Company site", "Infopark", "Referral", "Other"] as const;

export const WORK_MODES = ["Remote", "Hybrid", "On-site"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export type Draft = {
  company: string;
  role: string;
  source: string;
  location: string;
  applied: string;
  status: Status;
  followUp: string;
  contact: string;
  link: string;
  notes: string;
  rejectReason: string;
  salary: string;
  workMode: string;
};

export type App = Draft & {
  id: string;
  createdAt: number;
  updatedAt: number;
};
