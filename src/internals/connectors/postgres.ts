import { Client } from "pg";
import { Connector } from "./connector.js";

export class PostgresConnector implements Connector {
    private client: Client;

    constructor(connStr: string) {
        this.client = new Client({ connectionString: connStr });
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.end();
        }
        return;
    }

    async getClient() {
        try {
            return this.client.connect();
        } catch (err: any) {
            throw new Error("Database connection error!");
        }
    }
}
