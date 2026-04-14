import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { titleMigratorDL } from "./title.js";

export function renderHeader(
    migrationStatus: string = `${Colors.setColor("\n_", {
        backgrounds: "white",
    })}`
) {
    stdout.write("\x1b[0m");
    stdout.write(Colors.setColor(titleMigratorDL, { bolds: "yellow" }));
    stdout.write("\n");
    stdout.write(
        Colors.setColor(
            "=>=>=>=>=>=>=>=>=>=> Migrator v0.0.1 - Centralized database migration handler =>=>=>=>=>=>=>=>=>=>=>",
            { bolds: "white" }
        )
    );
    stdout.write(migrationStatus);
    stdout.write("\n\n");
}
