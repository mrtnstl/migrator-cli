import { access, readdir, readFile } from "fs/promises";
import { Reader } from "./reader.js";
import { ensureError } from "../../common/errors.js";

export class FileReader implements Reader {
    constructor() {}
    async readMigrationFile(
        path: string,
        currentVersion: number,
        direction: "up" | "down"
    ): Promise<string> {
        try {
            if (path[path.length - 1] === "/") {
                throw new Error(
                    "Invalid migrations location! Path shouldn't end with '/'"
                );
            }

            await access(path);
            const filesInDir = await readdir(path);

            type FileData = { v: number; t: string; name: string };

            const migrationsArray: FileData[] = filesInDir.map(
                (file: string) => {
                    const version = parseInt(file.split("_")[0]);
                    const type = file.split(".")[1];

                    return { v: version, t: type, name: file };
                }
            );

            const nextVersion = currentVersion + (direction === "up" ? 1 : 0);

            const selectedMigration = migrationsArray.find(
                record => record.v === nextVersion && record.t === direction
            );
            if (!selectedMigration) {
                throw new Error("Couldn't find appropriate migration file!");
            }

            const migrationContent = await readFile(
                `${path}/${selectedMigration?.name}`,
                { encoding: "utf8" }
            );

            return migrationContent;
        } catch (err: unknown) {
            if (
                typeof err === "object" &&
                Object.hasOwn(err as object, "code") &&
                ((err as { code: string }).code.includes("ENOENT") ||
                    (err as { code: string }).code.includes("EACCES"))
            ) {
                throw ensureError(
                    new Error(
                        "File not found or insufficient rights to read directory!",
                        { cause: err }
                    )
                );
            }

            throw ensureError(err);
        }
    }
}
