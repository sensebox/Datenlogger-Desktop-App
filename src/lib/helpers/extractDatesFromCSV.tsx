import { FileStats } from "@/types";

export const extractDatesFromCSV = (csvContent: string): FileStats => {
  // Split the CSV content into lines
  const lines = csvContent.split("\n");

  // Extract the dates from the third column of each line
  const dates = lines
    .map((line) => {
      const columns = line.split(",");
      return columns[2]; // Assuming the date is in the 3rd column
    })
    .filter((date) => date); // Remove empty or invalid entries

  // Get the first and last dates
  const firstDate = dates[0] ?? "";
  const lastDate = dates[dates.length - 1] ?? "";
  return { firstDate, lastDate };
};
