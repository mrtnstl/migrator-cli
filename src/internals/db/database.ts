import { DatabaseSync, SQLInputValue, SQLOutputValue } from "node:sqlite";
import {
    TNewProject,
    TNewProjectLog,
    TProject,
    TProjectLog,
} from "../../types/index.js";
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
            name TEXT NOT NULL,
            db_conn_str TEXT NOT NULL,
            migrations_location TEXT NOT NULL
        ) STRICT;
        CREATE TABLE IF NOT EXISTS logs (
            logID INTEGER PRIMARY KEY AUTOINCREMENT,
            projectID INTEGER,
            event TEXT NOT NULL,
            message TEXT NOT NULL,
            occurred_at TEXT DEFAULT CURRENT_TIMESTAMP
        ) STRICT;
    `);
}

export function insertNewProjects(values: TNewProject[]): Promise<void> {
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

export function insertLog(log: TNewProjectLog): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare(
                "INSERT INTO logs(projectID, event, message) VALUES (?, ?, ?);"
            );

            const data = Object.values({
                projectID: log.projectID,
                event: log.event,
                message: log.message,
            });

            statement.run(...data);

            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

export function getLogsByProjectID(projectID: number): Promise<TProjectLog[]> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare(
                `SELECT logID, projectID, event, message, occurred_at 
                FROM logs 
                WHERE projectID = ? 
                ORDER BY logID ASC;`
            );

            const result = statement.all(projectID) as TProjectLog[];
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}
