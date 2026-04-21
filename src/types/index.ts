// app database schemas
export type TProject = {
    id: number;
    name: string;
    db_conn_str: string;
    migrations_location: string;
};

// ui
export type TDivider = string;
export type TSelectItemSelectable = { name: string; value: string };
export type TSelectItem = TSelectItemSelectable | TDivider;

export type TSelectConfig = {
    message: string;
    options: TSelectItem[];
};

// views
export type TViewName =
    | "main"
    | "projects"
    | "project"
    | "createproject"
    | "userguide"
    | "exit"
    | "error";

export interface IView {
    name: TViewName;
    render(): Promise<string | null>;
}

export type TPressKeyOptions = "return";

// states

export type TAppLevelNotification = {
    type: "error" | "success" | "warning" | "info";
    message: string;
};
