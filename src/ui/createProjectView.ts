import { confirm, input } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { renderProjectsView } from "./projectsView.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { insertNewProjects } from "../internals/db/database.js";

export async function renderCreateProjectView() {
    console.clear();
    renderHeader();
    stdout.write(Colors.setColor("New Project\n", { bolds: "white" }));

    const answers = {
        name: await input({
            message: "name:",
            theme: {
                prefix: { idle: "", done: "" },
            },
        }),
        database: await input({
            message: "db connection string:",
            theme: {
                prefix: { idle: "", done: "" },
            },
        }),
        migrations: await input({
            message: "migrations location:",
            theme: {
                prefix: { idle: "", done: "" },
            },
        }),
    };

    if (
        answers.name === "" ||
        answers.database === "" ||
        answers.migrations === ""
    ) {
        stdout.write(
            Colors.setColor("All fields are required\n", { colors: "red" })
        );
        const wannaTryAgain = await confirm({
            message: "Wanna try again?",
            theme: {
                prefix: { idle: "", done: "" },
            },
        });
        if (!wannaTryAgain) {
            return renderProjectsView();
        } else {
            return renderCreateProjectView();
        }
    }

    const wannaSave = await confirm({
        message: "Want to save as new project?",
        theme: {
            prefix: { idle: "", done: "" },
        },
    });
    if (!wannaSave) {
        return renderProjectsView();
    } else {
        // saving new project
        await insertNewProjects([
            [answers.name, answers.database, answers.migrations],
        ]);

        return renderProjectsView();
    }
}
