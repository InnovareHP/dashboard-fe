import { axiosClient } from "@/lib/axios-client";
import type { LeadHistoryItem, LeadOptions } from "@/lib/types";

export const getLeads = async (filters: any) => {
  const response = await axiosClient.get("/api/leads", {
    params: { ...filters, filter: JSON.stringify(filters.filter) },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch leads");
  }

  return response.data;
};

export const getColumnOptions = async () => {
  const response = await axiosClient.get("/api/leads/options");

  if (response.status !== 200) {
    throw new Error("Failed to fetch leads meta");
  }

  return response.data;
};

export const getDropdownOptions = async (fieldKey: string) => {
  const response = await axiosClient.get(
    `/api/leads/field/${fieldKey}/options`
  );

  if (response.status !== 200) {
    throw new Error("Failed to fetch dropdown options");
  }

  return response.data as LeadOptions[];
};

export const createDropdownOption = async (
  fieldKey: string,
  option: string
) => {
  const response = await axiosClient.post(
    `/api/leads/field/${fieldKey}/options`,
    {
      option_name: option,
    }
  );

  return response.data;
};

export const getSpecificLead = async (leadId: string) => {
  const response = await axiosClient.get(`/api/leads/${leadId}`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch specific lead");
  }

  return response.data;
};

export const updateLead = async (
  leadId: string,
  fieldId: string,
  value: string
) => {
  const response = await axiosClient.patch(`/api/leads/${leadId}`, {
    value,
    field_id: fieldId,
  });

  if (response.status !== 200) {
    throw new Error("Failed to update lead");
  }

  return response.data;
};

export const createLead = async (data: any) => {
  const response = await axiosClient.post("/api/leads", {
    data,
  });

  return response.data;
};

export const createColumn = async (lead_type: string, column_name: string) => {
  const response = await axiosClient.post("/api/leads/column", {
    lead_type,
    column_name,
  });

  return response.data;
};

export const deleteLead = async (columnIds: string[]) => {
  const response = await axiosClient.delete(`/api/leads`, {
    data: {
      column_ids: columnIds,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to delete leads");
  }

  return response.data;
};

export const getLeadTimeline = async (
  leadId: string,
  limit: number,
  page: number
) => {
  const response = await axiosClient.get(
    `/api/leads/timeline/${leadId}?take=${limit}&page=${page}`
  );

  if (response.status !== 200) {
    throw new Error("Failed to fetch lead timeline");
  }

  return response.data;
};

export const createLeadTimeline = async (
  leadId: string,
  data: LeadHistoryItem
) => {
  const response = await axiosClient.post(`/api/leads/timeline/${leadId}`, {
    ...data,
  });

  return response.data;
};

export const editLeadTimeline = async (id: string) => {
  const response = await axiosClient.patch(`/api/leads/timeline/${id}`);

  if (response.status !== 200) {
    throw new Error("Failed to edit lead timeline");
  }

  return response.data;
};

export const deleteLeadTimeline = async (id: string) => {
  const response = await axiosClient.delete(`/api/leads/timeline/${id}`);

  if (response.status !== 200) {
    throw new Error("Failed to delete lead timeline");
  }

  return response.data;
};
