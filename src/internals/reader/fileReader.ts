import { readFile } from "fs/promises";
import { Reader } from "./reader.js";

export class FileReader implements Reader {
    constructor() {}
    async read(path: string): Promise<string> {
        try {
            return await readFile(path, { encoding: "utf8" });
        } catch (err: any) {
            throw err;
        }
    }
}
