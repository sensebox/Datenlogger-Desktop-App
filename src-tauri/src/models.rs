use diesel::prelude::*;
use crate::schema::{posts, uploads, files, test};
use serde::{Serialize, Deserialize};

#[derive(Queryable)]
pub struct Post {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub published: bool,
}

#[derive(Insertable)]
#[diesel(table_name = posts)]
pub struct NewPost<'a> {
    pub title: &'a str,
    pub body: &'a str,
}

#[derive(Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = uploads)]
pub struct Upload {
    pub id: i32,
    pub device_id: String,
    pub filename: String,
    pub checksum: String,
    pub uploaded_at: chrono::NaiveDateTime
}

#[derive(Insertable)]
#[diesel(table_name = uploads)]
pub struct NewUpload<'a> {
    pub device_id: &'a str,
    pub filename: &'a str,
    pub checksum: &'a str,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = files)]
pub struct File {
    pub id: i32,
    pub device_id: String,
    pub filename: String,
    pub checksum: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = test)]
pub struct Test {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub uploaded: bool,
}