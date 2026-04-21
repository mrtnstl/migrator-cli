import { select, createDivider } from "../common/prompt.js";
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
import { migrationState, selectedProjectIDState } from "../router.js";

export async function renderProjectView(): Promise<string> {
    const projectID = selectedProjectIDState.get();
    const migrationStatus = migrationState.get();

    const project: TProject = await selectProjectByID(projectID);

    renderHeader(migrationStatus);
    stdout.write(Colors.setColor(`${project.name}\n`, { bolds: "white" }));
    stdout.write("\n");

    console.table({
        id: project.id,
        name: project.name,
        db:
            project.db_conn_str.slice(0, 6) +
            project.db_conn_str.slice(6).replaceAll(/./g, "*"),
        migr: project.migrations_location,
    });

    const answer = await select({
        message: "", //Select an option\n
        options: [
            createDivider("migration:"),
            {
                name: "up",
                value: "up",
            },
            {
                name: "down",
                value: "down",
            },
            createDivider("project:"),
            {
                name: "settings",
                value: "projectsettings",
            },
            createDivider("__________"),
            {
                name: "back to projects",
                value: "projects",
            },
        ],
    });

    if (["projects", "projectsettings"].includes(answer)) {
        return answer;
    } else {
        return "NOT_IMPLEMENTED!!!";
    }
    /*
    switch (true) {
        case answer === "up":
            try {
                await runMigration(projectID, "up");

                await renderProjectView(
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
                await renderProjectView(
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

                await renderProjectView(
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
                await renderProjectView(
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
                    "Don't be so hasty, bigboss.",
                    "Just a sec. bro...",
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
                        await renderProjectView(
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
            await renderProjectsView();
            break;
        default:
            process.exit(1);
    }*/
}
