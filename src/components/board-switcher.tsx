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
import { createDirectory, readCSVFile, readDirectory } from "@/lib/fs";
import LoadingOverlay from "./ui/LoadingOverlay";
import { useFileStore } from "@/lib/store/files";
import { read, readFile } from "fs";
import { readConfig } from "@/lib/helpers/readConfig";
import { checkFilesUploaded } from "@/lib/helpers/checkFilesUploaded";
import { toast } from "sonner";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface BoardSwitcherProps extends PopoverTriggerProps {}

export default function BoardSwitcher({ className }: BoardSwitcherProps) {

  const [open, setOpen] = React.useState(false);
  const [serialPorts, setSerialPorts] = React.useState<SerialPort[]>();
  const [selectedBoard, setSelectedBoard] = React.useState<SerialPort | null>(
    null
  );
  const { setConfig, setSerialPort, config } = useBoardStore();
  const { files, setFiles } = useFileStore();
  const [loading, setLoading] = React.useState(false);

  const [folders, setFolders] = React.useState<any[]>([]);

  async function listSerialports() {
    setSerialPorts(await invoke("list_serialport_devices"));

  }

  React.useEffect(() => {
    readDir();
  }, []);

  const readDir = async () => {
    const files = await readDirectory(`.reedu/data/`);
    const mappedFiles: File[] = [];
    // exclude all hidden folders
    const filteredFiles = files.filter(
      (file) => file.name && !file.name.startsWith(".")
    );

    setFolders(filteredFiles);
  };

  async function connectAndReadConfig(serialPort: SerialPort) {
    try {
      setLoading(true);
      if (!serialPort) {
        throw new Error("No serial port selected.");
      }
          setSerialPort(serialPort);
      const boardConfig: SenseboxConfig = await invoke("connect_read_config", {
        port: serialPort.port,
        command: "<3 config>",
      });

      await createDirectory(`.reedu/data/${boardConfig.sensebox_id}`);
      const files: FileStats[] = await invoke("connect_list_files", {
        port: serialPort?.port,
        command: "<1 root>",
      });
      const checkedFiles = await checkFilesUploaded(
        files,
        boardConfig.sensebox_id
      );
      setFiles(checkedFiles);

      toast.success("Verbindung erfolgreich hergestellt.")
      setConfig(boardConfig);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error);
   
    }
  }

  const selectFolder = async (id: string) => {
    const data = await readDirectory(`.reedu/data/${id}`);
    const filteredData = data.filter(
      (file) => file.name?.endsWith(".CSV") || file.name?.endsWith(".csv")
    );
    const fileWithSize = await Promise.all(
      filteredData.map(async (file) => {
        const csvContent = await readCSVFile(`.reedu/data/${id}/${file.name}`);
        const textEncoder = new TextEncoder();
        const size = textEncoder.encode(csvContent).length;
        return {
          filename: file.name,
          size: size,
          status: "synced",
        };
      })
    );
    setFiles(fileWithSize);

    const config = await readCSVFile(`.reedu/data/${id}/config.cfg`);
    const boardConfig: SenseboxConfig = readConfig(config);
    setOpen(false);
    setSelectedBoard(null);
    setConfig(boardConfig);
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
            ) : folders ? (
              <div className="flex flex-row">
                <FolderIcon className="mr-2 h-4 w-4 text-green-400" />
                <span className="flex gap-4 text-green-600">
                  {config?.sensebox_id}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </span>
              </div>
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
              <CommandGroup key="devices" heading="Geräte">
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
              <CommandGroup key="folders" heading="Runtergeladene Ordner">
                {folders.map((folder, idx) => (
                  <CommandItem
                    key={idx}
                    onSelect={(element) => {
                      selectFolder(element);
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
