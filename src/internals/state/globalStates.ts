import { TProject } from "../../types/index.js";

interface State {
    set(newState: any): void;
    get(): any;
}

export class ErrorState implements State {
    private state: unknown;
    constructor() {
        this.state = null;
    }
    set(newState: unknown) {
        this.state = newState;
    }
    get() {
        return this.state;
    }
}

export class MigrationState implements State {
    private state: string;
    constructor() {
        this.state = "";
    }
    set(newState: string) {
        this.state = newState;
    }
    get() {
        return this.state;
    }
}

export class SelectedProjectIDState implements State {
    private state: number | null;
    constructor() {
        this.state = null;
    }
    set(newState: number) {
        this.state = newState;
    }
    get() {
        return this.state;
    }
}
