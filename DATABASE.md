# Database Setup for Town of Harmony

## Quick Start

The Town of Harmony Next.js app uses PostgreSQL running in Docker on **port 5435** (to avoid conflicts with other local databases).

### 1. Start the Database

```bash
# Start PostgreSQL container on port 5435
docker-compose -f docker-compose.dev.yml up -d

# Verify it's running
docker-compose -f docker-compose.dev.yml ps
```

### 2. Run Database Migrations

```bash
# Push the schema to the database
pnpm db:push

# Or run migrations if they exist
pnpm db:migrate
```

### 3. Seed Sample Data

```bash
# Add sample data for testing
pnpm tsx scripts/seed-sample-data.ts
```

### 4. Access Database

```bash
# Using psql
psql postgresql://postgres:postgres@localhost:5435/toh_dev

# Using Drizzle Studio (web UI)
pnpm db:studio
```

## Configuration

### Environment Variables

The database connection is configured in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/toh_dev
DB_PREFIX=toh
```

### Port Configuration

- **Default Port**: 5435 (external) → 5432 (internal)
- **Why 5435?**: Avoids conflicts with other PostgreSQL instances
- **Container Name**: `toh-postgres`
- **Database Name**: `toh_dev`
- **Username**: `postgres`
- **Password**: `postgres`

### Docker Compose Configuration

The database is defined in `docker-compose.dev.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: toh-postgres
    ports:
      - "5435:5432" # External:Internal
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: toh_dev
```

## Common Commands

```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d

# Stop database
docker-compose -f docker-compose.dev.yml down

# Stop and remove all data
docker-compose -f docker-compose.dev.yml down -v

# View logs
docker-compose -f docker-compose.dev.yml logs postgres

# Execute SQL directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d toh_dev

# Backup database
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres toh_dev > backup.sql

# Restore database
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres toh_dev < backup.sql
```

## Troubleshooting

### Port Already in Use

If port 5435 is already in use, you can change it in:

1. `docker-compose.dev.yml` - Update the ports section
2. `.env` - Update DATABASE_URL with the new port

### Connection Refused

1. Check if container is running: `docker-compose -f docker-compose.dev.yml ps`
2. Check logs: `docker-compose -f docker-compose.dev.yml logs postgres`
3. Ensure DATABASE_URL in `.env` matches the port configuration

### Permission Denied

If you get permission errors, ensure the Docker daemon is running and you have proper permissions:

```bash
# On macOS/Linux
sudo docker-compose -f docker-compose.dev.yml up -d
```

## Data Persistence

Database data is persisted in a Docker volume named `postgres_data`. This means:

- Data survives container restarts
- To completely reset, use: `docker-compose -f docker-compose.dev.yml down -v`
