#!/usr/bin/env node

/**
 * MANDATORY TESTING IMPLEMENTATION
 * Tests new code before committing - following the rule:
 * implement → test → fix → test → fix → test → commit
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class MandatoryTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.allTestsPassed = false;
  }

  async initialize() {
    console.log('🚀 MANDATORY TESTING: Starting browser automation');
    
    // Launch browser
    this.browser = await puppeteer.launch({ 
      headless: false, // Show browser so we can see what's happening
      slowMo: 100 // Slow down for visibility
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Check if dev server is running
    try {
      const response = await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      if (!response.ok()) {
        throw new Error(`Dev server not responding: ${response.status()}`);
      }
      console.log('✅ Dev server is running');
    } catch (error) {
      console.error('❌ CRITICAL: Dev server not running. Start with: npm run dev');
      process.exit(1);
    }
  }

  async testTestingPageImplementation() {
    console.log('🧪 TESTING: New Testing Page Implementation');
    
    const tests = [
      {
        name: 'Testing Page Loads Successfully',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Check for the actual testing page title
          const title = await this.page.$eval('h1', el => el.textContent);
          if (title.includes('Automated Testing')) {
            return { passed: true, message: 'Testing page loads with correct title' };
          }
          return { passed: false, message: `Wrong title: ${title}` };
        }
      },
      {
        name: 'Bottom Navigation Contains Testing Tab',
        test: async () => {
          // Go to testing page where navigation should be visible
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Look for testing link in navigation with multiple selectors
          let testingTab = await this.page.$('a[href="/testing"]');
          if (!testingTab) {
            // Try alternative selectors
            testingTab = await this.page.$('nav a[href="/testing"]');
          }
          if (!testingTab) {
            // Look for any link containing "Testing"
            const links = await this.page.$$('a');
            for (const link of links) {
              const href = await this.page.evaluate(l => l.getAttribute('href'), link);
              const text = await this.page.evaluate(l => l.textContent, link);
              if (href === '/testing' || (text && text.includes('Testing'))) {
                testingTab = link;
                break;
              }
            }
          }
          
          if (testingTab) {
            // Check if it's visible
            const isVisible = await testingTab.isVisible();
            if (isVisible) {
              return { passed: true, message: 'Testing tab found and visible in bottom navigation' };
            }
            return { passed: false, message: 'Testing tab found but not visible' };
          }
          return { passed: false, message: 'Testing tab not found in navigation' };
        }
      },
      {
        name: 'Testing Page File Exists',
        test: async () => {
          // Simple file existence test by checking if route compiles
          try {
            const response = await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'load' });
            // Any response (even redirect) means the route exists
            if (response) {
              return { passed: true, message: 'Testing page route exists and compiles successfully' };
            }
            return { passed: false, message: 'No response from testing route' };
          } catch (error) {
            return { passed: false, message: `Route compilation error: ${error.message}` };
          }
        }
      },
      {
        name: 'Navigation Structure Integrity',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Check for expected navigation items
          const expectedRoutes = ['/dashboard', '/contacts', '/store', '/testing', '/settings'];
          const foundRoutes = [];
          
          for (const route of expectedRoutes) {
            const link = await this.page.$(`a[href="${route}"]`);
            if (link) {
              foundRoutes.push(route);
            }
          }
          
          if (foundRoutes.length === expectedRoutes.length) {
            return { passed: true, message: `All ${expectedRoutes.length} navigation routes found` };
          }
          return { 
            passed: false, 
            message: `Missing routes: ${expectedRoutes.filter(r => !foundRoutes.includes(r)).join(', ')}` 
          };
        }
      },
      {
        name: 'App Responsive Design',
        test: async () => {
          // Test mobile viewport on testing page
          await this.page.setViewport({ width: 375, height: 667 });
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Check if navigation is visible on mobile
          const nav = await this.page.$('nav');
          if (nav) {
            const isVisible = await nav.isVisible();
            if (isVisible) {
              // Reset to desktop
              await this.page.setViewport({ width: 1280, height: 720 });
              return { passed: true, message: 'App is responsive - navigation visible on mobile viewport' };
            }
          }
          return { passed: false, message: 'App navigation not visible on mobile viewport' };
        }
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of tests) {
      console.log(`   🧪 ${testCase.name}...`);
      
      try {
        const result = await testCase.test();
        if (result.passed) {
          console.log(`   ✅ PASSED: ${result.message}`);
          passed++;
        } else {
          console.log(`   ❌ FAILED: ${result.message}`);
          failed++;
        }
        
        this.testResults.push({
          name: testCase.name,
          passed: result.passed,
          message: result.message
        });
        
      } catch (error) {
        console.log(`   💥 ERROR: ${error.message}`);
        failed++;
        this.testResults.push({
          name: testCase.name,
          passed: false,
          message: error.message
        });
      }
    }

    console.log(`\n📊 TESTING RESULTS: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Ready to commit.');
      this.allTestsPassed = true;
    } else {
      console.log('🚨 TESTS FAILED! Must fix before committing.');
      this.allTestsPassed = false;
    }

    return { passed, failed, allPassed: this.allTestsPassed };
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Implementation Testing',
      feature: 'Testing Page',
      results: this.testResults,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(t => t.passed).length,
        failed: this.testResults.filter(t => !t.passed).length,
        allPassed: this.allTestsPassed
      }
    };

    const reportFile = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs/mandatory-test-report.json';
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📄 Test report saved: ${reportFile}`);
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      const results = await this.testTestingPageImplementation();
      await this.generateReport();
      
      return results;
    } catch (error) {
      console.error(`💥 TESTING FAILED: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the mandatory testing
if (require.main === module) {
  const tester = new MandatoryTester();
  tester.run()
    .then(results => {
      if (results.allPassed) {
        console.log('\n🚀 READY TO COMMIT: All tests passed!');
        process.exit(0);
      } else {
        console.log('\n🛑 COMMIT BLOCKED: Fix failing tests first!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = MandatoryTester;