import { axiosClient } from "@/lib/axios-client";

export const getAnalytics = async () => {
  const response = await axiosClient.get(`/api/analytics`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch analytics");
  }

  return response.data;
};
