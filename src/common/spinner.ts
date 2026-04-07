import ora, { Color, Options, Ora } from "ora";

export class Spinner {
    private instance: Ora;
    constructor(arg: string | Options) {
        this.instance = ora(arg);
    }
    start() {
        this.instance.start();
    }
    stop() {
        this.instance.stop();
    }
    succeed() {
        this.instance.succeed();
    }
    text(text: string) {
        this.instance.text = text;
    }
    color(text: Color) {
        this.instance.color = text;
    }
}
