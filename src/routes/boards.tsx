import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/board";
import { FileContent } from "@/types";
import { invoke } from "@tauri-apps/api/tauri";
import { Cpu, Fingerprint, RefreshCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import crypto from "crypto";
import { DataTable } from "@/components/data-table";
import { File, columns } from "@/lib/columns/files";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

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

  const syncFiles = async () => {
    try {
      console.log("Syncing files from selected board");
      setLoading(true);

      // Invoke rust function to get all CSV files from SD card
      const files: String = await invoke("connect_list_files", {
        port: serialPort?.port,
        command: "<1 root>",
      });
      const fileArray = files.split("\r\n");
      // pop last element as its always empty
      fileArray.pop();
      const data: File[] = fileArray.map((file) => ({
        filename: file.split(",")[0],
        size: file.split(",")[1],
        status: "pending",
      }));

      setData(data);
      setLoading(false);
      //   showToast("Files synced succesfully", "success");
    } catch (error) {
      //   showToast(`error syncing files: ${error.message}`, "error");
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

  const getFileContent = async (fileName: String) => {
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
      const hash = calculateMd5hash(fileContent.content);
      if (hash === fileContent.md5hash) {
        saveDataToFile(fileContent.content, fileName);
      } else {
        console.log("Hashes are not equal");
      }
      setLoading(false);
    } catch (error) {
      //   showToast(`Error getting file content: ${error.messasge}`, "error");
      setLoading(false);
    }
  };

  const saveDataToFile = async (data, filePath) => {
    try {
      await invoke("save_data_to_file", {
        data: data,
        filePath: filePath,
      });
      //   showToast("Data saved successfully", "success");
      console.log("Daten erfolgreich gespeichert.");
    } catch (error) {
      //   showToast(
      //     `Error when trying to save the data: ${error.message}`,
      //     "error"
      //   );
      console.error("Fehler beim Speichern der Daten:", error);
    }
  };

  const calculateMd5hash = (data: string) => {
    const hash = crypto.createHash("md5");
    hash.update(data);
    return hash.digest("hex");
  };

  const query_db = async () => {
    await invoke("get_data");
  };

  const insert_db = async () => {
    await invoke("insert_data");
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
            <Button onClick={() => query_db()}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Query DB
            </Button>
            <Button onClick={() => insert_db()}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Insert into DB
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  variant: "destructive",
                  title: "Uh oh! Something went wrong.",
                  description: "There was a problem with your request.",
                  action: (
                    <ToastAction altText="Try again">Try again</ToastAction>
                  ),
                });
              }}
            >
              Show Toast
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
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
                </div>
              </CardContent>
            </Card>
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      </div>
      {/* {loading ? (
        <div>
          <LoadingOverlay></LoadingOverlay>
        </div>
      ) : null} */}
      {/* <ToastContainer /> */}
    </div>
  );
}
