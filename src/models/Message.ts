export interface Message {
    conversation_id: string;
    created_at: Date;
    // message_id: string;
    sender_id: string;
    receiver_id: string;
    message_text: string;
    status: string;
}


// conversation_id text,
// created_at timestamp,
// message_id uuid,
// media_url text,
// message_text text,
// receiver_id text,
// sender_id text,
// status text,
// PRIMARY KEY (conversation_id, created_at, message_id)