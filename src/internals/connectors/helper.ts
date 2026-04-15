import { Connector } from "./connector.js";
import { PostgresConnector } from "./postgres.js";

export function getConnection(connStr: string): Connector {
    try {
        switch (connStr.split(":")[0]) {
            case "postgres":
                return new PostgresConnector(connStr);
            case "postgresql":
                return new PostgresConnector(connStr);
            default:
                throw new Error("Invalid connection string!");
        }
    } catch (err) {
        throw err;
    }
}
