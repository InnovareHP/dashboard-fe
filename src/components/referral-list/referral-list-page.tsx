import { referralCollection } from "@/collection/referral/referral-collection";
import { generateReferralColumns } from "@/components/referral-list/referral-list-column";
import ReusableTable from "@/components/reusable-table/reusable-table";
import type { ReferralRow } from "@/lib/types";
import { getReferral } from "@/services/referral/referral-service";
import { useLiveQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function ReferralListPage() {
  const { data: fullResponse } = useSuspenseQuery({
    queryKey: ["referrals-meta"],
    queryFn: getReferral,
  });

  const { data: rows } = useLiveQuery(referralCollection);
  const columns = generateReferralColumns(fullResponse.columns);

  const table = useReactTable({
    data: rows ?? [],
    columns: columns as ColumnDef<ReferralRow>[],
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAddNewReferral = async () => {
    try {
      const newReferral: ReferralRow = {
        id: uuidv4(),
        "Referral date": "",
        County: "",
        Facility: "",
        "Facility Type": "",
        Contact: "",
        Number: "",
        "Date of Birth": "",
        Status: "New Lead",
        CPAP: "N/A",
        "Length of Assessment": "N/A",
      };

      referralCollection.insert([newReferral]);
    } catch (error) {
      toast.error("Failed to add new lead.");
    }
  };

  const handleDeleteReferrals = async (columnIds: string[]) => {
    try {
      referralCollection.delete(columnIds);
    } catch (error) {
      toast.error("Failed to delete leads.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Referral List</h2>
      <ReusableTable
        table={table}
        columns={columns as ColumnDef<ReferralRow>[]}
        isFetchingList={false}
        setActivePage={() => {}}
        onAddNewLead={handleAddNewReferral}
        onDeleteLeads={handleDeleteReferrals}
        isReferral={true}
      />
    </div>
  );
}
