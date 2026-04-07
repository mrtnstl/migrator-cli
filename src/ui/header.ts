import { Colors } from "../common/colors.js";
import { titleMigratorDL } from "./title.js";

export function renderHeader() {
    console.log(Colors.setColor(titleMigratorDL, { bolds: "green" }));
    console.log(
        Colors.setColor(
            "=>=>=>=>=>=>=>=>=>=> Migrator v0.0.1 - Centralized database migration handler =>=>=>=>=>=>=>=>=>=>=>",
            { bolds: "white" }
        )
    );
    console.log(
        Colors.setColor("test text123", {
            bolds: "white",
        })
    );
    console.log("");
}
