import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function StatusSelect({
  val,
  handleUpdate,
}: {
  val?: string;
  handleUpdate: (v: string, reason?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(val || "New Lead");
  const [reason, setReason] = useState("");

  const handleStatusChange = (v: string) => {
    setSelectedStatus(v);

    // Only ask for a reason if it's not "New Lead"
    if (v) {
      setOpen(true);
    } else {
      handleUpdate(v);
    }
  };

  const handleConfirm = () => {
    handleUpdate(selectedStatus, reason);
    setReason("");
    setOpen(false);
  };

  return (
    <>
      <Select value={selectedStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px] text-sm">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="New Lead">New Lead</SelectItem>
          <SelectItem value="Contacted">Contacted</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason for {selectedStatus}</DialogTitle>
          </DialogHeader>

          <Input
            placeholder={`Enter reason for ${selectedStatus.toLowerCase()}...`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!reason.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
