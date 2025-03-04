import { Client,auth } from "cassandra-driver";
import cluster from "cluster";
import dotenv from 'dotenv';
import {Message} from "../../models/Message";
import { v4 as uuid } from "uuid";
dotenv.config();
// import * from '../../../secure-connect-d8-msg-db'

const secureConnectBundlePath = '../dating_app_backend/secure-connect-d8-msg-db.zip'

const clientId = process.env.ASTRA_CLIENT_ID? process.env.ASTRA_CLIENT_ID : '';
const clientSecret = process.env.ASTRA_SECRET? process.env.ASTRA_SECRET : '';


export const CassandraClient = new Client({
    cloud: { secureConnectBundle: secureConnectBundlePath },
    credentials: {username: clientId, password: clientSecret},
})
export async function connectToCassandra(){

    try {
        await CassandraClient.connect();
        console.log('Connected to Cassandra DB');
        return CassandraClient;
    } catch (error) {
        console.error('Error connecting to Cassandra', error);
    }
}
export async function disconnectFromCassandra() {
    try {
        await CassandraClient.shutdown();
        console.log('Disconnected from Cassandra DB');
    } catch (error) {
        console.error('Error disconnecting from Cassandra', error);
    }
}
export async function query() {
    try {
        const result = await CassandraClient.execute("SELECT keyspace_name FROM system_schema.keyspaces;");
        console.log('Data from users table:', result.rows);
      } catch (error) {
        console.error('Error querying Astra DB:', error);
    }
}


export async function insertMessage(message:Message) {
    const query = `
        INSERT INTO messages_keyspace.messages (conversation_id, created_at, message_id,  media_url, message_text, receiver_id, sender_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?,?)
    `;
    const messageId = uuid();
    const media_url = 'NA';
    const params = [message.conversation_id, message.created_at, messageId,media_url, message.message_text,message.receiver_id, message.sender_id,message.status];
    try {
        await CassandraClient.execute(query, params, { prepare: true });
        console.log('<Cassandra Client>: Message inserted successfully');
    } catch (error) {
        console.error('<Cassandra Client>: Error inserting message:', error);
    }
}
// CREATE TABLE messages_keyspace.messages (
//     conversation_id text,
//     created_at timestamp,
//     message_id uuid,
//     media_url text,
//     message_text text,
//     receiver_id text,
//     sender_id text,
//     status text,
//     PRIMARY KEY (conversation_id, created_at, message_id)
// ) WITH CLUSTERING ORDER BY (created_at DESC, message_id DESC) 