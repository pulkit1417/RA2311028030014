import 'dotenv/config';
import { Log, configureLoggerAuth } from 'logging_middleware';
import * as fileSystem from 'fs';

// geting token from global .env file so we don't have to duplicate it!
const JWT_AUTH = process.env.VITE_JWT_AUTH;

configureLoggerAuth(JWT_AUTH);

// mapping scores for the different notification types (placements matter most)
const categoryScores = {
    'placement': 3,
    'result': 2,
    'event': 1
};

// helper function to quickly grab the score safely
const resolveScore = (itemType) => {
    // gotta make sure it's lowercase just in case the api sends weird casing
    const key = String(itemType).toLowerCase();
    return categoryScores[key] || 0;
};

const sortInboxItems = (firstItem, secondItem) => {
    const valA = resolveScore(firstItem.Type);
    const valB = resolveScore(secondItem.Type);
    
    if (valA !== valB) {
        return valB - valA; 
    }
    
    // if weights are the same, we gotta sort by time (newer is better)
    const timestampA = new Date(firstItem.Timestamp).valueOf();
    const timestampB = new Date(secondItem.Timestamp).valueOf();
    return timestampB - timestampA;
};

const runInboxProcessor = async () => {
    await Log("frontend", "info", "api", "Triggering priority inbox initialization");
    
    try {
        const fetchRes = await fetch("http://20.207.122.201/evaluation-service/notifications", {
            headers: {
                "Authorization": `Bearer ${JWT_AUTH}`
            }
        });

        if (!fetchRes.ok) {
            await Log("frontend", "error", "api", `Fetch failed. Status: ${fetchRes.status}`);
            return;
        }

        const parsedData = await fetchRes.json();
        const inboxList = parsedData.notifications || []; // fallback to empty array if undefined
        
        await Log("frontend", "info", "api", `Successfully pulled ${inboxList.length} items`);
        await Log("frontend", "info", "utils", "Sorting active items by priority");
        
        const arrangedItems = inboxList.sort(sortInboxItems);
        // we only care about the top 10 for the inbox view
        const topTenResults = arrangedItems.slice(0, 10);
        
        await Log("frontend", "info", "utils", "Computed top 10 items");
        
        fileSystem.writeFileSync('priority_inbox_output.json', JSON.stringify(topTenResults, null, 2));
        await Log("frontend", "info", "utils", "Dumped results to priority_inbox_output.json");
        
        process.stdout.write("\n=== PREMIUM PRIORITY INBOX ===\n");
        let counter = 1;
        for (const element of topTenResults) {
            process.stdout.write(`${counter}. [${element.Type}] ${element.Message} -> ${element.Timestamp}\n`);
            counter++;
        }
        process.stdout.write("==============================\n");

    } catch (err) {
        await Log("frontend", "error", "api", `Catch block error: ${err.message}`);
    }
};

runInboxProcessor();
