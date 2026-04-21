import { renderHeader } from "./header.js";
import {
    searchProjectsByName,
    selectAllProjects,
} from "../internals/db/database.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { TProject } from "../types/index.js";
import { selectedProjectIDState } from "../router.js";
import { select } from "../common/prompt.js";

export async function renderProjectsView(): Promise<string> {
    renderHeader();
    stdout.write(Colors.setColor("Projects\n", { bolds: "white" }));
    stdout.write("\n");

    let projectsQuery = await selectAllProjects();
    let projectsList = projectsQuery.map((project: TProject) => ({
        name: `[${project.id}] ${project.name}`,
        value: String(project.id),
        description: undefined,
    }));

    const answer = await select({
        message: "", //Choose a project\n
        options: [
            {
                name: "back to menu",
                value: "main",
                description: undefined,
            },
            {
                name: "create new project",
                value: "createproject",
                description: undefined,
            },
            ...projectsList,
        ],
    });

    if (!["main", "createproject"].includes(answer)) {
        selectedProjectIDState.set(parseInt(answer));
        return "project";
    }
    return answer;
}
