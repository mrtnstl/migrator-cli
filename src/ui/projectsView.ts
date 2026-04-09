import { search } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { renderMainView } from "./mainView.js";
import { dataRetrieval } from "../internals/db/database.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";

export async function renderProjectsView() {
    console.clear();
    renderHeader();
    stdout.write(Colors.setColor("Projects Menu\n", { bolds: "white" }));

    const projectsQuery: {
        id: number;
        name: string;
        db_conn_str: string;
        migrations_location: string;
    }[] = await dataRetrieval("SELECT * FROM data ORDER BY id;");
    const projectsList = projectsQuery.map(project => ({
        name: `[${project.id}] ${project.name}`,
        value: String(project.id),
        description: undefined,
    }));

    const answer = await search({
        message: "Select a project",
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
                const projectsQuery: {
                    id: number;
                    name: string;
                    db_conn_str: string;
                    migrations_location: string;
                }[] = await dataRetrieval(
                    `SELECT * FROM data WHERE name LIKE '%${input}%' ORDER BY id;`
                );

                const projectsList = projectsQuery.map(project => ({
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
                ];
            }
        },
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
        case answer === "back":
            renderMainView();
            break;
        case answer === "create":
            break;
        case answer !== "":
            return;
        default:
            process.exit(1);
    }
}
