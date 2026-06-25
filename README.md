## Enterprise WMS

### Database Binding

The app uses Supabase for runtime data access through `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`.

For database migrations from this repo, add one of these to `.env` or
`apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

or, because this repo already has `supabase/.temp/pooler-url`:

```env
SUPABASE_DB_PASSWORD=your-database-password
```

Then run:

```bash
npm run db:status
npm run db:baseline
npm run db:migrate
npm run create-admin
```

Use `db:baseline` once for an existing Supabase database that already has the
tables from `database/migrations`. Use `db:migrate` for new migration files
after that.
