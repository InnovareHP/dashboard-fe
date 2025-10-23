"use client";

import { leadCollection } from "@/collection/leads/lead-collection";
import { generateLeadColumns } from "@/components/master-list/master-list-column";
import ReusableTable from "@/components/reusable-table/reusable-table";
import type { LeadRow } from "@/lib/types";
import { getLeads } from "@/services/lead/lead-service";
import { useLiveQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function MasterListPage() {
  const { data: fullResponse } = useSuspenseQuery({
    queryKey: ["leads-meta"],
    queryFn: getLeads,
  });

  const { data: rows } = useLiveQuery(leadCollection);
  const columns = generateLeadColumns(fullResponse.columns);

  const table = useReactTable({
    data: rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAddNewLead = async () => {
    try {
      const newLead: LeadRow = {
        id: uuidv4(),
        lead_name: "",
        status: "",
        activities_time: 0,
        create_contact: "",
        company: "",
        title: "",
        email: "",
        phone: "",
        last_interaction: "",
        active_sequences: 0,
      };

      leadCollection.insert([newLead]);
    } catch (error) {
      toast.error("Failed to add new lead.");
    }
  };

  const handleDeleteLeads = async (columnIds: string[]) => {
    try {
      leadCollection.delete(columnIds);
    } catch (error) {
      toast.error("Failed to delete leads.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Lead Master List</h2>
      <ReusableTable
        table={table}
        columns={columns}
        isFetchingList={false}
        setActivePage={() => {}}
        onAddNewLead={handleAddNewLead}
        onDeleteLeads={handleDeleteLeads}
      />
    </div>
  );
}
