#!/usr/bin/env node

/**
 * SETTINGS PAGES TESTING SUITE
 * Direct testing of settings pages functionality
 * Tests theme switching, navigation, and settings controls
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class SettingsPageTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async initialize() {
    console.log('⚙️ SETTINGS TESTING: Direct settings functionality testing');
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 200,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async testAppearanceSettings() {
    console.log('🎨 TESTING: Appearance Settings Direct Access');
    
    const tests = [
      {
        name: 'Appearance Page Direct Access',
        test: async () => {
          try {
            await this.page.goto(`${this.baseUrl}/settings/appearance`, { waitUntil: 'networkidle2' });
            
            const pageContent = await this.page.content();
            const hasAppearanceContent = pageContent.includes('Appearance') || 
                                       pageContent.includes('Theme') || 
                                       pageContent.includes('Dark') || 
                                       pageContent.includes('Light');
            
            const currentUrl = this.page.url();
            const isOnAppearancePage = currentUrl.includes('/settings/appearance');
            
            return {
              passed: hasAppearanceContent || isOnAppearancePage,
              message: hasAppearanceContent ? 
                'Appearance page loads with theme content' : 
                (isOnAppearancePage ? 'On appearance page but content not detected' : `Redirected to: ${currentUrl}`)
            };
          } catch (error) {
            return {
              passed: false,
              message: `Failed to access appearance page: ${error.message}`
            };
          }
        }
      },
      {
        name: 'Theme Toggle Buttons Detection',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings/appearance`, { waitUntil: 'networkidle2' });
          
          const themeButtons = [];
          const buttons = await this.page.$$('button');
          
          for (const button of buttons) {
            try {
              const text = await this.page.evaluate(btn => btn.textContent, button);
              if (text && (text.includes('Dark') || text.includes('Light') || text.includes('System'))) {
                themeButtons.push(text.trim());
              }
            } catch (e) {
              // Continue
            }
          }
          
          // Also check for radio buttons or other inputs
          const inputs = await this.page.$$('input[type="radio"], input[name*="theme"]');
          const radioCount = inputs.length;
          
          return {
            passed: themeButtons.length > 0 || radioCount > 0,
            message: `Found ${themeButtons.length} theme buttons: [${themeButtons.join(', ')}] and ${radioCount} radio inputs`
          };
        }
      },
      {
        name: 'Theme Selection Functionality',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings/appearance`, { waitUntil: 'networkidle2' });
          
          // Get initial theme state
          const initialState = await this.page.evaluate(() => {
            const html = document.documentElement;
            const body = document.body;
            return {
              htmlClass: html.className,
              bodyClass: body.className,
              bodyBg: window.getComputedStyle(body).backgroundColor
            };
          });
          
          // Try to find and click a theme button
          const buttons = await this.page.$$('button');
          let themeChangeDetected = false;
          
          for (const button of buttons) {
            try {
              const text = await this.page.evaluate(btn => btn.textContent, button);
              if (text && (text.includes('Dark') || text.includes('Light'))) {
                await button.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Check if theme changed
                const newState = await this.page.evaluate(() => {
                  const html = document.documentElement;
                  const body = document.body;
                  return {
                    htmlClass: html.className,
                    bodyClass: body.className,
                    bodyBg: window.getComputedStyle(body).backgroundColor
                  };
                });
                
                if (newState.htmlClass !== initialState.htmlClass || 
                    newState.bodyClass !== initialState.bodyClass ||
                    newState.bodyBg !== initialState.bodyBg) {
                  themeChangeDetected = true;
                  break;
                }
              }
            } catch (e) {
              // Continue to next button
            }
          }
          
          return {
            passed: themeChangeDetected,
            message: themeChangeDetected ? 'Theme switching works correctly' : 'No theme change detected when clicking buttons'
          };
        }
      }
    ];

    return await this.runTestSuite('Appearance Settings', tests);
  }

  async testSettingsNavigation() {
    console.log('🧭 TESTING: Settings Navigation');
    
    const tests = [
      {
        name: 'Settings Pages Accessibility',
        test: async () => {
          const settingsPages = [
            { path: '/settings', name: 'Main Settings' },
            { path: '/settings/account', name: 'Account' },
            { path: '/settings/appearance', name: 'Appearance' },
            { path: '/settings/notifications', name: 'Notifications' },
            { path: '/settings/security', name: 'Security' },
            { path: '/settings/billing', name: 'Billing' },
            { path: '/settings/support', name: 'Support' }
          ];
          
          const accessResults = [];
          
          for (const page of settingsPages) {
            try {
              await this.page.goto(`${this.baseUrl}${page.path}`, { waitUntil: 'networkidle2' });
              const currentUrl = this.page.url();
              
              if (currentUrl.includes(page.path)) {
                accessResults.push(`✅ ${page.name}`);
              } else if (currentUrl.includes('/auth/signin')) {
                accessResults.push(`🔒 ${page.name} (protected)`);
              } else {
                accessResults.push(`❌ ${page.name} (redirected)`);
              }
            } catch (error) {
              accessResults.push(`💥 ${page.name} (error)`);
            }
          }
          
          const accessibleCount = accessResults.filter(r => r.includes('✅')).length;
          const protectedCount = accessResults.filter(r => r.includes('🔒')).length;
          
          return {
            passed: accessibleCount + protectedCount === settingsPages.length,
            message: `Settings pages: ${accessResults.join(', ')}`
          };
        }
      },
      {
        name: 'Back Navigation in Settings',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings/appearance`, { waitUntil: 'networkidle2' });
          
          // Look for back buttons or navigation
          const backElements = [];
          
          // Check for back buttons
          const buttons = await this.page.$$('button');
          for (const button of buttons) {
            try {
              const text = await this.page.evaluate(btn => btn.textContent, button);
              const ariaLabel = await this.page.evaluate(btn => btn.getAttribute('aria-label'), button);
              if ((text && text.includes('Back')) || (ariaLabel && ariaLabel.includes('Back'))) {
                backElements.push('Back button');
                break;
              }
            } catch (e) {
              // Continue
            }
          }
          
          // Check for navigation links
          const links = await this.page.$$('a');
          for (const link of links) {
            try {
              const href = await this.page.evaluate(l => l.getAttribute('href'), link);
              if (href === '/settings') {
                backElements.push('Settings link');
                break;
              }
            } catch (e) {
              // Continue
            }
          }
          
          return {
            passed: backElements.length > 0,
            message: backElements.length > 0 ? 
              `Found navigation elements: ${backElements.join(', ')}` : 
              'No back navigation found'
          };
        }
      }
    ];

    return await this.runTestSuite('Settings Navigation', tests);
  }

  async testUIComponents() {
    console.log('🎯 TESTING: Settings UI Components');
    
    const tests = [
      {
        name: 'Form Elements Detection',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings/appearance`, { waitUntil: 'networkidle2' });
          
          const formElements = await this.page.evaluate(() => {
            const inputs = document.querySelectorAll('input, select, textarea');
            const buttons = document.querySelectorAll('button');
            const labels = document.querySelectorAll('label');
            
            return {
              inputs: inputs.length,
              buttons: buttons.length,
              labels: labels.length
            };
          });
          
          const totalElements = formElements.inputs + formElements.buttons + formElements.labels;
          
          return {
            passed: totalElements > 3,
            message: `Interactive elements: ${formElements.inputs} inputs, ${formElements.buttons} buttons, ${formElements.labels} labels`
          };
        }
      },
      {
        name: 'Card Layout Structure',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/settings`, { waitUntil: 'networkidle2' });
          
          // Look for card-like structures
          const cardElements = await this.page.evaluate(() => {
            const possibleCards = document.querySelectorAll(
              '.card, [class*="card"], .panel, [class*="panel"], .setting, [class*="setting"]'
            );
            
            // Also check for grid layouts that might contain cards
            const gridElements = document.querySelectorAll(
              '[class*="grid"], [style*="grid"], [style*="flex"]'
            );
            
            return {
              cards: possibleCards.length,
              grids: gridElements.length
            };
          });
          
          return {
            passed: cardElements.cards > 0 || cardElements.grids > 0,
            message: `Layout structure: ${cardElements.cards} card elements, ${cardElements.grids} grid/flex containers`
          };
        }
      }
    ];

    return await this.runTestSuite('UI Components', tests);
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

  async generateReport() {
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.testResults.reduce((sum, suite) => sum + suite.failed, 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Settings Pages Testing',
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: ((totalPassed / totalTests) * 100).toFixed(2)
      },
      suites: this.testResults
    };
    
    const logsDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const reportFile = path.join(logsDir, 'settings-test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📄 Settings test report saved: ${reportFile}`);
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
      
      // Run settings test suites
      await this.testAppearanceSettings();
      await this.testSettingsNavigation();
      await this.testUIComponents();
      
      const report = await this.generateReport();
      
      console.log('\n' + '='.repeat(50));
      console.log('⚙️ SETTINGS TESTING COMPLETED');
      console.log('='.repeat(50));
      console.log(`📊 Results: ${report.summary.totalPassed}/${report.summary.totalTests} tests passed (${report.summary.successRate}%)`);
      
      if (report.summary.totalFailed === 0) {
        console.log('🎉 ALL SETTINGS TESTS PASSED!');
      } else {
        console.log(`⚠️  ${report.summary.totalFailed} settings tests need attention`);
      }
      
      return report;
      
    } catch (error) {
      console.error(`💥 Settings testing failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the settings testing
if (require.main === module) {
  const tester = new SettingsPageTester();
  tester.run()
    .then(report => {
      console.log('\n🚀 SETTINGS TESTING COMPLETE');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Settings testing failed:', error);
      process.exit(1);
    });
}

module.exports = SettingsPageTester;