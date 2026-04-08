import { number, search } from "@inquirer/prompts";
import { renderHeader } from "./header.js";
import { renderMainView } from "./mainView.js";
import { dataRetrieval } from "../internals/db/database.js";

export async function renderProjectsView() {
    console.clear();
    renderHeader();

    const projectsQuery: {
        id: number;
        name: string;
        db_conn_str: string;
        migrations_location: string;
    }[] = await dataRetrieval("SELECT * FROM data ORDER BY id;");
    const projectsList = projectsQuery.map(project => ({
        name: `[${project.id}] ${project.name}`,
        value: String(project.id),
        description: `project ${project.name}s record`,
    }));

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
                    {
                        name: "create new project",
                        value: "create",
                        description: "create a new project",
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
                    description: `project ${project.name}s record`,
                }));

                return [
                    {
                        name: "back to menu",
                        value: "back",
                        description: "go back to the menu",
                    },
                    {
                        name: "create new project",
                        value: "create",
                        description: "create a new project",
                    },
                ];
            }
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
