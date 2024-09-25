import { SenseboxConfig } from "@/types";

export const readConfig = (inputString: string): SenseboxConfig => {
  // Define a key mapping for normalization
  const keyMapping: Record<string, keyof SenseboxConfig> = {
    name: "name",
    device_id: "sensebox_id",
    sensebox_id: "sensebox_id",
    ssid: "ssid",
    psk: "psk",
    temp_id: "temp_id",
    temperatur_sensorid: "temp_id",
    humi_id: "humi_id",
    luftfeuchte_sensorid: "humi_id",
    dist_l_id: "dist_l_id",
    dist_r_id: "dist_r_id",
    pm10_id: "pm10_id",
    pm25_id: "pm25_id",
    acc_x_id: "acc_x_id",
    acc_y_id: "acc_y_id",
    acc_z_id: "acc_z_id",
    speed_id: "speed_id",
  };

  // Split the input string by line breaks to get each key-value pair
  const lines = inputString.split("\n");

  // Reduce the lines into a SenseboxConfig object
  const result = lines.reduce((acc: Partial<SenseboxConfig>, line: string) => {
    // Split each line into key and value by '='
    const [key, value] = line.split("=");
    if (key && value) {
      // Trim spaces, convert key to lowercase, and normalize the key
      const normalizedKey = keyMapping[key.trim().toLowerCase()];
      if (normalizedKey) {
        acc[normalizedKey] = value.trim();
      }
    }
    return acc;
  }, {} as Partial<SenseboxConfig>);

  // Ensure the required properties are present and cast to SenseboxConfig
  if (!result.name || !result.sensebox_id) {
    throw new Error('Missing required properties: "name" or "sensebox_id".');
  }

  return result as SenseboxConfig;
};
