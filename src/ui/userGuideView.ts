import { renderHeader } from "./header.js";
import { Colors } from "../common/colors.js";
import { stdout } from "node:process";
import { pressKey } from "../common/prompt.js";

export async function renderUserGuideView(): Promise<string> {
    renderHeader();
    stdout.write(Colors.setColor("User Guide\n", { bolds: "white" }));

    stdout.write(`
\x1b[0mThis section is meant to give clean instructions, on how Migrator works
and how you can incorporate it in your day to day work.

[1] Define a project
        - create a new project with the database ${Colors.setColor("connection string", { bolds: "blue" })}
            and the ${Colors.setColor("location", { bolds: "blue" })} of your migration files

[2] Run migration
        - you can migrate ${Colors.setColor("'up'", { bolds: "blue" })} or ${Colors.setColor("'down'", { bolds: "blue" })}

\n`);

    const answer = await pressKey(
        Colors.setColor("Press ENTER to go back", { underlines: "blue" })
    );

    if (answer) {
        return "main";
    }
    return "userguide";
}
