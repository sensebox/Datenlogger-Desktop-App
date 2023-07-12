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
import { FileUp } from "lucide-react";
import { useEffect, useState } from "react";
import { readCSVFile } from "@/lib/fs";
import { useToast } from "./ui/use-toast";
import { invoke } from "@tauri-apps/api";
import LoadingOverlay from "./ui/LoadingOverlay";
import storage from "@/lib/local-storage";

type UploadDialogProps = {
  filename: string;
  deviceId: string;
  setCounter: any;
};

export function UploadDialog({
  filename,
  deviceId,
  setCounter,
}: UploadDialogProps) {
  const { toast } = useToast();

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (storage.get(`accessToken_${deviceId}`) === undefined) return;
    setToken(storage.get(`accessToken_${deviceId}`));
  }, [deviceId]);

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
    // if answer code is anything but ok

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
        title: answer,
        description: answer,
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
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload CSV</DialogTitle>
          <DialogDescription>
            {loading && <div> Loading ... </div>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading && <div> Loading ... </div>}
          <div className="flex flex-col">
            Your uploading the file {filename} to the device {deviceId}.
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={deviceId === undefined && token === undefined}
            onClick={uploadFile}
          >
            {deviceId === undefined && token === undefined
              ? "No token"
              : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
      {loading ? (
        <div>
          <LoadingOverlay></LoadingOverlay>
        </div>
      ) : null}
    </Dialog>
  );
}
