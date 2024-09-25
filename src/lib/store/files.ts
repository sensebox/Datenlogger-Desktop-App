import { FileStats } from "@/types";
import { create } from "zustand";

interface FilesState {
  files: FileStats[];
  setFiles: (files: FileStats[]) => void;
}

export const useFileStore = create<FilesState>()((set) => ({
  files: [],
  setFiles: (files: FileStats[]) => set({ files: files }),
}));
