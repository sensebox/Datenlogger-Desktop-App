import { invoke } from "@tauri-apps/api";
import { readCSVFile, readDirectory } from "../fs";
import { createChecksum } from "./createChecksum";

export const checkFilesUploaded = async (files: any[], sensebox_id: string) => {
  const syncedFiles = await readDirectory(`.reedu/data/${sensebox_id}`).then(
    (files) => files.filter((file) => file.name?.toLowerCase().endsWith(".csv"))
  );

  const uploadedFiles: any = await invoke("get_data", {
    device: sensebox_id,
  });

  console.log(uploadedFiles);

  const tmpData: any[] = await Promise.all(
    files.map(async (file) => {
      let status = "pending";

      const fileIsSynced = syncedFiles.findIndex(
        (syncedFile) => syncedFile.name === file.filename
      );

      // if file is not synced return pending
      if (fileIsSynced === -1) {
        return {
          filename: file.filename,
          size: file.size,
          status: "pending",
          createdAt: "N/A",
        };
      }
      // check if file with the same size and name is already in the database
      const csvContent = await readCSVFile(
        `.reedu/data/${sensebox_id}/${file.filename}`
      );
      const checksum = createChecksum(
        `${file.filename}_${csvContent.split("\n")[0]}`
      );
      const fileIsUploaded = uploadedFiles.findIndex(
        (uploadedFile: any) => uploadedFile.checksum === checksum
      );

      // if file is synced but not uploaded return synced
      if (fileIsUploaded === -1) {
        return {
          filename: file.filename,
          size: file.size,
          status: "synced",
          createdAt: "N/A",
        };
      }
      // if all check succeed return uploaded
      return {
        filename: file.filename,
        size: file.size,
        status: "uploaded",
        createdAt: "N/A",
      };
    })
  );
  return tmpData;
};
