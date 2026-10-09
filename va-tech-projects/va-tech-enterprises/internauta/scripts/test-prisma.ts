import { prisma } from "../src/lib/prisma";

async function main() {
    try {
        const count = await prisma.chat.count();
        console.log(`Chat count: ${count}`);
    } catch (e: any) {
        console.error(`Error: ${e.message}`);
    }
}

main();
