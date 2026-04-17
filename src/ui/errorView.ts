import { renderHeader } from "./header.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { prompt } from "../common/prompt.js";
import { renderMainView } from "./mainView.js";

export async function renderErrorView(reason: unknown) {
    const error: { name: string; message: string } = {
        name: "Unknown Error",
        message: "An unexpected error occurred!",
    };
    if (reason instanceof Error) {
        error.name = reason.name;
        error.message = reason.message;
    }

    console.clear();
    renderHeader(Colors.setColor("\nFatal Error", { backgrounds: "red" }));
    // TODO: this is yellow for some reason
    stdout.write(Colors.setColor("Fatal Error\n", { bolds: "red" }));

    stdout.write(`\x1b[0m
${Colors.setColor(error.name, { backgrounds: "red" })}

${Colors.setColor(error.message, { backgrounds: "red" })}

\n`);

    const answer = await prompt(
        Colors.setColor("Press ENTER to go back", { underlines: "blue" })
    );

    switch (true) {
        case answer === "":
            renderMainView();
            break;
        default:
            process.exit(1);
    }
}
