// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[macro_use]
extern crate diesel;
extern crate diesel_migrations;

use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

mod cmd;
mod core;

mod db;
mod models;
mod schema;
mod sensebox;
mod serialports;
mod fileinfo;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

fn main() {

    core::config::UserConfig::init_config();

    let context = tauri::generate_context!();
    let mut connection = db::establish_connection();

    connection
        .run_pending_migrations(MIGRATIONS)
        .expect("Error migrating");

    tauri::Builder::default()
        .setup(|app| Ok(()))
        .invoke_handler(tauri::generate_handler![
            cmd::list_serialport_devices,
            cmd::connect_read_config,
            cmd::connect_list_files,
            cmd::delete_file,
            cmd::save_data_to_file,
            cmd::get_file_content,
            cmd::get_data,
            cmd::insert_data,
        ])
        .run(context)
        .expect("error while running tauri application");
}
