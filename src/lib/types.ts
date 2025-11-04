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

export type LeadOptions = {
    id: string;
    value: string;
}

export type LeadHistoryItem = {
  id: string;
  lead_id: string;
  created_at: string;
  created_by: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  field_name?: string;
  field_id?: string;
  message?: string;
};
