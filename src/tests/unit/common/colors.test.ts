import { Colors } from "../../../common/colors";

describe("Colors class", () => {
    it("setColor should return the provided string, wrapped around ANSI escape codes for the corresponding color and reset", () => {
        const coloredText = Colors.setColor("test", { colors: "red" });
        expect(coloredText).toBe("\x1b[31mtest\x1b[0m");
    });

    it("setColor should return the provided string, wrapped around ANSI escape codes for the corresponding background and reset", () => {
        const coloredText = Colors.setColor("test", { backgrounds: "red" });
        expect(coloredText).toBe("\x1b[41mtest\x1b[0m");
    });

    it("setColor should return the provided string, wrapped around ANSI escape codes for the corresponding bold color and reset", () => {
        const coloredText = Colors.setColor("test", { bolds: "red" });
        expect(coloredText).toBe("\x1b[1;31mtest\x1b[0m");
    });

    it("setColor should return the provided string, wrapped around ANSI escape codes for the corresponding underline and reset", () => {
        const coloredText = Colors.setColor("test", { underlines: "red" });
        expect(coloredText).toBe("\x1b[4;31mtest\x1b[0m");
    });

    it("setColor should return the provided string, when empty options object is provided", () => {
        const coloredText = Colors.setColor("test", {});
        expect(coloredText).toBe("test");
    });

    it("setColor should return the provided string, when the provided options value is undefined", () => {
        const coloredText = Colors.setColor("test", { colors: undefined });
        expect(coloredText).toBe("test");
    });

    it("setColor should throw, when more then 1 property is provided in the options object", () => {
        expect(() => {
            Colors.setColor("test", { colors: "blue", backgrounds: "yellow" });
        }).toThrow("Too many options for setColor");
    });
});
