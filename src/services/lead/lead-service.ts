import { axiosClient } from "@/lib/axios-client";
import type { ColumnsType, LeadRow } from "@/lib/types";

export const getLeads = async () => {
  const response = await axiosClient.get("/api/leads");

  if (response.status !== 200) {
    throw new Error("Failed to fetch leads");
  }

  return response.data as {
    data: LeadRow[];
    columns: ColumnsType[];
  };
};

export const updateLead = async (leadId: string, data: any) => {
  const response = await axiosClient.patch(`/api/leads/${leadId}`, {
    data,
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
