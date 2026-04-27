import { DatabaseSync } from "node:sqlite";
import { SqliteRepository } from "../../../internals/repositories/sqlite";
import { ensureError } from "../../../common/errors";

type MockStatement = {
    all: jest.Mock<any[], []>; //eslint-disable-line
    run: jest.Mock<any>; //eslint-disable-line
};

type MockDatabaseSync = {
    exec: jest.Mock<void, [string]>;
    prepare: jest.Mock<MockStatement, [string]>;
};

describe("Sqlite repository", () => {
    let mockClient: MockDatabaseSync;
    let repository: SqliteRepository;

    beforeEach(() => {
        mockClient = {
            exec: jest.fn(),
            prepare: jest.fn(),
        };

        repository = new SqliteRepository(
            mockClient as unknown as DatabaseSync
        );
        jest.clearAllMocks();
    });

    it("beginTx() should execute BEGIN query", async () => {
        await repository.beginTx();
        expect(mockClient.exec).toHaveBeenCalledWith("BEGIN TRANSACTION;");
        expect(mockClient.exec).toHaveBeenCalledTimes(1);
    });

    it("beginTx() should throw on unexpected error", async () => {
        const err = new Error("Transaction failed at BEGIN");
        const expectedErr = ensureError(
            new Error("Transaction failed at BEGIN", { cause: err })
        );

        (mockClient.exec as jest.Mock).mockImplementationOnce(() => {
            throw err;
        });

        await expect(repository.beginTx()).rejects.toThrow(expectedErr);
    });

    it("commitTx() should execute COMMIT query", async () => {
        await repository.commitTx();
        expect(mockClient.exec).toHaveBeenCalledWith("COMMIT;");
    });

    it("commitTx() should throw on unexpected error", async () => {
        const err = new Error("Transaction failed at COMMIT");
        const expectedErr = ensureError(
            new Error("Transaction failed at COMMIT", { cause: err })
        );
        (mockClient.exec as jest.Mock).mockImplementationOnce(() => {
            throw err;
        });

        await expect(repository.commitTx()).rejects.toThrow(expectedErr);
    });

    it("rollbackTx() should execute ROLLBACK query", async () => {
        await repository.rollbackTx();
        expect(mockClient.exec).toHaveBeenCalledWith("ROLLBACK;");
    });

    it("rollbackTx() should throw on unexpected error", async () => {
        const err = new Error("Transaction failed at ROLLBACK");
        const expectedErr = ensureError(
            new Error("Transaction failed at ROLLBACK", { cause: err })
        );
        (mockClient.exec as jest.Mock).mockImplementationOnce(() => {
            throw err;
        });

        await expect(repository.rollbackTx()).rejects.toThrow(expectedErr);
    });

    it("runMigration() should execute the provided sql statement", async () => {
        const migration = "CREATE TABLE test_migration (id INT PRIMARY KEY);";

        await repository.runMigration(migration);
        expect(mockClient.exec).toHaveBeenCalledWith(migration);
    });

    it("getMetaTable() should return metadata when table and row exists", async () => {
        const expectedData = {
            version: 2,
            is_dirty: 0,
            updated_at: new Date("2026-04-26T12:00:00Z"),
        };

        const mockStmt: MockStatement = {
            all: jest.fn().mockReturnValueOnce([expectedData]),
            run: jest.fn(),
        };

        (mockClient.prepare as jest.Mock).mockReturnValueOnce(mockStmt);

        const result = await repository.getMetaTable();

        expect(result).toEqual(expectedData);
        expect(mockClient.prepare).toHaveBeenCalledWith(
            `SELECT version, is_dirty, updated_at 
                    FROM migrations 
                    WHERE id = 1;`
        );
    });

    it("getMetaTable() should create migrations table, insert initial row when table doesn't exist", async () => {
        const expectedData = {
            version: 0,
            is_dirty: false,
            updated_at: expect.any(Date),
        };

        const noTableErr = new Error("no such table: migrations");
        const failingStatement: MockStatement = {
            all: jest.fn().mockImplementationOnce(() => {
                throw noTableErr;
            }),
            run: jest.fn(),
        };

        (mockClient.prepare as jest.Mock)
            .mockReturnValueOnce(failingStatement)
            .mockReturnValueOnce({
                all: jest.fn().mockReturnValueOnce([
                    {
                        version: 0,
                        is_dirty: 0,
                        updated_at: "2026-04-27T10:00:00Z",
                    },
                ]),
            });

        mockClient.exec.mockImplementation(() => {});

        const result = await repository.getMetaTable();

        expect(result.version).toBe(expectedData.version);
        expect(mockClient.exec).toHaveBeenCalledTimes(2);
        expect(mockClient.prepare).toHaveBeenCalledTimes(2);
    });

    it("getMetaTable() should throw 'No rows found in migrations table' if there are no meta data in migrations table", async () => {
        const noRowsFoundErr = new Error("No rows found in migrations table");

        const mockStmt: MockStatement = {
            all: jest.fn().mockReturnValueOnce([]),
            run: jest.fn(),
        };
        (mockClient.prepare as jest.Mock).mockReturnValueOnce(mockStmt);

        await expect(repository.getMetaTable()).rejects.toThrow(noRowsFoundErr);
    });

    it("getMetaTable() should throw 'Client is not initialized' if client is falsy", async () => {
        const clientUninitializedErr = new Error("Client is not initialized");

        mockClient = null as unknown as MockDatabaseSync;
        repository = new SqliteRepository(
            mockClient as unknown as DatabaseSync
        );

        await expect(repository.getMetaTable()).rejects.toThrow(
            clientUninitializedErr
        );
    });

    it("getMetaTable() should throw on unexpected database error", async () => {
        const unexpectedErr = new Error("Connection timeout");

        (mockClient.prepare as jest.Mock).mockImplementationOnce(() => {
            throw unexpectedErr;
        });

        await expect(repository.getMetaTable()).rejects.toThrow(unexpectedErr);
    });

    it("setMigrationVersion() should update version and and set updated_at to current timestamp", async () => {
        const mockStmt = {
            run: jest.fn().mockReturnValueOnce({} as any),
            all: jest.fn(),
        };

        (mockClient.prepare as jest.Mock).mockReturnValueOnce(mockStmt);

        await repository.setMigrationVersion(12);

        expect(mockClient.prepare).toHaveBeenCalledWith(`
                    UPDATE migrations 
                    SET version = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = 1;
                    `);
    });

    it("setMigrationStateAsDirty() should set is_dirty to TRUE", async () => {
        (mockClient.exec as jest.Mock).mockResolvedValueOnce({} as any);

        await repository.setMigrationStateAsDirty();

        expect(mockClient.exec).toHaveBeenCalledWith(`
                    UPDATE migrations
                    SET is_dirty = 1
                    WHERE id = 1;
                    `);
    });
});
