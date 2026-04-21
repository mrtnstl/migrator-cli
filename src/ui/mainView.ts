import { stdout } from "node:process";
import { createDivider, select } from "../common/prompt.js";
import { renderHeader } from "./header.js";
import { Colors } from "../common/colors.js";

export async function renderMainView(): Promise<string | null> {
    renderHeader();
    stdout.write(Colors.setColor("Main Menu\n", { bolds: "white" }));

    const answer = await select({
        message: "", //Choose an option\n
        options: [
            {
                name: "projects",
                value: "projects",
            },
            {
                name: "user guide",
                value: "userguide",
            },
            createDivider(),
            {
                name: "exit",
                value: "exit",
            },
        ],
    });

    return answer;
}
