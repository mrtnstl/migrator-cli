const colorsLite = {
    reset: "\x1b[0m",
    boldBlue: "\x1b[1;34m",
};

export class Spinner {
    private static readonly frames = ["|", "/", "-", "\\"] as const;
    private interval: NodeJS.Timeout | null;
    private message: string;
    private isRunning: boolean;
    private currentFrame: number;

    constructor(initialMessage: string) {
        this.interval = null;
        this.message = initialMessage;
        this.isRunning = false;
        this.currentFrame = 0;
    }

    start(message?: string) {
        if (this.isRunning) {
            return;
        }

        // hide cursor
        process.stdout.write("\x1b[?25l");

        this.message = message || this.message;
        this.currentFrame = 0;
        this.isRunning = true;

        process.stdout.write("\r");

        // ansi for clearing current line: \x1b[2K
        this.interval = setInterval(() => {
            const frame = Spinner.frames[this.currentFrame];
            process.stdout.write(
                "\r" + " ".repeat(process.stdout.columns || 80) + "\r"
            );
            process.stdout.write(
                `\r${colorsLite.boldBlue}${frame}${colorsLite.reset} ${this.message}`
            );
            this.currentFrame = (this.currentFrame + 1) % Spinner.frames.length;
        }, 80);
    }

    stop(message: string) {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        // show cursor
        process.stdout.write("\x1b[?25h");

        this.isRunning = false;

        process.stdout.write(
            "\r" + " ".repeat(process.stdout.columns || 80) + "\r"
        );

        if (message) {
            console.log(message);
        }
    }

    setMessage(newMessage: string) {
        this.message = newMessage;
    }
}
