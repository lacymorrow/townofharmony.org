# Town of Harmony Migration Scripts

This directory contains scripts to migrate data from the Django/Wagtail CMS to the new Next.js/Shipkit application.

## Migration Process

### Prerequisites

1. **Django Environment Setup**:
   - Ensure the Django project is accessible at `/Users/lacy/repo/TOH`
   - Django database should be running and accessible
   - Python 3.x with Django and Wagtail installed

2. **Next.js Environment Setup**:
   - PostgreSQL database running locally or accessible via DATABASE_URL
   - Run `pnpm install` in the TOH-new directory
   - Configure `.env` file with database credentials

### Step 1: Export Django Data

Run the export script from this directory:

```bash
cd /Users/lacy/repo/TOH-new/scripts/migrate
python export-django-data.py
```

This will create JSON files in the `data/` directory:

- `users.json` - User accounts
- `news.json` - News articles
- `events.json` - Events
- `businesses.json` - Business directory entries
- `pages.json` - General CMS pages
- `media.json` - Media file references

### Step 2: Set Up Next.js Database

1. Create the database (if not exists):

```bash
createdb toh_dev
```

2. Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
```

### Step 3: Import Data to Next.js

Run the import script:

```bash
pnpm tsx scripts/migrate/import-to-nextjs.ts
```

This will:

- Import users (with new UUIDs)
- Convert StreamField content to MDX
- Import news, events, and businesses
- Maintain relationships between entities

### Step 4: Validate Migration

Run the validation script to ensure data integrity:

```bash
pnpm tsx scripts/migrate/validate-migration.ts
```

This will check:

- Record counts match between Django and Next.js
- Required fields are populated
- No duplicate slugs
- Data integrity constraints

### Step 5: Migrate Media Files

Media files need to be copied from Django's media directory:

```bash
# Copy media files
cp -r /Users/lacy/repo/TOH/media/* /Users/lacy/repo/TOH-new/public/media/

# Or use rsync for better control
rsync -av /Users/lacy/repo/TOH/media/ /Users/lacy/repo/TOH-new/public/media/
```

### Step 6: Post-Migration Tasks

1. **Update Image References**:
   - Update database records to point to new media URLs
   - Consider using a CDN for production

2. **User Passwords**:
   - Users will need to reset their passwords
   - Send password reset emails to all users

3. **SEO Redirects**:
   - Set up 301 redirects from old URLs to new ones
   - Preserve SEO value

4. **Content Review**:
   - Review converted MDX content for formatting issues
   - Update any broken internal links

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check PostgreSQL is running:

```bash
pg_ctl status
```

2. Verify database exists:

```bash
psql -l | grep toh_dev
```

3. Check `.env` file has correct DATABASE_URL

### Django Import Errors

If the Django export script fails:

1. Ensure Django settings module is correct:

```python
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'harmonycms.settings.development')
```

2. Check Python path includes Django project:

```python
sys.path.insert(0, '/Users/lacy/repo/TOH')
```

3. Verify all required Django apps are installed

### Content Conversion Issues

If content doesn't convert properly:

1. Check the `blocksToMDX` function in `import-to-nextjs.ts`
2. Add handling for specific StreamField block types
3. Manually review and fix complex content blocks

## Custom Block Types

The migration handles these Wagtail StreamField blocks:

- `heading` → H2 markdown
- `paragraph` / `richtext` → Plain text
- `image` → Markdown image
- `list` → Markdown list

Add custom handlers in `blocksToMDX()` for other block types.

## Data Mapping

| Django Model       | Next.js Table | Notes                     |
| ------------------ | ------------- | ------------------------- |
| User               | users         | New UUID, role mapping    |
| NewsDetailPage     | news          | StreamField → MDX         |
| EventPage          | events        | Date parsing, status calc |
| BusinessDetailPage | businesses    | Needs categorization      |
| Page               | (various)     | Depends on content type   |

## Rollback

To rollback the migration:

1. Drop all toh_ prefixed tables:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

2. Re-run initial migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

## Production Migration

For production migration:

1. Put Django site in maintenance mode
2. Create database backup
3. Run migration scripts
4. Validate data integrity
5. Update DNS/proxy settings
6. Monitor for issues
7. Keep Django backup for rollback
