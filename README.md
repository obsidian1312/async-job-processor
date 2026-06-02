# Async Job Processor

## How to start the app:

1. Find the .env.tpl and create the .env with your values.
2. Run the `docker compose up -d` to build the Redis container.
3. Boot the app with `npm run start:dev` or with `npm run build` & `npm run start`

## Concurrency approach

I've chosen a per-user distributed concurrency limiter using Redis as a shared atomic counter.

> Each user has a Redis counter representing how many active jobs they currently have.
> The system allows only N concurrent jobs per user (configurable limit).

On the current app stage this is perfect approach as for me. Scalable, maintanable and debuggable. It guarantees success -> release, failure -> release, crash -> release. The status is being returned without blocking (asynchronously).

## Retry implementation

This one implemented with BullMQ’s built-in retry system.
> If a processor throws an error -> Bull retries the job automatically according to configuration.

In retry config I register maximum allowed number of attempts (1 + 3 retries)

**Flow**:
1. Job runs.
2. on `throw new Error()` -> Bull marks it as failed, on `success` -> release
3. Bull checks `attempts`
4. If attempts remain -> job is retried
5. If exhausted -> job is marked permanently failed.
