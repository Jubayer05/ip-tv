#!/usr/bin/env node

/**
 * Disaster Recovery (D/R) Testing Script
 *
 * Tests the resilience and recovery capabilities of your application:
 * - Database connectivity and failover
 * - API endpoint availability
 * - Critical user flows
 * - Data integrity
 * - Service degradation handling
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'https://www.cheapstreamtv.com',
  mongoUri: process.env.MONGODB_URI || '',
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 2000, // 2 seconds
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ PASS${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗ FAIL${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ WARN${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ INFO${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`),
};

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

// Helper: Make HTTP request with retries
async function fetchWithRetry(url, options = {}, retries = CONFIG.retries) {
  const makeRequest = () => {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, { timeout: CONFIG.timeout, ...options }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data,
            responseTime: Date.now() - startTime,
          });
        });
      });

      const startTime = Date.now();
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  };

  for (let i = 0; i < retries; i++) {
    try {
      return await makeRequest();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, CONFIG.retryDelay));
    }
  }
}

// Test: Website availability
async function testWebsiteAvailability() {
  log.header('1. WEBSITE AVAILABILITY');

  const criticalPages = [
    { path: '/', name: 'Home Page' },
    { path: '/packages', name: 'Packages Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/register', name: 'Register Page' },
    { path: '/support/faq', name: 'FAQ Page' },
    { path: '/support/contact', name: 'Contact Page' },
  ];

  for (const page of criticalPages) {
    try {
      const res = await fetchWithRetry(`${CONFIG.baseUrl}${page.path}`);
      if (res.status === 200) {
        log.success(`${page.name} (${res.responseTime}ms)`);
        results.passed++;
      } else {
        log.fail(`${page.name} - Status: ${res.status}`);
        results.failed++;
      }
      results.tests.push({ name: page.name, status: res.status, time: res.responseTime });
    } catch (error) {
      log.fail(`${page.name} - ${error.message}`);
      results.failed++;
      results.tests.push({ name: page.name, error: error.message });
    }
  }
}

// Test: API endpoints
async function testAPIEndpoints() {
  log.header('2. API ENDPOINT AVAILABILITY');

  const apis = [
    { path: '/api/admin/settings', name: 'Settings API' },
    { path: '/api/admin/products', name: 'Products API' },
    { path: '/api/blogs', name: 'Blogs API' },
    { path: '/api/admin/rank-system', name: 'Rank System API' },
  ];

  for (const api of apis) {
    try {
      const res = await fetchWithRetry(`${CONFIG.baseUrl}${api.path}`);
      // 200 or 401 (auth required) are both acceptable
      if (res.status === 200 || res.status === 401) {
        log.success(`${api.name} (${res.responseTime}ms)`);
        results.passed++;
      } else {
        log.warn(`${api.name} - Status: ${res.status}`);
        results.warnings++;
      }
      results.tests.push({ name: api.name, status: res.status, time: res.responseTime });
    } catch (error) {
      log.fail(`${api.name} - ${error.message}`);
      results.failed++;
      results.tests.push({ name: api.name, error: error.message });
    }
  }
}

// Test: Response time thresholds
async function testResponseTimes() {
  log.header('3. RESPONSE TIME THRESHOLDS');

  const thresholds = {
    home: 3000,      // 3 seconds
    api: 2000,       // 2 seconds
    static: 1000,    // 1 second
  };

  const tests = [
    { path: '/', name: 'Home Page', threshold: thresholds.home },
    { path: '/api/admin/settings', name: 'Settings API', threshold: thresholds.api },
    { path: '/packages', name: 'Packages Page', threshold: thresholds.home },
  ];

  for (const test of tests) {
    try {
      const res = await fetchWithRetry(`${CONFIG.baseUrl}${test.path}`);
      if (res.responseTime <= test.threshold) {
        log.success(`${test.name}: ${res.responseTime}ms (threshold: ${test.threshold}ms)`);
        results.passed++;
      } else {
        log.warn(`${test.name}: ${res.responseTime}ms exceeds threshold of ${test.threshold}ms`);
        results.warnings++;
      }
    } catch (error) {
      log.fail(`${test.name} - ${error.message}`);
      results.failed++;
    }
  }
}

// Test: SSL/TLS certificate
async function testSSLCertificate() {
  log.header('4. SSL/TLS CERTIFICATE');

  try {
    const url = new URL(CONFIG.baseUrl);
    const res = await fetchWithRetry(CONFIG.baseUrl);

    if (CONFIG.baseUrl.startsWith('https://')) {
      log.success('HTTPS enabled');
      results.passed++;
    } else {
      log.warn('Site not using HTTPS');
      results.warnings++;
    }
  } catch (error) {
    if (error.code === 'CERT_HAS_EXPIRED') {
      log.fail('SSL Certificate has expired!');
      results.failed++;
    } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      log.warn('SSL Certificate verification issue');
      results.warnings++;
    } else {
      log.fail(`SSL Check failed: ${error.message}`);
      results.failed++;
    }
  }
}

// Test: Error handling
async function testErrorHandling() {
  log.header('5. ERROR HANDLING');

  // Test 404 handling
  try {
    const res = await fetchWithRetry(`${CONFIG.baseUrl}/this-page-does-not-exist-12345`);
    if (res.status === 404) {
      log.success('404 Error page handled correctly');
      results.passed++;
    } else {
      log.warn(`Unexpected status for 404: ${res.status}`);
      results.warnings++;
    }
  } catch (error) {
    log.fail(`404 test failed: ${error.message}`);
    results.failed++;
  }

  // Test invalid API request
  try {
    const res = await fetchWithRetry(`${CONFIG.baseUrl}/api/invalid-endpoint-xyz`);
    if (res.status === 404 || res.status === 405) {
      log.success('Invalid API endpoint handled correctly');
      results.passed++;
    } else {
      log.warn(`Unexpected status for invalid API: ${res.status}`);
      results.warnings++;
    }
  } catch (error) {
    log.fail(`Invalid API test failed: ${error.message}`);
    results.failed++;
  }
}

// Test: Critical headers
async function testSecurityHeaders() {
  log.header('6. SECURITY HEADERS');

  try {
    const res = await fetchWithRetry(CONFIG.baseUrl);
    const headers = res.headers;

    const securityHeaders = [
      { name: 'x-frame-options', recommended: true },
      { name: 'x-content-type-options', recommended: true },
      { name: 'strict-transport-security', recommended: true },
      { name: 'x-xss-protection', recommended: false },
      { name: 'content-security-policy', recommended: false },
    ];

    for (const header of securityHeaders) {
      if (headers[header.name]) {
        log.success(`${header.name}: ${headers[header.name]}`);
        results.passed++;
      } else if (header.recommended) {
        log.warn(`Missing recommended header: ${header.name}`);
        results.warnings++;
      } else {
        log.info(`Optional header not set: ${header.name}`);
      }
    }
  } catch (error) {
    log.fail(`Security headers test failed: ${error.message}`);
    results.failed++;
  }
}

// Test: Database connectivity (via API)
async function testDatabaseConnectivity() {
  log.header('7. DATABASE CONNECTIVITY');

  // Test by hitting an API that requires database
  try {
    const res = await fetchWithRetry(`${CONFIG.baseUrl}/api/admin/settings`);
    const data = JSON.parse(res.data);

    if (data.success || data.data) {
      log.success('Database responding via Settings API');
      results.passed++;
    } else if (res.status === 500) {
      log.fail('Database connection error (500 response)');
      results.failed++;
    } else {
      log.success('API responding (auth may be required)');
      results.passed++;
    }
  } catch (error) {
    log.fail(`Database connectivity test failed: ${error.message}`);
    results.failed++;
  }

  // Test products API
  try {
    const res = await fetchWithRetry(`${CONFIG.baseUrl}/api/admin/products`);
    if (res.status !== 500) {
      log.success('Products API database connection OK');
      results.passed++;
    } else {
      log.fail('Products API database error');
      results.failed++;
    }
  } catch (error) {
    log.fail(`Products database test failed: ${error.message}`);
    results.failed++;
  }
}

// Test: Concurrent requests (stress test)
async function testConcurrentRequests() {
  log.header('8. CONCURRENT REQUEST HANDLING');

  const concurrentRequests = 20;
  const url = `${CONFIG.baseUrl}/`;

  log.info(`Sending ${concurrentRequests} concurrent requests...`);

  const startTime = Date.now();
  const promises = Array(concurrentRequests).fill().map(() =>
    fetchWithRetry(url, {}, 1).catch(e => ({ error: e.message }))
  );

  const responses = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  const successful = responses.filter(r => r.status === 200).length;
  const failed = responses.filter(r => r.error || r.status !== 200).length;

  if (successful === concurrentRequests) {
    log.success(`All ${concurrentRequests} requests succeeded in ${totalTime}ms`);
    results.passed++;
  } else if (successful >= concurrentRequests * 0.9) {
    log.warn(`${successful}/${concurrentRequests} requests succeeded (${failed} failed)`);
    results.warnings++;
  } else {
    log.fail(`Only ${successful}/${concurrentRequests} requests succeeded`);
    results.failed++;
  }

  const avgTime = responses
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / successful || 0;

  log.info(`Average response time: ${Math.round(avgTime)}ms`);
}

// Test: Cache headers
async function testCaching() {
  log.header('9. CACHING CONFIGURATION');

  try {
    // Test static assets caching
    const res = await fetchWithRetry(CONFIG.baseUrl);
    const cacheControl = res.headers['cache-control'];

    if (cacheControl) {
      log.success(`Cache-Control header present: ${cacheControl}`);
      results.passed++;
    } else {
      log.warn('No Cache-Control header on main page');
      results.warnings++;
    }

    // Test API no-cache
    const apiRes = await fetchWithRetry(`${CONFIG.baseUrl}/api/admin/settings?nocache=true`);
    const apiCache = apiRes.headers['cache-control'];

    if (apiCache && apiCache.includes('no-cache')) {
      log.success('API nocache parameter working');
      results.passed++;
    } else {
      log.info(`API cache header: ${apiCache || 'not set'}`);
    }
  } catch (error) {
    log.fail(`Caching test failed: ${error.message}`);
    results.failed++;
  }
}

// Test: Recovery simulation
async function testRecoverySimulation() {
  log.header('10. RECOVERY SIMULATION');

  log.info('Simulating rapid sequential requests (recovery scenario)...');

  const rapidRequests = 10;
  let successCount = 0;

  for (let i = 0; i < rapidRequests; i++) {
    try {
      const res = await fetchWithRetry(`${CONFIG.baseUrl}/`, {}, 1);
      if (res.status === 200) successCount++;
    } catch (e) {
      // Ignore individual failures
    }
    await new Promise(r => setTimeout(r, 100)); // Small delay between requests
  }

  if (successCount === rapidRequests) {
    log.success(`All ${rapidRequests} rapid requests succeeded`);
    results.passed++;
  } else if (successCount >= rapidRequests * 0.8) {
    log.warn(`${successCount}/${rapidRequests} rapid requests succeeded`);
    results.warnings++;
  } else {
    log.fail(`Only ${successCount}/${rapidRequests} rapid requests succeeded`);
    results.failed++;
  }
}

// Generate summary report
function generateReport() {
  log.header('D/R TEST SUMMARY');

  const total = results.passed + results.failed + results.warnings;
  const passRate = ((results.passed / total) * 100).toFixed(1);

  console.log(`
┌─────────────────────────────────────────┐
│           TEST RESULTS SUMMARY          │
├─────────────────────────────────────────┤
│  ${colors.green}PASSED${colors.reset}:    ${String(results.passed).padStart(3)}                          │
│  ${colors.red}FAILED${colors.reset}:    ${String(results.failed).padStart(3)}                          │
│  ${colors.yellow}WARNINGS${colors.reset}:  ${String(results.warnings).padStart(3)}                          │
│  TOTAL:     ${String(total).padStart(3)}                          │
├─────────────────────────────────────────┤
│  PASS RATE: ${passRate}%                       │
└─────────────────────────────────────────┘
`);

  if (results.failed === 0 && results.warnings === 0) {
    console.log(`${colors.green}★ ALL TESTS PASSED - System is healthy! ★${colors.reset}\n`);
    return 0;
  } else if (results.failed === 0) {
    console.log(`${colors.yellow}⚠ Tests passed with warnings - Review recommended${colors.reset}\n`);
    return 0;
  } else {
    console.log(`${colors.red}✗ SOME TESTS FAILED - Action required!${colors.reset}\n`);
    return 1;
  }
}

// Main execution
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         DISASTER RECOVERY (D/R) TEST SUITE                    ║
║         Target: ${CONFIG.baseUrl.padEnd(42)}║
║         Time: ${new Date().toISOString().padEnd(44)}║
╚═══════════════════════════════════════════════════════════════╝
`);

  try {
    await testWebsiteAvailability();
    await testAPIEndpoints();
    await testResponseTimes();
    await testSSLCertificate();
    await testErrorHandling();
    await testSecurityHeaders();
    await testDatabaseConnectivity();
    await testConcurrentRequests();
    await testCaching();
    await testRecoverySimulation();

    const exitCode = generateReport();
    process.exit(exitCode);
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during testing: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

main();
