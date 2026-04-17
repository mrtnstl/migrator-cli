export interface Connector {
    disconnect(): Promise<void>;
    getClient(): unknown;
}
