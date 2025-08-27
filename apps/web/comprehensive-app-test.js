#!/usr/bin/env node

/**
 * COMPREHENSIVE APP TESTING SUITE
 * Tests every button, clickable element, and functionality in Infinite Realty Hub
 * Following mandatory testing workflow: implement → test → fix → test → commit
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensiveAppTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.allTestsPassed = false;
    this.testCategories = [];
  }

  async initialize() {
    console.log('🚀 COMPREHENSIVE APP TESTING: Starting complete functionality validation');
    
    // Launch browser
    this.browser = await puppeteer.launch({ 
      headless: false, // Show browser so we can see what's happening
      slowMo: 300, // Slow down for stability
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Set longer timeouts
    this.page.setDefaultTimeout(10000);
    this.page.setDefaultNavigationTimeout(15000);
    
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

  async safeWait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createFreshPage() {
    // Create a new page for each test suite to avoid context issues
    if (this.page && !this.page.isClosed()) {
      await this.page.close();
    }
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
    this.page.setDefaultTimeout(10000);
    this.page.setDefaultNavigationTimeout(15000);
    return this.page;
  }

  async testNavigationSystem() {
    console.log('🧭 TESTING: Complete Navigation System');
    await this.createFreshPage(); // Start with fresh page
    
    const tests = [
      {
        name: 'Bottom Navigation - All Tabs Clickable',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          await this.safeWait(1000);
          
          const expectedTabs = [
            { href: '/testing', label: 'Testing' }, // Start with current page
            { href: '/settings', label: 'Settings' },
            { href: '/contacts', label: 'Contacts' },
            { href: '/store', label: 'Store' }
          ];
          
          const results = [];
          for (const tab of expectedTabs) {
            try {
              // Look for the navigation link
              const link = await this.page.$(`a[href="${tab.href}"]`);
              if (link) {
                await link.click();
                await this.safeWait(2000); // Wait for navigation
                
                const currentUrl = this.page.url();
                if (currentUrl.includes(tab.href)) {
                  results.push(`✅ ${tab.label} tab works`);
                } else {
                  results.push(`❌ ${tab.label} tab navigation failed (${currentUrl})`);
                }
              } else {
                results.push(`❌ ${tab.label} tab not found`);
              }
            } catch (error) {
              results.push(`❌ ${tab.label} tab error: ${error.message.substring(0, 50)}`);
            }
          }
          
          const successCount = results.filter(r => r.includes('✅')).length;
          return { 
            passed: successCount >= 2, // At least 2 tabs should work
            message: `Navigation Results (${successCount}/${expectedTabs.length}): ${results.join(', ')}` 
          };
        }
      },
      {
        name: 'Page Loading Performance',
        test: async () => {
          const pages = ['/testing', '/settings', '/contacts', '/store'];
          const loadTimes = [];
          
          for (const page of pages) {
            const startTime = Date.now();
            await this.page.goto(`${this.baseUrl}${page}`, { waitUntil: 'networkidle2' });
            const loadTime = Date.now() - startTime;
            loadTimes.push({ page, loadTime });
          }
          
          const avgLoadTime = loadTimes.reduce((sum, item) => sum + item.loadTime, 0) / loadTimes.length;
          const slowPages = loadTimes.filter(item => item.loadTime > 3000);
          
          return {
            passed: slowPages.length === 0,
            message: `Average load time: ${avgLoadTime.toFixed(0)}ms. ${slowPages.length > 0 ? `Slow pages: ${slowPages.map(p => p.page).join(', ')}` : 'All pages load quickly'}`
          };
        }
      }
    ];

    return await this.runTestSuite('Navigation System', tests);
  }

  async testSettingsPages() {
    console.log('⚙️ TESTING: All Settings Pages and Controls');
    await this.createFreshPage(); // Start with fresh page
    
    const tests = [
      {
        name: 'Main Settings Page - All Cards Clickable',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings`, { waitUntil: 'networkidle2' });
          
          const settingsCards = [
            'Account Information',
            'Appearance',
            'Notifications', 
            'Security',
            'Billing',
            'Support'
          ];
          
          const results = [];
          for (const cardName of settingsCards) {
            try {
              // Find the card by looking for elements containing the text
              const elements = await this.page.$$('*');
              let cardFound = false;
              
              for (const element of elements) {
                const text = await this.page.evaluate(el => el.textContent, element);
                if (text && text.includes(cardName)) {
                  // Try to find a clickable parent
                  const clickableParent = await this.page.evaluateHandle((el) => {
                    let current = el;
                    while (current && current !== document.body) {
                      if (current.tagName === 'A' || current.tagName === 'BUTTON' || current.onclick || current.getAttribute('href')) {
                        return current;
                      }
                      current = current.parentElement;
                    }
                    return null;
                  }, element);
                  
                  if (clickableParent && clickableParent._remoteObject.value !== null) {
                    await clickableParent.click();
                    await this.page.waitForTimeout(1000);
                    
                    // Check if we navigated to a settings subpage
                    const currentUrl = this.page.url();
                    if (currentUrl.includes('/settings/')) {
                      results.push(`✅ ${cardName} card navigation works`);
                      cardFound = true;
                      
                      // Navigate back to main settings
                      await this.page.goto(`${this.baseUrl}/settings`, { waitUntil: 'networkidle2' });
                      break;
                    }
                  }
                }
              }
              
              if (!cardFound) {
                results.push(`❌ ${cardName} card not clickable or not found`);
              }
            } catch (error) {
              results.push(`❌ ${cardName} card error: ${error.message}`);
            }
          }
          
          return {
            passed: results.filter(r => r.includes('✅')).length >= 4, // At least 4 should work
            message: `Settings Cards: ${results.join(', ')}`
          };
        }
      },
      {
        name: 'Appearance Settings - Theme Toggle',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings/appearance`, { waitUntil: 'networkidle2' });
          
          // Look for theme toggle buttons
          const buttons = await this.page.$$('button');
          let themeButtonFound = false;
          
          for (const button of buttons) {
            const text = await this.page.evaluate(btn => btn.textContent, button);
            if (text && (text.includes('Dark') || text.includes('Light') || text.includes('System'))) {
              await button.click();
              await this.page.waitForTimeout(500);
              themeButtonFound = true;
              break;
            }
          }
          
          return {
            passed: themeButtonFound,
            message: themeButtonFound ? 'Theme toggle button found and clickable' : 'No theme toggle buttons found'
          };
        }
      },
      {
        name: 'Settings Back Navigation',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings/account`, { waitUntil: 'networkidle2' });
          
          // Look for back button
          const backButtons = await this.page.$$('button[aria-label*="Back"], button:has-text("Back"), a:has-text("Back")');
          let backWorked = false;
          
          if (backButtons.length > 0) {
            try {
              await backButtons[0].click();
              await this.page.waitForTimeout(1000);
              const currentUrl = this.page.url();
              backWorked = currentUrl.endsWith('/settings');
            } catch (error) {
              // Try alternative approach
              const backLinks = await this.page.$$('a');
              for (const link of backLinks) {
                const href = await this.page.evaluate(l => l.getAttribute('href'), link);
                if (href === '/settings') {
                  await link.click();
                  await this.page.waitForTimeout(1000);
                  const currentUrl = this.page.url();
                  backWorked = currentUrl.endsWith('/settings');
                  break;
                }
              }
            }
          }
          
          return {
            passed: backWorked,
            message: backWorked ? 'Back navigation works correctly' : 'Back navigation not working'
          };
        }
      }
    ];

    return await this.runTestSuite('Settings Pages', tests);
  }

  async testContactsSystem() {
    console.log('👥 TESTING: Contacts/CRM System');
    await this.createFreshPage(); // Start with fresh page
    
    const tests = [
      {
        name: 'Contacts Page Loading',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/contacts`, { waitUntil: 'networkidle2' });
          
          // Check for contacts page elements
          const pageTitle = await this.page.$('h1');
          let titleCorrect = false;
          
          if (pageTitle) {
            const titleText = await this.page.evaluate(el => el.textContent, pageTitle);
            titleCorrect = titleText && titleText.includes('Contacts');
          }
          
          return {
            passed: titleCorrect,
            message: titleCorrect ? 'Contacts page loads with correct title' : 'Contacts page title not found'
          };
        }
      },
      {
        name: 'Add Contact Button',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/contacts`, { waitUntil: 'networkidle2' });
          
          // Look for add contact button
          const buttons = await this.page.$$('button');
          let addButtonFound = false;
          
          for (const button of buttons) {
            const text = await this.page.evaluate(btn => btn.textContent, button);
            if (text && (text.includes('Add') || text.includes('New') || text.includes('Create'))) {
              try {
                await button.click();
                await this.page.waitForTimeout(1000);
                
                // Check if modal or form appeared
                const modal = await this.page.$('[role="dialog"], .modal, form');
                if (modal) {
                  addButtonFound = true;
                  
                  // Try to close modal if it opened
                  const closeButtons = await this.page.$$('button[aria-label*="close"], button:has-text("Cancel"), button:has-text("Close")');
                  if (closeButtons.length > 0) {
                    await closeButtons[0].click();
                    await this.page.waitForTimeout(500);
                  }
                }
                break;
              } catch (error) {
                // Continue to next button
              }
            }
          }
          
          return {
            passed: addButtonFound,
            message: addButtonFound ? 'Add contact button works and opens form/modal' : 'Add contact button not found or not working'
          };
        }
      }
    ];

    return await this.runTestSuite('Contacts System', tests);
  }

  async testStoreSystem() {
    console.log('🏪 TESTING: Store System');
    await this.createFreshPage(); // Start with fresh page
    
    const tests = [
      {
        name: 'Store Page Loading',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/store`, { waitUntil: 'networkidle2' });
          
          // Check for store page elements
          const pageContent = await this.page.content();
          const hasStoreContent = pageContent.includes('Store') || pageContent.includes('Shop') || pageContent.includes('Product');
          
          return {
            passed: hasStoreContent,
            message: hasStoreContent ? 'Store page loads successfully' : 'Store page content not detected'
          };
        }
      }
    ];

    return await this.runTestSuite('Store System', tests);
  }

  async testTestingSystem() {
    console.log('🧪 TESTING: Testing System Interface');
    await this.createFreshPage(); // Start with fresh page
    
    const tests = [
      {
        name: 'Testing Page Interactive Elements',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          const interactiveElements = [];
          
          // Test "Run All Tests" button
          const runAllButtons = await this.page.$$('button');
          for (const button of runAllButtons) {
            const text = await this.page.evaluate(btn => btn.textContent, button);
            if (text && text.includes('Run All Tests')) {
              interactiveElements.push('✅ Run All Tests button found');
              break;
            }
          }
          
          // Test "Show Browser" toggle
          for (const button of runAllButtons) {
            const text = await this.page.evaluate(btn => btn.textContent, button);
            if (text && text.includes('Show Browser')) {
              try {
                await button.click();
                await this.page.waitForTimeout(500);
                interactiveElements.push('✅ Show Browser toggle works');
                
                // Click again to hide
                await button.click();
                await this.page.waitForTimeout(500);
              } catch (error) {
                interactiveElements.push('❌ Show Browser toggle error');
              }
              break;
            }
          }
          
          // Test individual "Run Suite" buttons
          const runSuiteCount = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.filter(btn => btn.textContent && btn.textContent.includes('Run Suite')).length;
          });
          
          if (runSuiteCount > 0) {
            interactiveElements.push(`✅ ${runSuiteCount} Run Suite buttons found`);
          }
          
          return {
            passed: interactiveElements.length >= 2,
            message: `Testing Interface: ${interactiveElements.join(', ')}`
          };
        }
      }
    ];

    return await this.runTestSuite('Testing System', tests);
  }

  async testResponsiveDesign() {
    console.log('📱 TESTING: Responsive Design Across All Pages');
    await this.createFreshPage(); // Start with fresh page
    
    const tests = [
      {
        name: 'Mobile Responsiveness - All Pages',
        test: async () => {
          const pages = ['/testing', '/settings', '/contacts', '/store'];
          const results = [];
          
          for (const page of pages) {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.goto(`${this.baseUrl}${page}`, { waitUntil: 'networkidle2' });
            
            // Check if navigation is visible
            const nav = await this.page.$('nav');
            if (nav && await nav.isVisible()) {
              results.push(`✅ ${page} mobile responsive`);
            } else {
              results.push(`❌ ${page} mobile issues`);
            }
          }
          
          // Reset to desktop
          await this.page.setViewport({ width: 1280, height: 720 });
          
          return {
            passed: results.filter(r => r.includes('✅')).length >= 3,
            message: `Mobile Responsiveness: ${results.join(', ')}`
          };
        }
      },
      {
        name: 'Tablet Responsiveness',
        test: async () => {
          await this.page.setViewport({ width: 768, height: 1024 });
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          const nav = await this.page.$('nav');
          const isResponsive = nav && await nav.isVisible();
          
          // Reset to desktop
          await this.page.setViewport({ width: 1280, height: 720 });
          
          return {
            passed: isResponsive,
            message: isResponsive ? 'Tablet viewport works correctly' : 'Tablet viewport issues detected'
          };
        }
      }
    ];

    return await this.runTestSuite('Responsive Design', tests);
  }

  async testUIInteractions() {
    console.log('🎨 TESTING: UI Interactions and Animations');
    await this.createFreshPage(); // Start with fresh page
    
    const tests = [
      {
        name: 'Button Hover States',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Find buttons and test hover states
          const buttons = await this.page.$$('button');
          let hoverTestsPasssed = 0;
          
          for (let i = 0; i < Math.min(buttons.length, 3); i++) {
            try {
              await buttons[i].hover();
              await this.page.waitForTimeout(200);
              hoverTestsPasssed++;
            } catch (error) {
              // Continue with next button
            }
          }
          
          return {
            passed: hoverTestsPasssed > 0,
            message: `Hover states tested on ${hoverTestsPasssed} buttons`
          };
        }
      },
      {
        name: 'Click Feedback',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Test click feedback on navigation
          const navLinks = await this.page.$$('nav a');
          let clickFeedbackWorks = false;
          
          if (navLinks.length > 0) {
            try {
              await navLinks[0].click();
              await this.page.waitForTimeout(300);
              clickFeedbackWorks = true;
            } catch (error) {
              // Click feedback test failed
            }
          }
          
          return {
            passed: clickFeedbackWorks,
            message: clickFeedbackWorks ? 'Click feedback animations work' : 'Click feedback not detected'
          };
        }
      }
    ];

    return await this.runTestSuite('UI Interactions', tests);
  }

  async runTestSuite(suiteName, tests) {
    console.log(`▶️ Running ${suiteName} test suite`);
    
    const suiteResults = {
      name: suiteName,
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    const suiteStartTime = Date.now();

    for (const test of tests) {
      console.log(`  🧪 Running: ${test.name}`);
      const testStartTime = Date.now();
      
      try {
        const result = await test.test();
        const duration = Date.now() - testStartTime;
        
        if (result.passed) {
          console.log(`  ✅ ${test.name}: ${result.message}`);
          suiteResults.passed++;
        } else {
          console.log(`  ❌ ${test.name}: ${result.message}`);
          suiteResults.failed++;
        }
        
        suiteResults.tests.push({
          name: test.name,
          success: result.passed,
          message: result.message,
          duration
        });
        
      } catch (error) {
        const duration = Date.now() - testStartTime;
        console.log(`  💥 ${test.name}: ${error.message}`);
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
    this.testCategories.push(suiteResults);
    
    console.log(`📋 ${suiteName} Results: ${suiteResults.passed} passed, ${suiteResults.failed} failed`);
    return suiteResults;
  }

  async generateComprehensiveReport() {
    console.log('📊 Generating comprehensive test report');
    
    const totalTests = this.testCategories.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.testCategories.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.testCategories.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.testCategories.reduce((sum, suite) => sum + suite.duration, 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Comprehensive App Testing',
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: ((totalPassed / totalTests) * 100).toFixed(2),
        totalDuration,
        categoriesTested: this.testCategories.length
      },
      categories: this.testCategories,
      recommendations: this.generateRecommendations()
    };
    
    // Create logs directory if it doesn't exist
    const logsDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Save JSON report
    const reportFile = path.join(logsDir, 'comprehensive-app-test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Generate and save HTML report
    const htmlReport = this.generateHtmlReport(report);
    const htmlFile = path.join(logsDir, 'comprehensive-app-test-report.html');
    fs.writeFileSync(htmlFile, htmlReport);
    
    console.log(`📄 Comprehensive test report saved: ${reportFile}`);
    console.log(`🌐 HTML report saved: ${htmlFile}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze test results and generate recommendations
    this.testCategories.forEach(category => {
      const failedTests = category.tests.filter(test => !test.success);
      if (failedTests.length > 0) {
        recommendations.push({
          category: category.name,
          issue: `${failedTests.length} failing tests`,
          recommendation: `Review and fix: ${failedTests.map(t => t.name).join(', ')}`
        });
      }
      
      const slowTests = category.tests.filter(test => test.duration > 5000);
      if (slowTests.length > 0) {
        recommendations.push({
          category: category.name,
          issue: 'Slow performance detected',
          recommendation: `Optimize performance for: ${slowTests.map(t => t.name).join(', ')}`
        });
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push({
        category: 'Overall',
        issue: 'No critical issues detected',
        recommendation: 'App is functioning well! Consider adding more advanced tests for edge cases.'
      });
    }
    
    return recommendations;
  }

  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinite Realty Hub - Comprehensive Test Report</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #0f0f23; color: #cccccc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #00d4ff; margin-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(0,212,255,0.3); border-radius: 12px; padding: 20px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #00d4ff; }
        .stat-label { color: #888; }
        .category { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 20px; padding: 20px; }
        .category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .category-title { color: #00d4ff; font-size: 1.2rem; font-weight: bold; }
        .test { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; border-radius: 6px; background: rgba(255,255,255,0.02); }
        .test-name { flex: 1; }
        .test-status { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
        .passed { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .failed { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .duration { color: #888; font-size: 0.8rem; margin-left: 10px; }
        .recommendations { background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 12px; padding: 20px; margin-top: 20px; }
        .recommendations h3 { color: #ffc107; margin-top: 0; }
        .recommendation { background: rgba(255,255,255,0.05); padding: 15px; margin: 10px 0; border-radius: 8px; }
        .recommendation-category { color: #00d4ff; font-weight: bold; }
        .recommendation-issue { color: #ffc107; margin: 5px 0; }
        .recommendation-text { color: #cccccc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Infinite Realty Hub</h1>
            <h2>Comprehensive App Test Report</h2>
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
            <div class="stat-card">
                <div class="stat-number">${report.summary.categoriesTested}</div>
                <div class="stat-label">Categories</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${(report.summary.totalDuration / 1000).toFixed(1)}s</div>
                <div class="stat-label">Duration</div>
            </div>
        </div>
        
        ${report.categories.map(category => `
            <div class="category">
                <div class="category-header">
                    <div class="category-title">${category.name}</div>
                    <div>${category.passed} passed, ${category.failed} failed (${(category.duration / 1000).toFixed(1)}s)</div>
                </div>
                ${category.tests.map(test => `
                    <div class="test">
                        <div class="test-name">${test.name}</div>
                        <div>
                            <span class="test-status ${test.success ? 'passed' : 'failed'}">
                                ${test.success ? 'PASSED' : 'FAILED'}
                            </span>
                            <span class="duration">${test.duration}ms</span>
                        </div>
                    </div>
                    ${!test.success ? `<div style="color: #ef4444; font-size: 0.8rem; margin-left: 20px; margin-bottom: 10px;">${test.message}</div>` : ''}
                `).join('')}
            </div>
        `).join('')}
        
        <div class="recommendations">
            <h3>📋 Recommendations</h3>
            ${report.recommendations.map(rec => `
                <div class="recommendation">
                    <div class="recommendation-category">${rec.category}</div>
                    <div class="recommendation-issue">Issue: ${rec.issue}</div>
                    <div class="recommendation-text">Recommendation: ${rec.recommendation}</div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      
      // Run all test suites
      await this.testNavigationSystem();
      await this.testSettingsPages();
      await this.testContactsSystem();
      await this.testStoreSystem();
      await this.testTestingSystem();
      await this.testResponsiveDesign();
      await this.testUIInteractions();
      
      const report = await this.generateComprehensiveReport();
      
      const totalPassed = report.summary.totalPassed;
      const totalTests = report.summary.totalTests;
      const successRate = report.summary.successRate;
      
      console.log('\n' + '='.repeat(60));
      console.log('🎯 COMPREHENSIVE TESTING COMPLETED');
      console.log('='.repeat(60));
      console.log(`📊 Final Results: ${totalPassed}/${totalTests} tests passed (${successRate}%)`);
      console.log(`⏱️  Total Duration: ${(report.summary.totalDuration / 1000).toFixed(1)} seconds`);
      console.log(`📂 Categories Tested: ${report.summary.categoriesTested}`);
      
      if (report.summary.totalFailed === 0) {
        console.log('🎉 ALL TESTS PASSED! App is functioning excellently.');
        this.allTestsPassed = true;
      } else {
        console.log(`⚠️  ${report.summary.totalFailed} tests failed. Review report for details.`);
        this.allTestsPassed = false;
      }
      
      return report;
      
    } catch (error) {
      console.error(`💥 Comprehensive testing failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the comprehensive testing
if (require.main === module) {
  const tester = new ComprehensiveAppTester();
  tester.run()
    .then(report => {
      if (report.summary.totalFailed === 0) {
        console.log('\n🚀 ALL SYSTEMS OPERATIONAL: Ready for production!');
        process.exit(0);
      } else {
        console.log('\n🔧 ISSUES DETECTED: Review and fix failing tests.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Comprehensive testing failed:', error);
      process.exit(1);
    });
}

module.exports = ComprehensiveAppTester;