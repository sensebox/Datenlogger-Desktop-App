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
import { CloudIcon, FileText, Calendar, List, UploadCloud, InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { readCSVFile } from "@/lib/fs";
import { invoke } from "@tauri-apps/api";
import LoadingOverlay from "./ui/LoadingOverlay";
import storage from "@/lib/local-storage";
import { FileOverview } from "./ui/file-overview";
import { extractDatesFromCSV } from "@/lib/helpers/extractDatesFromCSV";
import { useAuth } from "./auth-provider";
import { useFileStore } from "@/lib/store/files";
import { checkFilesUploaded } from "@/lib/helpers/checkFilesUploaded";
import { createChecksum } from "@/lib/helpers/createChecksum";
import { User } from "@/types";
import { Alert } from "./ui/alert";
import { sign } from "crypto";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner"

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

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [boxInAccount, setBoxInAccount] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const { signInResponse } = useAuth();
  const [ disabledTmp, setDisabledTmp ] = useState<boolean>(false);
  const [file, setFile] = useState<FileStats>({
    firstDate: "",
    lastDate: "",
  });
  const { files, setFiles } = useFileStore();

  useEffect(() => {

    if (storage.get(`accessToken_${deviceId}`) === undefined) return;
    setToken(storage.get(`accessToken_${deviceId}`));
  }, [deviceId]);

  useEffect(() => {
    console.log(deviceId, token);
    ( !signInResponse || disabled ) && setDisabledTmp(true);
    
  }, [open]);



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
      // check if the account also owns the box
      const loginResponse: any = storage.get("auth");
      if (!loginResponse) return;
      const boxes = loginResponse.data.user.boxes;
      if (boxes.includes(deviceId)) {
        setBoxInAccount(true);
      }
    };

    if (open) getFileStats();
  }, [open, deviceId, filename]);


    const handleRefresh = async (refreshToken: string) => {
        console.log(refreshToken, "refersh")
        try{
            console.log("repsosne")
            const response = await fetch("https://api.opensensemap.org/users/refresh-auth", {
                method: 'POST', 
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    token: refreshToken
                })
            })
            const data = await response.json();
            data.timestamp = Date.now();
            console.log(data);
            storage.set('auth', data)
            return true;
        } catch(err) {
            return false;
        }
    }

const uploadFile = async (event: React.FormEvent) => {
  event.preventDefault();
  setLoading(true);

  try {
    // CSV einlesen
    const csv = await readCSVFile(`.reedu/data/${deviceId}/${filename}`);

    const timeOld = signInResponse?.timestamp || 0 
    const timeNew = Date.now();
    // when 
    if( timeNew - timeOld > 3600000) {
      signInResponse?.refreshToken && handleRefresh(signInResponse?.refreshToken);
    }
    
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
    setFiles(updated);
  } catch (err: any) {
    // Netzwerk- oder API-Fehler
    toast.error(`Fehler: ${err.message || err}`);
  } finally {
    setOpen(false);
    setLoading(false);
  }
};


  return (

    <div>
       { disabledTmp ? (
        <Tooltip>
              <TooltipTrigger>
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors"
                  disabled={disabledTmp}
                  tooltip="CSV-Datei hochladen"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Hochladen
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {!signInResponse
                  ? "Bitte melde dich an, um eine CSV-Datei hochzuladen."
                  : "Lade die Datei vom Gerät runter, um sie hochzuladen."}
              </TooltipContent>
            </Tooltip>    

              ) : (
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
          disabled={disabledTmp}
          tooltip="CSV-Datei hochladen"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Hochladen


        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-gray-50 rounded-lg p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-800">
            CSV-Datei hochladen
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Überprüfen Sie die Dateiinformationen vor dem Hochladen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!boxInAccount ? (
            <div>
              <Alert variant="warning">
                <p>
                  Die Box mit der ID <strong>{deviceId}</strong> gehört nicht zu
                  deinem openSenseMap Account. Sie können nur Daten zu Boxen
                  hochladen, die Ihnen gehören.
                </p>
              </Alert>
            </div>
          ) : (
            <></>
          )}
          {loading ? (
            <div className="flex justify-center items-center text-blue-500">
              Wird geladen...
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
            Abbrechen
          </Button>
          <Button
            disabled={!deviceId || !boxInAccount}
            onClick={uploadFile}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition-colors"
          >
            {loading ? "Wird hochgeladen..." : "Hochladen"}
          </Button>
        </DialogFooter>
      </DialogContent>
      {loading && <LoadingOverlay />}
    </Dialog>

              )}
    </div>
  )

}


   
