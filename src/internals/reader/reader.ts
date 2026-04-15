export interface Reader {
    readMigrationFile(
        path: string,
        currentVersion: number,
        direction: "up" | "down"
    ): Promise<string>;
}
