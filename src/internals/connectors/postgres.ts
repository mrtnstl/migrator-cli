import { Client } from "pg";
import { Connector } from "./connector.js";

export class PostgresConnector implements Connector {
    client: Client | undefined = undefined;

    constructor(connStr: string) {
        this.connect(connStr);
    }

    connect(connectionStr: string): Client {
        const client = new Client({
            connectionString: connectionStr,
        });
        this.client = client;
        return client;
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.end();
        }
        return;
    }
}
