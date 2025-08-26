import type { FormValues } from "@/components/onboarding/onboarding";
import { axiosClient } from "@/lib/axios-client";

export const onboardUser = async (data: FormValues) => {
  const response = await axiosClient.post("/api/user/onboarding", data);

  if (response.status !== 200) {
    throw new Error("Failed to onboard user");
  }

  return response.data;
};
