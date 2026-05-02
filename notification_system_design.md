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

## Stage 2

### Frontend Architecture
The frontend is built as a highly responsive Single Page Application (SPA) using React, orchestrated via Vite. 

**Key Technical Decisions:**
1. **Material UI (MUI)**: Chosen as the exclusive styling and component framework to ensure enterprise-grade aesthetics and robust responsive layouts across both mobile and desktop screens. Custom CSS is strictly avoided.
2. **Proxy-based CORS Mitigation**: The API endpoints are called via relative paths that pass through Vite's local development server proxy. This securely circumvents browser-enforced Cross-Origin Resource Sharing (CORS) blocks.
3. **State Management**: 
   - `localStorage` is utilized for persistence to track "read" vs "unread" states across browser sessions.
   - Component state (`useState`) handles dynamic pagination and category filtering.
4. **Mandatory Logging Integration**: To fulfill strict tracking requirements, the global `logging_middleware` is invoked within `useEffect` hooks and event handlers, logging all UI navigations, API fetches, and user interactions without violating standard `console.log` restrictions.
