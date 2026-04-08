import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(":memory:");
db.exec(`
    CREATE TABLE IF NOT EXISTS data(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        db_conn_str TEXT,
        migrations_location TEXT
    ) STRICT;
`);

export async function dataManipulation(
    stmt: string,
    values: any[]
): Promise<boolean | Error> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare(stmt);
            for (const value of values) {
                statement.run(...value);
            }
            resolve(true);
        } catch (err) {
            reject(err);
        }
    });
}

export async function dataRetrieval(stmt: string): Promise<any | Error> {
    return new Promise((resolve, reject) => {
        try {
            const statement = db.prepare(stmt);
            const result = statement.all();
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}
