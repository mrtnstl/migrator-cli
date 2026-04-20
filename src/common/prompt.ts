import { stdin, stdout } from "node:process";
import readline from "node:readline";

import {
    TDivider,
    TSelectConfig,
    TSelectItemSelectable,
} from "../types/index.js";

// prompt func for simple user interaction
export function prompt(message: string): Promise<string> {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(message, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

// divider line for decor
export function createDivider(content: TDivider = "________"): TDivider {
    return `${content}\n`;
}

// select factory for menus
export function select(options: TSelectConfig): Promise<string> {
    if (!options.options.some(item => typeof item !== "string")) {
        throw new Error("A select must have at least 1 item with value!");
    }

    let selected = 0;
    let isFirstRender = true;

    function renderMenu() {
        if (isFirstRender) {
            if (options.message) {
                stdout.write(options.message);
            }
            isFirstRender = false;
        } else {
            readline.moveCursor(stdout, 0, -(options.options.length + 1));
        }

        options.options.forEach((option, i) => {
            const optionName =
                typeof option === "object" ? option.name : option;
            const line =
                i === selected
                    ? `\x1b[1;34m > ${optionName}\x1b[0m`
                    : `   ${optionName}`;

            stdout.write(
                line + " ".repeat(stdout.columns - line.length) + "\n"
            );
        });
        //readline.moveCursor(stdout, 0, this.options.options.length);
    }

    function cleanup() {
        stdin.removeAllListeners("keypress");
        if (stdin.isTTY) {
            stdin.setRawMode(false);
        }
        stdin.pause();
        stdout.write("\n");
    }

    return new Promise((resolve, reject) => {
        readline.emitKeypressEvents(stdin);
        if (stdin.isTTY) {
            stdin.setRawMode(true);
        }

        const handler = (_str: string, key: readline.Key) => {
            switch (true) {
                case key.name === "up" && selected > 0:
                    typeof options.options[selected - 1] === "object"
                        ? selected--
                        : (selected = selected - 2);

                    renderMenu();
                    break;
                case key.name === "down" &&
                    selected < options.options.length - 1:
                    typeof options.options[selected + 1] === "object"
                        ? selected++
                        : (selected = selected + 2);

                    renderMenu();
                    break;
                case key.name === "return":
                    cleanup();
                    resolve(
                        (options.options[selected] as TSelectItemSelectable)
                            .value
                    );
                    break;
                case key.ctrl && key.name === "c":
                    cleanup();
                    reject(new Error("Exited from menu unexpectedly!"));
                default:
            }
        };

        stdin.on("keypress", handler);
        renderMenu();
    });
}
