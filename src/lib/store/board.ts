import { SenseboxConfig, SerialPort } from "@/styles/types";
import { create } from "zustand";

interface BoardState {
  config: SenseboxConfig | null;
  serialPort: SerialPort | null;
  setConfig: (config: SenseboxConfig) => void;
  setSerialPort: (port: SerialPort) => void;
}

export const useBoardStore = create<BoardState>()((set) => ({
  config: null,
  serialPort: null,
  setConfig: (config: SenseboxConfig) => set({ config: config }),
  setSerialPort: (serialPort: SerialPort) => set({ serialPort: serialPort }),
}));
