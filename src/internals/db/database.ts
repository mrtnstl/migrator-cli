import { DatabaseSync, SQLInputValue } from "node:sqlite";

const db = new DatabaseSync(":memory:");
db.exec(`
    CREATE TABLE IF NOT EXISTS data(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        db_conn_str TEXT,
        migrations_location TEXT
    ) STRICT;
`);

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

export function selectAllProjects(): Promise<any | Error> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare("SELECT * FROM data ORDER BY id;");
            const result = statement.all();
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

export function searchProjectsByName(
    searchWord: SQLInputValue
): Promise<any | Error> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare(
                "SELECT * FROM data WHERE name LIKE '%' || ? || '%' ORDER BY id;"
            );
            const result = statement.all(searchWord);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

export function selectProjectByID(
    projectID: SQLInputValue
): Promise<any | Error> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare("SELECT * FROM data WHERE id = ?;");
            const result = statement.all(projectID);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}
