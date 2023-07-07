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
import LoadingOverlay from "./ui/LoadingOverlay";

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
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device>();
  const [selectedDeviceSecrets, setSelectedDeviceSecrets] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { signInResponse } = useAuth();

  useEffect(() => {
    const fetchDevices = async () => {
      const response = await fetch(
        "https://api.opensensemap.org/users/me/boxes",
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

  const fetchDeviceSecrets = async (deviceId: string) => {
    setLoading(true);
    const response = await fetch(
      `https://api.opensensemap.org/users/me/boxes/${deviceId}`,
      {
        headers: {
          Authorization: `Bearer ${signInResponse?.token}`,
        },
      }
    );
    const answer = await response.json();
    if (answer.code === "BadRequest" || answer.code === "UnprocessableEntity") {
      setOpen(false);
      toast({
        variant: "destructive",
        title: answer.code,
        description: answer.message,
        duration: 5000,
      });
    }

    setSelectedDeviceSecrets(answer.data);
    setLoading(false);
  };

  const uploadFile = async (event: any) => {
    setLoading(true);
    const csv = await readCSVFile(
      `.reedu/data/${selectedDevice?._id}/${filename}`
    );

    const response = await fetch(
      `https://api.opensensemap.org/boxes/${deviceId}/data`,
      {
        method: "POST",
        headers: {
          Authorization: `${selectedDeviceSecrets?.box.access_token}`,
          "content-type": "text/csv",
        },
        body: csv,
      }
    );
    const answer = await response.json();
    console.log(answer);

    if (answer.code === "BadRequest" || answer.code === "UnprocessableEntity") {
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
        duration: 5000,
      });
      await invoke("insert_data", {
        filename: filename,
        device: selectedDevice?._id,
        checksum: "",
      });
    }
    setLoading(false);
    setCounter((counter: number) => counter + 1);
    event.preventDefault();
  };

  const onValueChange = (deviceId: string) => {
    const device = devices.find((device) => device._id === deviceId);
    setSelectedDevice(device);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
        fetchDeviceSecrets(deviceId);
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

            {selectedDeviceSecrets.box && (
              <div className="flex flex-col">
                Your uploading the file {filename} to the device {deviceId}.
              </div>
            )}
            {!selectedDeviceSecrets.box && (
              <div className="flex flex-col">There has been an error</div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {selectedDeviceSecrets.box && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {selectedDeviceSecrets.box.name}
              </span>
              <span className="text-sm">
                The id of this box is: {selectedDeviceSecrets.box._id}
              </span>
              <span className="text-sm"></span>
              <span className="text-sm">
                The last measurement of this box was at:{" "}
                {selectedDeviceSecrets.box.lastMeasurementAt}
              </span>
              Are you sure you want to upload the file to this device?
            </div>
          )}
          {!selectedDeviceSecrets.box && (
            <div className="flex flex-col">
              There has been an error with getting the box credentials, does{" "}
              {deviceId} exist and are you the owner of it?
            </div>
          )}
          {/* <Select
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
          </Select> */}
        </div>
        <DialogFooter>
          <Button
            disabled={selectedDeviceSecrets === undefined}
            onClick={uploadFile}
          >
            Upload
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
