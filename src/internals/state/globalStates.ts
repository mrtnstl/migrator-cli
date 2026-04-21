import { TAppLevelNotification } from "../../types/index.js";

interface State {
    set(newState: unknown): void;
    get(): unknown;
}

export class ErrorState implements State {
    private state: Error | null;
    constructor() {
        this.state = null;
    }
    set(newState: Error | null) {
        this.state = newState;
    }
    get() {
        return this.state;
    }
}

export class AppLevelNotificationState implements State {
    private state: TAppLevelNotification;
    constructor() {
        this.state = { type: "info", message: "_" };
    }
    set(newState: TAppLevelNotification) {
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
    set(newState: number | null) {
        this.state = newState;
    }
    get() {
        return this.state;
    }
}
