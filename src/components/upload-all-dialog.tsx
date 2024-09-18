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
import { useToast } from "./ui/use-toast";
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

export function UploadAllDialog({
  deviceId,
  files,
  disabled,
}: {
  deviceId: any;
  files: any;
  disabled: boolean;
}) {
  const { toast } = useToast();

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [data, setData] = useState<FileStats[]>(files);

  useEffect(() => {
    if (storage.get(`accessToken_${deviceId}`) === undefined) return;
    setToken(storage.get(`accessToken_${deviceId}`));
  }, [deviceId]);

  useEffect(() => {
    // Simulate reading file stats (line count, first date)
    const getFileStats = async () => {
      const stats: FileStats[] = [];
      files.map(async (file: any) => {
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
  }, []);

  // useEffect(() => {
  //   // Simulate reading file stats (line count, first date)
  //   const getFileStats = async () => {
  //     const csvContent = await readCSVFile(
  //       `.reedu/data/${deviceId}/${filename}`
  //     );
  //     const lines = csvContent.split("\n").length;
  //     const { firstDate, lastDate } = extractDatesFromCSV(csvContent);

  //     setFileStats({ lines, firstDate, lastDate });
  //   };

  //   if (open) getFileStats();
  // }, [open, deviceId, filename]);

  // const uploadFile = async (event: any) => {
  //   setLoading(true);
  //   const csv = await readCSVFile(`.reedu/data/${deviceId}/${filename}`);
  //   const response = await fetch(
  //     `https://api.opensensemap.org/boxes/${deviceId}/data`,
  //     {
  //       method: "POST",
  //       headers: {
  //         Authorization: `${token}`,
  //         "content-type": "text/csv",
  //       },
  //       body: csv,
  //     }
  //   );
  //   const answer = await response.json();

  //   if (
  //     answer.code === "BadRequest" ||
  //     answer.code === "UnprocessableEntity" ||
  //     answer.code === "Unauthorized" ||
  //     answer.code === "Forbidden" ||
  //     answer.code === "NotFound"
  //   ) {
  //     setOpen(false);
  //     toast({
  //       variant: "destructive",
  //       title: answer.code,
  //       description: answer.message,
  //       duration: 5000,
  //     });
  //   } else {
  //     toast({
  //       title: "Upload Successful",
  //       description: "Your file has been uploaded successfully.",
  //       duration: 1000,
  //     });
  //     await invoke("insert_data", {
  //       filename: filename,
  //       device: deviceId,
  //       checksum: "",
  //     });
  //   }
  //   setLoading(false);
  //   setCounter((counter: number) => counter + 1);
  //   event.preventDefault();
  // };

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Alle Dateien hochladen
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
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <div className="flex justify-center items-center text-blue-500">
              Loading...
            </div>
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
            disabled={!deviceId || !token || loading}
            onClick={() => console.log()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition-colors"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
      {loading && <LoadingOverlay />}
    </Dialog>
  );
}
