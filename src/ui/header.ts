import { stdout } from "node:process";
import { Colors } from "../common/colors.js";
import { titleMigratorDL } from "./title.js";

export function renderHeader() {
    stdout.write(Colors.setColor(titleMigratorDL, { bolds: "green" }));
    stdout.write(
        Colors.setColor(
            "=>=>=>=>=>=>=>=>=>=> Migrator v0.0.1 - Centralized database migration handler =>=>=>=>=>=>=>=>=>=>=>",
            { bolds: "white" }
        )
    );
    stdout.write("\n");
}
