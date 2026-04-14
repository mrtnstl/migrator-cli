import { Client } from "pg";
import { Repository } from "./repository.js";

export class PostgresRepository implements Repository {
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    async getMetaTable(): Promise<{
        version: number;
        is_dirty: boolean;
        updated_at: Date;
    }> {
        try {
            if (!this.client || !this.client.query) {
                throw new Error("Client is not initialized");
            }

            const queryResult = await this.client.query<{
                version: number;
                is_dirty: boolean;
                updated_at: Date;
            }>("SELECT * FROM migrations;");

            if (queryResult.rows.length === 0) {
                throw new Error("No rows found in migrations table");
            }

            // Általában csak az első sort vesszük (meta tábla esetén)
            const meta = queryResult.rows[0];

            return meta;
        } catch (err) {
            throw err;
        }
    }

    async runMigration(migration: string): Promise<void> {
        try {
            await this.client?.query(migration);
            return;
        } catch (err) {
            throw err;
        }
    }
}
