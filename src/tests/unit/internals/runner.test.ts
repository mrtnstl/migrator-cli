import { insertNewProjects } from "../../../internals/db/database";
import { runMigration } from "../../../internals/runner";

describe("runMigration", () => {
    beforeEach(() => {
        insertNewProjects([
            [
                "important-backend",
                "postgres:some@dummy:commection/string",
                "migrations/on/local/machine",
            ],
            [
                "some-bobby-project",
                "sqlite:some@dummy:commection/string",
                "migrations/on/local/machine",
            ],
        ]);
    });
    /*
    it("should return void, in case of successful execution", () => {
        expect(() => {
            runMigration(0, "up");
        }).toBe(undefined);
    });
    */
    it("should throw connection is refused, when database is unreachable", async () => {
        try {
            await runMigration(1, "up");
        } catch (err) {
            expect((err as Error).message).toContain("ECONNREFUSED");
        }
    });

    it("should throw, when projectID not found", async () => {
        const projectID = 99;
        try {
            await runMigration(projectID, "up");
        } catch (err) {
            expect((err as Error).message).toBe(
                `Project with the ID ${projectID} doesn't exist!`
            );
        }
    });
});
