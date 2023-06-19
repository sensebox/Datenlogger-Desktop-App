import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/board";
import { FileContent } from "@/types";
import { invoke } from "@tauri-apps/api/tauri";
import { Bot, Cpu, Delete, Fingerprint, RefreshCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import crypto from "crypto";
import { DataTable } from "@/components/data-table";
import { File, getColumns } from "@/lib/columns/files";
import { useToast } from "@/components/ui/use-toast";
import { readDirectory } from "@/lib/fs";

export default function Boards() {
  const { toast } = useToast();

  const [data, setData] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { config, serialPort } = useBoardStore();
  const [disabledButtons, setDisabledButtons] = useState<boolean>(true);

  useEffect(() => {
    serialPort ? setDisabledButtons(false) : setDisabledButtons(true);
    return () => {};
  }, [serialPort]);

  const columns = getColumns(
    [],
    [
      {
        id: "actions",
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-4">
              <Button onClick={() => getFileContent(row.original.filename)}>
                <Save className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button onClick={() => console.log("tbd")}>
                <Delete className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          );
        },
      },
    ]
  );

  const syncFiles = async () => {
    try {
      setLoading(true);

      // Invoke rust function to get all CSV files from SD card
      const files: String = await invoke("connect_list_files", {
        port: serialPort?.port,
        command: "<1 root>",
      });

      const syncedFiles = await readDirectory(
        `.reedu/data/${config?.sensebox_id}`
      );

      const fileArray = files.split("\r\n");
      // pop last element as its always empty
      fileArray.pop();
      const data: File[] = fileArray.map((file) => {
        const [fileName, size] = file.split(",");
        const fileIsSynced = syncedFiles.findIndex(
          (syncedFile) => syncedFile.name === fileName
        );

        return {
          filename: fileName,
          size: size,
          status: fileIsSynced >= 0 ? "synced" : "pending",
        };
      });

      setData(data);
      setLoading(false);

      toast({
        variant: "default",
        description: "Files synced succesfully",
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
  };

  const deleteFile = async (fileName: String) => {
    try {
      setLoading(true);
      console.log("Deleting file from selected board with name: ", fileName);

      const toDelete: String = await invoke("delete_file", {
        port: serialPort?.port,
        command: `<4 /logs/${fileName}>`,
      });

      if (toDelete === "Datei erfolfreich gelöscht.") {
        const newData = data.filter((file) => file.filename !== fileName);
        // setData(newData);
      }
      setLoading(false);
      //   showToast(`Datei erfolgreich gelöscht`, "success");
    } catch (error) {
      console.error("Error deleting file:", error);
      //   showToast(`Error deleting files: ${error.message}`, "error");
      setLoading(false);
    }
  };

  const getFileContent = async (fileName: string) => {
    try {
      console.log(
        "Getting file content from selected board with name: ",
        fileName
      );
      setLoading(true);
      const fileContent: FileContent = await invoke("get_file_content", {
        port: serialPort?.port,
        command: `<2 /logs/${fileName}>`,
      });
      saveDataToFile(fileContent.content, fileName);
      // const hash = calculateMd5hash(fileContent.content);
      // if (hash === fileContent.md5hash) {
      // } else {
      //   console.log("Hashes are not equal");
      // }
      setLoading(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Error copying file: ${error.message}`,
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
        description: `File saved sucessfully.`,
        duration: 3000,
      });
      console.log("Daten erfolgreich gespeichert.");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: `Error trying to save file on disk: ${error.message}`,
        duration: 3000,
      });
      console.error("Fehler beim Speichern der Daten:", error);
    }
  };

  return (
    <div className="container">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button disabled={disabledButtons} onClick={() => syncFiles()}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Get files
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="md:col-span-1 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Device Overview
                </CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge>
                    <Fingerprint className="mr-1 h-3 w-3" />
                    {config ? config.sensebox_id : "No device selected"}
                  </Badge>
                  {config && config.name ? (
                    <Badge>
                      <Bot className="mr-1 h-3 w-3" />
                      {config.name}
                    </Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}
