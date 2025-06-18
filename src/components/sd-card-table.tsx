import * as React from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  FileText,
  DownloadIcon,
  TrashIcon,
  CheckIcon,
  Cpu,
  X,
  Loader2,
} from "lucide-react";
// Wir gehen davon aus, dass Du einen Dialog (Modal) aus Deiner UI-Bibliothek importierst
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UploadDialog } from "./upload-dialog";
import { useFileStore } from "@/lib/store/files";
import { invoke } from "@tauri-apps/api";
import { deleteFile } from "@/lib/fs";
import { FileStats } from "@/types";
import { useBoardStore } from "@/lib/store/board";
import { checkFilesUploaded } from "@/lib/helpers/checkFilesUploaded";
import { toast } from "sonner";

type FileTableProps = {
  data: Array<any>;
  config: { name?: string; sensebox_id?: string } | null;
  syncFiles: () => void;
  downloadFile: (filename: string) => void;
  port: string | null;
};

export function FileTable({
  config,
  syncFiles,
  downloadFile,
  port,
}: FileTableProps) {
  const { files, setFiles} = useFileStore();
  const { serialPort  } = useBoardStore();
  // Zustand, um das Modal, den aktuell ausgewählten Datensatz und den Ladezustand zu steuern
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);


  const formatBytes = (bytes: any) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${formattedSize} ${sizes[i]}`;
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "uploaded":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "synced":
        return "bg-blue-100 text-blue-800 ";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  // Öffnet das Modal und speichert die ausgewählte Datei
  const handleDeleteClick = (file: any) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  // Führt den Löschvorgang aus und aktualisiert den Ladezustand
  const handleDeleteConfirmation = async (mode: "device" | "all") => {
    setIsLoading(true);
    try {
      if (mode === "all") {
        const deleted = await invoke("delete_file_async", {
          port: port ? port : null,
          command: `<4 ${selectedFile.filename}>`,
        });

        const deleteLocal = await deleteFile(`.reedu/data/${config?.sensebox_id}/${selectedFile.filename}`);
        
      } else if (mode === "device") {
        const deleted = await invoke("delete_file_async", {
          port: port ? port : null,
          command: `<4 ${selectedFile.filename}>`,
        });
        console.log("Geräte Löschung:", deleted);
      }

      // Aktualisiere die Dateiliste, indem die gelöschte Datei entfernt wird
      const files: FileStats[] = await invoke("connect_list_files", {
        port: serialPort?.port,
        command: "<1 root>",
      });
      const checkedFiles = await checkFilesUploaded(
        files,
        config?.sensebox_id || ""
      );
      setFiles(checkedFiles);
      toast.success("Datei erfolgreich gelöscht.");


    } catch (error) {
      toast.error(
        `Fehler beim Löschen der Datei: ${error instanceof Error ? error.message : error}`
      );

      console.error("Fehler beim Löschen:", error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setSelectedFile(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-green-50">
            <TableHead className="text-green-800">Name</TableHead>
            <TableHead className="text-green-800">Größe</TableHead>
            <TableHead className="text-green-800">Status</TableHead>
            <TableHead className="text-green-800">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.length === 0 && config?.name && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <Button onClick={syncFiles} className="mt-4 bg-green-500">
                  <DownloadIcon className="mr-2 h-4 w-4 text-white" /> Daten
                  abfragen
                </Button>
              </TableCell>
            </TableRow>
          )}
          {files.length === 0 && !config?.name && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <p className="text-gray-600">
                  Bitte wähle einen Port aus, um das Gerät zu finden.
                </p>
              </TableCell>
            </TableRow>
          )}
          {files.map((file, index) => (
            <TableRow key={index} className="hover:bg-gray-80 transition-colors">
              <TableCell className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-green-500" />
                <span className="font-medium">{file.filename}</span>
              </TableCell>
              <TableCell className="text-gray-600">
                {formatBytes(file.size)}
              </TableCell>
              <TableCell>
                <span
                  className={`flex items-center gap-1 rounded-md p-0.5 ${getStatusClasses(
                    file.status ?? "unknown"
                  )}`}
                >
                  {file.status === "uploaded" ? (
                    <>
                      <CheckIcon className="w-4 h-4" /> Hochgeladen
                    </>
                  ) : file.status === "synced" ? (
                    <>
                      <DownloadIcon className="w-4 h-4" /> Runtergeladen
                    </>
                  ) : file.status === "pending" ? (
                    <>
                      <Cpu className="w-4 h-4" /> Auf dem Gerät
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" /> Fehler
                    </>
                  )}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => downloadFile(file.filename ?? "")}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </Button>
                  <UploadDialog
                    filename={file.filename ?? ""}
                    deviceId={config?.sensebox_id || ""}
                    disabled={file.status !== "synced"}
                  />
                  <Button
                    onClick={() => handleDeleteClick(file)}
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal (Dialog) für die Löschbestätigung */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Datei löschen</DialogTitle>
          </DialogHeader>
          <p className="my-4">
            Möchtest du die Datei nur vom Gerät löschen oder auch vom lokalen PC?
          </p>
          {/* Ladeanimation anzeigen, solange isLoading true ist */}
          {isLoading && (
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Löschen...</span>
            </div>
          )}
          <DialogFooter className="flex justify-end gap-2">
            <Button onClick={() => setDeleteModalOpen(false)} disabled={isLoading}>
              Abbrechen
            </Button>
            <Button
              onClick={() => handleDeleteConfirmation("device")}
              disabled={isLoading}
            >
              Nur Gerät
            </Button>
            <Button
              onClick={() => handleDeleteConfirmation("all")}
              disabled={isLoading || selectedFile?.status !== "synced"}
              variant="destructive"
            >
              Gerät &amp; PC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
