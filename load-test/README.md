# Load Testing with k6

## Installation

### macOS
```bash
brew install k6
```

### Ubuntu/Debian
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows
```bash
choco install k6
# or
winget install k6
```

### Docker
```bash
docker pull grafana/k6
```

## Running Tests

### 1. Quick Test (Start Here)
Run a quick 100-user test to verify everything works:
```bash
cd load-test
k6 run k6-quick-test.js
```

### 2. Full 50K User Load Test
```bash
cd load-test
k6 run k6-load-test.js
```

### 3. Custom URL
```bash
k6 run -e BASE_URL=https://your-staging-site.com k6-load-test.js
```

### 4. With Docker
```bash
docker run --rm -i grafana/k6 run - <k6-load-test.js
```

## Test Stages (50K Test)

| Duration | Target Users | Purpose |
|----------|--------------|---------|
| 2 min    | 1,000        | Initial ramp-up |
| 3 min    | 5,000        | Gradual increase |
| 5 min    | 15,000       | Medium load |
| 5 min    | 30,000       | High load |
| 5 min    | 50,000       | Peak load |
| 10 min   | 50,000       | **Sustain peak** |
| 5 min    | 10,000       | Ramp down |
| 3 min    | 0            | Cool down |

**Total Duration: ~38 minutes**

## User Behavior Simulation

- **40%** - Browsing users (home, about, explore, blog)
- **30%** - Potential customers (packages, FAQ, contact, reviews)
- **20%** - Returning users (login, knowledge base)
- **10%** - API-heavy users (settings, products APIs)

## Success Thresholds

- 95% of requests complete under 3 seconds
- Less than 5% error rate
- All critical pages return 200 status

## Output Metrics

After the test, you'll see:
- `http_req_duration` - Response times (avg, min, max, p95)
- `http_req_failed` - Failed request percentage
- `http_reqs` - Total requests per second
- `vus` - Virtual users active
- `errors` - Custom error rate

## Tips for Production Testing

1. **Warn your hosting provider** - 50K users might trigger DDoS protection
2. **Monitor server resources** - Watch CPU, RAM, database connections
3. **Run during off-peak hours** - Avoid impacting real users
4. **Start with quick test** - Verify setup before full load
5. **Check Vercel/hosting limits** - Serverless has concurrency limits

## Scaling Considerations

If your server struggles:
- Enable CDN caching (Vercel Edge, Cloudflare)
- Optimize database queries
- Add connection pooling to MongoDB
- Consider Redis for session/cache
- Scale serverless function limits
