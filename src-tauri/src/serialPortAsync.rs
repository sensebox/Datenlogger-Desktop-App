use serial2_tokio::SerialPort;
use std::error::Error;
use tokio::time::{timeout, Duration, Instant};

#[tauri::command]
pub async fn write_and_read_serialport(port: String, baud_rate: u32, command: String) -> Result<String, ()> {
    // Öffne den seriellen Port mit dem angegebenen Portnamen und der Baudrate
    let mut port = SerialPort::open(&port, baud_rate).map_err(|e| {
        eprintln!("Error opening serial port: {}", e);
        ()
    })?;
    
    // Konvertiere den Befehl in Bytes
    let command_bytes = command.into_bytes();
    
    // Schreibe den Befehl auf den seriellen Port
    match timeout(Duration::from_secs(2), port.write_all(&command_bytes)).await {
        Ok(Ok(_)) => {
            println!("Befehl erfolgreich gesendet.");
        }
        Ok(Err(e)) => {
            eprintln!("Error writing to serial port: {}", e);
            return Err(());
        },
        Err(_) => {
            eprintln!("Timeout writing to serial port");
            return Err(());
        },
    }

    // Lese die Antwort für 2 Sekunden
    let mut buffer = [0; 256];
    let mut collected_data = Vec::new();
    let start_time = Instant::now();

    while start_time.elapsed() < Duration::from_secs(2) {
        // Versuch, Daten vom seriellen Port mit einem Timeout von 1 Sekunde zu lesen
        match timeout(Duration::from_secs(1), port.read(&mut buffer)).await {
            Ok(Ok(bytes_read)) => {
                // Falls Daten gelesen werden, füge sie dem Vektor hinzu
                collected_data.extend_from_slice(&buffer[..bytes_read]);
            }
            Ok(Err(e)) => {
                eprintln!("Error reading from serial port: {}", e);
                return Err(());
            }
            Err(_) => {
                eprintln!("Timeout reading from serial port");
                break;
            }
        }
    }
    
    // Konvertiere die gesammelten Daten in einen String
    let result_string = String::from_utf8_lossy(&collected_data).to_string();
    
    Ok(result_string)
}


#[tauri::command]
pub async fn read_serialport(port: String) -> Result<String, ()> {
    // Open the serial port with the provided port name and baud rate
    let mut port = SerialPort::open(&port, 9600).map_err(|e| {
        eprintln!("Error opening serial port: {}", e);
        ()
    })?;
    
    let mut buffer = [0; 256];
    let mut collected_data = Vec::new();
    
    // Start the timer
    let start_time = Instant::now();
    
    // Read data for 2 seconds
    while start_time.elapsed() < Duration::from_secs(2) {
        // Attempt to read from the serial port with a timeout of 1 second
        match timeout(Duration::from_secs(1), port.read(&mut buffer)).await {
            Ok(Ok(bytes_read)) => {
                // If data is read, collect it into the vector
                collected_data.extend_from_slice(&buffer[..bytes_read]);
            }
            Ok(Err(e)) => {
                eprintln!("Error reading from serial port: {}", e);
                return Err(());
            }
            Err(_) => {
                // Timeout occurred, continue reading until 2 seconds have passed
                eprintln!("Timeout reading from serial port");
                break;
            }
        }
    }
    
    // Convert the collected data to a String
    let result_string = String::from_utf8_lossy(&collected_data).to_string();
    
    Ok(result_string)
}
