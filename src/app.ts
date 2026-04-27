//import { cwd } from "node:process";
//import { insertNewProjects } from "./internals/db/database.js";
import { initDB } from "./internals/db/database.js";
import { start } from "./router.js";

// dummy projects for development
/*insertNewProjects([
    [
        "test-sqlite-db",
        `sqlite://${cwd()}/src/mocks/test.db`,
        cwd() + "/src/mocks/migrations/sqlite",
    ],
]);*/
initDB();
start();
