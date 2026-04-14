import { dataManipulation } from "./internals/db/database.js";
import { renderMainView } from "./ui/mainView.js";

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

await dataManipulation(
    "INSERT INTO data(name, db_conn_str, migrations_location) VALUES (?, ?, ?)",
    [
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
    ]
);

renderMainView();
