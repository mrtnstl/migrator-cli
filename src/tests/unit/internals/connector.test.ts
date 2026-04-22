import { PostgresConnector } from "../../../internals/connectors/postgres";
import { getConnection } from "../../../internals/connectors/helper";

describe("getConnection", () => {
    it("should throw, when invalid protocol passed in connection string", () => {
        expect(() => getConnection("invalid://conn@str")).toThrow(
            "Invalid connection string!"
        );
    });

    it("should throw, when empty string passed as the parameter", () => {
        expect(() => getConnection("")).toThrow("Invalid connection string!");
    });

    it("should return an instance with getClient and disconnect", () => {
        const connection = getConnection("postgresql://some_pg_database");
        expect(connection).toHaveProperty("getClient");
        expect(connection).toHaveProperty("disconnect");
    });
});
