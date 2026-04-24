import { homedir, userInfo } from "os";
import { FileReader } from "../../../internals/reader/fileReader";

describe("FileReader", () => {
    let fr: FileReader;
    let migrationsDir: string;
    let isGHARunner: boolean;

    beforeAll(() => {
        fr = new FileReader();
        isGHARunner = userInfo().username === "runner";
        migrationsDir = isGHARunner
            ? homedir() + "/work/migrator-cli/migrator-cli/src/mocks/migrations"
            : homedir() +
              "/Projects/pet/db-migration-tool/src/mocks/migrations";
    });

    it("should return the content of the migration file of the appropriate version", async () => {
        const migrationFileContent = await fr.readMigrationFile(
            migrationsDir,
            0,
            "up"
        );

        expect(migrationFileContent).not.toBeFalsy();
        expect(migrationFileContent).toBe("SELECT 1;");
    });

    it("should throw, when the migration path ends with '/'", async () => {
        let err;
        try {
            await fr.readMigrationFile(migrationsDir + "/", 0, "up");
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
            await fr.readMigrationFile(migrationsDir, 99, "up");
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
