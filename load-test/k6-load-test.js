import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time');

// Configuration - Update this URL to your production site
const BASE_URL = __ENV.BASE_URL || 'https://www.cheapstreamtv.com';

// Test configuration for 50k users
export const options = {
  stages: [
    // Ramp up
    { duration: '2m', target: 1000 },    // Ramp to 1k users over 2 min
    { duration: '3m', target: 5000 },    // Ramp to 5k users over 3 min
    { duration: '5m', target: 15000 },   // Ramp to 15k users over 5 min
    { duration: '5m', target: 30000 },   // Ramp to 30k users over 5 min
    { duration: '5m', target: 50000 },   // Ramp to 50k users over 5 min
    // Sustain peak load
    { duration: '10m', target: 50000 },  // Stay at 50k for 10 min
    // Ramp down
    { duration: '5m', target: 10000 },   // Ramp down to 10k
    { duration: '3m', target: 0 },       // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],   // 95% of requests under 3s
    http_req_failed: ['rate<0.05'],      // Less than 5% errors
    errors: ['rate<0.05'],               // Custom error rate under 5%
  },
};

// Simulated user flows
export default function () {
  // Randomly select a user journey
  const journeyType = Math.random();

  if (journeyType < 0.4) {
    browsingUser();           // 40% - Just browsing
  } else if (journeyType < 0.7) {
    potentialCustomer();      // 30% - Looking at packages
  } else if (journeyType < 0.9) {
    returningUser();          // 20% - Checking dashboard/orders
  } else {
    apiHeavyUser();           // 10% - Heavy API usage
  }
}

// User just browsing the site
function browsingUser() {
  group('Browsing User', function () {
    // Home page
    let res = http.get(`${BASE_URL}/`);
    check(res, { 'home page status 200': (r) => r.status === 200 });
    pageLoadTime.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    sleep(randomBetween(2, 5));

    // About page
    res = http.get(`${BASE_URL}/about-us`);
    check(res, { 'about page status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(1, 3));

    // Explore channels
    res = http.get(`${BASE_URL}/explore`);
    check(res, { 'explore page status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(2, 4));

    // Blog
    res = http.get(`${BASE_URL}/blogs`);
    check(res, { 'blog page status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(1, 2));
  });
}

// User interested in buying
function potentialCustomer() {
  group('Potential Customer', function () {
    // Home page
    let res = http.get(`${BASE_URL}/`);
    check(res, { 'home status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(1, 3));

    // Packages/Pricing page
    res = http.get(`${BASE_URL}/packages`);
    check(res, { 'packages status 200': (r) => r.status === 200 });
    pageLoadTime.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    sleep(randomBetween(3, 6));

    // FAQ
    res = http.get(`${BASE_URL}/support/faq`);
    check(res, { 'faq status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(2, 4));

    // Contact page
    res = http.get(`${BASE_URL}/support/contact`);
    check(res, { 'contact status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(1, 2));

    // Reviews
    res = http.get(`${BASE_URL}/reviews`);
    check(res, { 'reviews status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(1, 3));
  });
}

// Returning user checking their account
function returningUser() {
  group('Returning User', function () {
    // Login page
    let res = http.get(`${BASE_URL}/login`);
    check(res, { 'login page status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(1, 2));

    // Knowledge base
    res = http.get(`${BASE_URL}/knowledge-base`);
    check(res, { 'knowledge base status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(2, 4));

    // Privacy policy
    res = http.get(`${BASE_URL}/privacy-policy`);
    check(res, { 'privacy status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(randomBetween(1, 2));
  });
}

// User making API calls
function apiHeavyUser() {
  group('API Heavy User', function () {
    // Settings API
    let res = http.get(`${BASE_URL}/api/admin/settings`);
    check(res, { 'settings API status 200': (r) => r.status === 200 });
    pageLoadTime.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    sleep(randomBetween(0.5, 1));

    // Products API
    res = http.get(`${BASE_URL}/api/admin/products`);
    check(res, { 'products API status 200': (r) => r.status === 200 || r.status === 401 });
    errorRate.add(res.status !== 200 && res.status !== 401);
    sleep(randomBetween(0.5, 1));

    // FAQ API
    res = http.get(`${BASE_URL}/api/faqs`);
    check(res, { 'faqs API': (r) => r.status === 200 || r.status === 404 });
    sleep(randomBetween(0.5, 1));

    // Blogs API
    res = http.get(`${BASE_URL}/api/blogs`);
    check(res, { 'blogs API': (r) => r.status === 200 || r.status === 404 });
    sleep(randomBetween(0.5, 1));
  });
}

// Helper function for random sleep times
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
