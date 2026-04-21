import { stdout } from "node:process";
import { input, confirm } from "../common/prompt.js";
import { renderHeader } from "./header.js";
import { Colors } from "../common/colors.js";
import { insertNewProjects } from "../internals/db/database.js";

export async function renderCreateProjectView(): Promise<string> {
    renderHeader();
    stdout.write(Colors.setColor("New Project\n", { bolds: "white" }));

    const answers = {
        name: await input("name: "),
        database: await input("db connection string: "),
        migrations: await input("migrations location: "),
    };

    if (
        answers.name === "" ||
        answers.database === "" ||
        answers.migrations === ""
    ) {
        stdout.write(
            Colors.setColor("All fields are required\n", { colors: "red" })
        );
        const wannaTryAgain = await confirm("Wanna try again? [Y/n]");
        if (!wannaTryAgain) {
            return "projects";
        } else {
            return "createproject";
        }
    }

    const wannaSave = await confirm("Want to save as new project? [Y/n]");
    if (!wannaSave) {
        return "projects";
    } else {
        // saving new project
        await insertNewProjects([
            [answers.name, answers.database, answers.migrations],
        ]);

        return "projects";
    }
}
