import { select, Separator } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { selectProjectByID } from "../internals/db/database.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { renderProjectsView } from "./projectsView.js";
import { runMigration } from "../internals/runner.js";
import { Spinner } from "../common/spinner.js";
import { prompt } from "../common/prompt.js";
import { TProject } from "../types/index.js";
import { ensureError } from "../common/errors.js";

export async function renderProjectView(
    projectID: number,
    migrationStatus: string
) {
    const project: TProject = await selectProjectByID(projectID);

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
            } catch (err: unknown) {
                const formattedErr = ensureError(err);
                let errorMessage = formattedErr.message;
                if (formattedErr.message.includes("ECONNREFUSED")) {
                    errorMessage = "Failed to connect to database!";
                }
                if (
                    formattedErr.message.includes("no such file or directory")
                ) {
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
            } catch (err: unknown) {
                const formattedErr = ensureError(err);
                let errorMessage = formattedErr.message;
                if (formattedErr.message.includes("ECONNREFUSED")) {
                    errorMessage = "Failed to connect to database!";
                }
                if (
                    formattedErr.message.includes("no such file or directory")
                ) {
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
            const spinner = new Spinner(
                Colors.setColor("Loadin' some shi...", { backgrounds: "white" })
            );
            spinner.start();
            let messageIdx = 0;
            const messageChangeInterval = setInterval(() => {
                const messages: string[] = [
                    "You almost there!",
                    "Just a sec. bro...",
                    "Don't be so hasty, bigboss.",
                ];
                spinner.setMessage(messages[messageIdx]);
                messageIdx = (messageIdx + 1) % messages.length;
            }, 2000);
            setTimeout(async () => {
                clearInterval(messageChangeInterval);
                spinner.stop("It done now !");
                const answer = await prompt(
                    Colors.setColor("Press ENTER to go back", {
                        underlines: "blue",
                    })
                );

                switch (true) {
                    case answer === "":
                        renderProjectView(
                            projectID,
                            Colors.setColor("\n_", {
                                backgrounds: "white",
                            })
                        );
                        break;
                    default:
                        process.exit(1);
                }
            }, 8000);
            break;
        case answer === "back":
            renderProjectsView();
            break;
        default:
            process.exit(1);
    }
}
