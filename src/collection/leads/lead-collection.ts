import type { LeadHistoryItem } from "@/lib/types";
import {
  createLeadTimeline,
  getLeadTimeline,
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
