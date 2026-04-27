import { DatabaseSync } from "node:sqlite";
import { ensureError } from "../../common/errors.js";
import { Repository } from "./repository.js";

export class SqliteRepository implements Repository {
    client: DatabaseSync;
    constructor(client: DatabaseSync) {
        this.client = client;
    }

    beginTx(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client.exec("BEGIN TRANSACTION;");
                resolve();
            } catch (err) {
                reject(
                    ensureError(
                        new Error("Transaction failed at BEGIN", { cause: err })
                    )
                );
            }
        });
    }
    commitTx(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client.exec("COMMIT;");
                resolve();
            } catch (err) {
                reject(
                    ensureError(
                        new Error("Transaction failed at COMMIT", {
                            cause: err,
                        })
                    )
                );
            }
        });
    }
    rollbackTx(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client.exec("ROLLBACK;");
                resolve();
            } catch (err) {
                reject(
                    ensureError(
                        new Error("Transaction failed at ROLLBACK", {
                            cause: err,
                        })
                    )
                );
            }
        });
    }
    runMigration(migration: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client.exec(migration);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    getMetaTable(): Promise<{
        version: number;
        is_dirty: boolean;
        updated_at: Date;
    }> {
        return new Promise((resolve, reject) => {
            try {
                if (!this.client) {
                    throw new Error("Client is not initialized");
                }

                const stmt = this.client.prepare(
                    `SELECT version, is_dirty, updated_at 
                    FROM migrations 
                    WHERE id = 1;`
                );
                const result = stmt.all()[0] as unknown as {
                    version: number;
                    is_dirty: boolean;
                    updated_at: string;
                };

                if (!result) {
                    throw new Error("No rows found in migrations table");
                }

                resolve({
                    version: result.version,
                    is_dirty: result.is_dirty,
                    updated_at: new Date(result.updated_at),
                });
            } catch (err: unknown) {
                const formattedError = ensureError(err);
                if (
                    formattedError.message.includes(`no such table: migrations`)
                ) {
                    this.client.exec(`
                            CREATE TABLE IF NOT EXISTS migrations (
                                id INTEGER PRIMARY KEY DEFAULT 1,
                                version INTEGER NOT NULL DEFAULT 0,
                                is_dirty INTEGER NOT NULL DEFAULT 0,
                                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                            ) STRICT;
                            `);
                    this.client.exec(`
                            INSERT INTO migrations (version) 
                            VALUES (0);
                            `);

                    const stmt = this.client.prepare(`
                        SELECT version, is_dirty, updated_at 
                        FROM migrations 
                        WHERE id = 1;
                        `);
                    const result = stmt.all()[0] as unknown as {
                        version: number;
                        is_dirty: boolean;
                        updated_at: string;
                    };

                    resolve({
                        version: result.version,
                        is_dirty: result.is_dirty,
                        updated_at: new Date(result.updated_at),
                    });
                }

                reject(err);
            }
        });
    }
    setMigrationVersion(newVersion: number): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const stmt = this.client.prepare(
                    `
                    UPDATE migrations 
                    SET version = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = 1;
                    `
                );

                stmt.run(newVersion);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    setMigrationStateAsDirty(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client.exec(
                    `
                    UPDATE migrations
                    SET is_dirty = 1
                    WHERE id = 1;
                    `
                );
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}
