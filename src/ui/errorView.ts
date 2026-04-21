import { stdout } from "node:process";
import { renderHeader } from "./header.js";
import { Colors } from "../common/colors.js";
import { pressKey } from "../common/prompt.js";
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

    renderHeader();
    // TODO: this is yellow for some reason
    stdout.write(Colors.setColor("Fatal Error\n", { bolds: "red" }));

    stdout.write(`\x1b[0m
${Colors.setColor(error.name, { backgrounds: "red" })}

${Colors.setColor(error.message, { backgrounds: "red" })}

\n`);

    await pressKey(
        Colors.setColor("Press ENTER to quit", { underlines: "blue" })
    );

    return null;
}
