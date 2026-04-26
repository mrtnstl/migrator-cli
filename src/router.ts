import readline from "node:readline";
import { stdin, stdout } from "node:process";

import { TViewName } from "./types/index.js";
import { renderCreateProjectView } from "./ui/createProjectView.js";
import { renderErrorView } from "./ui/errorView.js";
import { renderMainView } from "./ui/mainView.js";
import { renderProjectsView } from "./ui/projectsView.js";
import { renderProjectView } from "./ui/projectView.js";
import { renderUserGuideView } from "./ui/userGuideView.js";
import {
    ErrorState,
    AppLevelNotificationState,
    SelectedProjectIDState,
} from "./internals/state/globalStates.js";
import { ensureError } from "./common/errors.js";

const views = new Map<string, () => Promise<string | null>>();

views.set("main", renderMainView);
views.set("projects", renderProjectsView);
views.set("project", renderProjectView);
views.set("error", renderErrorView);
views.set("userguide", renderUserGuideView);
views.set("createproject", renderCreateProjectView);

export const globalErrorState = new ErrorState();
export const selectedProjectIDState = new SelectedProjectIDState();
export const appLevelNotificationState = new AppLevelNotificationState();

export async function start() {
    let currentView: TViewName = "main";

    readline.emitKeypressEvents(stdin);

    try {
        while (currentView !== "exit") {
            const viewFunc = views.get(currentView);

            if (!viewFunc) {
                //currentView = "main";
                //continue;
                throw new Error(`Unknown view! ${currentView}`);
            }

            stdin.write("\x1b[2J");
            readline.cursorTo(stdin, 0, 0);

            const nextView = await viewFunc();

            if (nextView === null || nextView === "exit") {
                currentView = "exit";
                stdin.write("\x1b[2J");
                readline.cursorTo(stdin, 0, 0);
                process.exit(0);
            } else {
                currentView = nextView as TViewName;
            }
        }
    } catch (err) {
        globalErrorState.set(ensureError(err));

        stdin.write("\x1b[2J");
        readline.cursorTo(stdin, 0, 0);

        await renderErrorView();
    } finally {
        if (stdin.isTTY) {
            stdin.setRawMode(false);
        }
        stdin.pause();
        stdin.removeAllListeners("keypress");
        stdout.write("\x1b[?25h");
    }
}
