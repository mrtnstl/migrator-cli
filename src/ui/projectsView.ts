import { search } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { renderMainView } from "./mainView.js";

export async function renderProjectsView() {
    console.clear();
    renderHeader();
    const answer = await search({
        message: "Select a project",
        source: async (input, { signal }) => {
            if (!input) {
                return [
                    {
                        name: "back to menu",
                        value: "back",
                        description: "go back to the menu",
                    },
                ];
            }

            // TODO: fetch and return project here
            const mockResult = [
                {
                    name: "pro_01",
                    value: "pro_01",
                    description: "project number 1",
                },
                {
                    name: "pro_02",
                    value: "pro_02",
                    description: "project number 2",
                },
                {
                    name: "pro_03",
                    value: "pro_03",
                    description: "project number 3",
                },
            ];

            return [
                {
                    name: "back to menu",
                    value: "back",
                    description: "go back to the menu",
                },
                ...mockResult,
            ];
        },
    });

    switch (true) {
        case answer === "back":
            renderMainView();
            break;
        case answer !== "":
            return;
        default:
            process.exit();
    }
}
