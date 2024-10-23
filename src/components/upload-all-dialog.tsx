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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FileOverview } from "./ui/file-overview";
import { FileStats } from "@/types";
import { extractDatesFromCSV } from "@/lib/helpers/extractDatesFromCSV";
import { useAuth } from "./auth-provider";
import { useFileStore } from "@/lib/store/files";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function UploadAllDialog({
  deviceId,
  disabled,
}: {
  deviceId: any;
  disabled: boolean;
}) {
  const { toast } = useToast();
  const { signInResponse } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [uploadCount, setUploadCount] = useState<number>(0);
  const [data, setData] = useState<FileStats[]>([]);
  const [boxInAccount, setBoxInAccount] = useState<boolean>(false);

  const { files } = useFileStore();
  useEffect(() => {
    if (storage.get(`accessToken_${deviceId}`) === undefined) return;
    setToken(storage.get(`accessToken_${deviceId}`));
  }, [deviceId]);

  useEffect(() => {
    // Simulate reading file stats (line count, first date)
    const getFileStats = async () => {
      const stats: FileStats[] = [];
      files.map(async (file: any) => {
        // if the file is not on the device, skip it
        if (file.status !== "synced") return;
        const csvContent = await readCSVFile(
          `.reedu/data/${deviceId}/${file.filename}`
        );
        const lines = csvContent.split("\n").length;
        const { firstDate, lastDate } = extractDatesFromCSV(csvContent);
        stats.push({
          deviceId,
          filename: file.filename,
          lines,
          firstDate,
          lastDate,
        });
      });
      setData(stats);
    };

    getFileStats();
    const loginResponse: any = storage.get("auth");
    if (!loginResponse) return;
    const boxes = loginResponse.data.user.boxes;
    if (boxes.includes(deviceId)) {
      setBoxInAccount(true);
    }
  }, [files]);

  const initiateUploadAll = async () => {
    try {
      setLoading(true);
      setUploadCount(0);

      for (let i = 0; i < data.length; i++) {
        // Starte den Upload und den Timer gleichzeitig
        await Promise.all([
          uploadFile(data[i].filename), // Upload der Datei
          new Promise((resolve) => setTimeout(resolve, 1000)), // Mindestwartezeit von 1 Sekunde
        ]);

        setUploadCount((prev) => prev + 1); // Aktualisieren des Fortschritts
      }

      setLoading(false);
      setOpen(false);
      toast({
        variant: "success",
        description: "Die Dateien wurden erfolgreich hochgeladen.",
        duration: 1000,
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
      setOpen(false);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "An error occurred while uploading the files: " + error,
        duration: 5000,
      });
    }
  };

  const uploadFile = async (filename: any) => {
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
        description:
          "Es gab einen Fehler: " + answer.message + " (" + answer.code + ")",
        duration: 5000,
      });
    } else {
      // create a checksum based on filename and the first line of the csv
      const checksum = `${filename}_${csv.split("\n")[0]}`;

      await invoke("insert_data", {
        filename: filename,
        device: deviceId,
        checksum: checksum,
      });
    }
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
          disabled={!signInResponse || disabled}
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Alles an die openSenseMap hochladen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-gray-50 rounded-lg p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-800">
            Alle Dateien hochladen
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Bevor du alle Dateien auf einmal hochlädst kannst du unten durch die
            Dateien scrollen um deine Eingabe zu überprüfen.
            <Alert variant={"warning"}>
              <AlertTitle>Achtung!</AlertTitle>
              <AlertDescription>
                Der Upload kann etwas dauern, da die openSenseMap ein Rate-Limit
                von maximal 6 Uploads pro Minute hat.
              </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>
        <div className="">
          {!boxInAccount ? (
            <div>
              <Alert variant="warning">
                <p>
                  Die Box mit der ID <strong>{deviceId}</strong> gehört nicht zu
                  deinem openSenseMap Account. Du kannst nur Daten an eine Box
                  hochladen, die auf deinem Account registriert ist.
                </p>
              </Alert>
            </div>
          ) : (
            <></>
          )}
          {loading ? (
            <div className="flex justify-center items-center text-blue-500">
              <p>
                {uploadCount}/{data.length} Dateien...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${(uploadCount / data.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <Carousel
              opts={{
                loop: true,
              }}
              className="w-full max-w-sm p-4"
            >
              <CarouselContent>
                {data.map((file: any, index: number) => (
                  <CarouselItem className="pt-1" key={"carousel_" + index}>
                    <FileOverview file={file} key={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
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
            disabled={!deviceId || loading}
            onClick={() => initiateUploadAll()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition-colors"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
