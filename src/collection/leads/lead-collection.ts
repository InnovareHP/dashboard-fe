import type { LeadRow } from "@/lib/types";
import { createLead, getLeads, updateLead } from "@/services/lead/lead-service";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const leadCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data } = await getLeads();
      return data;
    },
    getKey: (item: LeadRow) => item.id,
    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      await updateLead(
        (mutation.original as { id: string }).id,
        mutation.modified
      ); // Cast original to expected type
    },
    queryClient,
    onInsert: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      await createLead(mutation.modified);
    },
  })
);
