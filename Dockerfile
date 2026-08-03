
# Deps stage: install production dependencies only.
FROM docker.io/node:24-alpine3.23 AS deps
 
WORKDIR /app

# npm ci installs exactly what's in package-lock.json (fast, reproducible).
# --mount=type=cache keeps the npm cache on the host between builds.
# --mount=type=bind makes package.json + lockfile visible without COPYing them.
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci --omit=dev


# Runner stage: minimal runtime image with compiled app and production deps.
FROM docker.io/node:24-alpine3.23 AS runner

ENV PATH=/app/node_modules/.bin:$PATH

WORKDIR /app

# Production dependencies from the deps stage.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# The application source
COPY --chown=node:node . .
 

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["node", "index.js"]