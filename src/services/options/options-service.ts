import { axiosClient } from "@/lib/axios-client";
import type { OptionsResponse } from "@/lib/types";

export const getOptionsCounties = async () => {
  const response = await axiosClient.get(`/api/options/counties`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch counties");
  }

  return response.data as OptionsResponse[];
};

export const getLiaisons = async (isLiaison: boolean) => {
  const response = await axiosClient.get(`/api/options/members`, {
    params: {
      isLiaison,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch liaisons");
  }

  return response.data as OptionsResponse[];
};
