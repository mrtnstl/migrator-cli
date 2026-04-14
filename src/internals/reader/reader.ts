export interface Reader {
    read(path: string): Promise<string>;
}
