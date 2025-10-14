export type LeadRow = {
  id: string;
  lead_name: string;
  status: string;
  activities_time: number;
  create_contact: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  last_interaction: string;
  active_sequences: number;
  [key: string]: string | number;
};

export type ColumnsType = {
  id: string;
  name: string;
  type: string;
};
