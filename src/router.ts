import readline from "node:readline";
import { stdin } from "node:process";

import { TViewName } from "./types/index.js";
import { renderCreateProjectView } from "./ui/createProjectView.js";
import { renderErrorView } from "./ui/errorView.js";
import { renderMainView } from "./ui/mainView.js";
import { renderProjectsView } from "./ui/projectsView.js";
import { renderProjectView } from "./ui/projectView.js";
import { renderUserGuideView } from "./ui/userGuideView.js";
import {
    ErrorState,
    MigrationState,
    SelectedProjectIDState,
} from "./internals/state/globalStates.js";

const views = new Map<string, () => Promise<string | null>>();

views.set("main", renderMainView);
views.set("projects", renderProjectsView);
views.set("project", renderProjectView);
views.set("error", renderErrorView);
views.set("userguide", renderUserGuideView);
views.set("createproject", renderCreateProjectView);

export let globalErrorState = new ErrorState();
export let selectedProjectIDState = new SelectedProjectIDState();
export let migrationState = new MigrationState();

export async function start() {
    let currentView: TViewName = "main";

    readline.emitKeypressEvents(stdin);
    //if (stdin.isTTY) {
    //    stdin.setRawMode(true);
    //}

    try {
        while (currentView !== "exit") {
            const viewFunc = views.get(currentView);

            if (!viewFunc) {
                //currentView = "main";
                //continue;
                throw new Error(`Unknown view! ${currentView}`);
            }

            //if (stdin.isTTY && !stdin.isRaw) {
            //    stdin.setRawMode(true);
            //}

            stdin.write("\x1b[2J");
            readline.cursorTo(stdin, 0, 0);

            const nextView = await viewFunc();

            if (nextView === null || nextView === "exit") {
                currentView = "exit";
                stdin.write("\x1b[2J");
                readline.cursorTo(stdin, 0, 0);
            } else {
                currentView = nextView as TViewName;
            }
        }
    } catch (err) {
        globalErrorState.set(err);
        stdin.write("\x1b[2J");
        readline.cursorTo(stdin, 0, 0);
        await renderErrorView();
    } finally {
        if (stdin.isTTY) {
            stdin.setRawMode(false);
        }
        stdin.pause();
        stdin.removeAllListeners("keypress");
    }
}
