import type { LeadHistoryItem, LeadRow } from "@/lib/types";
import {
    createLead,
    createLeadTimeline,
    deleteLead,
    getLeads,
    getLeadTimeline,
    updateLead,
} from "@/services/lead/lead-service";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

/**
 * Lead Collection using TanStack DB
 * - Only stores `data` (rows).
 * - Fetch `columns` separately with React Query.
 */
export const leadCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await getLeads();

      return response.data;
    },
    getKey: (item: LeadRow) => item.id,
    queryClient,
    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      await updateLead(
        mutation.modified.id as string,
        mutation.modified.field_id as string,
        mutation.modified.value as string
      );
    },
    onInsert: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      await createLead(mutation.modified);
    },

    onDelete: async ({ transaction }) => {
      const mutation = transaction.mutations;
      await deleteLead(mutation.map((m) => m.modified.id as string));
    },
  })
);

export const leadTimelineCollection = createCollection(
  queryCollectionOptions({
    queryKey: ["lead-timeline"],
    queryFn: async ({ queryKey }: { queryKey: string[] }) => {
      const leadId = queryKey[1];
      const response = await getLeadTimeline(leadId);
      return response.data;
    },
    getKey: (item: LeadHistoryItem) => item.id,
    queryClient,
    onInsert: async ({ transaction }) => {
      const mutation = transaction.mutations[0];
      await createLeadTimeline(
        mutation.modified.id as string,
        mutation.modified
      );
    },
  })
);
