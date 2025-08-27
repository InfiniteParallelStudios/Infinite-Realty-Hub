#!/usr/bin/env node

/**
 * Automated Testing Script for Infinite Realty Hub
 * Uses Playwright MCP server for browser automation
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class InfiniteRealtyTestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
    this.browser = null;
    this.page = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    
    // Also save to log file
    const logFile = path.join(__dirname, '../logs/test-automation.log');
    fs.appendFileSync(logFile, logMessage + '\n');
  }

  async initialize() {
    this.log('🚀 Initializing Infinite Realty Hub Test Automation');
    
    // Check if development server is running
    try {
      const response = await fetch(this.baseUrl);
      if (response.ok) {
        this.log('✅ Development server is running');
      } else {
        throw new Error('Server not responding correctly');
      }
    } catch (error) {
      this.log('❌ Development server is not running. Please start with: npm run dev', 'error');
      process.exit(1);
    }
  }

  async runAuthenticationTests() {
    this.log('🔐 Starting Authentication Flow Tests');
    
    const tests = [
      {
        name: 'Load Sign-in Page',
        action: async () => {
          // Navigate to sign-in page
          await this.page.goto(`${this.baseUrl}/auth/signin`);
          await this.page.waitForLoadState('networkidle');
          
          // Check for Google OAuth button
          const googleButton = this.page.locator('text=Sign in with Google');
          await googleButton.waitFor({ timeout: 5000 });
          
          return { success: true, message: 'Sign-in page loaded successfully' };
        }
      },
      {
        name: 'Test Protected Route Redirect',
        action: async () => {
          // Try to access dashboard without authentication
          await this.page.goto(`${this.baseUrl}/dashboard`);
          await this.page.waitForLoadState('networkidle');
          
          // Should be redirected to sign-in
          const currentUrl = this.page.url();
          if (currentUrl.includes('/auth/signin')) {
            return { success: true, message: 'Protected route correctly redirects to sign-in' };
          } else {
            return { success: false, message: 'Protected route did not redirect properly' };
          }
        }
      }
    ];

    return await this.runTestSuite('Authentication', tests);
  }

  async runCRMTests() {
    this.log('📊 Starting CRM Functionality Tests');
    
    const tests = [
      {
        name: 'Load Contacts Page',
        action: async () => {
          await this.page.goto(`${this.baseUrl}/contacts`);
          await this.page.waitForLoadState('networkidle');
          
          // Check for contacts page elements
          const pageTitle = this.page.locator('h1:has-text("Contacts")');
          await pageTitle.waitFor({ timeout: 5000 });
          
          const addButton = this.page.locator('text=Add Contact');
          await addButton.waitFor({ timeout: 3000 });
          
          return { success: true, message: 'Contacts page loaded with all elements' };
        }
      },
      {
        name: 'Test Add Contact Modal',
        action: async () => {
          // Click add contact button
          await this.page.click('text=Add Contact');
          
          // Wait for modal to appear
          const modal = this.page.locator('text=Add New Contact');
          await modal.waitFor({ timeout: 3000 });
          
          // Check for form fields
          const firstNameField = this.page.locator('input[name="first_name"]');
          const lastNameField = this.page.locator('input[name="last_name"]');
          
          await firstNameField.waitFor({ timeout: 2000 });
          await lastNameField.waitFor({ timeout: 2000 });
          
          return { success: true, message: 'Add contact modal opens with form fields' };
        }
      },
      {
        name: 'Test Contact Form Validation',
        action: async () => {
          // Try to submit empty form
          const submitButton = this.page.locator('text=Create Contact');
          await submitButton.click();
          
          // Form should not submit without required fields
          // Check if modal is still open (form validation working)
          const modal = this.page.locator('text=Add New Contact');
          const isVisible = await modal.isVisible();
          
          if (isVisible) {
            return { success: true, message: 'Form validation prevents empty submission' };
          } else {
            return { success: false, message: 'Form validation not working properly' };
          }
        }
      }
    ];

    return await this.runTestSuite('CRM Functionality', tests);
  }

  async runSettingsTests() {
    this.log('⚙️ Starting Settings Navigation Tests');
    
    const tests = [
      {
        name: 'Load Main Settings Page',
        action: async () => {
          await this.page.goto(`${this.baseUrl}/settings`);
          await this.page.waitForLoadState('networkidle');
          
          const pageTitle = this.page.locator('h1:has-text("Settings")');
          await pageTitle.waitFor({ timeout: 5000 });
          
          return { success: true, message: 'Main settings page loaded' };
        }
      },
      {
        name: 'Test Account Settings Navigation',
        action: async () => {
          // Click on Account Information card
          await this.page.click('text=Account Information');
          await this.page.waitForLoadState('networkidle');
          
          // Check if we're on account settings page
          const accountTitle = this.page.locator('h1:has-text("Account Information")');
          await accountTitle.waitFor({ timeout: 3000 });
          
          return { success: true, message: 'Account settings page accessible' };
        }
      },
      {
        name: 'Test Settings Back Navigation',
        action: async () => {
          // Click back button
          const backButton = this.page.locator('button[aria-label="Back to settings"]').first();
          await backButton.click();
          await this.page.waitForLoadState('networkidle');
          
          // Should be back on main settings
          const settingsTitle = this.page.locator('h1:has-text("Settings")');
          await settingsTitle.waitFor({ timeout: 3000 });
          
          return { success: true, message: 'Back navigation works correctly' };
        }
      }
    ];

    return await this.runTestSuite('Settings Navigation', tests);
  }

  async runResponsivenessTests() {
    this.log('📱 Starting UI Responsiveness Tests');
    
    const tests = [
      {
        name: 'Test Mobile Layout',
        action: async () => {
          // Set mobile viewport
          await this.page.setViewportSize({ width: 375, height: 667 });
          await this.page.goto(`${this.baseUrl}/dashboard`);
          await this.page.waitForLoadState('networkidle');
          
          // Check if mobile navigation is visible
          const bottomNav = this.page.locator('nav[class*="bottom"]');
          await bottomNav.waitFor({ timeout: 3000 });
          
          const isVisible = await bottomNav.isVisible();
          return { 
            success: isVisible, 
            message: isVisible ? 'Mobile layout renders correctly' : 'Mobile navigation not visible' 
          };
        }
      },
      {
        name: 'Test Desktop Layout',
        action: async () => {
          // Set desktop viewport
          await this.page.setViewportSize({ width: 1920, height: 1080 });
          await this.page.reload();
          await this.page.waitForLoadState('networkidle');
          
          // Check for desktop-specific elements
          const dashboard = this.page.locator('h1:has-text("Dashboard")');
          await dashboard.waitFor({ timeout: 3000 });
          
          return { success: true, message: 'Desktop layout renders correctly' };
        }
      },
      {
        name: 'Test Theme Toggle',
        action: async () => {
          // Find and click theme toggle button
          const themeToggle = this.page.locator('button[title*="theme"], button:has-text("Switch to")').first();
          
          if (await themeToggle.isVisible()) {
            await themeToggle.click();
            await this.page.waitForTimeout(1000); // Wait for theme transition
            
            return { success: true, message: 'Theme toggle works' };
          } else {
            return { success: false, message: 'Theme toggle button not found' };
          }
        }
      }
    ];

    return await this.runTestSuite('UI Responsiveness', tests);
  }

  async runTestSuite(suiteName, tests) {
    this.log(`▶️ Running ${suiteName} test suite`);
    
    const suiteResults = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const suiteStartTime = Date.now();

    for (const test of tests) {
      this.log(`  🧪 Running: ${test.name}`);
      const testStartTime = Date.now();
      
      try {
        const result = await test.action();
        const duration = Date.now() - testStartTime;
        
        if (result.success) {
          this.log(`  ✅ ${test.name}: ${result.message}`, 'success');
          suiteResults.passed++;
        } else {
          this.log(`  ❌ ${test.name}: ${result.message}`, 'error');
          suiteResults.failed++;
        }
        
        suiteResults.tests.push({
          name: test.name,
          success: result.success,
          message: result.message,
          duration
        });
        
      } catch (error) {
        const duration = Date.now() - testStartTime;
        this.log(`  ❌ ${test.name}: ${error.message}`, 'error');
        suiteResults.failed++;
        
        suiteResults.tests.push({
          name: test.name,
          success: false,
          message: error.message,
          duration
        });
      }
    }
    
    suiteResults.duration = Date.now() - suiteStartTime;
    this.testResults.push(suiteResults);
    
    this.log(`📋 ${suiteName} Results: ${suiteResults.passed} passed, ${suiteResults.failed} failed`);
    return suiteResults;
  }

  async generateReport() {
    this.log('📊 Generating test report');
    
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.testResults.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.testResults.reduce((sum, suite) => sum + suite.duration, 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: ((totalPassed / totalTests) * 100).toFixed(2),
        totalDuration
      },
      suites: this.testResults
    };
    
    // Save report to file
    const reportFile = path.join(__dirname, '../logs/test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport(report);
    const htmlFile = path.join(__dirname, '../logs/test-report.html');
    fs.writeFileSync(htmlFile, htmlReport);
    
    this.log(`📄 Test report saved to: ${reportFile}`);
    this.log(`🌐 HTML report saved to: ${htmlFile}`);
    
    return report;
  }

  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinite Realty Hub - Test Report</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #0f0f23; color: #cccccc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #00d4ff; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(0,212,255,0.3); border-radius: 12px; padding: 20px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #00d4ff; }
        .stat-label { color: #888; }
        .suite { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 20px; padding: 20px; }
        .suite-header { display: flex; justify-content: between; align-items: center; margin-bottom: 15px; }
        .suite-title { color: #00d4ff; font-size: 1.2rem; font-weight: bold; }
        .test { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; border-radius: 6px; background: rgba(255,255,255,0.02); }
        .test-name { flex: 1; }
        .test-status { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
        .passed { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .failed { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .duration { color: #888; font-size: 0.8rem; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Infinite Realty Hub</h1>
            <h2>Automated Test Report</h2>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${report.summary.totalTests}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${report.summary.totalPassed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${report.summary.totalFailed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${report.summary.successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>
        
        ${report.suites.map(suite => `
            <div class="suite">
                <div class="suite-header">
                    <div class="suite-title">${suite.name}</div>
                    <div>${suite.passed} passed, ${suite.failed} failed (${suite.duration}ms)</div>
                </div>
                ${suite.tests.map(test => `
                    <div class="test">
                        <div class="test-name">${test.name}</div>
                        <div>
                            <span class="test-status ${test.success ? 'passed' : 'failed'}">
                                ${test.success ? 'PASSED' : 'FAILED'}
                            </span>
                            <span class="duration">${test.duration}ms</span>
                        </div>
                    </div>
                    ${!test.success ? `<div style="color: #ef4444; font-size: 0.8rem; margin-left: 20px;">${test.message}</div>` : ''}
                `).join('')}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  async run() {
    try {
      await this.initialize();
      
      // Note: In a real implementation, we would use the Playwright MCP server
      // For now, this demonstrates the testing framework structure
      this.log('🎭 Browser automation would start here via Playwright MCP');
      
      // Simulate test runs
      await this.runAuthenticationTests();
      await this.runCRMTests();
      await this.runSettingsTests();
      await this.runResponsivenessTests();
      
      const report = await this.generateReport();
      
      this.log('🎯 Test automation completed');
      this.log(`📊 Final Results: ${report.summary.totalPassed}/${report.summary.totalTests} tests passed (${report.summary.successRate}%)`);
      
      return report;
      
    } catch (error) {
      this.log(`💥 Test automation failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const runner = new InfiniteRealtyTestRunner();
  runner.run().catch(console.error);
}

module.exports = InfiniteRealtyTestRunner;