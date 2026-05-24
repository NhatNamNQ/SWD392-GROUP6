# Observability Reference Architecture

Observability should make failures understandable. The first target is basic
metrics and dashboards, not a complex alerting program.

## Tooling

| Tool | Purpose |
| --- | --- |
| Prometheus | Scrape and store time-series metrics |
| Grafana | Visualize service health and business metrics |
| Application logs | Explain request failures and indexing failures |
| Traces | Future option for cross-service request debugging |

## Metrics To Expose

| Service | Example Metrics |
| --- | --- |
| Next.js BFF | request count, request latency, error count, stream duration |
| Java backend | API latency, auth failures, document status counts, chat session writes |
| Python RAG backend | indexing duration, chunk count, retrieval latency, LLM latency, token usage, answer failures |
| PostgreSQL | connection count, slow queries, index health, storage growth |

## Dashboard Set

Start with four Grafana dashboards:

- System overview: request rate, error rate, p95 latency, service uptime.
- RAG health: indexing success rate, retrieval latency, LLM latency, failed answers.
- Data health: document status distribution, chunk count, embedding count.
- Infrastructure health: PostgreSQL, CPU, memory, disk, and container restarts.

## Future Alert Ideas

Do not add alerts until the team knows normal traffic patterns. Candidate alerts:

- API error rate above an agreed threshold.
- Python RAG p95 latency above an agreed threshold.
- Indexing failures increasing.
- PostgreSQL disk usage near capacity.
- LLM API failure rate increasing.

## Logging Guidelines

- Log request IDs across frontend, Java, and Python services.
- Never log raw secrets or API keys.
- Avoid logging full student conversations by default.
- Log document indexing failures with a human-readable reason.
- Include document ID, course ID, and chapter ID where useful for debugging.
