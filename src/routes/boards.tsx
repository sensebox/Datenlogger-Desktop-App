import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/board";
import { FileContent, FileInfo } from "@/types";
import { invoke } from "@tauri-apps/api/tauri";
import {
  Bot,
  Cpu,
  Delete,
  Fingerprint,
  RefreshCcw,
  Save,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { File, getColumns } from "@/lib/columns/files";
import { useToast } from "@/components/ui/use-toast";
import { readDirectory } from "@/lib/fs";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useFileStore } from "@/lib/store/files";

export default function Boards() {
  const { toast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { config, serialPort } = useBoardStore();
  const [disabledButtons, setDisabledButtons] = useState<boolean>(true);
  const { files, setFiles } = useFileStore();

  useEffect(() => {
    serialPort ? setDisabledButtons(false) : setDisabledButtons(true);
  }, [serialPort]);

  useEffect(() => {
    if (files.length > 0) {
      setData(files);
    }
  }, []);

  const columns = getColumns(
    [],
    [
      {
        id: "actions",
        cell: ({ row }: any) => {
          return (
            <div className="flex justify-between">
              <Button onClick={() => getFileContent(row.original.filename)}>
                <Save className="mr-2 h-4 w-4 " /> Copy
              </Button>
              <Button variant="destructive" onClick={() => console.log("tbd")}>
                <TrashIcon className="mr-2 h-4 w-4 " /> Delete
              </Button>
            </div>
          );
        },
      },
    ]
  );

  const syncFiles = async () => {
    setLoading(true);

    // Polyfill für requestIdleCallback
    const idleCallback =
      window.requestIdleCallback ||
      function (handler) {
        return setTimeout(handler, 1);
      };

    idleCallback(async () => {
      try {
        const files: FileInfo[] = await invoke("connect_list_files", {
          port: serialPort?.port,
          command: "<1 root>",
        });
        setFiles(files);
        const csvFiles = files.filter(
          (file) =>
            !file.filename.includes("~") && file.filename.endsWith(".CSV")
        );

        const syncedFiles = await readDirectory(
          `.reedu/data/${config?.sensebox_id}`
        );

        const data: File[] = csvFiles.map((file) => {
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

        setData(data);
        setLoading(false);

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
        setLoading(false);
      }
    });
  };

  const getFileContent = async (fileName: string) => {
    try {
      setLoading(true);
      const fileContent: FileContent = await invoke("get_file_content", {
        port: serialPort?.port,
        command: `<2 /${fileName}>`,
      });
      saveDataToFile(fileContent.content, fileName);
      setLoading(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Error copying file: ${error}`,
        duration: 3000,
      });
      setLoading(false);
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

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex-1 space-y-6">
        <div className="grid gap-6 md:grid-cols-5 lg:grid-cols-5">
          <Card className="bg-gray-50 shadow-lg md:col-span-4 lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Device Overview
              </CardTitle>
              <Cpu className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-500">
                  <Fingerprint className="mr-1 h-4 w-4" />
                  {config ? config.sensebox_id : "No device selected"}
                </Badge>
                {config && config.name && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-500"
                  >
                    <Bot className="mr-1 h-4 w-4" />
                    {config.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Button occupying 1/5 of the grid space */}
          <div className="flex items-start justify-end md:col-span-1 lg:col-span-1">
            <Button
              disabled={disabledButtons}
              onClick={() => syncFiles()}
              className="w-full"
            >
              <RefreshCcw className="mr-2 h-4 w-4 text-white" /> Get Files
            </Button>
          </div>
        </div>

        <DataTable columns={columns} data={data} />
      </div>
      {loading && <LoadingOverlay />}
    </div>
  );
}
