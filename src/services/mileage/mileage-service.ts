import { axiosClient } from "@/lib/axios-client";
import type { MileageLogRow } from "@/lib/types";

export const getMileageLogs = async (filters?: any) => {
  const response = await axiosClient.get("/api/liason/mileage", {
    params: {
      ...filters,
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch mileage logs");
  }

  return response.data as {
    data: MileageLogRow[];
    total: number;
  };
};

export const createMileageLog = async (data: any) => {
  const response = await axiosClient.post("/api/liason/mileage", {
    ...data,
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error("Failed to create mileage log");
  }

  return response.data;
};

export const updateMileageLog = async (id: string, data: any) => {
  const response = await axiosClient.patch(`/api/liason/mileage/${id}`, {
    ...data,
  });

  if (response.status !== 200) {
    throw new Error("Failed to update mileage log");
  }

  return response.data;
};

export const deleteMileageLog = async (id: string) => {
  const response = await axiosClient.delete(`/api/liason/mileage/${id}`);

  if (response.status !== 200) {
    throw new Error("Failed to delete mileage log");
  }

  return response.data;
};
