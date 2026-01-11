import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useRef, useState } from "react";
import Autocomplete from "react-google-autocomplete";

type LocationCellProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const LocationCell: React.FC<LocationCellProps> = ({
  value = "",
  onChange,
}) => {
  const [address, setAddress] = useState(value);
  const lastConfirmedValue = useRef(value);

  const [openConfirm, setOpenConfirm] = useState(false);
  const pendingClear = useRef(false);

  useEffect(() => {
    setAddress(value);
    lastConfirmedValue.current = value;
  }, [value]);

  return (
    <>
      <Autocomplete
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        placeholder="Search for an address..."
        value={address}
        options={{
          types: ["geocode"],
          componentRestrictions: { country: "us" },
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = e.target.value;

          // Attempt to clear
          if (newValue === "") {
            pendingClear.current = true;
            setOpenConfirm(true);
            return;
          }

          setAddress(newValue);
        }}
        onPlaceSelected={(place) => {
          if (!place?.formatted_address) return;

          const finalAddress = place.formatted_address;
          setAddress(finalAddress);
          lastConfirmedValue.current = finalAddress;
          onChange?.(finalAddress);
        }}
        className="w-96 border px-3 py-2 rounded"
      />

      {/* 🔔 CONFIRM DELETE DIALOG */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete address?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this address? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                // Cancel delete
                setAddress(lastConfirmedValue.current);
                pendingClear.current = false;
                setOpenConfirm(false);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                // Confirm delete
                setAddress("");
                lastConfirmedValue.current = "";
                pendingClear.current = false;
                setOpenConfirm(false);
                onChange?.("");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationCell;
