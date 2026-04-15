import { access, readdir, readFile } from "fs/promises";
import { Reader } from "./reader.js";

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

            const migrationsArray: FileData[] = filesInDir!.map(
                (file: string) => {
                    const version = parseInt(file.split("_")[0]);
                    const type = file.split(".")[1];

                    return { v: version, t: type, name: file };
                }
            );

            const directionValue = (): number => {
                if (direction === "up") {
                    return 1;
                } else if (direction === "down") {
                    return -1;
                } else {
                    throw new Error(
                        "An error occurred while calculating migration direction value!"
                    );
                }
            };
            const nextVersion = currentVersion + directionValue();
            const selectedMigration = migrationsArray?.find(
                record => record.v === nextVersion && record.t === direction
            );

            const migrationContent = await readFile(
                `${path}/${selectedMigration?.name}`,
                { encoding: "utf8" }
            );

            return migrationContent;
        } catch (err: any) {
            throw err;
        }
    }
}
