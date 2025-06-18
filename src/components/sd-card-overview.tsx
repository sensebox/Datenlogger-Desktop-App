import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Folder, SettingsIcon, BoxesIcon, SaveIcon, HelpCircleIcon, Car, User } from "lucide-react";
import { useBoardStore } from "@/lib/store/board";
import { useFileStore } from "@/lib/store/files";
import { FileContent, FileStats } from "@/types";
import { Button } from "./ui/button";
import { deleteFile } from "@/lib/fs";
import { invoke } from "@tauri-apps/api/tauri";
import BoardSwitcher from "./board-switcher";
import { useAuth } from "./auth-provider";
import { UserNav } from "./user-nav";
import { FileTable } from "./sd-card-table";
import { SDCardTableButtonBar } from "./sd-card-table-button-bar";
import { checkFilesUploaded } from "@/lib/helpers/checkFilesUploaded";
import { deleteFilesFromTable } from "@/lib/helpers/deleteFilesFromTable";
import { Link } from "react-router-dom";
import { toast } from "sonner";


type Device = {
  name: string;
  id: string;
};

export default function SDCardOverview() {
  const { config, serialPort } = useBoardStore();
  const { files, setFiles } = useFileStore();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const { signInResponse } = useAuth();

  const syncFiles = async () => {
    try {
      const filesFromBoard: FileStats[] = await invoke("connect_list_files", {
        port: serialPort?.port,
        command: "<1 root>",
      });
      console.log(filesFromBoard)
      setFiles(filesFromBoard);
      if (files.length === 0) {
        if (config?.sensebox_id) {
          setFiles(
            await checkFilesUploaded(filesFromBoard, config?.sensebox_id)
          );
        }
      }

      toast.success("Dateien erfolgreich synchronisiert.")

    } catch (error: any) {
      toast.error(
        `Fehler beim Synchronisieren der Dateien: ${error.message}`)
    }
  };

  const downloadFile = async (fileName: string) => {
    try {
      if (!fileName) return;
      const fileContent: FileContent = await invoke("get_file_content", {
        port: serialPort?.port,
        command: `<2 /${fileName}>`,
      });
      saveDataToFile(fileContent.content, fileName);
      if (config?.sensebox_id) {
        setFiles(await checkFilesUploaded(files, config?.sensebox_id));
      }
    } catch (error: any) {
      toast.error(
        `Fehler beim Herunterladen der Datei: ${error.message}`)
    }
  };

  const saveDataToFile = async (data: string, filePath: string) => {
    try {
      await invoke("save_data_to_file", {
        data: data,
        deviceFolder: config?.sensebox_id,
        filePath: filePath,
      });
      toast.success(`Datei ${filePath} erfolgreich auf dem Computer gespeichert.`);

    } catch (error: any) {
      toast.error(
        `Fehler beim Speichern der Datei: ${error.message}`)

    }
  };

  const openFolderInExplorer = async () => {
    try {
      await invoke("open_in_explorer", {
        deviceid: config?.sensebox_id,
      });
    } catch (error: any) {
      toast.error(
        `Fehler beim Öffnen des Ordners: ${error.message}`
      );
    }
  };

  const uploadFile = async (filename: string) => {
    if (!filename) return;
  };

  const deleteFileUI = async (filename: string) => {
    try {
      if (!filename) return;

      const deletedFile = await deleteFile(filename);

      checkFilesUploaded(files, config?.sensebox_id ?? "");
    } catch (error: any) {}
  };

  const downloadAllFiles = async () => {
    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file.status === "synced" || file.status === "uploaded") continue;
        if (file.filename) await downloadFile(file.filename);
      }
      if (config?.sensebox_id) {
        setFiles(await checkFilesUploaded(files, config?.sensebox_id));
      }
      toast.success(`Alle Dateien erfolgreich heruntergeladen.`);

    } catch (error: any) {
      toast.error(
        `Error downloading files: ${error.message}`
      );


    }
  };

  const deleteAllFiles = async () => {
    try {
      deleteFilesFromTable();
      const uploadedFiles: any = await invoke("reset_data", {
        device: config?.sensebox_id,
      });

    } catch (error: any) {
      toast.error(
        `Error deleting files: ${error.message}`
      );

    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white p-1  rounded-lg overflow-hidden">
            <CardHeader className="bg-grey-200 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SaveIcon className="w-5 h-5 text-blue-600" />
            <CardTitle className="font-normal">senseBox SD-Karte Übersicht</CardTitle>
          </div>
          <UserNav />
        </div>
      </CardHeader>


      <CardContent className="p-4">
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">


          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div>
              <p className="text-sm font-medium">
                Gerät auswählen
              </p>
              <BoardSwitcher />
            </div>
              <p className="text-sm font-medium">Gerätename</p>

              <p className="text-lg text-blue-500">{config?.name}</p>
                            <p className="text-sm font-medium">senseBox-ID</p>

              <p className="text-lg text-blue-500">{config?.sensebox_id}</p>


            </div>
            <SDCardTableButtonBar
              data={files}
              config={config}
              downloadAllFiles={downloadAllFiles}
              deleteAllFiles={deleteAllFiles}
            />
      
          </div>
          <div className="flex flex-row justify-between mt-4">


          </div>
        </div>
        <FileTable
          data={files}
          config={config}
          syncFiles={syncFiles}
          downloadFile={downloadFile}
          // deleteFile={deleteFile}
          port={serialPort?.port.toString() ?? ''} 
        />
      </CardContent>
    </Card>
  );
}


