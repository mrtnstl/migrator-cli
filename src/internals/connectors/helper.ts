import { Connector } from "./connector.js";
import { PostgresConnector } from "./postgres.js";
import { SqliteConnector } from "./sqlite.js";

export function getConnection(connStr: string): Connector {
    switch (connStr.split(":")[0]) {
        case "postgresql":
            return new PostgresConnector(connStr);
        case "sqlite":
            return new SqliteConnector(connStr.split("://")[1]);
        default:
            throw new Error("Invalid connection string!");
    }
}
