use serde::{Serialize, Serializer, ser::SerializeStruct};

#[derive(Default, Debug)]
pub struct SenseboxConfig {
    pub name: String,
    pub sensebox_id: String,
    pub ssid: String,
    pub psk: String,
    pub temp_id: String,
    pub humi_id: String,
    pub dist_l_id: String,
    pub dist_r_id: String,
    pub pm10_id: String,
    pub pm25_id: String,
    pub acc_x_id: String,
    pub acc_y_id: String,
    pub acc_z_id: String,
    pub speed_id: String
}

impl SenseboxConfig {
    pub fn new() -> Self {
        Default::default()
    }
}

impl Serialize for SenseboxConfig {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("SenseboxConfig", 4)?;
        s.serialize_field("name", &self.name)?;
        s.serialize_field("sensebox_id", &self.sensebox_id)?;
        s.serialize_field("ssid", &self.ssid)?;
        s.serialize_field("psk", &self.psk)?;
        s.serialize_field("temp_id", &self.temp_id)?;
        s.serialize_field("humi_id", &self.humi_id)?;
        s.serialize_field("dist_r_id", &self.dist_l_id)?;
        s.serialize_field("dist_r_id", &self.dist_r_id)?;
        s.serialize_field("pm10_id", &self.pm10_id)?;
        s.serialize_field("pm25_id", &self.pm25_id)?;
        s.serialize_field("acc_x_id", &self.acc_x_id)?;
        s.serialize_field("acc_y_id", &self.acc_y_id)?;
        s.serialize_field("acc_z_id", &self.acc_z_id)?;
        s.serialize_field("speed_id", &self.speed_id)?;
        s.end()
    }
}