use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use std::{env, path};

pub fn establish_connection() -> SqliteConnection {
  let _env = env::var("DATABASE_URL");

  match _env {
    Ok(_env) => {
      let database_url = &env::var("DATABASE_URL").unwrap();

      SqliteConnection::establish(&database_url)
        .expect(&format!("Error connecting to {}", &database_url))
    }
    Err(_) => {
      println!("No DATABASE_URL found");

      let database_url = path::Path::new(&tauri::api::path::home_dir().unwrap()).join(".reedu").join("upload.db");

      let database_url = database_url.to_str().clone().unwrap();

      SqliteConnection::establish(&database_url).expect(&format!("Error connecting to {}", &database_url))
    }
  }
}