import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, DownloadIcon, Upload, TrashIcon } from "lucide-react";
import { UploadDialog } from "./upload-dialog";

type FileTableProps = {
  data: Array<any>;
  config: { name?: string; sensebox_id?: string } | null;
  syncFiles: () => void;
  downloadFile: (filename: string) => void;
  deleteFile: (filename: string) => void;
};

export function FileTable({
  data,
  config,
  syncFiles,
  downloadFile,
  deleteFile,
}: FileTableProps) {
  const formatBytes = (bytes: any) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${formattedSize} ${sizes[i]}`;
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "uploaded":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800"; // Für alle anderen Fälle
    }
  };
  return (
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
              <Button onClick={syncFiles} className="mt-4 bg-green-500">
                <DownloadIcon className="mr-2 h-4 w-4 text-white" /> Daten
                abfragen
              </Button>
            </TableCell>
          </TableRow>
        )}
        {data.length === 0 && !config?.name && (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              <p className="text-gray-600">
                Bitte wähle einen Port aus, um das Gerät zu finden.
              </p>
            </TableCell>
          </TableRow>
        )}
        {data.map((file, index) => (
          <TableRow key={index} className="hover:bg-gray-80 transition-colors">
            <TableCell className="flex items-center gap-4">
              <FileText className="w-5 h-5 text-green-500" />
              <span className="font-medium">{file.filename}</span>
            </TableCell>
            <TableCell className="text-gray-600">
              {formatBytes(file.size)}{" "}
            </TableCell>
            <TableCell>
              <Badge
                variant={file ? "default" : "secondary"}
                className={`flex items-center gap-1 ${getStatusClasses(
                  file.status
                )}`}
              >
                {file.status === "synced" ? (
                  <DownloadIcon className="w-4 h-4" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {file.status === "uploaded"
                  ? "Hochgeladen"
                  : file.status === "synced"
                  ? "Auf dem PC"
                  : file.status === "pending"
                  ? "Auf dem Gerät"
                  : "fehlgeschlagen"}
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
                  disabled={file.status !== "synced"}
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
