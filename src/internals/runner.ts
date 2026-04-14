import { MigrationError } from "../common/errors.js";
import { getConnection } from "./connectors/helper.js";
import { dataRetrieval } from "./db/database.js";
import { FileReader } from "./reader/fileReader.js";
import { Reader } from "./reader/reader.js";
import { getRepository } from "./repositories/helper.js";

export async function runMigrationUp(projectID: number): Promise<void> {
    // get metadata from db
    // read migr. files
    // update metadata(dirty table if failed)
    try {
        // getting project data (conn. str., migration location)
        const project: {
            id: number;
            name: string;
            db_conn_str: string;
            migrations_location: string;
        } = (
            await dataRetrieval(`SELECT * FROM data WHERE id=${projectID}`)
        )[0];

        // setup DB connection
        console.log("before connection");
        let db = getConnection(project.db_conn_str);
        const client = await db.getClient();
        let repository = getRepository(client, project.db_conn_str);
        if (repository === null) {
            throw new Error("Failing repository instance!");
        }
        console.log("after connection");
        // getting migrations metadata from DB
        const metaTable = await repository.getMetaTable();
        if (metaTable.is_dirty) {
            throw new Error("Database is potentially dirty!");
        }
        console.log("after meta table query");
        // reading migration files
        const reader: Reader = new FileReader();
        // get correct file (get current version from db meta)
        const migrationFiles = await reader.read(project.migrations_location);

        await repository.runMigration(migrationFiles);

        // write meta table, bump version

        repository = null;
        await client.disconnect();
        return;
    } catch (err: any) {
        if (err instanceof MigrationError) {
            // write to meta table, dirty table
            throw err;
        }
        throw err;
    }
}

export async function runMigrationDown(
    projectID: number
): Promise<{ resultDown: any; errorDown: string | null }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                resultDown: false,
                errorDown: "An unexpected error occured!",
            });
        }, 2000);
    });
}
