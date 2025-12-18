import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload } from "lucide-react";
import { useState } from "react";

export default function MasterListImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [includeAnalytics, setIncludeAnalytics] = useState(false);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      // TODO: Implement master list import logic
      console.log("Uploading master list file:", file.name);
    }
  };

  const handleExport = (format: "csv" | "excel") => {
    // TODO: Implement master list export logic
    console.log("Exporting master list as", format);
    if (includeAnalytics) {
      console.log("Including analytics export (PDF) with date range:", analyticsDateRange);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master List</h1>
        <p className="text-muted-foreground">
          Import or export master list data from CSV or Excel files
        </p>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="import">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Select a file to import into the Master List. Supported formats: CSV, XLSX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV, XLSX (MAX. 10MB)</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {file && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Selected file:</p>
                  <p className="text-sm text-gray-600">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Master List
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Master List</CardTitle>
              <CardDescription>
                Download your master list data in CSV or Excel format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Download className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 text-center">
                  Export your master list data
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Available formats: CSV, XLSX
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-analytics"
                    checked={includeAnalytics}
                    onCheckedChange={(checked) => {
                      setIncludeAnalytics(checked as boolean);
                      if (!checked) {
                        setAnalyticsDateRange({ from: null, to: null });
                      }
                    }}
                  />
                  <Label
                    htmlFor="include-analytics"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include Analytics Export (PDF)
                  </Label>
                </div>

                {includeAnalytics && (
                  <div className="space-y-2 pl-6">
                    <Label className="text-sm text-muted-foreground">
                      Select date range for analytics
                    </Label>
                    <DateRangeFilter
                      from={analyticsDateRange.from}
                      to={analyticsDateRange.to}
                      onChange={(range) => {
                        setAnalyticsDateRange(range);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => handleExport("csv")}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </Button>
                <Button
                  onClick={() => handleExport("excel")}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export as Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

