import {
  readDir,
  BaseDirectory,
  createDir,
  readTextFile,
} from "@tauri-apps/api/fs";

const readDirectory = async function (
  dirName: string,
  recursive: boolean = false
) {
  const entries = await readDir(dirName, {
    dir: BaseDirectory.Home,
    recursive: recursive,
  });
  return entries;
};

const createDirectory = async function (dirName: string) {
  await createDir(dirName, { dir: BaseDirectory.Home, recursive: true });
};

const readCSVFile = async function (fileName: string) {
  const contents = await readTextFile(fileName, {
    dir: BaseDirectory.Home,
  });
  return contents;
};

export { createDirectory, readDirectory, readCSVFile };
