type User = {
  boxes: any[];
  email: string;
  emailIsConfirmed: Boolean;
  language: string;
  name: string;
  role: string;
};

type SerialPort = {
  port: String;
  serialNumber: String;
  manufacturer: String;
  product: String;
};

type Device = {
  _id: string;
  name: string;
  exposure: string;
  model: string;
  grouptag: string[];
  useAuth: boolean;
  access_token: string;
};

type SenseboxConfig = {
  name: string;
  sensebox_id: string;
  ssid: string;
  psk: string;
  temp_id: string;
  humi_id: string;
  dist_l_id: string;
  dist_r_id: string;
  pm10_id: string;
  pm25_id: string;
  acc_x_id: string;
  acc_y_id: string;
  acc_z_id: string;
  speed_id: string;
};

type FileContent = {
  name: string;
  content: string;
  md5hash: string;
};

type SignInData = {
  user: User;
};

type SignInResponse = {
  code: string;
  data: SignInData;
  message: string;
  refreshToken: string;
  token: string;
};

type Upload = {
  id: number;
  filename: string;
  device_id: string;
  checksum: string;
  uploaded_at: Date;
};

export {
  Device,
  SerialPort,
  User,
  SenseboxConfig,
  FileContent,
  SignInData,
  SignInResponse,
  Upload,
};
