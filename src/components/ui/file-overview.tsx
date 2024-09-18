import { FileStats } from "@/types";
import { FileText, Calendar, List, CloudIcon } from "lucide-react";

type FileOverviewProps = {
  file: FileStats;
};

export function FileOverview({ file }: FileOverviewProps) {
  return (
    <div className="flex flex-col text-gray-700">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">File Overview:</h3>
        <ul className="mt-2 space-y-2">
          <li className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-sm">
              File: <span className="font-medium">{file.filename}</span>
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <CloudIcon className="w-4 h-4 text-teal-500" />
            <span className="text-sm">
              Device ID: <span className="font-medium">{file.deviceId}</span>
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <List className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              Messungen: <span className="font-medium">{file.lines}</span>
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-sm">
              Erste Messung:{" "}
              <span className="font-medium">{file.firstDate}</span>
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-red-500" />
            <span className="text-sm">
              Letzte Messung:{" "}
              <span className="font-medium">{file.lastDate}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
