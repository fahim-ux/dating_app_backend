import { Client,auth } from "cassandra-driver";
import dotenv from 'dotenv';
dotenv.config();
// import * from '../../../secure-connect-d8-msg-db'

const secureConnectBundlePath = '../dating_app_backend/secure-connect-d8-msg-db.zip'

const clientId = process.env.ASTRA_CLIENT_ID? process.env.ASTRA_CLIENT_ID : '';
const clientSecret = process.env.ASTRA_SECRET? process.env.ASTRA_SECRET : '';

const authProvider = new auth.PlainTextAuthProvider(clientId, clientSecret);

const client = new Client({
    cloud: { secureConnectBundle: secureConnectBundlePath },
    credentials: {username: clientId, password: clientSecret},
})

export async function connectToCassandra() {
    try {
        await client.connect();
        console.log('Connected to Cassandra DB');
    } catch (error) {
        console.error('Error connecting to Cassandra', error);
    }
}
export async function disconnectFromCassandra() {
    try {
        await client.shutdown();
        console.log('Disconnected from Cassandra DB');
    } catch (error) {
        console.error('Error disconnecting from Cassandra', error);
    }
}
export async function query() {
    try {
        const result = await client.execute("SELECT keyspace_name FROM system_schema.keyspaces;");
        console.log('Data from users table:', result.rows);
      } catch (error) {
        console.error('Error querying Astra DB:', error);
    }
}