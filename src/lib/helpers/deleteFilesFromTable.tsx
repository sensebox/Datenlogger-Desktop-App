import { invoke } from "@tauri-apps/api";

export const deleteFilesFromTable = async () => {
  try {
    await invoke("delete_files");
  } catch (error: any) {
    console.log(error);
  }
};
