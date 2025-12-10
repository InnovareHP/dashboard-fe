import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMileageLog, deleteMileageLog, getMileageLogs } from "@/services/mileage/mileage-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v3";

// Define MileageRateType enum
export const MileageRateType = ["STANDARD", "CUSTOM", "IRS_RATE"] as const;

// Create the schema
export const CreateMillageSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  countiesMarketed: z.string().min(1, "Counties marketed is required"),
  beginningMileage: z.number().min(0, "Beginning mileage must be 0 or greater"),
  endingMileage: z.number().min(0, "Ending mileage must be 0 or greater"),
  totalMiles: z.number().min(0, "Total miles must be 0 or greater"),
  rateType: z.enum(MileageRateType, {
    required_error: "Rate type is required",
  }),
  ratePerMile: z.number().min(0, "Rate per mile must be 0 or greater"),
  reimbursementAmount: z.number().min(0, "Reimbursement amount must be 0 or greater"),
});

type CreateMileageFormValues = z.infer<typeof CreateMillageSchema>;

const MileageLogPage = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // useQuery for fetching mileage logs
  const { data: mileageLogs, isLoading } = useQuery({
    queryKey: ["mileage-logs"],
    queryFn: getMileageLogs,
  });

  // useMutation for creating mileage log
  const createMileageMutation = useMutation({
    mutationFn: createMileageLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mileage-logs"] });
      toast.success("Mileage log created successfully!");
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to create mileage log");
    },
  });

  // useMutation for deleting mileage log
  const deleteMileageMutation = useMutation({
    mutationFn: deleteMileageLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mileage-logs"] });
      toast.success("Mileage log deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete mileage log");
    },
  });

  const form = useForm<CreateMileageFormValues>({
    resolver: zodResolver(CreateMillageSchema),
    defaultValues: {
      destination: "",
      countiesMarketed: "",
      beginningMileage: 0,
      endingMileage: 0,
      totalMiles: 0,
      rateType: undefined,
      ratePerMile: 0,
      reimbursementAmount: 0,
    },
  });

  const onSubmit = (values: CreateMileageFormValues) => {
    createMileageMutation.mutate(values);
  };

  const handleDelete = (id: string) => {
    deleteMileageMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mileage Log</h1>
            <p className="text-gray-600 mt-1">
              Track and manage your mileage expenses
            </p>
          </div>
          {mileageLogs && Array.isArray(mileageLogs) && (
            <Badge variant="outline" className="text-lg py-2 px-4">
              {mileageLogs.length} {mileageLogs.length === 1 ? "Entry" : "Entries"}
            </Badge>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Create New Mileage Entry</CardTitle>
                    <CardDescription>
                      Click to add a new mileage log entry
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Mileage Entry</DialogTitle>
              <DialogDescription>
                Fill in the details for your mileage log entry
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Destination */}
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter destination" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Counties Marketed */}
                  <FormField
                    control={form.control}
                    name="countiesMarketed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Counties Marketed</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter counties" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Beginning Mileage */}
                  <FormField
                    control={form.control}
                    name="beginningMileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beginning Mileage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ending Mileage */}
                  <FormField
                    control={form.control}
                    name="endingMileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ending Mileage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Total Miles */}
                  <FormField
                    control={form.control}
                    name="totalMiles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Miles</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Rate Type */}
                <FormField
                  control={form.control}
                  name="rateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rate type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MileageRateType.map((rate) => (
                            <SelectItem key={rate} value={rate}>
                              {rate.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rate Per Mile */}
                  <FormField
                    control={form.control}
                    name="ratePerMile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Per Mile</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reimbursement Amount */}
                  <FormField
                    control={form.control}
                    name="reimbursementAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reimbursement Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createMileageMutation.isPending}
                  >
                    {createMileageMutation.isPending ? "Creating..." : "Create Entry"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Mileage Logs Table */}
        <Card className="overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading mileage logs...
              </div>
            ) : mileageLogs && Array.isArray(mileageLogs) && mileageLogs.length > 0 ? (
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Destination</th>
                    <th className="px-4 py-3 text-left font-semibold">Counties Marketed</th>
                    <th className="px-4 py-3 text-left font-semibold">Beginning</th>
                    <th className="px-4 py-3 text-left font-semibold">Ending</th>
                    <th className="px-4 py-3 text-left font-semibold">Total Miles</th>
                    <th className="px-4 py-3 text-left font-semibold">Rate Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Rate/Mile</th>
                    <th className="px-4 py-3 text-left font-semibold">Reimbursement</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mileageLogs.map((log: any) => (
                    <tr
                      key={log.id}
                      className="border-b bg-white hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">{log.destination || "—"}</td>
                      <td className="px-4 py-3">{log.countiesMarketed || "—"}</td>
                      <td className="px-4 py-3">{log.beginningMileage ?? "—"}</td>
                      <td className="px-4 py-3">{log.endingMileage ?? "—"}</td>
                      <td className="px-4 py-3">{log.totalMiles ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {log.rateType?.replace("_", " ") || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        ${log.ratePerMile?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ${log.reimbursementAmount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(log.id)}
                          className="text-gray-400 hover:text-red-500"
                          disabled={deleteMileageMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center text-gray-500 text-sm">
                No mileage logs found. Click the card above to create your first entry.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MileageLogPage;
