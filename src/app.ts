import { dataManipulation } from "./internals/db/database.js";
import { renderMainView } from "./ui/mainView.js";

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
            "postgres:some@dummy:commection/string",
            "migrations/on/local/machine",
        ],
    ]
);

renderMainView();

/*
const mySpinner = new Spinner("spinnin'");
mySpinner.start();

const spinnerTo = setTimeout(() => {
    mySpinner.text("spinnin' done for good");
    mySpinner.succeed();
    clearTimeout(spinnerTo);
}, 2000);
*/
//process.exit();
