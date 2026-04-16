import { search } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { renderMainView } from "./mainView.js";
import {
    searchProjectsByName,
    selectAllProjects,
} from "../internals/db/database.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { renderCreateProjectView } from "./createProjectView.js";
import { renderProjectView } from "./projectView.js";

export async function renderProjectsView() {
    console.clear();
    renderHeader();
    stdout.write(Colors.setColor("Projects\n", { bolds: "white" }));

    let projectsQuery: {
        id: number;
        name: string;
        db_conn_str: string;
        migrations_location: string;
    }[] = await selectAllProjects();
    let projectsList = projectsQuery.map(project => ({
        name: `[${project.id}] ${project.name}`,
        value: String(project.id),
        description: undefined,
    }));

    const answer = await search({
        message: "",
        source: async (input, { signal }) => {
            if (!input) {
                return [
                    {
                        name: "back to menu",
                        value: "back",
                        description: undefined,
                    },
                    {
                        name: "create new project",
                        value: "create",
                        description: undefined,
                    },
                    ...projectsList,
                ];
            } else {
                projectsQuery = await searchProjectsByName(input);

                projectsList = projectsQuery.map(project => ({
                    name: `[${project.id}] ${project.name}`,
                    value: String(project.id),
                    description: undefined,
                }));

                return [
                    {
                        name: "back to menu",
                        value: "back",
                        description: undefined,
                    },
                    {
                        name: "create new project",
                        value: "create",
                        description: undefined,
                    },
                    ...projectsList,
                ];
            }
        },
        theme: {
            prefix: { idle: "", done: "" },
            style: {
                keysHelpTip: () => "",
                message: () => "search:",
                description: () => "",
            },
        },
    });

    switch (true) {
        case answer === "back":
            renderMainView();
            break;
        case answer === "create":
            renderCreateProjectView();
            break;
        case answer !== "":
            renderProjectView(
                parseInt(answer),
                Colors.setColor("\n_", {
                    backgrounds: "white",
                })
            );
            break;
        default:
            process.exit(1);
    }
}
