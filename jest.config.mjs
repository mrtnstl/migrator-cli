/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"isolatedModules": true} */

const config = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    roots: ["./src/tests"],
    transform: {
        "^.+\\.ts?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
    //moduleFileExtentions: ["ts", "js", "json", "node"],
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};

export default config;
