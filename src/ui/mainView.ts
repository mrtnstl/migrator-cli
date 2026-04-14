import { select, Separator } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { renderProjectsView } from "./projectsView.js";
import { renderUserGuideView } from "./userGuideView.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";

export async function renderMainView() {
    console.clear();
    renderHeader();
    stdout.write(Colors.setColor("Main Menu\n", { bolds: "white" }));

    const answer = await select({
        message: "",
        choices: [
            {
                name: "projects",
                value: "projects",
                description: undefined,
            },
            {
                name: "user guide",
                value: "userguide",
                description: undefined,
            },
            new Separator("__________"),
            {
                name: "exit",
                value: "exit",
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

    switch (answer) {
        case "projects":
            renderProjectsView();
            break;
        case "userguide":
            renderUserGuideView();
            break;
        case "exit":
            console.clear();
            process.exit();
        default:
            process.exit();
    }
}
