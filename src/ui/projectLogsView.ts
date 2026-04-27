import { stdout } from "node:process";
import { pressKey } from "../common/prompt.js";
import { renderHeader } from "./header.js";
import {
    getLogsByProjectID,
    selectProjectByID,
} from "../internals/db/database.js";
import { Colors } from "../common/colors.js";
import { TProject, TProjectLog, TViewName } from "../types/index.js";
import {
    appLevelNotificationState,
    globalErrorState,
    selectedProjectIDState,
} from "../router.js";

export async function renderProjectLogsView(): Promise<TViewName> {
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

    // fetch project logs
    const projectLogs = await getLogsByProjectID(project.id);

    let logsFormatted = `\n`;

    if (projectLogs.length === 0) {
        logsFormatted += `No logs for this project...`;
    } else {
        projectLogs.map(log => {
            const logEvent =
                log.event === "success"
                    ? `\x1b[42m${log.event}\x1b[0m`
                    : `\x1b[41m${log.event}  \x1b[0m`;
            const occurredAt = log.occurred_at;
            logsFormatted += `${logEvent}\t${occurredAt}\t${log.message}\n`;
        });
    }

    logsFormatted += "\n\n";

    renderHeader();
    stdout.write(Colors.setColor(`${project.name} logs\n`, { bolds: "white" }));

    stdout.write(logsFormatted);

    await pressKey(
        Colors.setColor("Press ENTER to go back", { underlines: "blue" })
    );

    return "project";
}
