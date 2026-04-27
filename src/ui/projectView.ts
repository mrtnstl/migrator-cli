import { stdout } from "node:process";
import { select, createDivider } from "../common/prompt.js";
import { renderHeader } from "./header.js";
import { insertLog, selectProjectByID } from "../internals/db/database.js";
import { Colors } from "../common/colors.js";
import { runMigration } from "../internals/runner.js";
import { TProject, TViewName } from "../types/index.js";
import { ensureError } from "../common/errors.js";
import {
    appLevelNotificationState,
    globalErrorState,
    selectedProjectIDState,
} from "../router.js";
import { getMigrationsData } from "../internals/dbMetaGetter.js";

export async function renderProjectView(): Promise<TViewName> {
    const projectID = selectedProjectIDState.get();
    if (!projectID) {
        throw new Error(
            "An unexpected error occurred! ProjectID can not be null!"
        );
    }

    const project: TProject = await selectProjectByID(projectID);
    if (!project) {
        throw new Error(`Project with the ID ${projectID} doesn't exist!`);
    }

    try {
        const migrationData = await getMigrationsData(project);
        const migrationDataAsStr = `current version: ${migrationData.version}, last updated at: ${migrationData.updated_at.toISOString()}${migrationData.is_dirty ? " and the database is dirty!" : ""}`;

        const currentNotification = appLevelNotificationState.get();
        const notifType = currentNotification.type;
        const notifMessage =
            currentNotification.message + ", " + migrationDataAsStr;

        appLevelNotificationState.set({
            type: notifType,
            message: notifMessage,
        });
    } catch (err) {
        globalErrorState.set(ensureError(err));
    }

    renderHeader();
    stdout.write(Colors.setColor(`${project.name}\n`, { bolds: "white" }));

    console.table({
        id: project.id,
        name: project.name,
        db: project.db_conn_str.slice(0, 6).replaceAll(/./g, "*"),
        migr: project.migrations_location.slice(0, 6).replaceAll(/./g, "*"),
    });

    const answer = await select({
        message: "",
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
                name: "logs",
                value: "projectlogs",
            },
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

    if (["projects", "projectsettings", "projectlogs"].includes(answer)) {
        return answer as TViewName;
    } else if (answer === "up") {
        try {
            await runMigration(projectID, "up");

            appLevelNotificationState.set({
                type: "success",
                message: "Migrated successfully",
            });

            await insertLog({
                projectID: projectID,
                event: "success",
                message: "Migrated successfully",
            });
            return "project";
        } catch (err: unknown) {
            const formattedErr = ensureError(err);

            if (formattedErr.message.includes("ECONNREFUSED")) {
                formattedErr.message = "Failed to connect to database!";
            }
            if (formattedErr.message.includes("no such file or directory")) {
                formattedErr.message =
                    "Failed to open migration file! No file found with the appropriate name.";
            }

            await insertLog({
                projectID: projectID,
                event: "error",
                message: formattedErr.message,
            });
            globalErrorState.set(formattedErr);
            return "project";
        }
    } else if (answer === "down") {
        try {
            await runMigration(projectID, "down");
            appLevelNotificationState.set({
                type: "success",
                message: "Migrated successfully",
            });

            await insertLog({
                projectID: projectID,
                event: "success",
                message: "Migrated successfully",
            });
            return "project";
        } catch (err: unknown) {
            const formattedErr = ensureError(err);

            if (formattedErr.message.includes("ECONNREFUSED")) {
                formattedErr.message = "Failed to connect to database!";
            }
            if (formattedErr.message.includes("no such file or directory")) {
                formattedErr.message =
                    "Failed to open migration file! No file found with the appropriate name.";
            }

            await insertLog({
                projectID: projectID,
                event: "error",
                message: formattedErr.message,
            });
            globalErrorState.set(formattedErr);
            return "project";
        }
    } else if (answer === "projectsettings") {
        return "error";
    } else if (answer === "back") {
        return "projects";
    }
    return "error";
}
