export interface Repository {
    getMetaTable(): Promise<{
        version: number;
        is_dirty: boolean;
        updated_at: Date;
    }>;
    runMigration(migration: string): Promise<void>;
}
