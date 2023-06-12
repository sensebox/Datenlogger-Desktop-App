use serde::{Deserialize, Serialize};
use std::{env, fs, path};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserConfig {
  pub threads: i32,
  pub theme: String,
}

impl Default for UserConfig {
  fn default() -> Self {
    Self {
      threads: 1,
      theme: String::from('1'),
    }
  }
}

impl UserConfig {
  pub fn init_config() -> UserConfig {
    let home_dir = tauri::api::path::home_dir();
    match home_dir {
      Some(home_dir) => {
        let app_config = path::Path::new(&home_dir);
        let app_config = app_config.join(".reedu");
        let app_data  = app_config.join("data");
        println!("{:?}", app_config);
        fs::create_dir_all(app_config).unwrap();
        fs::create_dir_all(app_data).unwrap();
        println!("{:?}", env::current_dir());
        println!("{:?}", env::current_exe());

        UserConfig::default()
      }
      None => UserConfig::default()
    }
  }
}