import { Client, QueryResult } from "pg";
import { PostgresRepository } from "../../../internals/repositories/postgres";

jest.mock("pg", () => {
    const mockClientInstance = {
        query: jest.fn(),
    };
    return {
        Client: jest.fn(() => mockClientInstance),
    };
});

describe("Postgres repository", () => {
    let mockClient: Client;
    let repository: PostgresRepository;

    beforeEach(() => {
        mockClient = new (require("pg").Client)() as jest.Mocked<Client>; //eslint-disable-line
        repository = new PostgresRepository(mockClient);
        jest.clearAllMocks();
    });

    it("beginTx() should execute BEGIN query", async () => {
        await repository.beginTx();
        expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
        expect(mockClient.query).toHaveBeenCalledTimes(1);
    });

    it("commitTx() should execute COMMIT query", async () => {
        await repository.commitTx();
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("rollbackTx() should execute ROLLBACK query", async () => {
        await repository.rollbackTx();
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("runMigration() should execute the provided sql statement", async () => {
        const migration =
            "CREATE TABLE test_migration (id SERIAL PRIMARY KEY);";

        await repository.runMigration(migration);
        expect(mockClient.query).toHaveBeenCalledWith(migration);
    });

    it("getMetaTable() should return metadata when table and row exists", async () => {
        const expectedData = {
            version: 2,
            is_dirty: false,
            updated_at: new Date("2026-04-26T12:00:00Z"),
        };

        (mockClient.query as jest.Mock).mockResolvedValueOnce({
            rows: [expectedData],
            rowCount: 1,
            command: "SELECT",
            fields: [],
            oid: 0,
        }) as unknown as QueryResult;

        const result = await repository.getMetaTable();

        expect(result).toEqual(expectedData);
        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining(
                "SELECT version, is_dirty, updated_at FROM migrations"
            )
        );
    });

    it("getMetaTable() should create migrations table, insert initial row when table doesn't exist", async () => {
        const relationErr = new Error('relation "migrations" does not exist');
        (mockClient.query as jest.Mock).mockRejectedValueOnce(relationErr);

        (mockClient.query as jest.Mock).mockResolvedValueOnce({} as any); //eslint-disable-line
        const insertedRow = {
            version: 0,
            is_dirty: false,
            updated_at: new Date(),
        };
        (mockClient.query as jest.Mock).mockResolvedValueOnce({
            rows: [insertedRow],
            rowCount: 1,
        } as QueryResult);

        const result = await repository.getMetaTable();

        expect(result).toEqual(insertedRow);
        expect(mockClient.query).toHaveBeenCalledTimes(3);
        expect(mockClient.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("CREATE TABLE IF NOT EXISTS migrations")
        );
    });

    it("getMetaTable() should throw 'No rows found in migrations table' if there are no meta data in migrations table", async () => {
        const noRowsFoundErr = new Error("No rows found in migrations table");

        (mockClient.query as jest.Mock).mockResolvedValueOnce({
            rows: [],
            rowCount: 0,
        });

        await expect(repository.getMetaTable()).rejects.toThrow(noRowsFoundErr);
    });

    it("getMetaTable() should throw 'Client is not initialized' if client or client.query is falsy", async () => {
        const clientUninitializedErr = new Error("Client is not initialized");

        (mockClient.query as jest.Mock).mockRejectedValueOnce(
            clientUninitializedErr
        );

        await expect(repository.getMetaTable()).rejects.toThrow(
            clientUninitializedErr
        );
    });

    it("getMetaTable() should throw on unexpected database error", async () => {
        const unexpectedErr = new Error("Connection timeout");

        (mockClient.query as jest.Mock).mockRejectedValueOnce(unexpectedErr);

        await expect(repository.getMetaTable()).rejects.toThrow(unexpectedErr);
    });

    it("setMigrationVersion() should update version and and set updated_at to current timestamp", async () => {
        (mockClient.query as jest.Mock).mockResolvedValueOnce({} as any); //eslint-disable-line

        await repository.setMigrationVersion(12);

        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining(`
                UPDATE migrations 
                SET version = $1, updated_at = NOW() 
                WHERE id = 1 
                RETURNING id, version, is_dirty, updated_at;
                `),
            [12]
        );
    });

    it("setMigrationStateAsDirty() should set is_dirty to TRUE", async () => {
        (mockClient.query as jest.Mock).mockResolvedValueOnce({} as any); //eslint-disable-line

        await repository.setMigrationStateAsDirty();

        expect(mockClient.query).toHaveBeenCalledWith(`
                UPDATE migrations
                SET is_dirty = TRUE
                WHERE id = 1;
                `);
    });
});
