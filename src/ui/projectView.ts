import { select, Separator } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { dataRetrieval } from "../internals/db/database.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { renderProjectsView } from "./projectsView.js";
import { runMigrationDown, runMigrationUp } from "../internals/runner.js";

export async function renderProjectView(
    projectID: number,
    migrationStatus: string
) {
    const project: {
        id: number;
        name: string;
        db_conn_str: string;
        migrations_location: string;
    } = (await dataRetrieval(`SELECT * FROM data WHERE id=${projectID}`))[0];

    console.clear();
    renderHeader(migrationStatus);
    stdout.write(Colors.setColor(`${project.name}\n`, { bolds: "white" }));
    console.table({
        id: project.id,
        name: project.name,
        db:
            project.db_conn_str.slice(0, 6) +
            project.db_conn_str.slice(6).replaceAll(/./g, "*"),
        migr: project.migrations_location,
    });

    const answer = await select({
        message: "",
        choices: [
            new Separator("migration:"),
            {
                name: "up",
                value: "up",
                description: undefined,
            },
            {
                name: "down",
                value: "down",
                description: undefined,
            },
            new Separator("project:"),
            {
                name: "settings",
                value: "settings",
                description: undefined,
            },
            new Separator("__________"),
            {
                name: "back to projects",
                value: "back",
                description: undefined,
            },
        ],
        theme: {
            prefix: { idle: "", done: "" },
            style: {
                keysHelpTip: () => "",
                message: () => "",
                description: () => "",
            },
        },
    });

    switch (true) {
        case answer === "up":
            try {
                await runMigrationUp(projectID);

                renderProjectView(
                    projectID,
                    Colors.setColor("\nsuccess", { backgrounds: "green" })
                );
                break;
            } catch (err: any) {
                renderProjectView(
                    projectID,
                    Colors.setColor(
                        `\nfail: ${err.message || "An unexpected error occured!"}`,
                        {
                            backgrounds: "red",
                        }
                    )
                );
                break;
            }
        case answer === "down":
            const { resultDown, errorDown } = await runMigrationDown(projectID);
            if (errorDown) {
                renderProjectView(
                    projectID,
                    Colors.setColor(`\nfail: ${errorDown}`, {
                        backgrounds: "red",
                    })
                );
                break;
            }

            renderProjectView(
                projectID,
                Colors.setColor("\nsuccess", { backgrounds: "green" })
            );
            break;
        case answer === "settings":
            break;
        case answer === "back":
            renderProjectsView();
            break;
        default:
            process.exit(1);
    }
}
