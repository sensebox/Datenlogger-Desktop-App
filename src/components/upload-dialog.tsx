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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { readCSVFile } from "@/lib/fs";
import { Device } from "@/types";
import { useAuth } from "./auth-provider";
import { useToast } from "./ui/use-toast";
import { invoke } from "@tauri-apps/api";

type UploadDialogProps = {
  filename: string;
  deviceId: string;
};

export function UploadDialog({ filename, deviceId }: UploadDialogProps) {
  const { toast } = useToast();

  const [open, setOpen] = useState<boolean>(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device>();

  const { signInResponse } = useAuth();

  useEffect(() => {
    const fetchDevices = async () => {
      const response = await fetch(
        "https://api.testing.opensensemap.org/users/me/boxes",
        {
          headers: {
            Authorization: `Bearer ${signInResponse?.token}`,
          },
        }
      );
      const devices = await response.json();
      setDevices(devices.data.boxes);
      setSelectedDevice(
        devices.data.boxes.find((device: Device) => device._id === deviceId)
      );
    };

    fetchDevices();
  }, []);

  const uploadFile = async (event: any) => {
    const csv = await readCSVFile(
      `.reedu/data/${selectedDevice?._id}/${filename}`
    );

    const response = await fetch(
      `https://api.testing.opensensemap.org/boxes/${deviceId}/data`,
      {
        method: "POST",
        headers: {
          Authorization: `${selectedDevice?.access_token}`,
          "content-type": "text/csv",
        },
        body: csv,
      }
    );
    const answer = await response.json();
    console.log(answer);

    if (answer.code === "BadRequest" || "UnprocessableEntity") {
      setOpen(false);
      toast({
        variant: "destructive",
        title: answer.code,
        description: answer.message,
        duration: 5000,
      });
    } else {
      await invoke("insert_data", {
        filename: filename,
        device: selectedDevice?._id,
        checksum: "",
      });

      toast({
        description: answer,
        duration: 5000,
      });

      event.preventDefault();
    }
  };

  const onValueChange = (deviceId: string) => {
    const device = devices.find((device) => device._id === deviceId);
    setSelectedDevice(device);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Upload measurements included in the selelected CSV to a device on
            openSenseMap.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={selectedDevice ? selectedDevice._id : ""}
            onValueChange={onValueChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Device" />
            </SelectTrigger>
            <SelectContent>
              {devices.length > 0 &&
                devices.map((device) => {
                  return (
                    <SelectItem key={device._id} value={device._id}>
                      {device.name} ({device._id})
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button disabled={selectedDevice === undefined} onClick={uploadFile}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
