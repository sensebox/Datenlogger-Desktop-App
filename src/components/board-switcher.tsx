import * as React from "react";
import { Check, ChevronsUpDown, ListRestartIcon, Cpu } from "lucide-react"; // Verwende ein Icon, das Geräte repräsentiert
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
import { SenseboxConfig, SerialPort } from "@/types";
import { useBoardStore } from "@/lib/store/board";
import { createDirectory } from "@/lib/fs";
import LoadingOverlay from "./ui/LoadingOverlay";
import { useToast } from "./ui/use-toast";

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
  const [loading, setLoading] = React.useState(false);

  async function listSerialports() {
    setSerialPorts(await invoke("list_serialport_devices"));
  }

  async function connectAndReadConfig(serialPort: SerialPort) {
    try {
      setLoading(true);
      const boardConfig: SenseboxConfig = await invoke("connect_read_config", {
        port: serialPort.port,
        command: "<3 config>",
      });
      await createDirectory(`.reedu/data/${boardConfig.sensebox_id}`);
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
              "w-[250px] justify-between p-3 bg-white rounded-lg shadow-md",
              className
            )}
          >
            {selectedBoard ? (
              <>
                <Cpu className="mr-2 h-4 w-4 text-green-400" />
                {selectedBoard.port} ({selectedBoard.product})
              </>
            ) : (
              "No device selected"
            )}
            <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-2 bg-white rounded-lg shadow-md">
          <Command>
            <CommandList>
              {/* <CommandInput placeholder="Search devices..." /> */}
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
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                  >
                    <Cpu className="h-4 w-4 text-blue-400" />
                    <span className="flex-1 text-sm">
                      {serialPort.port} ({serialPort.product})
                    </span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 text-green-400",
                        selectedBoard?.port === serialPort.port
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            {/* <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      listSerialports();
                    }}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                  >
                    <ListRestartIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">Refresh List</span>
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList> */}
          </Command>
        </PopoverContent>
      </Popover>
      {loading && <LoadingOverlay />}
    </Dialog>
  );
}
