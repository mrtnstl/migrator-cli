import { DatabaseSync, SQLInputValue } from "node:sqlite";
import { TProject } from "../../types/index.js";
import { cwd } from "node:process";

const db = new DatabaseSync(
    process.env.NODE_ENV === "test"
        ? `${cwd() + "/migrator_storage-test.db"}`
        : `${cwd() + "/migrator_storage.db"}`
);

export function initDB(): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS data(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            db_conn_str TEXT,
            migrations_location TEXT
        ) STRICT;
    `);
}

type TNewProject = [string, string, string];

export function insertNewProjects(
    values: TNewProject[]
): Promise<void | Error> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare(
                "INSERT INTO data(name, db_conn_str, migrations_location) VALUES (?, ?, ?)"
            );
            for (const value of values) {
                statement.run(...value);
            }
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

export function selectAllProjects(): Promise<TProject[]> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare("SELECT * FROM data ORDER BY id;");
            const result = statement.all();
            resolve(result as TProject[]);
        } catch (err) {
            reject(err);
        }
    });
}

export function searchProjectsByName(
    searchWord: SQLInputValue
): Promise<TProject[]> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare(
                "SELECT * FROM data WHERE name LIKE '%' || ? || '%' ORDER BY id;"
            );
            const result = statement.all(searchWord);
            resolve(result as TProject[]);
        } catch (err) {
            reject(err);
        }
    });
}

export function selectProjectByID(projectID: SQLInputValue): Promise<TProject> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare("SELECT * FROM data WHERE id = ?;");
            const result = statement.all(projectID)[0];
            resolve(result as TProject);
        } catch (err) {
            reject(err);
        }
    });
}
