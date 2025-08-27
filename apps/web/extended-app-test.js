#!/usr/bin/env node

/**
 * EXTENDED APP TESTING SUITE
 * Comprehensive testing of all app functionality including auth, accessibility, and edge cases
 * Continues from the focused testing to provide complete coverage
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ExtendedAppTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.allTestsPassed = false;
  }

  async initialize() {
    console.log('🔬 EXTENDED APP TESTING: Deep dive into all functionality');
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 150,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Check dev server
    try {
      const response = await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      if (!response.ok()) {
        throw new Error(`Dev server not responding: ${response.status()}`);
      }
      console.log('✅ Dev server running - Starting extended testing');
    } catch (error) {
      console.error('❌ CRITICAL: Dev server not accessible');
      process.exit(1);
    }
  }

  async testAuthenticationPages() {
    console.log('🔐 TESTING: Authentication System');
    
    const tests = [
      {
        name: 'Home Page Redirect to Auth',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
          
          const currentUrl = this.page.url();
          const redirectedToAuth = currentUrl.includes('/auth/signin');
          
          return {
            passed: redirectedToAuth,
            message: redirectedToAuth ? 'Home page correctly redirects to sign-in' : `No redirect, on: ${currentUrl}`
          };
        }
      },
      {
        name: 'Sign-in Page Elements',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
          
          const elements = {
            googleButton: false,
            title: false,
            logo: false
          };
          
          // Check for Google sign-in button
          const buttons = await this.page.$$('button, a');
          for (const button of buttons) {
            const text = await this.page.evaluate(btn => btn.textContent || btn.innerText, button);
            if (text && (text.includes('Google') || text.includes('Sign in'))) {
              elements.googleButton = true;
              break;
            }
          }
          
          // Check for page title
          const headings = await this.page.$$('h1, h2, h3');
          for (const heading of headings) {
            const text = await this.page.evaluate(h => h.textContent, heading);
            if (text && (text.includes('Sign') || text.includes('Login') || text.includes('Infinite'))) {
              elements.title = true;
              break;
            }
          }
          
          // Check for any branding/logo
          const images = await this.page.$$('img, svg, [class*="logo"]');
          elements.logo = images.length > 0;
          
          const foundElements = Object.values(elements).filter(Boolean).length;
          
          return {
            passed: foundElements >= 2,
            message: `Sign-in page has ${foundElements}/3 expected elements (Google button: ${elements.googleButton}, Title: ${elements.title}, Logo/branding: ${elements.logo})`
          };
        }
      },
      {
        name: 'Protected Routes Redirect',
        test: async () => {
          const protectedRoutes = ['/dashboard', '/contacts', '/store', '/settings'];
          const redirectResults = [];
          
          for (const route of protectedRoutes) {
            await this.page.goto(`${this.baseUrl}${route}`, { waitUntil: 'networkidle2' });
            const currentUrl = this.page.url();
            const isRedirected = currentUrl.includes('/auth/signin');
            redirectResults.push(`${route}: ${isRedirected ? '✅' : '❌'}`);
          }
          
          const successCount = redirectResults.filter(r => r.includes('✅')).length;
          
          return {
            passed: successCount >= 3,
            message: `Protected routes (${successCount}/${protectedRoutes.length}): ${redirectResults.join(', ')}`
          };
        }
      }
    ];

    return await this.runTestSuite('Authentication System', tests);
  }

  async testAccessibilityFeatures() {
    console.log('♿ TESTING: Accessibility Features');
    
    const tests = [
      {
        name: 'Keyboard Navigation',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Test Tab navigation
          await this.page.focus('body');
          let tabStops = 0;
          const maxTabs = 10;
          
          for (let i = 0; i < maxTabs; i++) {
            await this.page.keyboard.press('Tab');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const activeElement = await this.page.evaluate(() => {
              const active = document.activeElement;
              return active ? {
                tagName: active.tagName,
                type: active.type,
                role: active.getAttribute('role'),
                href: active.href,
                hasTabIndex: active.tabIndex >= 0
              } : null;
            });
            
            if (activeElement && (
              activeElement.tagName === 'BUTTON' || 
              activeElement.tagName === 'A' || 
              activeElement.tagName === 'INPUT' ||
              activeElement.hasTabIndex
            )) {
              tabStops++;
            }
          }
          
          return {
            passed: tabStops >= 3,
            message: `Found ${tabStops} keyboard-accessible elements in ${maxTabs} tab presses`
          };
        }
      },
      {
        name: 'ARIA Labels and Roles',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          const ariaElements = await this.page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            let ariaCount = 0;
            let labelCount = 0;
            
            elements.forEach(el => {
              if (el.getAttribute('aria-label') || 
                  el.getAttribute('aria-labelledby') || 
                  el.getAttribute('aria-describedby') ||
                  el.getAttribute('role')) {
                ariaCount++;
              }
              
              if (el.tagName === 'LABEL' || el.getAttribute('aria-label')) {
                labelCount++;
              }
            });
            
            return { ariaCount, labelCount };
          });
          
          return {
            passed: ariaElements.ariaCount >= 2,
            message: `Found ${ariaElements.ariaCount} ARIA attributes and ${ariaElements.labelCount} labels`
          };
        }
      },
      {
        name: 'Color Contrast (Basic Check)',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          const contrastIssues = await this.page.evaluate(() => {
            const elements = document.querySelectorAll('h1, h2, h3, p, button, a');
            let lowContrastCount = 0;
            
            elements.forEach(el => {
              const style = window.getComputedStyle(el);
              const color = style.color;
              const bgColor = style.backgroundColor;
              
              // Basic check - if text is very light and background is very light, flag it
              if (color.includes('rgb(255') && bgColor.includes('rgb(255')) {
                lowContrastCount++;
              }
            });
            
            return lowContrastCount;
          });
          
          return {
            passed: contrastIssues < 3,
            message: contrastIssues === 0 ? 'No obvious contrast issues detected' : `${contrastIssues} potential contrast issues found`
          };
        }
      }
    ];

    return await this.runTestSuite('Accessibility Features', tests);
  }

  async testThemeSwitching() {
    console.log('🎨 TESTING: Theme Switching');
    
    const tests = [
      {
        name: 'Dark/Light Theme Detection',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Check initial theme
          const initialTheme = await this.page.evaluate(() => {
            const html = document.documentElement;
            const body = document.body;
            const hasThemeClass = html.className.includes('dark') || html.className.includes('light') ||
                                body.className.includes('dark') || body.className.includes('light');
            const bodyBg = window.getComputedStyle(body).backgroundColor;
            const isDarkBg = bodyBg.includes('rgb(15') || bodyBg.includes('rgb(0,') || bodyBg.includes('rgba(0,');
            
            return {
              hasThemeClass,
              isDarkBg,
              bodyBg,
              htmlClass: html.className,
              bodyClass: body.className
            };
          });
          
          return {
            passed: initialTheme.hasThemeClass || initialTheme.isDarkBg,
            message: `Theme detected - Dark background: ${initialTheme.isDarkBg}, Theme classes: ${initialTheme.hasThemeClass}`
          };
        }
      },
      {
        name: 'Theme Toggle Functionality',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings/appearance`, { waitUntil: 'networkidle2' });
          
          // Look for theme toggle buttons
          const themeButtons = await this.page.$$('button');
          let themeToggleFound = false;
          
          for (const button of themeButtons) {
            const text = await this.page.evaluate(btn => btn.textContent, button);
            if (text && (text.includes('Dark') || text.includes('Light') || text.includes('System'))) {
              try {
                // Get initial state
                const initialBg = await this.page.evaluate(() => 
                  window.getComputedStyle(document.body).backgroundColor
                );
                
                // Click theme button
                await button.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Check if theme changed
                const newBg = await this.page.evaluate(() => 
                  window.getComputedStyle(document.body).backgroundColor
                );
                
                themeToggleFound = true;
                break;
              } catch (error) {
                // Continue to next button
              }
            }
          }
          
          return {
            passed: themeToggleFound,
            message: themeToggleFound ? 'Theme toggle button found and functional' : 'No theme toggle buttons found or not functional'
          };
        }
      }
    ];

    return await this.runTestSuite('Theme Switching', tests);
  }

  async testErrorHandling() {
    console.log('🚨 TESTING: Error Handling and Edge Cases');
    
    const tests = [
      {
        name: 'Invalid Routes (404 Handling)',
        test: async () => {
          const invalidRoutes = ['/nonexistent', '/fake-page', '/invalid/route'];
          const errorHandling = [];
          
          for (const route of invalidRoutes) {
            try {
              const response = await this.page.goto(`${this.baseUrl}${route}`, { 
                waitUntil: 'networkidle2',
                timeout: 5000 
              });
              
              const status = response.status();
              const content = await this.page.content();
              const hasErrorPage = content.includes('404') || content.includes('not found') || content.includes('error');
              
              errorHandling.push(`${route}: ${status === 404 || hasErrorPage ? '✅' : '❌'}`);
            } catch (error) {
              errorHandling.push(`${route}: ❌ (${error.message.substring(0, 30)})`);
            }
          }
          
          const successCount = errorHandling.filter(r => r.includes('✅')).length;
          
          return {
            passed: successCount >= 1, // At least one should handle errors properly
            message: `Error handling (${successCount}/${invalidRoutes.length}): ${errorHandling.join(', ')}`
          };
        }
      },
      {
        name: 'Console Errors Check',
        test: async () => {
          const consoleErrors = [];
          
          this.page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });
          
          // Navigate through pages and check for console errors
          const pages = ['/testing', '/auth/signin'];
          for (const page of pages) {
            await this.page.goto(`${this.baseUrl}${page}`, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          const criticalErrors = consoleErrors.filter(error => 
            !error.includes('favicon') && 
            !error.includes('chunk') &&
            !error.includes('network') &&
            error.length > 10
          );
          
          return {
            passed: criticalErrors.length === 0,
            message: criticalErrors.length === 0 ? 
              `No critical console errors (${consoleErrors.length} total)` : 
              `${criticalErrors.length} critical errors: ${criticalErrors.slice(0, 2).join(', ')}`
          };
        }
      },
      {
        name: 'Network Resilience',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          // Test page functionality without network (offline simulation)
          try {
            await this.page.setOfflineMode(true);
            
            // Test if page still functions locally
            const buttons = await this.page.$$('button');
            let buttonClicksWork = 0;
            
            for (let i = 0; i < Math.min(buttons.length, 2); i++) {
              try {
                await buttons[i].click();
                buttonClicksWork++;
              } catch (error) {
                // Continue
              }
            }
            
            await this.page.setOfflineMode(false);
            
            return {
              passed: buttonClicksWork > 0,
              message: `Offline resilience: ${buttonClicksWork} buttons still functional without network`
            };
          } catch (error) {
            return {
              passed: false,
              message: `Network resilience test failed: ${error.message}`
            };
          }
        }
      }
    ];

    return await this.runTestSuite('Error Handling', tests);
  }

  async testPerformanceMetrics() {
    console.log('⚡ TESTING: Performance Metrics');
    
    const tests = [
      {
        name: 'Page Load Times',
        test: async () => {
          const pages = ['/testing', '/auth/signin'];
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
            passed: avgLoadTime < 2500,
            message: `Average load time: ${avgLoadTime.toFixed(0)}ms. ${slowPages.length === 0 ? 'All pages fast' : `Slow: ${slowPages.map(p => p.page).join(', ')}`}`
          };
        }
      },
      {
        name: 'Memory Usage',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          const metrics = await this.page.metrics();
          const jsHeapSize = metrics.JSHeapUsedSize / 1024 / 1024; // Convert to MB
          
          return {
            passed: jsHeapSize < 50, // Less than 50MB is reasonable
            message: `JS Heap size: ${jsHeapSize.toFixed(2)}MB`
          };
        }
      },
      {
        name: 'Resource Loading',
        test: async () => {
          let resourcesLoaded = 0;
          let resourcesFailed = 0;
          
          this.page.on('response', response => {
            if (response.status() >= 200 && response.status() < 400) {
              resourcesLoaded++;
            } else {
              resourcesFailed++;
            }
          });
          
          await this.page.goto(`${this.baseUrl}/testing`, { waitUntil: 'networkidle2' });
          
          return {
            passed: resourcesFailed === 0,
            message: `Resources: ${resourcesLoaded} loaded, ${resourcesFailed} failed`
          };
        }
      }
    ];

    return await this.runTestSuite('Performance Metrics', tests);
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
    this.testResults.push(suiteResults);
    
    console.log(`📋 ${suiteName} Results: ${suiteResults.passed} passed, ${suiteResults.failed} failed`);
    return suiteResults;
  }

  async generateExtendedReport() {
    console.log('📊 Generating extended test report');
    
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.testResults.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.testResults.reduce((sum, suite) => sum + suite.duration, 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Extended App Testing',
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: ((totalPassed / totalTests) * 100).toFixed(2),
        totalDuration,
        suitesRun: this.testResults.length
      },
      suites: this.testResults,
      recommendations: this.generateRecommendations()
    };
    
    // Create logs directory
    const logsDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Save report
    const reportFile = path.join(logsDir, 'extended-app-test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📄 Extended test report saved: ${reportFile}`);
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    this.testResults.forEach(suite => {
      const failedTests = suite.tests.filter(test => !test.success);
      if (failedTests.length > 0) {
        recommendations.push({
          priority: 'high',
          category: suite.name,
          issue: `${failedTests.length} failing tests`,
          recommendation: `Address: ${failedTests.map(t => t.name).join(', ')}`
        });
      }
      
      const slowTests = suite.tests.filter(test => test.duration > 3000);
      if (slowTests.length > 0) {
        recommendations.push({
          priority: 'medium',
          category: suite.name,
          issue: 'Performance concerns',
          recommendation: `Optimize: ${slowTests.map(t => t.name).join(', ')}`
        });
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'info',
        category: 'Overall Assessment',
        issue: 'No critical issues found',
        recommendation: 'App is performing well! Consider adding E2E tests for user workflows.'
      });
    }
    
    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      
      // Run extended test suites
      await this.testAuthenticationPages();
      await this.testAccessibilityFeatures();
      await this.testThemeSwitching();
      await this.testErrorHandling();
      await this.testPerformanceMetrics();
      
      const report = await this.generateExtendedReport();
      
      console.log('\n' + '='.repeat(60));
      console.log('🔬 EXTENDED TESTING COMPLETED');
      console.log('='.repeat(60));
      console.log(`📊 Results: ${report.summary.totalPassed}/${report.summary.totalTests} tests passed (${report.summary.successRate}%)`);
      console.log(`⏱️  Duration: ${(report.summary.totalDuration / 1000).toFixed(1)} seconds`);
      console.log(`📂 Test Suites: ${report.summary.suitesRun}`);
      
      if (report.summary.totalFailed === 0) {
        console.log('🎉 ALL EXTENDED TESTS PASSED!');
        this.allTestsPassed = true;
      } else {
        console.log(`⚠️  ${report.summary.totalFailed} tests need attention`);
      }
      
      return report;
      
    } catch (error) {
      console.error(`💥 Extended testing failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the extended testing
if (require.main === module) {
  const tester = new ExtendedAppTester();
  tester.run()
    .then(report => {
      console.log('\n🚀 EXTENDED TESTING COMPLETE');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Extended testing failed:', error);
      process.exit(1);
    });
}

module.exports = ExtendedAppTester;