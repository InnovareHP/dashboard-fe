import { axiosClient } from "@/lib/axios-client";
import type { LeadHistoryItem } from "@/lib/types";

export const getLeads = async () => {
  const response = await axiosClient.get("/api/leads");

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

  return response.data;
};

export const getLeadTimeline = async (leadId: string) => {
  const response = await axiosClient.get(`/api/leads/timeline/${leadId}`);

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
    data,
  });

  if (response.status !== 200) {
    throw new Error("Failed to create lead timeline");
  }

  return response.data;
};
