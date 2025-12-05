import { axiosClient } from "@/lib/axios-client";
import type { AnalyticsResponse } from "@/lib/types";

export const getAnalytics = async (
  start: string | null,
  end: string | null
) => {
  const response = await axiosClient.get(`/api/analytics`, {
    params: {
      start,
      end,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch analytics");
  }

  return response.data;
};

export const getAnalyticsSummary = async (analytics: AnalyticsResponse) => {
  const response = await axiosClient.get(`/api/analytics/summary`, {
    params: {
      analytics,    
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch analytics summary");
  }

  return response.data;
};
