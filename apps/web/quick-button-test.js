#!/usr/bin/env node

/**
 * QUICK BUTTON FUNCTIONALITY TEST
 * Uses Puppeteer-compatible selectors to test button functionality
 */

const puppeteer = require('puppeteer');

class QuickButtonTest {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async initialize() {
    console.log('🔍 QUICK BUTTON FUNCTIONALITY TEST');
    console.log('='.repeat(50));
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 200,
      args: ['--no-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.browser.newPage();
    console.log('✅ Browser initialized');
  }

  async findButtonByText(text) {
    return await this.page.evaluateHandle((buttonText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(button => 
        button.textContent.trim().includes(buttonText) ||
        button.innerText.trim().includes(buttonText)
      );
    }, text);
  }

  async testButtonByText(buttonText, expectedBehavior, page = null) {
    try {
      console.log(`\n🔘 Testing: "${buttonText}"`);
      
      if (page) {
        await this.page.goto(`${this.baseUrl}${page}`, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Find button by text content
      const buttonHandle = await this.findButtonByText(buttonText);
      const button = buttonHandle.asElement();
      
      if (!button) {
        throw new Error(`Button with text "${buttonText}" not found`);
      }

      // Check if clickable
      const isClickable = await this.page.evaluate(btn => {
        return btn && !btn.disabled && btn.offsetParent !== null;
      }, button);

      if (!isClickable) {
        throw new Error('Button is disabled or not visible');
      }

      const initialUrl = this.page.url();
      
      // Set up dialog detection
      let dialogTriggered = false;
      const dialogListener = async (dialog) => {
        dialogTriggered = true;
        console.log(`   📢 Dialog: "${dialog.message()}"`);
        await dialog.accept();
      };
      this.page.on('dialog', dialogListener);

      // Click the button
      await button.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check results
      let success = false;
      let result = '';

      // Check for URL change
      const newUrl = this.page.url();
      if (newUrl !== initialUrl) {
        success = true;
        result = `Navigation to ${newUrl.split('/').pop()}`;
      }

      // Check for modals
      const modals = await this.page.$$('div[class*="fixed"], div[role="dialog"]');
      if (modals.length > 0) {
        success = true;
        result = 'Modal opened';
        
        // Try to close modal
        try {
          const closeButtons = await this.page.$$('button');
          for (const closeBtn of closeButtons) {
            const text = await this.page.evaluate(btn => btn.textContent, closeBtn);
            if (text.includes('Close') || text.includes('Got it')) {
              await closeBtn.click();
              await new Promise(resolve => setTimeout(resolve, 500));
              break;
            }
          }
        } catch (e) {
          // Ignore close errors
        }
      }

      // Check for dialogs
      if (dialogTriggered) {
        success = true;
        result = 'Alert dialog triggered';
      }

      // Check for UI state changes (like browser status)
      const pageContent = await this.page.content();
      if (pageContent.includes('Launching') || pageContent.includes('Browser automation') || 
          pageContent.includes('active') || pageContent.includes('Screenshot')) {
        success = true;
        result = 'UI state change detected';
      }

      this.page.off('dialog', dialogListener);

      if (success) {
        console.log(`   ✅ PASSED - ${result}`);
        this.results.push({ button: buttonText, status: 'PASSED', result });
      } else {
        console.log(`   ⚠️  UNCLEAR - Click successful but no clear response detected`);
        this.results.push({ button: buttonText, status: 'UNCLEAR', result: 'Button clicked but response unclear' });
      }

    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}`);
      this.results.push({ button: buttonText, status: 'FAILED', result: error.message });
    }
  }

  async runTests() {
    console.log('\n🚀 Starting button tests...\n');

    // Test accessible pages first (testing page)
    await this.testButtonByText('Show Browser', 'Toggle browser controls', '/testing');
    await this.testButtonByText('Run All Tests', 'Start test execution', null);
    
    // Wait and test browser controls
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.testButtonByText('Launch Browser', 'Start browser automation', null);
    await this.testButtonByText('Navigate to App', 'Navigate to app', null);
    await this.testButtonByText('Take Screenshot', 'Capture screenshot', null);
    await this.testButtonByText('Close Browser', 'Close automation', null);

    // Test store page
    await this.testButtonByText('Subscribe', 'Start subscription', '/store');

    // Test settings page  
    await this.testButtonByText('Privacy Policy', 'Open privacy modal', '/settings');
    await this.testButtonByText('Terms of Service', 'Open terms modal', '/settings');
    await this.testButtonByText('About', 'Open about modal', '/settings');

    // Test billing page
    await this.testButtonByText('Set as Default', 'Confirm default setting', '/settings/billing');
    await this.testButtonByText('Edit', 'Open edit dialog', '/settings/billing');
    await this.testButtonByText('Remove', 'Confirm removal', '/settings/billing');

    // Note: Dashboard requires auth, so we'll note it
    console.log('\n📋 Note: Dashboard buttons require authentication - would test with login');
  }

  generateSummary() {
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const unclear = this.results.filter(r => r.status === 'UNCLEAR').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('📊 BUTTON TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tested: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Unclear: ${unclear}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.status === 'FAILED').forEach(r => {
        console.log(`   • ${r.button}: ${r.result}`);
      });
    }

    if (unclear > 0) {
      console.log('\n⚠️  Unclear Results:');
      this.results.filter(r => r.status === 'UNCLEAR').forEach(r => {
        console.log(`   • ${r.button}: ${r.result}`);
      });
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.runTests();
      this.generateSummary();
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test
new QuickButtonTest().run();