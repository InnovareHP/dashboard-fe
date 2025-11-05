import { axiosClient } from "@/lib/axios-client";
import type { OptionsResponse } from "@/lib/types";

export const getOptionsCounties = async () => {
  const response = await axiosClient.get(`/api/options/counties`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch counties");
  }

  return response.data as OptionsResponse[];
};
