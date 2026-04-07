import fs from "node:fs";
import { Pool } from "pg";

const DB_CONN_STR = process.env.DATABASE_CONNECTION_STRING as string;

/**
 * migration files should look like the example below
 *
 * 000001_create_users.up.sql
 * 000013_add_isActive_to_users.down.sql
 *
 *
 */

const MIGRATIONS_DIR = "./migrations/";

console.log("DATABASE MIGRATION");

// get mType
//console.log(process.argv);

process.argv.length <= 2 &&
    (() => {
        console.log("[error] Insufficient number of arguments");
        process.exit(1);
    })();

let migrationTypeFlag;
for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("t")) {
        migrationTypeFlag = process.argv[i];
        break;
    }
}

const mTypeVal = migrationTypeFlag?.split("=")[1];

console.log("migrationType:", migrationTypeFlag);
console.log("mTypeValue:", mTypeVal);

// connect to database
// check for migrations table, check if table is dirty and/or return current migration version
let currentVersion = 2;

// read and execute next migrations
let filesInDir;
try {
    fs.accessSync(MIGRATIONS_DIR);
    filesInDir = fs.readdirSync(MIGRATIONS_DIR);
    //console.log(filesInDir)
} catch (err) {
    console.log("[error] Failed to read migration files");
}

type FileData = { v: number; t: string; name: string };

const migrationsArray: FileData[] = filesInDir!.map((file: string) => {
    const version = parseInt(file.split("_")[0]);
    const type = file.split(".")[1];

    return { v: version, t: type, name: file };
});

console.log(migrationsArray);

const selectedMigration = migrationsArray?.find(
    record => record.v === currentVersion && record.t === "down"
);

const migrationContent = fs.readFileSync(
    `${MIGRATIONS_DIR}${selectedMigration?.name}`,
    { encoding: "utf8" }
);
console.log(migrationContent);

if (!process.env.DATABASE_CONNECTION_STRING) {
    throw new Error("DATABASE_CONNECTION_STRING in undefined!");
}

const pool = new Pool({
    connectionString: DB_CONN_STR,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

(async () => {
    let client = await pool.connect();
    try {
        const result = await pool.query(migrationContent);
        console.log("RESULT:", result);
        console.log("Migration executed successfully! :D");
    } catch (err: any) {
        console.log("[error] Failed to execute migration", err.message);
    } finally {
        client.release();
        process.exit();
    }
})();

console.log("EOF");
