# THINKING.md

## Assumptions

1. **Data Inconsistencies**: I assumed that the data provided in the JSON files could have inconsistencies (e.g., missing values, unexpected formats), but I handled this gracefully by defaulting missing values to 0 or null where appropriate.
   
2. **Targets Data**: The target data (`targets.json`) is monthly, and I assumed that the monthly targets are summed up to get the target for the quarter.

3. **Revenue Drivers**: I used the `deals` data to derive important revenue metrics such as win rate, average deal size, and pipeline value. Deals in the "Prospecting" and "Negotiation" stages are considered part of the pipeline.

4. **Current Quarter Calculation**: The current quarter’s revenue was calculated based on the most recent deal's closed date. If no closed deals exist, the system would return a 0 revenue for the current quarter. 

5. **Performance Metrics**: For the purpose of calculating `winRate` and `avgDealSize`, I only considered closed deals (i.e., deals with a "Closed Won" or "Closed Lost" stage). Open deals or deals without any activity Ire excluded from the win rate calculation.

6. **Risk Factors**: Underperforming reps Ire identified by comparing their target achievement to a threshold (50%). Stale deals Ire identified if there had been no activity (call/email) for 45+ days.

---

## Data Issues

1. **Missing Data**: Some fields like `closed_at` in the `deals` dataset Ire missing. This could impact metrics like the sales cycle time and revenue calculation. I handled these with null or 0.


---

## Trade-offs

1. **Performance vs Accuracy**: To keep the calculations fast and scalable, I opted to perform some aggregations (like sum and average) directly in SQL rather than in-memory processing. This could be less flexible but ensures that I are only retrieving and manipulating the necessary data.

2. **Handling Edge Cases**: I made trade-offs by using simple fallbacks for certain edge cases (e.g., no closed deals or no targets for a given period). More sophisticated handling, like interpolation of missing target data or handling of incomplete revenue data, would have added complexity and overhead.

3. **Simplicity in API**: I focused on delivering clean, simple API endpoints (such as `/api/summary` and `/api/drivers`) without too much logic in the front-end. This makes the system extensible for future features but requires careful data handling on the backend.

---

## What Would Break at 10x Scale?

1. **Database Performance**: The SQLite database would struggle with 10× the amount of data, especially with complex queries aggregating large amounts of deals and activities data. Moving to a more scalable database like PostgreSQL or MySQL would be necessary.

2. **Real-Time Updates**: The current system doesn't handle real-time data updates (e.g., newly closed deals or activities). Scaling to 10× would require implementing real-time data syncs or Ibhooks to ensure the frontend gets updated instantly.

3. **Data Quality and Consistency**: With more data, issues like incomplete records or inconsistent dates could cause errors in calculations. More robust data validation and cleanup would be needed to ensure accuracy.

---

## What Did AI Help With vs What You Decided?

1. **AI Assistance**:
   - **Code snippets**: Used AI (ChatGPT) for generating small snippets of code related to SQL query optimization and generating complex date-based calculations.
   - **Refactoring suggestions**: AI helped refactor certain code blocks, improving readability and ensuring best practices for asynchronous operations.

2. **Manual Decisions**:
   - **API Design**: Decided to keep API endpoints minimal and focused on critical business metrics, rather than overloading them with unnecessary features.
   - **Data Handling**: I made decisions manually on how to handle missing or inconsistent data (e.g., fallback logic for missing `closed_at` dates or empty `revenue` calculations).

---

