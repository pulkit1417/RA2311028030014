# Notification System Design Architecture

## Stage 1

### Priority Inbox Technical Strategy
To reliably manage and present the top `N` critical notifications (like the top 10) in a continuously updating environment, leveraging a **Min-Heap (Priority Queue)** data structure of size `N` represents the optimal path.

**Advantages of the Min-Heap Design:**
- **Memory Footprint**: Memory usage remains strictly bounded at `O(N)` since the heap only ever retains exactly `N` items.
- **Computational Overhead**: 
  - Identifying the least-important notification in our top list is instant (`O(1)`), as it always sits at the root of the min-heap.
  - As new notifications arrive, we verify if its priority surpasses the heap's root element. If so, the root is dropped (`O(log N)`) and the fresh notification is pushed in (`O(log N)`).
  - Processing `M` incoming data packets yields a complexity of `O(M log N)`, which is vastly superior for live-streamed data compared to full batch sorting (`O(M log M)`).

### Metric Calculation Hierarchy
Our priority matrix is computed using two primary factors:
1. **Weight**: We mathematically rank notification categories (Placement = 3 points, Result = 2 points, Event = 1 point).
2. **Timestamp Recency**: We translate the human-readable date into absolute Unix epochs.

During evaluation, two objects are initially compared by their Weight integer. In the event of a tiebreaker, the notification possessing the larger Unix epoch (the more recent event) inherits the priority advantage.
