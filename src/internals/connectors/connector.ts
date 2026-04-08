export interface Connector {
    connect(connectionStr: string): any;
    disconnect(): Promise<void>;
}
