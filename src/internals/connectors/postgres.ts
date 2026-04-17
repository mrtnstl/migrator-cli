import { Client } from "pg";
import { Connector } from "./connector.js";
import { ensureError } from "../../common/errors.js";

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
        } catch (err: unknown) {
            throw new Error("Database connection error!", {
                cause: err,
            });
        }
    }
}
