import { MigrationError } from "../common/errors.js";
import { getConnection } from "./connectors/helper.js";
import { selectProjectByID } from "./db/database.js";
import { FileReader } from "./reader/fileReader.js";
import { Reader } from "./reader/reader.js";
import { getRepository } from "./repositories/helper.js";

export async function runMigration(
    projectID: number,
    direction: "up" | "down"
): Promise<void> {
    // getting project data (conn. str., migration location, ...)
    const project: {
        id: number;
        name: string;
        db_conn_str: string;
        migrations_location: string;
    } = (await selectProjectByID(projectID))[0];

    // setup DB connection
    let db = getConnection(project.db_conn_str);
    const client = await db.getClient();

    let repository = getRepository(client, project.db_conn_str);
    if (repository === null) {
        throw new Error("Failed to instantiate repository instance!");
    }

    try {
        // getting migrations metadata from DB
        const metaTable = await repository.getMetaTable();
        if (metaTable.is_dirty) {
            throw new Error(
                "Database is in dirty state! Manual intervention required."
            );
        }

        // reading migration files
        const reader: Reader = new FileReader();
        // get correct file (get current version from db meta)
        const migrationFile = await reader.readMigrationFile(
            project.migrations_location,
            metaTable.version,
            direction
        );

        // execute migration in a transaction
        await repository.beginTx();
        await repository.runMigration(migrationFile);

        // update meta table, bump version
        const newVersion =
            direction === "up" ? metaTable.version + 1 : metaTable.version - 1;
        await repository.setMigrationVersion(newVersion);

        await repository.commitTx();

        return;
    } catch (err: any) {
        try {
            await repository.rollbackTx();
        } catch (err: any) {
            throw new Error(
                "Transaction rollback failed, after a failed migration attempt.",
                err.message
            );
        }

        if (err instanceof MigrationError) {
            // update meta table, dirty table
            if (repository) {
                await repository.setMigrationStateAsDirty();
                throw err;
            } else {
                throw new Error(
                    `An unexpected error occurred and the program failed to update the migration table state! (dirty)
This requires immediate attention!`
                );
            }
        }

        throw err;
    } finally {
        // cleanup
        repository = null;
        await db.disconnect();
    }
}
