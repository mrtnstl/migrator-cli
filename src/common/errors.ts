export class MigrationError extends Error {
    constructor(message: string = "An error occured during the migration!") {
        super(message);
    }
}
