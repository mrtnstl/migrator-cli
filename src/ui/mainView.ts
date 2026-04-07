import { select, Separator } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { renderProjectsView } from "./projectsView.js";

export async function renderMainView() {
    console.clear();
    renderHeader();
    const answer = await select({
        message: "Select a menu point",
        choices: [
            {
                name: "projects",
                value: "projects",
                description: "your saved projects",
            },
            {
                name: "user guide",
                value: "userguide",
                description: "documentation about tool usage",
            },
            new Separator(),
            {
                name: "exit",
                value: "exit",
                description: "exit application",
            },
        ],
    });

    switch (answer) {
        case "projects":
            renderProjectsView();
        case "userguide":
            return;
        case "exit":
            process.exit();
        default:
            process.exit();
    }
}
