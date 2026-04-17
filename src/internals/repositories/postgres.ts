import { Client } from "pg";
import { Repository } from "./repository.js";
import { ensureError } from "../../common/errors.js";

export class PostgresRepository implements Repository {
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    async beginTx(): Promise<void> {
        await this.client.query("BEGIN");
    }
    async commitTx(): Promise<void> {
        await this.client.query("COMMIT");
    }
    async rollbackTx(): Promise<void> {
        await this.client.query("ROLLBACK");
    }
    async runMigration(migration: string): Promise<void> {
        await this.client.query(migration);
        return;
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
            }>(
                "SELECT version, is_dirty, updated_at FROM migrations WHERE id = 1;"
            );

            if (queryResult.rows.length === 0) {
                throw new Error("No rows found in migrations table");
            }

            const meta = queryResult.rows[0];

            return meta;
        } catch (err: unknown) {
            const formattedError = ensureError(err);
            if (
                formattedError.message.includes(
                    `relation "migrations" does not exist`
                )
            ) {
                await this.client.query(`
                    CREATE TABLE IF NOT EXISTS migrations (
                        id SMALLINT PRIMARY KEY DEFAULT 1,
                        version INT NOT NULL DEFAULT 0,
                        is_dirty BOOL NOT NULL DEFAULT FALSE,
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );
                    `);
                const insertRecord = await this.client.query<{
                    version: number;
                    is_dirty: boolean;
                    updated_at: Date;
                }>(`
                    INSERT INTO migrations (version) 
                    VALUES (0) 
                    RETURNING version, is_dirty, updated_at;
                    `);
                return insertRecord.rows[0];
            }

            throw err;
        }
    }
    async setMigrationVersion(newVersion: number): Promise<void> {
        await this.client.query(
            `
                UPDATE migrations 
                SET version = $1, updated_at = NOW() 
                WHERE id = 1 
                RETURNING id, version, is_dirty, updated_at;
                `,
            [newVersion]
        );

        return;
    }

    async setMigrationStateAsDirty(): Promise<void> {
        await this.client.query(
            `
                UPDATE migrations
                SET is_dirty = TRUE
                WHERE id = 1;
                `
        );
    }
}
