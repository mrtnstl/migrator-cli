export interface Repository {
    getMetaTable(): Promise<{
        version: number;
        is_dirty: boolean;
        updated_at: Date;
    }>;
    beginTx(): Promise<void>;
    commitTx(): Promise<void>;
    rollbackTx(): Promise<void>;
    runMigration(migration: string): Promise<void>;
    setMigrationVersion(newVersion: number): Promise<void>;
    setMigrationStateAsDirty(): Promise<void>;
}
