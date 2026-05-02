import { Log, configureLoggerAuth } from 'logging_middleware';
import * as fileSystem from 'fs';

//this token will eventually always expire that's why i am not putting in the env file
const JWT_AUTH = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJwZzE3MzZAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMDQxNSwiaWF0IjoxNzc3Njk5NTE1LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNmMzNTdmNDItNmE4Ny00MmRlLWFjNDYtNzFkMzA5ZDNhYWQ3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoicHVsa2l0IGd1cHRhIiwic3ViIjoiNTVhMzdjZGUtOTNkNS00OTY1LTk2MTMtMmVjYjZiMDJiNjFmIn0sImVtYWlsIjoicGcxNzM2QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoicHVsa2l0IGd1cHRhIiwicm9sbE5vIjoicmEyMzExMDI4MDMwMDE0IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNTVhMzdjZGUtOTNkNS00OTY1LTk2MTMtMmVjYjZiMDJiNjFmIiwiY2xpZW50U2VjcmV0IjoidXR2TXJ2SmZwYVFuRGNEayJ9.wqxevM1Px1MHJb062hViqwNsfRuv5Js5G4HOZoYsr7M";

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
