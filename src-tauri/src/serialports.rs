use serde::{Serialize, Serializer, ser::SerializeStruct};

pub struct SerialPorts {
    port: String,
    serial_number: String,
    manufacturer: String,
    product: String,
}

impl SerialPorts {
    pub fn new(port: String, serial_number: String, manufacturer: String, product: String) -> Self {
        Self {
            port,
            serial_number,
            manufacturer,
            product
        }
    }
}

impl Serialize for SerialPorts {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("User", 4)?;
        s.serialize_field("port", &self.port)?;
        s.serialize_field("serialNumber", &self.serial_number)?;
        s.serialize_field("manufacturer", &self.manufacturer)?;
        s.serialize_field("product", &self.product)?;
        s.end()
    }
}