use serde::{Serialize, Serializer, ser::SerializeStruct};

#[derive(Default, Debug)]
pub struct FileInfo {
    pub filename: String,
    pub size: String,
}

impl FileInfo {
    pub fn new() -> Self {
        Default::default()
    }
}

impl Serialize for FileInfo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("FileInfo", 2)?;
        s.serialize_field("filename", &self.filename)?;
        s.serialize_field("size", &self.size)?;
        s.end()
    }
}