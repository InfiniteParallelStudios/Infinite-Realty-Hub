#!/usr/bin/env node

/**
 * BUTTON FUNCTIONALITY VERIFICATION TEST
 * Comprehensive test of all recently fixed buttons
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ButtonFunctionalityVerifier {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.failedTests = [];
    this.passedTests = [];
  }

  async initialize() {
    console.log('🔍 BUTTON FUNCTIONALITY VERIFICATION TEST');
    console.log('Testing all recently fixed buttons for proper functionality');
    console.log('='.repeat(70));
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 300,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.browser.newPage();
    
    // Set up event listeners for functionality detection
    this.setupEventListeners();
    
    console.log('✅ Browser initialized for verification testing');
  }

  setupEventListeners() {
    this.page.on('dialog', async dialog => {
      console.log(`   📢 Dialog detected: "${dialog.message()}"`);
      await dialog.accept();
    });
    
    this.page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('api')) {
        console.log(`   📡 API call: ${response.status()} ${response.url().split('/').pop()}`);
      }
    });
  }

  async testButton(selector, buttonName, expectedBehavior, page = null) {
    try {
      console.log(`\n🔘 Testing: ${buttonName}`);
      console.log(`   Expected: ${expectedBehavior}`);
      
      if (page) {
        await this.page.goto(`${this.baseUrl}${page}`, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Check if button exists
      const button = await this.page.$(selector);
      if (!button) {
        throw new Error(`Button not found with selector: ${selector}`);
      }

      // Check if button is clickable
      const isClickable = await this.page.evaluate(btn => {
        return !btn.disabled && btn.offsetParent !== null;
      }, button);

      if (!isClickable) {
        throw new Error('Button is disabled or not visible');
      }

      // Record initial state
      const initialUrl = this.page.url();
      
      // Set up functionality detection
      let functionalityDetected = false;
      let detectedBehavior = '';
      
      const dialogListener = async (dialog) => {
        functionalityDetected = true;
        detectedBehavior = 'Dialog triggered';
        await dialog.accept();
      };

      this.page.on('dialog', dialogListener);

      // Click the button
      await button.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for URL changes
      const newUrl = this.page.url();
      if (newUrl !== initialUrl) {
        functionalityDetected = true;
        detectedBehavior = `Navigation to ${newUrl.split('/').pop()}`;
      }

      // Check for modals
      const modals = await this.page.$$('[role="dialog"], .modal, [class*="modal"]');
      if (modals.length > 0) {
        functionalityDetected = true;
        detectedBehavior = 'Modal opened';
        
        // Close modal if it exists
        const closeButton = await this.page.$('button:has-text("Close"), button:has-text("Got it!")');
        if (closeButton) {
          await closeButton.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Check for content changes
      const newContent = await this.page.content();
      if (newContent.includes('✅') || newContent.includes('Launching') || newContent.includes('Browser automation')) {
        functionalityDetected = true;
        detectedBehavior = 'UI state change detected';
      }

      this.page.off('dialog', dialogListener);

      if (functionalityDetected) {
        console.log(`   ✅ PASSED - ${detectedBehavior}`);
        this.passedTests.push({
          buttonName,
          expectedBehavior,
          actualBehavior: detectedBehavior,
          status: 'PASSED'
        });
      } else {
        console.log(`   ❌ FAILED - No functionality detected`);
        this.failedTests.push({
          buttonName,
          expectedBehavior,
          actualBehavior: 'No visible response',
          status: 'FAILED'
        });
      }

    } catch (error) {
      console.log(`   💥 ERROR - ${error.message}`);
      this.failedTests.push({
        buttonName,
        expectedBehavior,
        actualBehavior: `Error: ${error.message}`,
        status: 'ERROR'
      });
    }
  }

  async runAllButtonTests() {
    console.log('\n🚀 STARTING COMPREHENSIVE BUTTON VERIFICATION');
    console.log('='.repeat(70));

    // Dashboard Page Tests
    console.log('\n📄 TESTING DASHBOARD PAGE');
    await this.testButton(
      'button:has-text("Get Started")',
      'Dashboard Get Started Button',
      'Navigate to contacts page',
      '/dashboard'
    );

    await this.testButton(
      'button:has-text("Learn More")',
      'Dashboard Learn More Button',
      'Open welcome modal',
      '/dashboard'
    );

    // Settings Page Tests
    console.log('\n📄 TESTING SETTINGS PAGE');
    await this.testButton(
      'button:has-text("Privacy Policy")',
      'Privacy Policy Button',
      'Open privacy policy modal',
      '/settings'
    );

    await this.testButton(
      'button:has-text("Terms of Service")',
      'Terms of Service Button',
      'Open terms modal',
      '/settings'
    );

    await this.testButton(
      'button:has-text("About")',
      'About Button',
      'Open about modal',
      '/settings'
    );

    // Billing Page Tests
    console.log('\n📄 TESTING BILLING PAGE');
    await this.testButton(
      'button:has-text("Set as Default")',
      'Set as Default Button',
      'Show confirmation dialog',
      '/settings/billing'
    );

    await this.testButton(
      'button:has-text("Edit")',
      'Edit Payment Method Button',
      'Show edit dialog',
      '/settings/billing'
    );

    await this.testButton(
      'button:has-text("Remove")',
      'Remove Payment Method Button',
      'Show removal confirmation',
      '/settings/billing'
    );

    // Store Page Tests
    console.log('\n📄 TESTING STORE PAGE');
    await this.testButton(
      'button:has-text("Subscribe")',
      'Subscribe Button',
      'Show subscription dialog',
      '/store'
    );

    // Testing Page Tests
    console.log('\n📄 TESTING TESTING PAGE');
    await this.testButton(
      'button:has-text("Show Browser")',
      'Show Browser Button',
      'Toggle browser controls',
      '/testing'
    );

    // Wait for browser controls to be visible
    await new Promise(resolve => setTimeout(resolve, 1000));

    await this.testButton(
      'button:has-text("Launch Browser")',
      'Launch Browser Button',
      'Start browser automation',
      null
    );

    await this.testButton(
      'button:has-text("Navigate to App")',
      'Navigate to App Button',
      'Navigate browser to app',
      null
    );

    await this.testButton(
      'button:has-text("Take Screenshot")',
      'Take Screenshot Button',
      'Capture screenshot',
      null
    );

    await this.testButton(
      'button:has-text("Close Browser")',
      'Close Browser Button',
      'Close browser automation',
      null
    );
  }

  generateReport() {
    const totalTests = this.passedTests.length + this.failedTests.length;
    const passRate = totalTests > 0 ? ((this.passedTests.length / totalTests) * 100).toFixed(2) : 0;

    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Button Functionality Verification',
      summary: {
        totalTests,
        passedTests: this.passedTests.length,
        failedTests: this.failedTests.length,
        passRate: `${passRate}%`
      },
      passedTests: this.passedTests,
      failedTests: this.failedTests
    };

    // Save report
    const logsDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const reportFile = path.join(logsDir, 'button-verification-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('🎯 BUTTON VERIFICATION RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${this.passedTests.length}`);
    console.log(`❌ Failed: ${this.failedTests.length}`);
    console.log(`📈 Pass Rate: ${passRate}%`);

    if (this.failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.failedTests.forEach(test => {
        console.log(`   • ${test.buttonName}: ${test.actualBehavior}`);
      });
    } else {
      console.log('\n🎉 ALL BUTTON TESTS PASSED!');
    }

    console.log(`\n📄 Detailed report saved: ${reportFile}`);
    
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
      await this.runAllButtonTests();
      const report = this.generateReport();
      
      return report;
      
    } catch (error) {
      console.error(`💥 Verification failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the verification
if (require.main === module) {
  const verifier = new ButtonFunctionalityVerifier();
  verifier.run()
    .then(report => {
      console.log('\n🚀 BUTTON VERIFICATION COMPLETED');
      process.exit(report.failedTests.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = ButtonFunctionalityVerifier;