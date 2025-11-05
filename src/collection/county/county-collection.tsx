import type { CountyRow } from "@/lib/types";
import {
  createCounty,
  deleteCounty,
  getCounties,
} from "@/services/referral/referral-service";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const countyCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["counties"],
    queryFn: async () => {
      const response = await getCounties();

      return response;
    },
    getKey: (item: CountyRow) => item.id,
    queryClient,
    onInsert: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      await createCounty(mutation.modified);
    },
    onDelete: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      await deleteCounty(mutation.key);
    },
  })
);
