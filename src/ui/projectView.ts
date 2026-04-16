import { select, Separator } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { selectProjectByID } from "../internals/db/database.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { renderProjectsView } from "./projectsView.js";
import { runMigration } from "../internals/runner.js";

export async function renderProjectView(
    projectID: number,
    migrationStatus: string
) {
    const project: {
        id: number;
        name: string;
        db_conn_str: string;
        migrations_location: string;
    } = (await selectProjectByID(projectID))[0];

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
                await runMigration(projectID, "up");

                renderProjectView(
                    projectID,
                    Colors.setColor("\nMigrated successfully (up)", {
                        backgrounds: "green",
                    })
                );
                break;
            } catch (err: any) {
                let errorMessage = err.message;
                if (err.message.includes("ECONNREFUSED")) {
                    errorMessage = "Failed to connect to database!";
                }
                if (err.message.includes("no such file or directory")) {
                    errorMessage =
                        "Failed to open migration file! No file found with the appropriate name.";
                }
                renderProjectView(
                    projectID,
                    Colors.setColor(
                        `\nERROR: ${errorMessage || "An unexpected error occurred!"}`,
                        {
                            backgrounds: "red",
                        }
                    )
                );
                break;
            }
        case answer === "down":
            try {
                await runMigration(projectID, "down");

                renderProjectView(
                    projectID,
                    Colors.setColor("\nMigrated successfully (down)", {
                        backgrounds: "green",
                    })
                );
                break;
            } catch (err: any) {
                let errorMessage = err.message;
                if (err.message.includes("ECONNREFUSED")) {
                    errorMessage = "Failed to connect to database!";
                }
                if (err.message.includes("no such file or directory")) {
                    errorMessage =
                        "Failed to open migration file! No file found with the appropriate name.";
                }
                renderProjectView(
                    projectID,
                    Colors.setColor(
                        `\nERROR: ${errorMessage || "An unexpected error occurred!"}`,
                        {
                            backgrounds: "red",
                        }
                    )
                );
                break;
            }
        case answer === "settings":
            break;
        case answer === "back":
            renderProjectsView();
            break;
        default:
            process.exit(1);
    }
}
