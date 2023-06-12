use diesel::prelude::*;
use crate::schema::{posts, uploads};

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

#[derive(Queryable)]
pub struct Upload {
    pub id: i32,
    pub device_id: String,
    pub filename: String,
    pub checksum: String,
    pub uploaded_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = uploads)]
pub struct NewUpload<'a> {
    pub device_id: &'a str,
    pub filename: &'a str,
    pub checksum: &'a str,
}