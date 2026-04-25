import { ensureError } from "../common/errors.js";
import { TProject } from "../types/index.js";
import { getConnection } from "./connectors/helper.js";
import { getRepository } from "./repositories/helper.js";

export async function getMigrationsData(project: TProject) {
    const db = getConnection(project.db_conn_str);
    try {
        const client = await db.getClient();

        const repository = getRepository(client, project.db_conn_str);
        if (repository === null) {
            throw new Error("Failed to instantiate repository instance!");
        }

        return await repository.getMetaTable();
    } catch (err) {
        throw ensureError(err);
    } finally {
        await db.disconnect();
    }
}
