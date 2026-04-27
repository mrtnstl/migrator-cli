import { DatabaseSync } from "node:sqlite";
import { Connector } from "./connector.js";

export class SqliteConnector implements Connector {
    private client;
    // connStr is the path
    constructor(connStr: string) {
        this.client = new DatabaseSync(connStr);
    }

    async disconnect(): Promise<void> {
        return new Promise(resolve => {
            if (this.client) {
                this.client.close();
            }
            resolve();
        });
    }

    getClient() {
        try {
            return this.client;
        } catch (err: unknown) {
            throw new Error("Database connection error!", {
                cause: err,
            });
        }
    }
}
