const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = './visual-test-screenshots';
const VIEWPORT = { width: 1920, height: 1080 };
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 14 Pro

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test pages configuration
const TEST_PAGES = [
  { name: 'home', url: '/', description: 'Home Page' },
  { name: 'auth-signin', url: '/auth/signin', description: 'Sign In Page' },
  { name: 'dashboard', url: '/dashboard', description: 'Dashboard' },
  { name: 'contacts', url: '/contacts', description: 'Contacts & Leads' },
  { name: 'pipeline', url: '/pipeline', description: 'Sales Pipeline' },
  { name: 'qr-generator', url: '/qr-generator', description: 'QR Code Generator' },
  { name: 'qr-leads', url: '/qr-leads', description: 'QR Lead Capture' },
  { name: 'newsletter', url: '/newsletter', description: 'Newsletter Management' },
  { name: 'team', url: '/team', description: 'Team Management' },
  { name: 'market-test', url: '/market-test', description: 'Market Data Testing' },
  { name: 'settings', url: '/settings', description: 'Settings' }
];

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  totalPages: TEST_PAGES.length,
  passed: [],
  warnings: [],
  errors: [],
  consoleErrors: [],
  networkErrors: []
};

async function runVisualTests() {
  console.log(`${colors.cyan}${colors.bright}🧪 INFINITE REALTY HUB - COMPREHENSIVE VISUAL TESTING${colors.reset}\n`);
  console.log(`${colors.dim}Starting tests at ${new Date().toLocaleTimeString()}${colors.reset}\n`);

  const browser = await puppeteer.launch({
    headless: false, // Show browser for visual inspection
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Set up console error monitoring
    page.on('console', message => {
      if (message.type() === 'error') {
        const text = message.text();
        // Filter out expected errors and warnings
        if (!text.includes('404') && 
            !text.includes('Not Found') && 
            !text.includes('NEXT_REDIRECT') &&
            !text.includes('hydration')) {
          testResults.consoleErrors.push({
            url: page.url(),
            message: text,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Set up network error monitoring
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      
      // Log failed network requests (excluding expected 404s)
      if (status >= 400 && 
          !url.includes('_next/static') && 
          !url.includes('favicon') &&
          !url.includes('chrome-extension')) {
        testResults.networkErrors.push({
          pageUrl: page.url(),
          resourceUrl: url,
          status: status,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Test each page
    for (let i = 0; i < TEST_PAGES.length; i++) {
      const testPage = TEST_PAGES[i];
      const pageUrl = `${BASE_URL}${testPage.url}`;
      
      console.log(`${colors.blue}[${i + 1}/${TEST_PAGES.length}] Testing: ${colors.bright}${testPage.description}${colors.reset}`);
      console.log(`${colors.dim}   URL: ${pageUrl}${colors.reset}`);

      try {
        // Navigate to page
        await page.goto(pageUrl, { 
          waitUntil: ['networkidle0', 'domcontentloaded'],
          timeout: 30000 
        });

        // Wait for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check page title
        const pageTitle = await page.title();
        console.log(`${colors.dim}   Title: ${pageTitle}${colors.reset}`);

        // Desktop Screenshot
        const desktopPath = path.join(SCREENSHOT_DIR, `${testPage.name}-desktop.png`);
        await page.screenshot({
          path: desktopPath,
          fullPage: true
        });
        console.log(`${colors.green}   ✓ Desktop screenshot saved${colors.reset}`);

        // Mobile Screenshot
        await page.setViewport(MOBILE_VIEWPORT);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for responsive adjustments
        
        const mobilePath = path.join(SCREENSHOT_DIR, `${testPage.name}-mobile.png`);
        await page.screenshot({
          path: mobilePath,
          fullPage: true
        });
        console.log(`${colors.green}   ✓ Mobile screenshot saved${colors.reset}`);

        // Reset to desktop viewport
        await page.setViewport(VIEWPORT);

        // Visual checks
        const visualChecks = await page.evaluate(() => {
          const checks = {
            hasContent: document.body.innerText.trim().length > 0,
            hasImages: document.querySelectorAll('img').length,
            hasButtons: document.querySelectorAll('button').length,
            hasLinks: document.querySelectorAll('a').length,
            hasForms: document.querySelectorAll('form').length,
            visibleErrors: [],
            emptyContainers: []
          };

          // Check for visible error messages
          const errorPatterns = ['error', 'Error', 'ERROR', 'failed', 'Failed', 'FAILED', 'exception', 'Exception'];
          const allText = document.body.innerText;
          
          errorPatterns.forEach(pattern => {
            if (allText.includes(pattern)) {
              // Find elements containing error text
              const elements = Array.from(document.querySelectorAll('*')).filter(el => 
                el.innerText && el.innerText.includes(pattern) && el.children.length === 0
              );
              elements.forEach(el => {
                const text = el.innerText.trim();
                if (text.length < 200) { // Avoid large text blocks
                  checks.visibleErrors.push(text);
                }
              });
            }
          });

          // Check for empty containers that should have content
          const containers = document.querySelectorAll('main, section, [role="main"]');
          containers.forEach(container => {
            if (container.innerText.trim().length === 0) {
              checks.emptyContainers.push(container.tagName);
            }
          });

          return checks;
        });

        // Log visual check results
        if (visualChecks.hasContent) {
          console.log(`${colors.green}   ✓ Page has content${colors.reset}`);
        } else {
          console.log(`${colors.red}   ✗ Page appears empty${colors.reset}`);
          testResults.warnings.push({
            page: testPage.name,
            issue: 'Page appears to have no content'
          });
        }

        console.log(`${colors.dim}   Components: ${visualChecks.hasButtons} buttons, ${visualChecks.hasLinks} links, ${visualChecks.hasForms} forms${colors.reset}`);

        // Check for visible errors
        if (visualChecks.visibleErrors.length > 0) {
          const uniqueErrors = [...new Set(visualChecks.visibleErrors)];
          uniqueErrors.forEach(error => {
            // Filter out false positives
            if (!error.includes('404 status codes') && 
                !error.includes('Error boundaries') &&
                !error.includes('error handling')) {
              console.log(`${colors.yellow}   ⚠ Visible text: "${error.substring(0, 100)}..."${colors.reset}`);
              testResults.warnings.push({
                page: testPage.name,
                issue: `Visible error text: ${error}`
              });
            }
          });
        }

        // Mark test as passed
        testResults.passed.push(testPage.name);
        console.log(`${colors.green}   ✅ Page test completed${colors.reset}\n`);

      } catch (error) {
        console.log(`${colors.red}   ❌ Error testing page: ${error.message}${colors.reset}\n`);
        testResults.errors.push({
          page: testPage.name,
          error: error.message
        });
        
        // Take error screenshot
        try {
          const errorPath = path.join(SCREENSHOT_DIR, `${testPage.name}-error.png`);
          await page.screenshot({
            path: errorPath,
            fullPage: true
          });
        } catch (screenshotError) {
          console.log(`${colors.red}   Could not capture error screenshot${colors.reset}`);
        }
      }
    }

  } finally {
    await browser.close();
  }

  // Generate test report
  generateTestReport();
}

function generateTestReport() {
  console.log(`\n${colors.cyan}${colors.bright}📊 VISUAL TEST REPORT${colors.reset}\n`);
  
  const passRate = (testResults.passed.length / testResults.totalPages * 100).toFixed(1);
  
  console.log(`${colors.bright}Overall Results:${colors.reset}`);
  console.log(`  Total Pages Tested: ${testResults.totalPages}`);
  console.log(`  ${colors.green}Passed: ${testResults.passed.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${testResults.warnings.length}${colors.reset}`);
  console.log(`  ${colors.red}Errors: ${testResults.errors.length}${colors.reset}`);
  console.log(`  ${colors.bright}Pass Rate: ${passRate}%${colors.reset}\n`);

  if (testResults.consoleErrors.length > 0) {
    console.log(`${colors.yellow}Console Errors Found:${colors.reset}`);
    testResults.consoleErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.url}`);
      console.log(`     ${colors.dim}${err.message}${colors.reset}`);
    });
    console.log('');
  }

  if (testResults.networkErrors.length > 0) {
    console.log(`${colors.yellow}Network Errors Found:${colors.reset}`);
    const uniqueNetworkErrors = {};
    testResults.networkErrors.forEach(err => {
      const key = `${err.status}-${err.resourceUrl}`;
      if (!uniqueNetworkErrors[key]) {
        uniqueNetworkErrors[key] = err;
      }
    });
    
    Object.values(uniqueNetworkErrors).forEach((err, i) => {
      console.log(`  ${i + 1}. Status ${err.status}: ${err.resourceUrl}`);
    });
    console.log('');
  }

  if (testResults.warnings.length > 0) {
    console.log(`${colors.yellow}Visual Warnings:${colors.reset}`);
    testResults.warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. [${warning.page}] ${warning.issue}`);
    });
    console.log('');
  }

  if (testResults.errors.length > 0) {
    console.log(`${colors.red}Test Errors:${colors.reset}`);
    testResults.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. [${error.page}] ${error.error}`);
    });
    console.log('');
  }

  // Save JSON report
  const reportPath = path.join(SCREENSHOT_DIR, 'visual-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`${colors.green}✅ Full report saved to: ${reportPath}${colors.reset}`);
  
  // Final verdict
  console.log(`\n${colors.bright}📍 FINAL VERDICT:${colors.reset}`);
  if (passRate === '100.0' && testResults.warnings.length === 0) {
    console.log(`${colors.green}${colors.bright}✅ ALL TESTS PASSED - Application is visually perfect!${colors.reset}`);
  } else if (passRate >= 80 && testResults.errors.length === 0) {
    console.log(`${colors.green}✅ Application is working well with minor warnings${colors.reset}`);
  } else if (passRate >= 60) {
    console.log(`${colors.yellow}⚠️ Application has some issues that should be addressed${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Application has significant issues requiring attention${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Screenshots saved in: ${SCREENSHOT_DIR}${colors.reset}`);
  console.log(`${colors.dim}Test completed at ${new Date().toLocaleTimeString()}${colors.reset}\n`);
}

// Run tests
runVisualTests().catch(error => {
  console.error(`${colors.red}Fatal error during testing:${colors.reset}`, error);
  process.exit(1);
});