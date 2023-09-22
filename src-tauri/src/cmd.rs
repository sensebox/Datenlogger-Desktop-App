use crate::db;
use crate::fileinfo::FileInfo;
use crate::models::{NewPost, NewUpload, Post, Test, Upload};
use crate::schema::uploads::{self, device_id};
use crate::sensebox::SenseboxConfig;
use crate::serialports::SerialPorts;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serialport::SerialPortType;
use std::io::{self, Read};
use std::process::Command;
use std::time::Duration;
use std::{env, path};
use sysinfo::{NetworkExt, NetworksExt, ProcessExt, System, SystemExt};
use tauri::command;
#[derive(Serialize, Deserialize)]
pub struct File {
    pub filename: String,
    pub content: String,
    pub md5hash: String,
}

#[command]
pub fn list_serialport_devices() -> Vec<SerialPorts> {
    println!("Serialport devices");
    let mut serial_ports: Vec<SerialPorts> = Vec::new();
    let ports = serialport::available_ports().expect("No ports found!");
    for p in ports {
        println!("Name: {}", p.port_name);

        match p.port_type {
            SerialPortType::UsbPort(info) => {
                println!("   Type: USB");
                println!("   VID:{:04x} PID:{:04x}", info.vid, info.pid);
                println!(
                    "   Serial Number: {}",
                    info.serial_number.as_ref().map_or("", String::as_str)
                );
                println!(
                    "   Manufacturer: {}",
                    info.manufacturer.as_ref().map_or("", String::as_str)
                );
                println!(
                    "   Product: {}",
                    info.product.as_ref().map_or("", String::as_str)
                );
                let a = info.product.as_ref().map_or("", String::as_str);
                let b = "senseBox MCU";

                if (info.vid == 0x04d8 && info.pid == 0xef67) {
                    serial_ports.push(SerialPorts::new(
                        p.port_name,
                        info.serial_number.unwrap_or("".to_owned()),
                        "senseBox".to_owned(),
                        "senseBox MCU".to_owned(),
                    ))
                } else {
                    serial_ports.push(SerialPorts::new(
                        p.port_name,
                        info.serial_number.unwrap_or("".to_owned()),
                        info.manufacturer.unwrap_or("".to_owned()),
                        info.product.unwrap_or("".to_owned()),
                    ));
                }
                // }
            }
            SerialPortType::BluetoothPort => {
                // println!("    Type: Bluetooth");
            }
            SerialPortType::PciPort => {
                // println!("    Type: PCI");
            }
            SerialPortType::Unknown => {
                // println!("    Type: Unknown");
            }
        }
    }

    serial_ports.into()
}

#[command]
pub fn connect_read_config(port: &str, command: &str) -> Result<SenseboxConfig, String> {
    // Open port
    let mut port = match serialport::new(port.to_string(), 115_200)
        .timeout(Duration::from_millis(5000))
        .open()
    {
        Ok(port) => port,
        Err(error) => return Err(format!("Failed to open port: {}", error)),
    };

    // Write data
    println!("Command: {}", command.to_string());
    let written_bytes = match port.write(command.as_bytes()) {
        Ok(bytes) => bytes,
        Err(error) => return Err(format!("Write failed: {}", error)),
    };
    println!("Written bytes len = {}", written_bytes);

    let mut buffer = String::new();
    port.read_to_string(&mut buffer);
    println!("result: {}", buffer);
    // Check if the last 3 chars are "end"
    if !buffer.ends_with("end") {
        return Err("Übertragung fehlgeschlagen: Not ending with |end ".to_string());
    }
    let parts: Vec<&str> = buffer.trim().split('|').collect();
    if parts.len() < 3 {
        return Err("Übertragung fehlgeschlagen: Not 3 parts".to_string());
    }
    let content = parts[1].to_string();

    // Parse config.cfg string and serialize into SenseboxConfig
    let mut config: SenseboxConfig = SenseboxConfig::new();
    for line in content.lines() {
        if !line.starts_with("#") && line.len() > 0 {
            let parts: Vec<&str> = line.split("=").collect();
            match parts[0] {
                "NAME" => config.name = parts[1].to_string(),
                "SENSEBOX_ID" => config.sensebox_id = parts[1].to_string(),
                "DEVICE_ID" => config.sensebox_id = parts[1].to_string(),
                "SSID" => config.ssid = parts[1].to_string(),
                "PSK" => config.psk = parts[1].to_string(),
                "TEMP_ID" => config.temp_id = parts[1].to_string(),
                "TEMPERATUR_SENSORID" => config.temp_id = parts[1].to_string(),
                "HUMI_ID" => config.humi_id = parts[1].to_string(),
                "LUFTFEUCHTE_SENSORID" => config.humi_id = parts[1].to_string(),
                "DIST_L_ID" => config.dist_l_id = parts[1].to_string(),
                "DIST_R_ID" => config.dist_r_id = parts[1].to_string(),
                "PM10_ID" => config.pm10_id = parts[1].to_string(),
                "PM25_ID" => config.pm25_id = parts[1].to_string(),
                "ACC_Y_ID" => config.acc_y_id = parts[1].to_string(),
                "ACC_X_ID" => config.acc_x_id = parts[1].to_string(),
                "ACC_Z_ID" => config.acc_z_id = parts[1].to_string(),
                "SPEED_ID" => config.speed_id = parts[1].to_string(),
                &_ => println!("Unknown config key: {}", parts[0]),
            }
        }
    }

    Ok(config)
}

#[command]
pub fn connect_list_files(port: &str, command: &str) -> Result<Vec<FileInfo>, String> {
    // Open port
    println!("Port: {}", port.to_string());
    let mut port = match serialport::new(port.to_string(), 115_200)
        .timeout(Duration::from_millis(2000))
        .open()
    {
        Ok(port) => port,
        Err(error) => return Err(format!("Failed to open port: {}", error)),
    };

    // Write data
    println!("Command: {}", command.to_string());
    let written_bytes = match port.write(command.as_bytes()) {
        Ok(bytes) => bytes,
        Err(error) => return Err(format!("Write failed: {}", error)),
    };
    println!("Written bytes len = {}", written_bytes);
    println!(
        "Receiving data on {} at {} baud:",
        "/dev/cu.usbmodem1101", 115_200
    );

    // Wait for data
    loop {
        let available_bytes = match port.bytes_to_read() {
            Ok(bytes) => bytes,
            Err(error) => return Err(format!("Failed to read buffer size: {}", error)),
        };
        if available_bytes > 0 {
            break;
        }
        println!("No data");
        std::thread::sleep(std::time::Duration::from_millis(2000));
    }

    // Read data
    // let mut buffer = String::new();
    // port.read_to_string(&mut buffer);
    let mut buffer = String::new();
    loop {
        let available_bytes = match port.bytes_to_read() {
            Ok(bytes) => bytes,
            Err(error) => return Err(format!("Failed to read buffer size: {}", error)),
        };
        if available_bytes == 0 {
            println!("No more data");
            break;
        }
        port.read_to_string(&mut buffer);
    }

    // Parse config.cfg string and serialize into SenseboxConfig
    let mut files: Vec<FileInfo> = Vec::new();
    for line in buffer.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() == 2 {
            files.push(FileInfo {
                filename: parts[0].to_string(),
                size: parts[1].to_string(),
            });
        }
    }
    println!("{}", files.len());

    Ok(files)
}

#[command]
pub fn delete_file(port: &str, command: &str) -> Result<String, String> {
    let mut port = match serialport::new(port.to_string(), 115_200)
        .timeout(Duration::from_millis(2000))
        .open()
    {
        Ok(port) => port,
        Err(error) => return Err(format!("Failed to open port: {}", error)),
    };

    // Write data
    println!("Command: {}", command.to_string());
    let written_bytes = match port.write(command.as_bytes()) {
        Ok(bytes) => bytes,
        Err(error) => return Err(format!("Write failed: {}", error)),
    };
    println!("Written bytes len = {}", written_bytes);

    // Wait for data
    loop {
        let available_bytes = match port.bytes_to_read() {
            Ok(bytes) => bytes,
            Err(error) => return Err(format!("Failed to read buffer size: {}", error)),
        };
        if available_bytes > 0 {
            break;
        }
        println!("No data");
        std::thread::sleep(std::time::Duration::from_millis(2000));
    }

    // Read data
    let mut buffer = String::new();
    port.read_to_string(&mut buffer);
    // println!("result: {}", buffer);

    Ok(buffer)
}

#[command]
pub fn get_file_content(port: &str, command: &str) -> Result<File, String> {
    let mut port = match serialport::new(port.to_string(), 115_200)
        .timeout(Duration::from_millis(2000))
        .open()
    {
        Ok(port) => port,
        Err(error) => return Err(format!("Failed to open port: {}", error)),
    };

    // Write data
    println!("Command: {}", command.to_string());
    let written_bytes = match port.write(command.as_bytes()) {
        Ok(bytes) => bytes,
        Err(error) => return Err(format!("Write failed: {}", error)),
    };
    println!("Written bytes len = {}", written_bytes);

    // Wait for data

    // Read data
    let mut buffer = String::new();
    port.read_to_string(&mut buffer);
    println!("result: {}", buffer);
    // Check if the last 3 chars are "end"
    if !buffer.ends_with("end") {
        return Err("Übertragung fehlgeschlagen: Not ending with |end ".to_string());
    }
    let parts: Vec<&str> = buffer.trim().split('|').collect();
    // if parts has more than 2 parts then return the parts as a File struct
    // if not return an error
    if parts.len() != 3 {
        return Err("Error: File has less than 3 parts".to_string());
    }
    let filename = parts[0].to_string();
    let content = parts[1].to_string();
    let md5hash = parts[2].to_string();

    return Ok(File {
        filename,
        content,
        md5hash,
    });
}

#[command]
pub fn save_data_to_file(
    data: String,
    device_folder: String,
    file_path: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let app_dir = path::Path::new(&tauri::api::path::home_dir().unwrap())
        .join(".reedu")
        .join("data")
        .join(device_folder);

    std::fs::create_dir(&app_dir);

    // let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let app_str = app_dir.to_str().unwrap();
    let realpath = format!("{}/{}", app_str, file_path);
    println!("File is saved at: {}", realpath);
    match std::fs::write(&realpath, &data) {
        Ok(_) => {
            let success_message = format!("File '{}' successfully saved.", file_path);
            Ok(success_message)
        }
        Err(err) => {
            let error_message = format!("Error when saving... '{}': {}", file_path, err);
            Err(error_message)
        }
    }
}

#[command]
pub fn get_data(device: String) -> Result<Vec<Upload>, String> {
    use crate::schema::uploads::dsl::*;

    let mut connection = db::establish_connection();

    let results = uploads
        .filter(device_id.eq(device))
        .load::<Upload>(&mut connection)
        .expect("Error loading posts.");

    // println!("Displaying {} posts", results.len());
    // for post in results {
    //     println!("{}", post.device_id);
    //     println!("-----------\n");
    //     println!("{}", post.filename);
    // }
    Ok(results)
}

#[tauri::command]
pub fn insert_data(filename: String, device: String, checksum: String) {
    use crate::schema::uploads;

    let mut connection = db::establish_connection();

    let new_upload = NewUpload {
        filename: &filename,
        device_id: &device,
        checksum: &checksum,
    };

    let result = diesel::insert_into(uploads::table)
        .values(new_upload)
        .execute(&mut connection);

    println!("{:?}", result);
}

#[tauri::command]
pub fn open_in_explorer() {
    // Überprüfen, welches Betriebssystem ausgeführt wird

    let app_dir = path::Path::new(&tauri::api::path::home_dir().unwrap())
        .join(".reedu")
        .join("data");

    print!("Running on ");
    if cfg!(target_os = "linux") {
        println!("Linux");
    } else if cfg!(target_os = "windows") {
        println!("Windows");
        // Windows
        Command::new("explorer")
            .args([app_dir]) // The comma after select is not a typo
            .spawn()
            .unwrap();
    } else if cfg!(target_os = "macos") {
        Command::new("open")
            .args([app_dir]) // i don't have a mac so not 100% sure
            .spawn()
            .unwrap();

        println!("Mac OS");
    } else {
        println!("Other");
    }
}

#[tauri::command]
pub fn upload_to_usb(app_handle: tauri::AppHandle) {
    // get a file from the project folder and save it to the
    let mut file_path = env::current_dir()
        .unwrap()
        .join("src")
        .join("assets")
        .join("hello_world.ino.bin");

    let mut file = std::fs::File::open(&file_path).unwrap();
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).unwrap();

    // print buffer
    println!("{:?}", buffer);
}
#[tauri::command]
pub fn list_disks() {
    let mut system = System::new_all();
    system.refresh_all();
    for disk in system.disks() {
        println!("{:?}", disk);
    }
}
