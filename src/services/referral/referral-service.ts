import { axiosClient } from "@/lib/axios-client";
import type { CountyRow, LeadOptions, ReferralHistoryItem } from "@/lib/types";

export const getReferral = async () => {
  const response = await axiosClient.get("/api/referral");

  if (response.status !== 200) {
    throw new Error("Failed to fetch referrals");
  }

  return response.data;
};

export const getReferralColumnOptions = async () => {
  const response = await axiosClient.get("/api/referral/options");

  if (response.status !== 200) {
    throw new Error("Failed to fetch referrals meta");
  }

  return response.data;
};

export const getReferralDropdownOptions = async (fieldKey: string) => {
  const response = await axiosClient.get(
    `/api/referral/field/${fieldKey}/options`
  );

  if (response.status !== 200) {
    throw new Error("Failed to fetch referrals dropdown options");
  }

  return response.data as LeadOptions[];
};

export const createReferralDropdownOption = async (
  fieldKey: string,
  option: string
) => {
  const response = await axiosClient.post(
    `/api/referral/field/${fieldKey}/options`,
    {
      option_name: option,
    }
  );

  return response.data;
};

export const updateReferral = async (
  referralId: string,
  fieldId: string,
  value: string,
  reason: string | undefined
) => {
  const response = await axiosClient.patch(`/api/referral/${referralId}`, {
    value,
    fieldId,
    reason,
  });

  if (response.status !== 200) {
    throw new Error("Failed to update referral");
  }

  return response.data;
};

export const createReferral = async (data: any) => {
  const response = await axiosClient.post("/api/referral", {
    data,
  });

  return response.data;
};

export const createReferralColumn = async (
  referral_type: string,
  column_name: string
) => {
  const response = await axiosClient.post("/api/referral/column", {
    referral_type,
    column_name,
  });

  return response.data;
};

export const deleteReferralColumn = async (columnIds: string[]) => {
  const response = await axiosClient.delete(`/api/referral`, {
    data: {
      column_ids: columnIds,
    },
  });

  return response.data;
};

export const getReferralTimeline = async (referralId: string) => {
  const response = await axiosClient.get(
    `/api/referral/timeline/${referralId}`
  );

  if (response.status !== 200) {
    throw new Error("Failed to fetch referral timeline");
  }

  return response.data;
};

export const createReferralTimeline = async (
  referralId: string,
  data: ReferralHistoryItem
) => {
  const response = await axiosClient.post(
    `/api/referral/timeline/${referralId}`,
    {
      ...data,
    }
  );

  return response.data;
};

export const editReferralTimeline = async (id: string) => {
  const response = await axiosClient.patch(`/api/referral/timeline/${id}`);

  if (response.status !== 200) {
    throw new Error("Failed to edit referral timeline");
  }

  return response.data;
};

export const deleteReferralTimeline = async (id: string) => {
  const response = await axiosClient.delete(`/api/referral/timeline/${id}`);

  if (response.status !== 200) {
    throw new Error("Failed to delete referral timeline");
  }

  return response.data;
};

export const getCounties = async () => {
  const response = await axiosClient.get("/api/referral/county/configuration");

  if (response.status !== 200) {
    throw new Error("Failed to fetch referral counties");
  }

  return response.data;
};

export const createCounty = async (data: CountyRow) => {
  const response = await axiosClient.post("/api/referral/county/assignment", {
    ...data,
  });

  return response.data;
};

export const deleteCounty = async (id: string) => {
  const response = await axiosClient.delete(
    `/api/referral/county/assignment/${id}`
  );

  if (response.status !== 200) {
    throw new Error("Failed to delete county");
  }

  return response.data;
};
