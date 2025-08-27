#!/usr/bin/env node

/**
 * Manual QR Code System Test - Simpler approach using HTTP requests and direct testing
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  baseUrl: 'http://192.168.1.218:3000',
  screenshotDir: './manual-test-screenshots'
};

class ManualQRTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {};
  }

  async setup() {
    console.log('🚀 Setting up manual test environment...');
    
    if (!fs.existsSync(CONFIG.screenshotDir)) {
      fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
    }

    this.browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Log console messages
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Browser Error: ${msg.text()}`);
      } else {
        console.log(`🖥️  Browser: ${msg.text()}`);
      }
    });
  }

  async screenshot(name, description) {
    const filename = `${name}_${Date.now()}.png`;
    const filepath = path.join(CONFIG.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 ${description}: ${filename}`);
    return filepath;
  }

  async testServerAndPages() {
    console.log('\n=== MANUAL SERVER AND PAGES TEST ===');
    
    const pages = [
      { url: '/', name: 'Home Page' },
      { url: '/capture?agent_name=Test%20Agent&agent_email=test@example.com&agent_phone=555-123-4567&agent_company=Test%20Company', name: 'Capture Form' },
      { url: '/qr-generator', name: 'QR Generator' },
      { url: '/qr-leads', name: 'QR Leads' }
    ];

    for (const pageTest of pages) {
      try {
        console.log(`\n🔍 Testing ${pageTest.name}...`);
        
        const response = await this.page.goto(`${CONFIG.baseUrl}${pageTest.url}`, { 
          waitUntil: 'networkidle0',
          timeout: 15000 
        });
        
        console.log(`📡 Response: ${response.status()}`);
        
        // Wait a moment for page to fully load
        await this.page.waitForTimeout(2000);
        
        await this.screenshot(pageTest.name.toLowerCase().replace(/\s+/g, '-'), `${pageTest.name} loaded`);
        
        // Check for common error indicators
        const pageTitle = await this.page.title();
        const hasError = await this.page.evaluate(() => {
          const errorText = document.body.textContent.toLowerCase();
          return errorText.includes('error') || 
                 errorText.includes('not found') || 
                 errorText.includes('500') || 
                 errorText.includes('404');
        });
        
        const pageAnalysis = await this.page.evaluate(() => {
          // Count different types of elements
          return {
            title: document.title,
            hasForm: document.querySelector('form') !== null,
            hasInputs: document.querySelectorAll('input').length,
            hasButtons: document.querySelectorAll('button').length,
            hasCanvas: document.querySelector('canvas') !== null,
            bodyText: document.body.textContent.slice(0, 200) + '...'
          };
        });
        
        console.log(`📊 Page Analysis:`, pageAnalysis);
        
        this.results[pageTest.name] = {
          status: response.status() >= 200 && response.status() < 400 && !hasError ? 'PASS' : 'FAIL',
          httpStatus: response.status(),
          title: pageTitle,
          hasError,
          analysis: pageAnalysis
        };
        
      } catch (error) {
        console.error(`❌ Failed to test ${pageTest.name}: ${error.message}`);
        this.results[pageTest.name] = {
          status: 'FAIL',
          error: error.message
        };
      }
    }
  }

  async testQRGeneration() {
    console.log('\n=== MANUAL QR GENERATION TEST ===');
    
    try {
      // Go to QR generator page
      await this.page.goto(`${CONFIG.baseUrl}/qr-generator`, { waitUntil: 'networkidle0' });
      await this.page.waitForTimeout(3000);
      
      console.log('🔍 Looking for QR generator elements...');
      
      // Try to find and fill form fields using more specific selectors
      const inputs = await this.page.$$('input');
      console.log(`📝 Found ${inputs.length} input fields`);
      
      if (inputs.length > 0) {
        // Fill the first few inputs with test data
        try {
          await this.page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input'));
            if (inputs[0]) inputs[0].value = 'Test Agent';
            if (inputs[1]) inputs[1].value = 'Real Estate Agent'; 
            if (inputs[2]) inputs[2].value = 'Test Company';
            if (inputs[3]) inputs[3].value = '555-123-4567';
            if (inputs[4]) inputs[4].value = 'test@example.com';
          });
          console.log('✅ Form fields filled');
        } catch (e) {
          console.log('⚠️ Could not fill some form fields');
        }
      }
      
      await this.screenshot('qr-form-filled', 'QR Generator form filled');
      
      // Look for generate buttons
      const buttons = await this.page.$$('button');
      console.log(`🔘 Found ${buttons.length} buttons`);
      
      // Try to click generate-related buttons
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await this.page.evaluate(btn => btn.textContent, buttons[i]);
        console.log(`🔘 Button ${i}: "${buttonText}"`);
        
        if (buttonText.toLowerCase().includes('generate') || 
            buttonText.toLowerCase().includes('create') ||
            buttonText.toLowerCase().includes('simple qr')) {
          
          console.log(`🎯 Clicking button: "${buttonText}"`);
          await buttons[i].click();
          await this.page.waitForTimeout(3000);
          
          await this.screenshot(`after-${buttonText.replace(/\s+/g, '-').toLowerCase()}`, `After clicking ${buttonText}`);
          
          // Check for canvas content
          const canvasInfo = await this.page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return { found: false };
            
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 50), Math.min(canvas.height, 50));
            
            let hasContent = false;
            for (let i = 0; i < imageData.data.length; i += 4) {
              const r = imageData.data[i];
              const g = imageData.data[i + 1];
              const b = imageData.data[i + 2];
              
              if (r < 240 || g < 240 || b < 240) {
                hasContent = true;
                break;
              }
            }
            
            return {
              found: true,
              width: canvas.width,
              height: canvas.height,
              hasContent,
              visible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0
            };
          });
          
          console.log(`🖼️ Canvas analysis:`, canvasInfo);
          
          this.results['QR Generation'] = {
            status: canvasInfo.hasContent ? 'PASS' : 'FAIL',
            canvas: canvasInfo,
            buttonClicked: buttonText
          };
          
          break; // Only test the first generate button
        }
      }
      
    } catch (error) {
      console.error(`❌ QR Generation test failed: ${error.message}`);
      this.results['QR Generation'] = {
        status: 'FAIL',
        error: error.message
      };
    }
  }

  async testCaptureWorkflow() {
    console.log('\n=== MANUAL CAPTURE WORKFLOW TEST ===');
    
    try {
      const captureUrl = `${CONFIG.baseUrl}/capture?agent_name=John%20Test&agent_email=john@test.com&agent_phone=555-123-4567&agent_company=Test%20Realty`;
      
      console.log('🔍 Testing capture form workflow...');
      await this.page.goto(captureUrl, { waitUntil: 'networkidle0' });
      await this.page.waitForTimeout(2000);
      
      await this.screenshot('capture-workflow-start', 'Capture workflow started');
      
      // Check if agent info is displayed
      const pageText = await this.page.evaluate(() => document.body.textContent);
      const hasAgentInfo = pageText.includes('John Test');
      console.log(`👤 Agent info displayed: ${hasAgentInfo}`);
      
      // Fill the form
      const formFilled = await this.page.evaluate(() => {
        try {
          const inputs = Array.from(document.querySelectorAll('input'));
          const textareas = Array.from(document.querySelectorAll('textarea'));
          const selects = Array.from(document.querySelectorAll('select'));
          
          // Fill inputs based on type or placeholder
          inputs.forEach(input => {
            const placeholder = input.placeholder.toLowerCase();
            const type = input.type;
            
            if (placeholder.includes('first') || input.name === 'firstName') {
              input.value = 'Jane';
            } else if (placeholder.includes('last') || input.name === 'lastName') {
              input.value = 'Smith';
            } else if (type === 'email') {
              input.value = 'jane.smith@example.com';
            } else if (type === 'tel' || placeholder.includes('phone')) {
              input.value = '555-987-6543';
            }
          });
          
          if (textareas[0]) {
            textareas[0].value = 'I am interested in buying a home';
          }
          
          if (selects[0]) {
            selects[0].value = 'buying';
          }
          
          return {
            inputsFilled: inputs.length,
            textareasFilled: textareas.length,
            selectsFilled: selects.length
          };
        } catch (e) {
          return { error: e.message };
        }
      });
      
      console.log(`📝 Form filled:`, formFilled);
      
      await this.screenshot('capture-form-filled', 'Capture form filled out');
      
      // Try to submit
      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) {
        console.log('📤 Submitting form...');
        await submitButton.click();
        await this.page.waitForTimeout(4000);
        
        await this.screenshot('capture-after-submit', 'After form submission');
        
        // Check for success page
        const finalPageText = await this.page.evaluate(() => document.body.textContent);
        const hasThankYou = finalPageText.toLowerCase().includes('thank you') || 
                           finalPageText.toLowerCase().includes('success');
        
        console.log(`✅ Success confirmation: ${hasThankYou}`);
        
        this.results['Capture Workflow'] = {
          status: hasThankYou ? 'PASS' : 'WARNING',
          agentInfoDisplayed: hasAgentInfo,
          formFilled: formFilled,
          successConfirmation: hasThankYou
        };
      } else {
        this.results['Capture Workflow'] = {
          status: 'FAIL',
          error: 'Submit button not found'
        };
      }
      
    } catch (error) {
      console.error(`❌ Capture workflow test failed: ${error.message}`);
      this.results['Capture Workflow'] = {
        status: 'FAIL',
        error: error.message
      };
    }
  }

  generateReport() {
    console.log('\n=== MANUAL TEST RESULTS ===');
    
    Object.entries(this.results).forEach(([testName, result]) => {
      const status = result.status;
      const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${testName}: ${status}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.analysis) {
        console.log(`   Analysis: Form=${result.analysis.hasForm}, Inputs=${result.analysis.hasInputs}, Buttons=${result.analysis.hasButtons}, Canvas=${result.analysis.hasCanvas}`);
      }
    });
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.status === 'PASS').length,
        failed: Object.values(this.results).filter(r => r.status === 'FAIL').length,
        warnings: Object.values(this.results).filter(r => r.status === 'WARNING').length
      }
    };
    
    const reportPath = path.join(CONFIG.screenshotDir, 'manual-qr-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${reportPath}`);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runTests() {
    console.log('🚀 Starting Manual QR System Tests...');
    
    try {
      await this.setup();
      await this.testServerAndPages();
      await this.testQRGeneration();
      await this.testCaptureWorkflow();
      
      const report = this.generateReport();
      
      console.log(`\n🎉 Manual tests completed!`);
      console.log(`📊 Summary: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.warnings} warnings`);
      
      return report;
      
    } catch (error) {
      console.error('💥 Manual test suite failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
if (require.main === module) {
  const testSuite = new ManualQRTest();
  testSuite.runTests()
    .then(() => {
      console.log('\n✅ Manual tests completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Manual test suite failed:', error);
      process.exit(1);
    });
}

module.exports = ManualQRTest;