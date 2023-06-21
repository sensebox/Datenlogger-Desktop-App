import * as React from "react";
import { Check, ChevronsUpDown, ListRestartIcon } from "lucide-react";

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
// import LoadingOverlay from "./ui/LoadingOverlay";
// import { ToastContainer } from "react-toastify";
// import showToast from "../helper/showToast";

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
      // showToast(`Successfully opened board at:${serialPort.port} `, "success");
    } catch (error) {
      setLoading(false);
      console.log(error);
      // showToast(`Error opening port: ${error}`, "error");
    }
  }

  return (
    <Dialog>
      {/* {loading ? (
        <div>
          <LoadingOverlay></LoadingOverlay>
        </div>
      ) : null} */}
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
            aria-label="Select a team"
            className={cn("w-[200px] justify-between", className)}
          >
            {selectedBoard ? selectedBoard.port : "No board selected"}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search boards..." />
              <CommandEmpty>No board found.</CommandEmpty>
              <CommandGroup key="boards" heading="Boards">
                {serialPorts?.map((serialPort, idx) => (
                  <CommandItem
                    key={idx}
                    onSelect={() => {
                      setSelectedBoard(serialPort);
                      connectAndReadConfig(serialPort);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    {serialPort.port} ({serialPort.product})
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
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
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      listSerialports();
                    }}
                  >
                    <ListRestartIcon className="mr-2 h-5 w-5" />
                    Refresh List
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {loading ? (
        <div>
          <LoadingOverlay></LoadingOverlay>
        </div>
      ) : null}
      {/* <ToastContainer /> */}
    </Dialog>
  );
}
