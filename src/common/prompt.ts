import readline from "node:readline/promises";

export async function prompt(message: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answer = await rl.question(message);
    rl.close();
    return answer;
}
