import { renderHeader } from "./header.js";
import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { prompt } from "../common/prompt.js";
import { globalErrorState } from "../router.js";

export async function renderErrorView(): Promise<null> {
    const globalErr = globalErrorState.get();
    const error: { name: string; message: string } = {
        name: "Unknown Error",
        message: "An unexpected error occurred!",
    };
    if (globalErr instanceof Error) {
        error.name = globalErr.name;
        error.message = globalErr.message;
    }

    renderHeader(Colors.setColor("\nFatal Error", { backgrounds: "red" }));
    // TODO: this is yellow for some reason
    stdout.write(Colors.setColor("Fatal Error\n", { bolds: "red" }));

    stdout.write(`\x1b[0m
${Colors.setColor(error.name, { backgrounds: "red" })}

${Colors.setColor(error.message, { backgrounds: "red" })}

\n`);

    const answer = await prompt(
        Colors.setColor("Press ENTER to quit", { underlines: "blue" })
    );

    return null;
}
