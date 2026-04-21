import { stdin, stdout } from "node:process";
import readline from "node:readline";

import {
    TDivider,
    TPressKeyOptions,
    TSelectConfig,
    TSelectItemSelectable,
} from "../types/index.js";

// simple user input prompt
export function input(message: string): Promise<string> {
    return new Promise(resolve => {
        stdin.isTTY && stdin.setRawMode(false);

        stdin.write(message);

        const handler = (data: ReadableStream) => {
            const input = String(data);
            resolve(input.substring(0, input.indexOf("\n")));
            stdin.removeAllListeners("data");
        };
        stdin.on("data", handler);
    });
}

// confirmation prompt (Y/n)
export function confirm(message: string): Promise<boolean> {
    return new Promise(resolve => {
        stdin.isTTY && stdin.setRawMode(false);

        stdin.write(message);

        const handler = (data: ReadableStream) => {
            const input = String(data);
            resolve(
                input.substring(0, input.indexOf("\n")) === "Y" ? true : false
            );
            stdin.removeAllListeners("data");
        };
        stdin.on("data", handler);
    });
}

// "press XYZ key" prompt (default is ENTER)
export function pressKey(
    message: string,
    requiredKey: TPressKeyOptions = "return"
): Promise<boolean> {
    function cleanup() {
        if (stdin.isTTY) {
            stdin.setRawMode(false);
            stdin.removeAllListeners("keypress");
            stdout.write("\n");
        }
    }

    return new Promise((resolve, reject) => {
        if (stdin.isTTY) {
            stdin.setRawMode(true);
            stdin.removeAllListeners("keypress");
        }
        stdout.write(message);

        const handler = (_str: string, key: readline.Key) => {
            if (key.name === requiredKey) {
                resolve(true);
                cleanup();
            }
        };

        stdin.on("keypress", handler);
    });
}

// DEPRECATING THIS! prompt func for simple user interaction
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
    return `${content}`;
}

// select factory for menus
export function select(options: TSelectConfig): Promise<string> {
    if (!options.options.some(item => typeof item !== "string")) {
        throw new Error("A select must have at least 1 item with value!");
    }

    let selected = 0;
    if (typeof options.options[0] === "string") {
        selected = 1;
    }

    let isFirstRender = true;

    function renderMenu() {
        if (isFirstRender) {
            if (options.message) {
                stdout.write(options.message);
            }
            isFirstRender = false;
        } else {
            readline.moveCursor(
                stdout,
                -stdout.columns,
                -options.options.length
            );
        }

        options.options.forEach((option, i) => {
            const optionName =
                typeof option === "object" ? option.name : option;

            let line = "INVALID_LINE";

            if (typeof option === "string") {
                line = option;
            } else {
                line =
                    i === selected
                        ? `\x1b[1;34m > ${optionName}\x1b[0m`
                        : `   ${optionName}`;
            }
            stdout.write(
                line + " ".repeat(stdout.columns - line.length) + "\n"
            );
        });
        readline.moveCursor(stdout, stdout.columns, 0);
    }

    function cleanup() {
        stdin.removeAllListeners("keypress");
        stdout.write("\n");
    }

    return new Promise((resolve, reject) => {
        if (stdin.isTTY) {
            stdin.setRawMode(true);
        }

        const handler = (_str: string, key: readline.Key) => {
            if (key.name === "up" && selected > 0) {
                typeof options.options[selected - 1] === "object"
                    ? selected--
                    : (selected = selected - 2);

                renderMenu();
            } else if (
                key.name === "down" &&
                selected < options.options.length - 1
            ) {
                typeof options.options[selected + 1] === "object"
                    ? selected++
                    : (selected = selected + 2);

                renderMenu();
            } else if (key.name === "return") {
                cleanup();
                resolve(
                    (options.options[selected] as TSelectItemSelectable).value
                );
            } else if (key.ctrl && key.name === "c") {
                cleanup();
                reject(new Error("Exited from menu unexpectedly!"));
            }
        };

        stdin.on("keypress", handler);
        renderMenu();
    });
}
