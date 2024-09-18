import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CloudIcon, FileText, Calendar, List, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { readCSVFile } from "@/lib/fs";
import { useToast } from "./ui/use-toast";
import { invoke } from "@tauri-apps/api";
import LoadingOverlay from "./ui/LoadingOverlay";
import storage from "@/lib/local-storage";
import { FileOverview } from "./ui/file-overview";
import { extractDatesFromCSV } from "@/lib/helpers/extractDatesFromCSV";

type UploadDialogProps = {
  filename: string;
  deviceId: string;
  setCounter?: any;
  disabled?: boolean;
};
type FileStats = {
  firstDate: string;
  lastDate: string;
};

export function UploadDialog({
  filename,
  deviceId,
  setCounter,
  disabled,
}: UploadDialogProps) {
  const { toast } = useToast();

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [file, setFile] = useState<FileStats>({
    firstDate: "",
    lastDate: "",
  });

  useEffect(() => {
    if (storage.get(`accessToken_${deviceId}`) === undefined) return;
    setToken(storage.get(`accessToken_${deviceId}`));
  }, [deviceId]);

  useEffect(() => {
    // Simulate reading file stats (line count, first date)
    const getFileStats = async () => {
      const csvContent = await readCSVFile(
        `.reedu/data/${deviceId}/${filename}`
      );
      const lines = csvContent.split("\n").length;
      const { firstDate, lastDate } = extractDatesFromCSV(csvContent);

      // @ts-ignore
      setFile({ lines, firstDate, lastDate, deviceId: deviceId, filename });
    };

    if (open) getFileStats();
  }, [open, deviceId, filename]);

  const uploadFile = async (event: any) => {
    setLoading(true);
    const csv = await readCSVFile(`.reedu/data/${deviceId}/${filename}`);
    const response = await fetch(
      `https://api.opensensemap.org/boxes/${deviceId}/data`,
      {
        method: "POST",
        headers: {
          Authorization: `${token}`,
          "content-type": "text/csv",
        },
        body: csv,
      }
    );
    const answer = await response.json();

    if (
      answer.code === "BadRequest" ||
      answer.code === "UnprocessableEntity" ||
      answer.code === "Unauthorized" ||
      answer.code === "Forbidden" ||
      answer.code === "NotFound"
    ) {
      setOpen(false);
      toast({
        variant: "destructive",
        title: answer.code,
        description: answer.message,
        duration: 5000,
      });
    } else {
      toast({
        title: "Upload Successful",
        description: "Your file has been uploaded successfully.",
        duration: 1000,
      });
      await invoke("insert_data", {
        filename: filename,
        device: deviceId,
        checksum: "",
      });
    }
    setLoading(false);
    setCounter((counter: number) => counter + 1);
    event.preventDefault();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors"
          disabled={disabled}
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-gray-50 rounded-lg p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-800">
            Upload CSV File
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Review the file information before uploading.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <div className="flex justify-center items-center text-blue-500">
              Loading...
            </div>
          ) : (
            <FileOverview file={file} />
          )}
        </div>
        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button
            onClick={() => setOpen(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md shadow-md transition-colors"
          >
            Cancel
          </Button>
          <Button
            disabled={!deviceId || !token || loading}
            onClick={uploadFile}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition-colors"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
      {loading && <LoadingOverlay />}
    </Dialog>
  );
}
