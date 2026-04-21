import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { titleMigratorDL } from "./title.js";
import { globalErrorState, appLevelNotificationState } from "../router.js";

export function renderHeader() {
    const globalError = globalErrorState.get();
    const appLevelNotification = appLevelNotificationState.get();

    let statusMessage;
    if (globalError) {
        statusMessage = Colors.setColor(globalError.message, {
            backgrounds: "red",
        });
    } else {
        switch (appLevelNotification.type) {
            case "info":
                statusMessage = Colors.setColor(appLevelNotification.message, {
                    backgrounds: "blue",
                });
                break;
            case "success":
                statusMessage = Colors.setColor(appLevelNotification.message, {
                    backgrounds: "green",
                });
                break;
            case "warning":
                statusMessage = Colors.setColor(appLevelNotification.message, {
                    backgrounds: "yellow",
                });
                break;
            default:
                statusMessage = Colors.setColor(appLevelNotification.message, {
                    backgrounds: "blue",
                });
        }
    }

    stdout.write("\x1b[0m");
    stdout.write(Colors.setColor(titleMigratorDL, { bolds: "yellow" }));
    stdout.write("\n");
    stdout.write(
        Colors.setColor(
            "=>=>=>=>=>=>=>=>=>=> Migrator v0.0.1 - Centralized database migration handler =>=>=>=>=>=>=>=>=>=>=>",
            { bolds: "white" }
        )
    );
    stdout.write("\n");
    stdout.write(statusMessage);
    stdout.write("\n\n");
}
