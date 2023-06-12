// @generated automatically by Diesel CLI.

diesel::table! {
    posts (id) {
        id -> Integer,
        title -> Text,
        body -> Text,
        published -> Bool,
    }
}

diesel::table! {
    uploads (id) {
        id -> Integer,
        device_id -> Text,
        filename -> Text,
        checksum -> Text,
        uploaded_at -> Nullable<Timestamp>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    posts,
    uploads,
);
