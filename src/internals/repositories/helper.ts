import { Client } from "pg";
import { PostgresRepository } from "./postgres.js";
import { Repository } from "./repository.js";
import { ensureError } from "../../common/errors.js";

export function getRepository(
    client: unknown,
    connStr: string
): Repository | null {
    try {
        switch (connStr.split(":")[0]) {
            case "postgres":
                return new PostgresRepository(client as Client);
            case "postgresql":
                return new PostgresRepository(client as Client);
            default:
                throw new Error(
                    "Invalid Client instance or connection string!"
                );
        }
    } catch (err: unknown) {
        throw ensureError(err);
    }
}
