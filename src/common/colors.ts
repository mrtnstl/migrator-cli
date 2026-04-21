export type TFormatOptions = {
    colors?: string;
    bolds?: string;
    underlines?: string;
    backgrounds?: string;
};
const formatOptions = {
    reset: "\x1b[0m",
    colors: {
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        purple: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
    },
    bolds: {
        black: "\x1b[1;30m",
        red: "\x1b[1;31m",
        green: "\x1b[1;32m",
        yellow: "\x1b[1;33m",
        blue: "\x1b[1;34m",
        purple: "\x1b[1;35m",
        cyan: "\x1b[1;36m",
        white: "\x1b[1;37m",
    },
    underlines: {
        black: "\x1b[4;30m",
        red: "\x1b[4;31m",
        green: "\x1b[4;32m",
        yellow: "\x1b[4;33m",
        blue: "\x1b[4;34m",
        purple: "\x1b[4;35m",
        cyan: "\x1b[4;36m",
        white: "\x1b[4;37m",
    },
    backgrounds: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        purple: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
    },
};

export class Colors {
    public static setColor(text: string, options: TFormatOptions): string {
        if (Object.keys(options).length > 1) {
            throw new Error("Too many options for setColor");
        }

        const opts: string[] = [];

        switch (true) {
            case typeof options.colors !== "undefined":
                opts.push(formatOptions.colors[options.colors as keyof object]);
                break;
            case typeof options.backgrounds !== "undefined":
                opts.push(
                    formatOptions.backgrounds[
                        options.backgrounds as keyof object
                    ]
                );
                break;
            case typeof options.bolds !== "undefined":
                opts.push(formatOptions.bolds[options.bolds as keyof object]);
                break;
            case typeof options.underlines !== "undefined":
                opts.push(
                    formatOptions.underlines[options.underlines as keyof object]
                );
                break;
            default:
                break;
        }

        if (opts.length === 0) {
            return text;
        }

        const proccessedOptions = opts.join().replaceAll(",", "");
        return proccessedOptions + text + formatOptions.reset;
    }
}
