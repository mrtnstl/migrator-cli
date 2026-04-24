import {
    ErrorState,
    AppLevelNotificationState,
    SelectedProjectIDState,
} from "../../../internals/state/globalStates";
import { TAppLevelNotification } from "../../../types";

describe("ErrorState", () => {
    it("should create an instance with the initial value of null", () => {
        const errorState = new ErrorState();

        expect(errorState).toBeInstanceOf(ErrorState);
        expect(errorState.get()).toBeNull();
    });

    it("should return the new value after calling the setter", () => {
        const errorState = new ErrorState();

        const message = "some error";
        errorState.set(new Error(message));

        expect(errorState.get()).toBeInstanceOf(Error);
        expect(errorState.get()?.message).toBe(message);
    });
});

describe("AppLevelNotificationState", () => {
    it("should create an instance with the initial value", () => {
        const notificationState = new AppLevelNotificationState();

        expect(notificationState).toBeInstanceOf(AppLevelNotificationState);
        expect(notificationState.get()).toHaveProperty("type");
        expect(notificationState.get()).toHaveProperty("message");
        expect(notificationState.get().message).toBe("_");
    });

    it("should return the new value after calling the setter", () => {
        const notificationState = new AppLevelNotificationState();

        const newState = { type: "info", message: "" } as TAppLevelNotification;
        notificationState.set(newState);

        expect(notificationState.get().message).toBe(newState.message);
        expect(notificationState.get().type).toBe(newState.type);
    });
});

describe("SelectedProjectIDState", () => {
    it("should create an instance with the initial value of null", () => {
        const selectedProjectIDState = new SelectedProjectIDState();

        expect(selectedProjectIDState).toBeInstanceOf(SelectedProjectIDState);
        expect(selectedProjectIDState.get()).toBeNull();
    });

    it("should return the new value after calling the setter", () => {
        const selectedProjectIDState = new SelectedProjectIDState();

        const newState = 5;
        selectedProjectIDState.set(newState);

        expect(selectedProjectIDState.get()).not.toBeNull();
        expect(selectedProjectIDState.get()).toBe(newState);
    });
});
