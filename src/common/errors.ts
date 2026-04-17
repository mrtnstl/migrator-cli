export class MigrationError extends Error {
    constructor(message: string = "An error occurred during the migration!") {
        super(message);
    }
}

export function ensureError(potentialError: unknown): Error {
    if (potentialError instanceof Error) {
        return potentialError;
    }

    if (typeof potentialError === "string") {
        return Error(potentialError);
    }

    return Error("Unspecified error!!");
}
