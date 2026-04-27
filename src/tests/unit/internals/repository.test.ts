import { cwd } from "node:process";
import { getRepository } from "../../../internals/repositories/helper";
import { PostgresRepository } from "../../../internals/repositories/postgres";
import { SqliteRepository } from "../../../internals/repositories/sqlite";
import { Client } from "pg";
import { DatabaseSync } from "node:sqlite";

describe("getRepository()", () => {
    const mockPGClient = {} as Client;
    const mockSQLiteClient = {} as DatabaseSync;

    it("should return a postgres repo instance", () => {
        const connStr = "postgresql://some-pg-db";
        const pgRepo = getRepository(mockPGClient, connStr);

        expect(pgRepo).toBeInstanceOf(PostgresRepository);
        expect(pgRepo).toHaveProperty("getMetaTable");
        expect(pgRepo).toHaveProperty("beginTx");
        expect(pgRepo).toHaveProperty("commitTx");
        expect(pgRepo).toHaveProperty("rollbackTx");
        expect(pgRepo).toHaveProperty("runMigration");
        expect(pgRepo).toHaveProperty("setMigrationVersion");
        expect(pgRepo).toHaveProperty("setMigrationStateAsDirty");
    });

    it("should return a sqlite repo instance", () => {
        const connStr = `sqlite://${cwd()}/src/mocks/test.db`;
        const sqliteRepo = getRepository(mockSQLiteClient, connStr);

        expect(sqliteRepo).toBeInstanceOf(SqliteRepository);
        expect(sqliteRepo).toHaveProperty("getMetaTable");
        expect(sqliteRepo).toHaveProperty("beginTx");
        expect(sqliteRepo).toHaveProperty("commitTx");
        expect(sqliteRepo).toHaveProperty("rollbackTx");
        expect(sqliteRepo).toHaveProperty("runMigration");
        expect(sqliteRepo).toHaveProperty("setMigrationVersion");
        expect(sqliteRepo).toHaveProperty("setMigrationStateAsDirty");
    });

    it("should throw on invalid connection string", () => {
        let err;
        try {
            const connStr = `unknowndb://some-db`;
            const repo = getRepository(mockPGClient, connStr);
        } catch (e) {
            err = e;
        } finally {
            expect(err).toBeInstanceOf(Error);
            expect((err as Error).message).toBe(
                "Invalid Client instance or connection string!"
            );
        }
    });
});
