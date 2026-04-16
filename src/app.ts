import { insertNewProjects } from "./internals/db/database.js";
import { renderErrorView } from "./ui/errorView.js";
import { renderMainView } from "./ui/mainView.js";

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    renderErrorView(reason);
});

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

// main view, app entrypoint
renderMainView();
