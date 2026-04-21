import { insertNewProjects } from "./internals/db/database.js";
import { start } from "./router.js";

// dummy projects for development
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

start();
