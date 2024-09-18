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

  useEffect(() => {
    console.log(signInResponse);
  }, []);

  const checkFilesUploaded = async (files: any[]) => {
    const syncedFiles = await readDirectory(
      `.reedu/data/${config?.sensebox_id}`
    );

    const tmpData: any[] = files.map((file) => {
      const fileIsSynced = syncedFiles.findIndex(
        (syncedFile) => syncedFile.name === file.filename
      );

      return {
        filename: file.filename,
        size: file.size,
        status: fileIsSynced >= 0 ? "synced" : "pending",
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
        variant: "default",
        description: "Files synced successfully",
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
      toast({
        variant: "default",
        description: `File saved successfully.`,
        duration: 3000,
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
        if (file.filename) await downloadFile(file.filename);
      }
      checkFilesUploaded(files);
      toast({
        variant: "default",
        description: `All files downloaded successfully.`,
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

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => downloadAllFiles()}
                disabled={data.length === 0}
                className="mt-4 bg-blue-500"
              >
                <DownloadIcon className="mr-2 h-4 w-4  text-white" />
                Alle Daten runterladen
              </Button>
              <UploadAllDialog
                disabled={data.length === 0}
                files={data}
                deviceId={config?.sensebox_id}
              />
              <Button
                onClick={() => console.log("deleting everything")}
                disabled={data.length === 0}
                variant={"destructive"}
              >
                <Trash className="mr-2 h-4 w-4  text-white" />
                Alle Daten löschen
              </Button>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-green-50">
              <TableHead className="text-green-800">Datei</TableHead>
              <TableHead className="text-green-800">Größe</TableHead>
              <TableHead className="text-green-800">Status</TableHead>
              <TableHead className="text-green-800">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && config?.name && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Button
                    onClick={() => syncFiles()}
                    className="mt-4 bg-green-500"
                  >
                    <DownloadIcon className="mr-2 h-4 w-4  text-white" /> Daten
                    abfragen
                  </Button>
                </TableCell>
              </TableRow>
            )}
            {data.length === 0 && !config?.name && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <p className="text-gray-600">
                    Bitte wähle einen Port aus um das Gerät zu finden.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {data.map((file, index) => (
              <TableRow
                key={index}
                className="hover:bg-gray-80 transition-colors"
              >
                <TableCell className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="font-medium ">{file.filename}</span>
                </TableCell>
                <TableCell className="text-gray-600">{file.size} KB</TableCell>
                <TableCell>
                  <Badge
                    variant={file ? "default" : "secondary"}
                    className={`flex items-center gap-1 ${
                      file.status === "synced"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {file.status === "synced" ? (
                      <DownloadIcon className="w-4 h-4" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {file.status === "synced" ? "Runtergeladen" : "Ausstehend"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => downloadFile(file.filename ?? "")}
                      disabled={file.status === "synced"}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>
                    <UploadDialog
                      filename={file.filename ?? ""}
                      deviceId={config?.sensebox_id || ""}
                      disabled={file.status != "synced"}
                    />

                    <Button
                      onClick={() => deleteFile(file.filename ?? "")}
                      variant="destructive"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>{" "}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
