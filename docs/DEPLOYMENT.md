# FinPredict Deployment Guide

## Vercel Configuration

### Cron Jobs

The application uses Vercel Cron Jobs to automatically fetch news every 30 minutes:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/news/ingest",
      "schedule": "*/30 * * * *"
    }
  ]
}
\`\`\`

### Environment Variables

Required environment variables:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: NewsAPI.org (for additional news sources)
NEWS_API_KEY=your_newsapi_key

# Optional: Alpha Vantage (for price data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
\`\`\`

### Caching Strategy

1. **API Routes**: Use \`revalidate\` for ISR caching
   - \`/api/news/list\`: 5 minutes (300 seconds)
   - \`/api/energy\`: 5 minutes
   - \`/api/investing\`: 5 minutes

2. **In-Memory Cache**: For frequently accessed data
   - Company data: 5 minutes
   - News feed: 5 minutes
   - Price data: 1 minute

3. **Database Query Optimization**:
   - Index on \`published_at\` for fast sorting
   - GIN index on \`tickers\` array for fast lookups
   - Pagination to limit result sets

### Rate Limiting

To prevent abuse and stay within API limits:

1. **RSS Feeds**: Max 1 request per source per 30 minutes (via cron)
2. **Yahoo Finance API**: Cached for 5 minutes
3. **NewsAPI.org**: 100 requests per day (free tier)

### Deployment Steps

1. **Initial Setup**:
   \`\`\`bash
   # Clone repository
   git clone https://github.com/your-repo/finpredict.git
   cd finpredict
   
   # Install dependencies
   pnpm install
   
   # Set up environment variables
   cp .env.example .env.local
   # Edit .env.local with your keys
   \`\`\`

2. **Database Setup**:
   \`\`\`bash
   # Run SQL scripts in Supabase dashboard or via CLI
   psql $DATABASE_URL -f scripts/create_news_tables.sql
   \`\`\`

3. **Deploy to Vercel**:
   \`\`\`bash
   vercel --prod
   \`\`\`

4. **Verify Cron Jobs**:
   - Go to Vercel Dashboard > Your Project > Settings > Cron Jobs
   - Verify that \`/api/news/ingest\` is scheduled for every 30 minutes
   - Check logs to ensure it's running successfully

5. **Test Manual Ingestion**:
   \`\`\`bash
   curl https://your-domain.vercel.app/api/news/ingest
   \`\`\`

### Monitoring

1. **Vercel Logs**: Check deployment and function logs
2. **Supabase Logs**: Monitor database queries and RLS policy hits
3. **Error Tracking**: Check console logs for parsing errors

### Troubleshooting

**Cron job not running**:
- Verify \`vercel.json\` is in project root
- Check Vercel dashboard for cron job configuration
- Ensure API route returns 200 status

**News not appearing**:
- Check database for inserted articles
- Verify RLS policies allow reading
- Test individual RSS feeds manually

**Rate limit errors**:
- Reduce cron frequency
- Add delays between API calls
- Use caching more aggressively

### Performance Optimization

1. **Edge Functions**: All API routes use edge runtime for faster response
2. **Database Indexes**: Optimize queries with proper indexing
3. **Image Optimization**: Use Next.js Image component for news thumbnails
4. **Lazy Loading**: Implement infinite scroll to reduce initial load
5. **CDN Caching**: Set appropriate Cache-Control headers
