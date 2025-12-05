import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Loader2, MapPlus } from "lucide-react";
import React, { useState } from "react";
import { Skeleton } from "../ui/skeleton";

type LocationCellProps = {
  value?: string;
  onChange?: (value: string) => Promise<void> | void;
};

const GOOGLE_MAP_LIBRARIES = ["places"] as const;

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const LocationCell: React.FC<LocationCellProps> = ({
  value = "",
  onChange,
}) => {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [_, setMap] = useState<google.maps.Map | null>(null);
  const [address, setAddress] = useState(value.replace(/^"|"$/g, ""));
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [isChanging, setIsChanging] = useState(false);

  // ✅ FIXED — libraries array is now stable
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
    libraries: [...GOOGLE_MAP_LIBRARIES],
  });

  const handlePlaceChanged = async () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const newAddress = (place.formatted_address || "").replace(/^"|"$/g, "");

    setIsChanging(true);
    try {
      setAddress(newAddress);
      setMarkerPosition({ lat, lng });
      await onChange?.(newAddress);
    } finally {
      setIsChanging(false);
    }
  };

  const handleDragMarker = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarkerPosition({ lat, lng });
    setIsChanging(true);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, async (results, status) => {
      if (status === "OK" && results && results[0]) {
        const newAddress = results[0].formatted_address.replace(/^"|"$/g, "");
        setAddress(newAddress);
        try {
          await onChange?.(newAddress);
        } finally {
          setIsChanging(false);
        }
      } else {
        setIsChanging(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-2 w-full relative">
      {isLoaded ? (
        <>
          <Autocomplete
            onLoad={(a) => setAutocomplete(a)}
            onPlaceChanged={handlePlaceChanged}
          >
            <div className="relative w-96">
              <Input
                placeholder="Enter address..."
                value={address}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/^"|"$/g, "");
                  setAddress(cleanValue);
                }}
                disabled={isChanging}
                className="pr-8 w-full"
              />

              {isChanging && (
                <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </Autocomplete>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Pin on map"
                disabled={isChanging}
                className="absolute right-0 top-0"
              >
                <MapPlus className="w-4 h-4" />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
              <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <GoogleMap
                  mapContainerStyle={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "0.5rem",
                  }}
                  center={markerPosition}
                  zoom={12}
                  onLoad={(mapInstance) => setMap(mapInstance)}
                >
                  <Marker
                    position={markerPosition}
                    draggable
                    onDragEnd={handleDragMarker}
                  />
                </GoogleMap>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Skeleton className="h-[40px] w-[200px] rounded-md" />
      )}
    </div>
  );
};

export default LocationCell;
