import { PostgresRepository } from "./postgres.js";
import { Repository } from "./repository.js";

export function getRepository(client: any, connStr: string): Repository | null {
    try {
        switch (connStr.split(":")[0]) {
            case "postgres":
                return new PostgresRepository(client);
            default:
                throw new Error(
                    "Invalid Client instance or connection string!"
                );
        }
    } catch (err: any) {
        throw err;
    }
}
