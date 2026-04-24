import { homedir } from "os";
import { FileReader } from "../../../internals/reader/fileReader";

describe("FileReader", () => {
    let fr: FileReader;

    beforeAll(() => {
        fr = new FileReader();
    });

    it("should return the content of the migration file of the appropriate version", async () => {
        const migrationFileContent = await fr.readMigrationFile(
            `${homedir()}/Projects/pet/db-migration-tool/src/mocks/migrations`,
            0,
            "up"
        );

        expect(migrationFileContent).not.toBeFalsy();
        expect(migrationFileContent).toBe("SELECT 1;");
    });

    it("should throw, when the migration path ends with '/'", async () => {
        let err;
        try {
            await fr.readMigrationFile(
                `${homedir()}/Projects/pet/db-migration-tool/src/mocks/migrations/`,
                0,
                "up"
            );
        } catch (e) {
            err = e;
        } finally {
            expect(err).toBeInstanceOf(Error);
            expect((err as Error).message).toBe(
                "Invalid migrations location! Path shouldn't end with '/'"
            );
        }
    });

    it("should throw, when invalid migration path provided", async () => {
        let err;
        try {
            await fr.readMigrationFile(
                `${homedir()}/ect/tool/migrations`,
                0,
                "up"
            );
        } catch (e) {
            err = e;
        } finally {
            expect(err).toBeInstanceOf(Error);
            expect((err as Error).message).toBe(
                "File not found or insufficient rights to read directory!"
            );
        }
    });

    it("should throw, when there is no corresponding direction for the provided migration version", async () => {
        let err;
        try {
            await fr.readMigrationFile(
                `${homedir()}/Projects/pet/db-migration-tool/src/mocks/migrations`,
                99,
                "up"
            );
        } catch (e) {
            err = e;
        } finally {
            expect(err).toBeInstanceOf(Error);
            expect((err as Error).message).toBe(
                "Couldn't find appropriate migration file!"
            );
        }
    });
});
