import { FileInfo } from "@/types";
import { create } from "zustand";

interface FilesState {
  files: FileInfo[];
  setFiles: (files: FileInfo[]) => void;
}

export const useFileStore = create<FilesState>()((set) => ({
  files: [],
  setFiles: (files: FileInfo[]) => set({ files: files }),
}));
