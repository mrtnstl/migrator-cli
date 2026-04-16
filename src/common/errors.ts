export class MigrationError extends Error {
    constructor(message: string = "An error occurred during the migration!") {
        super(message);
    }
}
