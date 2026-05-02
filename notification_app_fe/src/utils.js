// using local storage to remember what we already read so it persists after refresh
export const fetchReadStatus = () => {
  const storedData = localStorage.getItem('seen_notifications');
  return storedData ? JSON.parse(storedData) : [];
};

export const flagAsRead = (itemId) => {
  const currentSeen = fetchReadStatus();
  // only add if it's not already there to prevent duplicates
  if (!currentSeen.includes(itemId)) {
    currentSeen.push(itemId);
    localStorage.setItem('seen_notifications', JSON.stringify(currentSeen));
  }
};

// basic weight mapping (placements > results > events)
const weightMap = {
    'placement': 3,
    'result': 2,
    'event': 1
};

export const getScoreVal = (rawType) => {
    // gotta lowercase this because sometimes backends send weird capitalization
    const normalizedKey = String(rawType).toLowerCase();
    return weightMap[normalizedKey] || 0;
};

// custom sorter to rank based on weight first, then fallback to time if tied
export const rankItemsDesc = (a, b) => {
    const scoreA = getScoreVal(a.Type);
    const scoreB = getScoreVal(b.Type);
    
    if (scoreA !== scoreB) {
        return scoreB - scoreA; 
    }
    
    // time fallback: newer stuff bubbles up to the top
    const timeA = new Date(a.Timestamp).getTime();
    const timeB = new Date(b.Timestamp).getTime();
    return timeB - timeA;
};
