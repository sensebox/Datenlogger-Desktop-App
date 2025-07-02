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
import { toast } from "sonner"
import { createChecksum } from "@/lib/helpers/createChecksum";
import { checkFilesUploaded } from "@/lib/helpers/checkFilesUploaded";

export function UploadAllDialog({
  deviceId,
  disabled,
}: {
  deviceId: any;
  disabled: boolean;
}) {
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
    const boxes = loginResponse.data?.user.boxes;
    if (!boxes || !Array.isArray(boxes)) return;
    if (boxes.includes(deviceId)) {
      setBoxInAccount(true);
    }
  }, [files]);

  const CHUNK_SIZE = 2499;

async function initiateUploadAll() {
  setLoading(true);
  try {
    // 1. Alle Dateien parallel lesen und Checksums berechnen
    const fileInfos = await Promise.all(
      files.map(async ({ filename, size }) => {
        const path = `.reedu/data/${deviceId}/${filename}`;
        const content = (await readCSVFile(path)) || "";
        const firstLine = content.split("\n", 1)[0] || "";
        const checksum = await createChecksum(`${filename}_${firstLine}`);
        return { filename, size, content, checksum };
      })
    );

    // 2. Gesamten Inhalt zusammenführen und in CHUNK_SIZE-Zeilen-Blöcke aufteilen
    const allLines = fileInfos.flatMap(info => info.content.split("\n"));
    const chunks = [];
    for (let i = 0; i < allLines.length; i += CHUNK_SIZE) {
      const block = allLines.slice(i, i + CHUNK_SIZE).join("\n").trim();
      if (block) chunks.push(block);
    }

    // 3. Jeden Block nacheinander hochladen
    for (const chunk of chunks) {
      await uploadCSV(chunk);
    }

    // 4. Metadaten (Filename, Device, Size, Checksum) in der DB speichern
    for (const { filename, size, checksum } of fileInfos) {
      console.log("Inserting data:", { filename, device: deviceId, size, checksum });

      await invoke("insert_data", {
        filename,
        device: deviceId,
        size,
        checksum,
      });
    }

    // 5. Optional: prüfen, ob alles hochgeladen ist
    const updated = await checkFilesUploaded(files, deviceId);
    // hier ggf. noch eine Rückmeldung an den User geben

  } catch (error) {
    console.error("Upload-Fehler:", error);
    toast.error("Fehler beim Hochladen: " + error.message);
  }
  finally {
    setLoading(false);
  }
}


  const uploadCSV = async (content: string) => {
setLoading(true);

  try {
    // CSV einlesen

    // get the box' access token using the login token
    const boxToken = await fetch (
            `https://api.opensensemap.org/users/me/boxes/${deviceId}`,
              {
                method:'GET',
                headers: {
                  Authorization: "Bearer " + signInResponse?.token
                  
                }
              }
    )
    const boxTokenRes = await boxToken.json();
    // Daten senden
    const res = await fetch(
      `https://api.opensensemap.org/boxes/${deviceId}/data`,
      {
        method: "POST",
        headers: {
          Authorization: boxTokenRes.data.box.access_token,
          "Content-Type": "text/csv",
        },
        body: content,
      }
    );
    const result = await res.json();

    if (!res.ok) {
      // API-Fehler
      throw new Error(
        result.message
          ? `${result.message} (${result.code || res.status})`
          : `HTTP ${res.status}`
      );
    }

    // Erfolg
    toast.success("Datei erfolgreich hochgeladen");

  } catch (err: any) {
    // Netzwerk- oder API-Fehler
    toast.error(`Fehler: ${err.message || err}`);
  } finally {
    setOpen(false);
    setLoading(false);
  }
  }


  const uploadFile = async (filename: string) => {
  setLoading(true);

  try {
    // CSV einlesen
    const csv = await readCSVFile(`.reedu/data/${deviceId}/${filename}`);

    // get the box' access token using the login token
    const boxToken = await fetch (
            `https://api.opensensemap.org/users/me/boxes/${deviceId}`,
              {
                method:'GET',
                headers: {
                  Authorization: "Bearer " + signInResponse?.token
                  
                }
              }
    )
    const boxTokenRes = await boxToken.json();
    // Daten senden
    const res = await fetch(
      `https://api.opensensemap.org/boxes/${deviceId}/data`,
      {
        method: "POST",
        headers: {
          Authorization: boxTokenRes.data.box.access_token,
          "Content-Type": "text/csv",
        },
        body: csv,
      }
    );
    const result = await res.json();

    if (!res.ok) {
      // API-Fehler
      throw new Error(
        result.message
          ? `${result.message} (${result.code || res.status})`
          : `HTTP ${res.status}`
      );
    }

    // Erfolg
    toast.success("Datei erfolgreich hochgeladen");

    // Nacharbeiten: Checksum & DB
    const firstLine = csv.split("\n", 1)[0];
    const checksum = createChecksum(`${filename}_${firstLine}`);
    await invoke("insert_data", {
      filename,
      device: deviceId,
      size: csv.length,
      checksum,
    });

    const updated = await checkFilesUploaded(files, deviceId);
  } catch (err: any) {
    // Netzwerk- oder API-Fehler
    toast.error(`Fehler: ${err.message || err}`);
  } finally {
    setOpen(false);
    setLoading(false);
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
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg w-1/2 shadow-md transition-colors"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Alles hochladen
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
            <LoadingOverlay
              />
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
