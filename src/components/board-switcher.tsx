import * as React from "react";
import {
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronsUpDown,
  Cpu,
  FolderIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { invoke } from "@tauri-apps/api/tauri";
import { FileStats, SenseboxConfig, SerialPort, Upload } from "@/types";
import { useBoardStore } from "@/lib/store/board";
import { createDirectory, readDirectory } from "@/lib/fs";
import LoadingOverlay from "./ui/LoadingOverlay";
import { useToast } from "./ui/use-toast";
import { useFileStore } from "@/lib/store/files";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface BoardSwitcherProps extends PopoverTriggerProps {}

export default function BoardSwitcher({ className }: BoardSwitcherProps) {
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [serialPorts, setSerialPorts] = React.useState<SerialPort[]>();
  const [selectedBoard, setSelectedBoard] = React.useState<SerialPort | null>(
    null
  );
  const { setConfig, setSerialPort } = useBoardStore();
  const { files, setFiles } = useFileStore();
  const [loading, setLoading] = React.useState(false);

  const [folders, setFolders] = React.useState<any[]>([]);
  async function listSerialports() {
    setSerialPorts(await invoke("list_serialport_devices"));
  }

  React.useEffect(() => {
    readDir();
  }, []);

  async function connectAndReadConfig(serialPort: SerialPort) {
    try {
      setLoading(true);
      const boardConfig: SenseboxConfig = await invoke("connect_read_config", {
        port: serialPort.port,
        command: "<3 config>",
      });
      await createDirectory(`.reedu/data/${boardConfig.sensebox_id}`);
      const files: FileStats[] = await invoke("connect_list_files", {
        port: serialPort?.port,
        command: "<1 root>",
      });
      setFiles(files);
      toast({
        variant: "success",
        description: "Verbindung erfolgreich hergestellt.",
        duration: 5000,
      });
      setConfig(boardConfig);
      setSerialPort(serialPort);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      toast({
        variant: "destructive",
        title: error.message,
        description: error,
        duration: 5000,
      });
    }
  }

  const readDir = async () => {
    const files = await readDirectory(`.reedu/data/`);
    const mappedFiles: File[] = [];
    // exclude all hidden folders
    const filteredFiles = files.filter((file) => !file.name.startsWith("."));

    // for (let index = 0; index < files.length; index++) {
    //   const element = files[index];
    //   const fileIsUploaded = uploadedFiles.findIndex(
    //     (uploadedFile) => uploadedFile.filename === element.name
    //   );
    //   mappedFiles.push({
    //     filename: element.name || "no name",
    //     size: "",
    //     status: fileIsUploaded >= 0 ? "uploaded" : "pending",
    //   });
    // }
    setFolders(filteredFiles);
  };

  return (
    <Dialog>
      <Popover
        open={open}
        onOpenChange={() => {
          listSerialports();
          setOpen(!open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a device"
            className={cn(
              "w-[300px] justify-between p-3 bg-white rounded-lg shadow-md transition-colors",
              selectedBoard
                ? "border border-green-500"
                : "border border-gray-300",
              className
            )}
          >
            {selectedBoard ? (
              <>
                <Cpu className="mr-2 h-4 w-4 text-green-400" />
                <span className="flex gap-4 text-green-600">
                  {selectedBoard.port} ({selectedBoard.product}){" "}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </span>
              </>
            ) : (
              <span className="flex gap-4 text-gray-500">
                No device selected{" "}
                <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-2 bg-white rounded-lg shadow-md">
          <Command>
            <CommandList>
              <CommandEmpty>No device found.</CommandEmpty>
              <CommandGroup key="devices" heading="Devices">
                {serialPorts?.map((serialPort, idx) => (
                  <CommandItem
                    key={idx}
                    onSelect={() => {
                      setSelectedBoard(serialPort);
                      connectAndReadConfig(serialPort);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer",
                      selectedBoard?.port === serialPort.port
                        ? "bg-green-100"
                        : ""
                    )}
                  >
                    <Cpu className="h-4 w-4 text-blue-400" />
                    <span className="flex-1 text-sm">
                      {serialPort.port} ({serialPort.product})
                    </span>
                    {selectedBoard?.port === serialPort.port && (
                      <Check className="ml-auto h-4 w-4 text-green-400" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup key="folders" heading="Folders">
                {folders.map((folder, idx) => (
                  <CommandItem
                    key={idx}
                    onSelect={() => {
                      console.log(folder);
                    }}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <FolderIcon className="h-4 w-4 text-blue-400" />
                    <span className="flex-1 text-sm">{folder.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {loading && <LoadingOverlay />}
    </Dialog>
  );
}
