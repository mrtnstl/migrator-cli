import { ensureError, MigrationError } from "../common/errors.js";
import { TProject } from "../types/index.js";
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
    const project: TProject = await selectProjectByID(projectID);
    if (!project) {
        throw new Error(`Project with the ID ${projectID} doesn't exist!`);
    }

    // setup DB connection
    const db = getConnection(project.db_conn_str);
    const client = await db.getClient();

    const repository = getRepository(client, project.db_conn_str);
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
    } catch (err: unknown) {
        const formattedErr = ensureError(err);
        try {
            await repository.rollbackTx();
        } catch (err: unknown) {
            const newErr = new Error(
                "Transaction rollback failed, after a failed migration attempt!",
                { cause: formattedErr }
            );
            newErr.cause = err;
            throw newErr;
        }

        if (err instanceof MigrationError) {
            // update meta table, dirty table
            if (repository) {
                try {
                    await repository.setMigrationStateAsDirty();
                } catch (migrationErr: unknown) {
                    throw new Error(
                        "An error occurred while updating meta table after a failed migration!",
                        { cause: migrationErr }
                    );
                }
                throw err;
            } else {
                throw new Error(
                    `An unexpected error occurred and the program failed to update the migration table state! (dirty)
This requires immediate attention!`,
                    { cause: err }
                );
            }
        }

        throw err;
    } finally {
        // cleanup
        await db.disconnect();
    }
}
