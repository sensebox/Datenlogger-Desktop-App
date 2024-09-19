import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  File,
  FileAudio,
  FileVideo,
  FileText,
  Upload,
  CheckCircle2,
  Smartphone,
  SmartphoneIcon,
  DownloadIcon,
  CloudIcon,
  TrashIcon,
  Trash,
  UserIcon,
} from "lucide-react";
import { useBoardStore } from "@/lib/store/board";
import { useFileStore } from "@/lib/store/files";
import { FileContent, FileStats } from "@/types";
import { Button } from "./ui/button";
import { readDirectory, deleteFile } from "@/lib/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { toast } from "./ui/use-toast";
import BoardSwitcher from "./board-switcher";
import { UploadDialog } from "./upload-dialog";
import { UploadAllDialog } from "./upload-all-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "./auth-provider";
import { UserNav } from "./user-nav";
import { FileTable } from "./sd-card-table";
import { SDCardTableButtonBar } from "./sd-card-table-button-bar";

type Device = {
  name: string;
  id: string;
};

export default function SDCardOverview() {
  const { config, serialPort } = useBoardStore();
  const { files, setFiles } = useFileStore();
  const { signInResponse } = useAuth();
  const [data, setData] = useState<FileStats[]>(files);

  useEffect(() => {
    if (files.length > 0) {
      checkFilesUploaded(files);
      setData(files);
    }
  }, [files]);

  const checkFilesUploaded = async (files: any[]) => {
    const syncedFiles = await readDirectory(
      `.reedu/data/${config?.sensebox_id}`
    );

    const uploadedFiles: any = await invoke("get_data", {
      device: config?.sensebox_id,
    });
    const tmpData: any[] = files.map((file) => {
      const fileIsSynced = syncedFiles.findIndex(
        (syncedFile) => syncedFile.name === file.filename
      );
      const fileIsUploaded = uploadedFiles.findIndex(
        (uploadedFile: any) => uploadedFile.filename === file.filename
      );
      // distinguish between 3 states "pending" "synced" und "uploaded"
      if (fileIsSynced !== -1 && fileIsUploaded !== -1) {
        return {
          filename: file.filename,
          size: file.size,
          status: "uploaded",
          createdAt: uploadedFiles[fileIsUploaded].createdAt,
        };
      } else if (fileIsSynced !== -1) {
        return {
          filename: file.filename,
          size: file.size,
          status: "synced",
          createdAt: "N/A",
        };
      }
      return {
        filename: file.filename,
        size: file.size,
        status: "pending",
        createdAt: "N/A",
      };
    });

    setData(tmpData);
  };

  const syncFiles = async () => {
    try {
      const files: FileStats[] = await invoke("connect_list_files", {
        port: serialPort?.port,
        command: "<1 root>",
      });
      setFiles(files);
      checkFilesUploaded(files);

      toast({
        variant: "success",
        description: "Verbindung erfolgreich hergestellt.",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Error syncing files, ${error.message}`,
        duration: 3000,
      });
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
      checkFilesUploaded(files);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Error copying file: ${error}`,
        duration: 3000,
      });
    }
  };

  const saveDataToFile = async (data: string, filePath: string) => {
    try {
      await invoke("save_data_to_file", {
        data: data,
        deviceFolder: config?.sensebox_id,
        filePath: filePath,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Error trying to save file on disk: ${error.message}`,
        duration: 3000,
      });
    }
  };
  const uploadFile = async (filename: string) => {
    if (!filename) return;
  };

  const deleteFileUI = async (filename: string) => {
    try {
      if (!filename) return;

      const deletedFile = await deleteFile(filename);

      checkFilesUploaded(files);
    } catch (error: any) {}
  };

  const downloadAllFiles = async () => {
    try {
      for (let index = 0; index < files.length; index++) {
        const file = data[index];
        if (file.status === "synced" || file.status === "uploaded") return;
        if (file.filename) await downloadFile(file.filename);
      }
      checkFilesUploaded(files);
      toast({
        variant: "success",
        description: `Alle Daten erfolgreicher auf dem Computer gespeichert.`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Error copying file: ${error}`,
        duration: 3000,
      });
    }
  };

  const deleteAllFiles = async () => {};

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white  rounded-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex flex-row justify-between align-middle">
            <h2 className="text-xl font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Geräteinformationen
            </h2>
            <div className="flex flex-row gap-2 p-2 cursor-pointer rounded-sm border-blue-100 border-solid border-2  ">
              <UserNav />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Gerätename</p>
              <p className="text-lg text-blue-900">{config?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Geräte-ID</p>
              <p className="text-lg text-blue-900">{config?.sensebox_id} </p>
            </div>
          </div>
          <div className="flex flex-row justify-between mt-4">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-2">
                Port auswählen
              </p>
              <BoardSwitcher />
            </div>
            <SDCardTableButtonBar
              data={data}
              config={config}
              downloadAllFiles={downloadAllFiles}
              deleteAllFiles={deleteAllFiles}
            />
          </div>
        </div>
        <FileTable
          data={data}
          config={config}
          syncFiles={syncFiles}
          downloadFile={downloadFile}
          deleteFile={deleteFile}
        />
      </CardContent>
    </Card>
  );
}
