// @generated automatically by Diesel CLI.

diesel::table! {
    files (id) {
        id -> Integer,
        device_id -> Text,
        filename -> Text,
        checksum -> Text,
    }
}

diesel::table! {
    posts (id) {
        id -> Integer,
        title -> Text,
        body -> Text,
        published -> Bool,
    }
}

diesel::table! {
    test (id) {
        id -> Integer,
        title -> Text,
        body -> Text,
        uploaded -> Bool,
    }
}

diesel::table! {
    uploads (id) {
        id -> Integer,
        device_id -> Text,
        filename -> Text,
        checksum -> Text,
        uploaded_at -> Timestamp,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    files,
    posts,
    test,
    uploads,
);
