import { MigrationError, ensureError } from "../../../common/errors";

describe("MigrationError", () => {
    it("should be instance of MigrationError", () => {
        const migrationError = new MigrationError();
        const isInstanceOf = migrationError instanceof MigrationError;

        expect(isInstanceOf).toBe(true);
    });

    it("should have predefined message, if not provided at instantiation", () => {
        const migrationError = new MigrationError();

        expect(migrationError.message).toBe(
            "An error occurred during the migration!"
        );
    });

    it("should have message, that is provided at instantiation", () => {
        const message = "Migration failed due to an error...";
        const migrationError = new MigrationError(message);

        expect(migrationError.message).toBe(message);
    });
});

describe("ensureError", () => {
    it("should return the same error when provided with Error", () => {
        const someError = new Error("Some error");

        const checkedError = ensureError(someError);

        expect(checkedError).toBe(someError);
    });

    it("should return an Error when provided with string", () => {
        const message = "Some error";

        const checkedError = ensureError(message);
        const isError = checkedError instanceof Error;

        expect(isError).toBe(true);
        expect(checkedError.message).toBe(message);
    });

    it("should return an Error with specific message when provided with a non string and non Error parameter", () => {
        const message = false;

        const checkedError = ensureError(message);
        const isError = checkedError instanceof Error;

        expect(isError).toBe(true);
        expect(checkedError.message).toBe("Unspecified error!!");
    });
});
