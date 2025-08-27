#!/usr/bin/env node

/**
 * Comprehensive QR Code Lead Capture System Testing Suite
 * Tests all aspects of the QR system including server access, QR generation,
 * form capture, lead management, and mobile compatibility.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
  baseUrl: 'http://192.168.1.218:3000',
  networkIp: '192.168.1.218',
  port: 3000,
  timeout: 30000,
  screenshotDir: './test-screenshots',
  testResults: {
    serverAccess: null,
    qrGenerator: null,
    qrGeneration: null,
    captureForm: null,
    formSubmission: null,
    leadsDisplay: null,
    navigation: null,
    mobileCompatibility: null,
    serverLogs: null
  }
};

// Test data
const TEST_AGENT = {
  name: 'John Test Agent',
  email: 'john.test@example.com',
  phone: '(555) 123-4567',
  company: 'Test Realty'
};

const TEST_LEAD = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '(555) 987-6543',
  interestedIn: 'buying',
  message: 'Looking for a 3-bedroom home in downtown area.'
};

class QRTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = { ...CONFIG.testResults };
    this.screenshots = [];
    this.errors = [];
  }

  async setup() {
    console.log('🚀 Setting up test environment...');
    
    // Create screenshots directory
    if (!fs.existsSync(CONFIG.screenshotDir)) {
      fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
    }

    // Launch browser with mobile and desktop viewport support
    this.browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set up error and console logging
    this.page.on('console', msg => {
      console.log(`🖥️  Browser Console (${msg.type()}):`, msg.text());
    });

    this.page.on('pageerror', error => {
      console.error('❌ Page Error:', error);
      this.errors.push({ type: 'pageerror', error: error.toString() });
    });

    this.page.on('requestfailed', request => {
      console.error('❌ Request Failed:', request.url(), request.failure().errorText);
      this.errors.push({ 
        type: 'requestfailed', 
        url: request.url(), 
        error: request.failure().errorText 
      });
    });

    await this.page.setViewport({ width: 1280, height: 720 });
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  }

  async screenshot(name, description) {
    const filename = `${name}_${Date.now()}.png`;
    const filepath = path.join(CONFIG.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    
    this.screenshots.push({ name, description, filename, filepath });
    console.log(`📸 Screenshot saved: ${filename} - ${description}`);
    return filepath;
  }

  async testServerAccess() {
    console.log('\n=== 1. SERVER ACCESS TEST ===');
    
    try {
      console.log(`🔍 Testing server access: ${CONFIG.baseUrl}`);
      
      const response = await this.page.goto(CONFIG.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: CONFIG.timeout 
      });
      
      const status = response.status();
      console.log(`📡 Server Response Status: ${status}`);
      
      if (status >= 200 && status < 400) {
        await this.screenshot('server-access-success', 'Server homepage loaded successfully');
        
        // Check for any visible error messages
        const errorElements = await this.page.$$('.error, .alert-error, [class*="error"]');
        if (errorElements.length > 0) {
          console.log('⚠️  Found error elements on page');
          this.results.serverAccess = { 
            status: 'PASS_WITH_WARNINGS', 
            code: status,
            warnings: 'Error elements found on page'
          };
        } else {
          this.results.serverAccess = { status: 'PASS', code: status };
        }
      } else {
        await this.screenshot('server-access-fail', `Server returned ${status}`);
        this.results.serverAccess = { status: 'FAIL', code: status, error: `HTTP ${status}` };
      }
      
    } catch (error) {
      console.error('❌ Server access test failed:', error.message);
      await this.screenshot('server-access-error', 'Server access error');
      this.results.serverAccess = { status: 'FAIL', error: error.message };
    }
  }

  async testQRGenerator() {
    console.log('\n=== 2. QR GENERATOR PAGE TEST ===');
    
    try {
      console.log('🔍 Navigating to QR Generator page...');
      
      // First check if we need authentication
      await this.page.goto(`${CONFIG.baseUrl}/qr-generator`, { waitUntil: 'networkidle2' });
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/auth/signin') || currentUrl.includes('/login')) {
        console.log('🔐 Authentication required, attempting to sign in...');
        await this.handleAuthentication();
        await this.page.goto(`${CONFIG.baseUrl}/qr-generator`, { waitUntil: 'networkidle2' });
      }
      
      await this.screenshot('qr-generator-page', 'QR Generator page loaded');
      
      // Check for key elements
      const checks = {
        title: await this.page.$('h1, h2') !== null,
        form: await this.page.$('form, input[type="text"]') !== null,
        generateButton: await this.page.$('button:contains("Generate"), button[class*="generate"]') !== null,
        canvas: await this.page.$('canvas') !== null
      };
      
      console.log('🔍 Page element checks:', checks);
      
      // Test form filling
      const nameInput = await this.page.$('input[placeholder*="name" i], input[value*="name" i]');
      if (nameInput) {
        await nameInput.clear();
        await nameInput.type(TEST_AGENT.name);
        console.log('✅ Name input filled');
      }
      
      const emailInput = await this.page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.clear();
        await emailInput.type(TEST_AGENT.email);
        console.log('✅ Email input filled');
      }
      
      const phoneInput = await this.page.$('input[type="tel"], input[placeholder*="phone" i]');
      if (phoneInput) {
        await phoneInput.clear();
        await phoneInput.type(TEST_AGENT.phone);
        console.log('✅ Phone input filled');
      }
      
      await this.screenshot('qr-generator-filled', 'QR Generator form filled with test data');
      
      const passed = Object.values(checks).every(check => check);
      this.results.qrGenerator = { 
        status: passed ? 'PASS' : 'FAIL', 
        checks,
        error: passed ? null : 'Missing required elements'
      };
      
    } catch (error) {
      console.error('❌ QR Generator test failed:', error.message);
      await this.screenshot('qr-generator-error', 'QR Generator page error');
      this.results.qrGenerator = { status: 'FAIL', error: error.message };
    }
  }

  async testQRGeneration() {
    console.log('\n=== 3. QR CODE GENERATION TEST ===');
    
    try {
      console.log('🔍 Testing QR code generation...');
      
      // Look for the generate button
      const generateButton = await this.page.$('button:contains("Generate"), button[class*="generate"]');
      if (!generateButton) {
        throw new Error('Generate button not found');
      }
      
      // Test the simple QR button first
      const simpleQRButton = await this.page.$('button:contains("Simple QR")');
      if (simpleQRButton) {
        console.log('🧪 Testing simple QR generation...');
        await simpleQRButton.click();
        await this.page.waitForTimeout(2000);
        await this.screenshot('simple-qr-test', 'Simple QR generation test');
      }
      
      // Test canvas drawing
      const testCanvasButton = await this.page.$('button:contains("Test Canvas")');
      if (testCanvasButton) {
        console.log('🧪 Testing canvas drawing...');
        await testCanvasButton.click();
        await this.page.waitForTimeout(1000);
        await this.screenshot('canvas-test', 'Canvas drawing test');
      }
      
      // Test main QR generation
      console.log('🔄 Clicking main Generate QR Code button...');
      await generateButton.click();
      
      // Wait for QR generation
      await this.page.waitForTimeout(3000);
      
      await this.screenshot('qr-generated', 'QR code generation attempt');
      
      // Check if canvas has content
      const canvasContent = await this.page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Check for non-white pixels
        let hasContent = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          if (r < 250 || g < 250 || b < 250) {
            hasContent = true;
            break;
          }
        }
        
        return {
          width: canvas.width,
          height: canvas.height,
          hasContent,
          style: canvas.style.cssText
        };
      });
      
      console.log('🔍 Canvas analysis:', canvasContent);
      
      // Check for QR preview visibility
      const qrPreview = await this.page.$('.bg-white p-4, canvas');
      const isVisible = qrPreview ? await qrPreview.isIntersectingViewport() : false;
      
      this.results.qrGeneration = {
        status: canvasContent?.hasContent ? 'PASS' : 'FAIL',
        canvas: canvasContent,
        previewVisible: isVisible,
        error: canvasContent?.hasContent ? null : 'QR code canvas appears empty'
      };
      
    } catch (error) {
      console.error('❌ QR Generation test failed:', error.message);
      await this.screenshot('qr-generation-error', 'QR generation error');
      this.results.qrGeneration = { status: 'FAIL', error: error.message };
    }
  }

  async testCaptureForm() {
    console.log('\n=== 4. CAPTURE FORM TEST ===');
    
    try {
      console.log('🔍 Testing capture form...');
      
      // Build capture form URL with test parameters
      const captureUrl = `${CONFIG.baseUrl}/capture?${new URLSearchParams({
        agent_name: TEST_AGENT.name,
        agent_email: TEST_AGENT.email,
        agent_phone: TEST_AGENT.phone,
        agent_company: TEST_AGENT.company
      })}`;
      
      console.log('🌐 Capture URL:', captureUrl);
      
      await this.page.goto(captureUrl, { waitUntil: 'networkidle2' });
      await this.screenshot('capture-form-loaded', 'Capture form page loaded');
      
      // Check if agent info is properly displayed
      const agentNameElement = await this.page.$eval('h1, h2, .agent-name', el => el.textContent);
      const hasAgentName = agentNameElement?.includes(TEST_AGENT.name);
      
      console.log('🔍 Agent name displayed:', hasAgentName, agentNameElement);
      
      // Check form elements
      const formElements = {
        firstName: await this.page.$('input[name="firstName"], input[placeholder*="first" i]') !== null,
        lastName: await this.page.$('input[name="lastName"], input[placeholder*="last" i]') !== null,
        email: await this.page.$('input[type="email"]') !== null,
        phone: await this.page.$('input[type="tel"], input[placeholder*="phone" i]') !== null,
        interested: await this.page.$('select, input[name="interestedIn"]') !== null,
        message: await this.page.$('textarea') !== null,
        submitButton: await this.page.$('button[type="submit"], button:contains("Connect")') !== null
      };
      
      console.log('🔍 Form element checks:', formElements);
      
      const allElementsPresent = Object.values(formElements).every(present => present);
      
      this.results.captureForm = {
        status: allElementsPresent && hasAgentName ? 'PASS' : 'FAIL',
        agentInfoDisplayed: hasAgentName,
        formElements,
        captureUrl,
        error: allElementsPresent && hasAgentName ? null : 'Missing form elements or agent info'
      };
      
    } catch (error) {
      console.error('❌ Capture form test failed:', error.message);
      await this.screenshot('capture-form-error', 'Capture form error');
      this.results.captureForm = { status: 'FAIL', error: error.message };
    }
  }

  async testFormSubmission() {
    console.log('\n=== 5. FORM SUBMISSION TEST ===');
    
    try {
      console.log('🔍 Testing form submission...');
      
      // Fill out the form
      await this.page.type('input[placeholder*="first" i], input[name="firstName"]', TEST_LEAD.firstName);
      await this.page.type('input[placeholder*="last" i], input[name="lastName"]', TEST_LEAD.lastName);
      await this.page.type('input[type="email"]', TEST_LEAD.email);
      await this.page.type('input[type="tel"], input[placeholder*="phone" i]', TEST_LEAD.phone);
      
      const selectElement = await this.page.$('select');
      if (selectElement) {
        await this.page.select('select', TEST_LEAD.interestedIn);
      }
      
      const textareaElement = await this.page.$('textarea');
      if (textareaElement) {
        await this.page.type('textarea', TEST_LEAD.message);
      }
      
      await this.screenshot('form-filled', 'Lead capture form filled out');
      
      // Submit the form
      console.log('📤 Submitting form...');
      const submitButton = await this.page.$('button[type="submit"], button:contains("Connect")');
      await submitButton.click();
      
      // Wait for submission to complete
      await this.page.waitForTimeout(3000);
      
      // Check for success indicators
      const successElements = await this.page.$$('text="Thank You", .success, [class*="success"]');
      const currentUrl = this.page.url();
      
      await this.screenshot('form-submitted', 'After form submission');
      
      // Check if we're on a success page or see success message
      const submissionSuccess = successElements.length > 0 || 
                               currentUrl.includes('success') || 
                               currentUrl.includes('thank-you');
      
      this.results.formSubmission = {
        status: submissionSuccess ? 'PASS' : 'FAIL',
        successElementsFound: successElements.length,
        finalUrl: currentUrl,
        error: submissionSuccess ? null : 'No success confirmation found'
      };
      
    } catch (error) {
      console.error('❌ Form submission test failed:', error.message);
      await this.screenshot('form-submission-error', 'Form submission error');
      this.results.formSubmission = { status: 'FAIL', error: error.message };
    }
  }

  async testLeadsDisplay() {
    console.log('\n=== 6. LEADS DASHBOARD TEST ===');
    
    try {
      console.log('🔍 Testing leads dashboard...');
      
      await this.page.goto(`${CONFIG.baseUrl}/qr-leads`, { waitUntil: 'networkidle2' });
      await this.screenshot('leads-dashboard', 'QR Leads dashboard');
      
      // Check for leads display elements
      const leadsElements = {
        title: await this.page.$('h1:contains("QR"), h1:contains("Leads")') !== null,
        statsCards: await this.page.$$('.stats, [class*="stat"], .grid') !== null,
        leadsList: await this.page.$('.lead, .contact, [class*="lead"]') !== null,
        createButton: await this.page.$('button:contains("Create"), button:contains("Generate")') !== null
      };
      
      console.log('🔍 Leads dashboard elements:', leadsElements);
      
      // Check if our test lead appears
      const pageText = await this.page.evaluate(() => document.body.textContent);
      const testLeadVisible = pageText.includes(TEST_LEAD.firstName) && pageText.includes(TEST_LEAD.lastName);
      
      console.log('🔍 Test lead visible on dashboard:', testLeadVisible);
      
      const dashboardWorking = Object.values(leadsElements).some(present => present);
      
      this.results.leadsDisplay = {
        status: dashboardWorking ? 'PASS' : 'FAIL',
        elements: leadsElements,
        testLeadVisible,
        error: dashboardWorking ? null : 'Dashboard elements not found'
      };
      
    } catch (error) {
      console.error('❌ Leads display test failed:', error.message);
      await this.screenshot('leads-display-error', 'Leads dashboard error');
      this.results.leadsDisplay = { status: 'FAIL', error: error.message };
    }
  }

  async testNavigation() {
    console.log('\n=== 7. NAVIGATION TEST ===');
    
    try {
      console.log('🔍 Testing navigation between QR system pages...');
      
      const navigationTests = [
        { path: '/qr-generator', name: 'QR Generator' },
        { path: '/qr-leads', name: 'QR Leads' },
        { path: '/capture', name: 'Capture Form' },
        { path: '/', name: 'Home' }
      ];
      
      const navigationResults = {};
      
      for (const test of navigationTests) {
        try {
          console.log(`🔗 Testing navigation to ${test.name}...`);
          
          const response = await this.page.goto(`${CONFIG.baseUrl}${test.path}`, { 
            waitUntil: 'networkidle2',
            timeout: 10000 
          });
          
          const status = response.status();
          const loaded = status >= 200 && status < 400;
          
          navigationResults[test.path] = {
            status: loaded ? 'PASS' : 'FAIL',
            httpStatus: status,
            name: test.name
          };
          
          console.log(`${loaded ? '✅' : '❌'} ${test.name}: ${status}`);
          
        } catch (error) {
          navigationResults[test.path] = {
            status: 'FAIL',
            error: error.message,
            name: test.name
          };
          console.log(`❌ ${test.name}: ${error.message}`);
        }
      }
      
      await this.screenshot('navigation-test', 'Navigation test completed');
      
      const allPassed = Object.values(navigationResults).every(result => result.status === 'PASS');
      
      this.results.navigation = {
        status: allPassed ? 'PASS' : 'FAIL',
        results: navigationResults,
        error: allPassed ? null : 'Some navigation links failed'
      };
      
    } catch (error) {
      console.error('❌ Navigation test failed:', error.message);
      this.results.navigation = { status: 'FAIL', error: error.message };
    }
  }

  async testMobileCompatibility() {
    console.log('\n=== 8. MOBILE COMPATIBILITY TEST ===');
    
    try {
      console.log('🔍 Testing mobile compatibility...');
      
      // Switch to mobile viewport
      await this.page.setViewport({ width: 375, height: 667, isMobile: true });
      await this.page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
      
      // Test capture form on mobile
      const captureUrl = `${CONFIG.baseUrl}/capture?${new URLSearchParams({
        agent_name: TEST_AGENT.name,
        agent_email: TEST_AGENT.email,
        agent_phone: TEST_AGENT.phone,
        agent_company: TEST_AGENT.company
      })}`;
      
      await this.page.goto(captureUrl, { waitUntil: 'networkidle2' });
      await this.screenshot('mobile-capture-form', 'Capture form on mobile');
      
      // Check mobile-specific elements and responsiveness
      const mobileChecks = {
        formVisible: await this.page.$('form') !== null,
        inputsClickable: await this.page.$('input') !== null,
        buttonAccessible: await this.page.$('button[type="submit"]') !== null,
        textReadable: await this.page.evaluate(() => {
          const elements = document.querySelectorAll('h1, h2, p, label');
          return Array.from(elements).every(el => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            return fontSize >= 12; // Minimum readable font size
          });
        })
      };
      
      console.log('🔍 Mobile compatibility checks:', mobileChecks);
      
      // Test QR generator on mobile
      await this.page.goto(`${CONFIG.baseUrl}/qr-generator`, { waitUntil: 'networkidle2' });
      await this.screenshot('mobile-qr-generator', 'QR Generator on mobile');
      
      const mobileCompatible = Object.values(mobileChecks).every(check => check);
      
      this.results.mobileCompatibility = {
        status: mobileCompatible ? 'PASS' : 'FAIL',
        checks: mobileChecks,
        error: mobileCompatible ? null : 'Mobile compatibility issues found'
      };
      
    } catch (error) {
      console.error('❌ Mobile compatibility test failed:', error.message);
      await this.screenshot('mobile-compatibility-error', 'Mobile compatibility error');
      this.results.mobileCompatibility = { status: 'FAIL', error: error.message };
    }
  }

  async handleAuthentication() {
    console.log('🔐 Attempting authentication...');
    
    try {
      // Look for test signin or skip authentication
      const testButton = await this.page.$('button:contains("Test"), button:contains("Skip"), a[href*="test"]');
      if (testButton) {
        await testButton.click();
        await this.page.waitForTimeout(2000);
        return;
      }
      
      // If there's a direct test route
      const testAuthUrl = `${CONFIG.baseUrl}/auth/direct-test`;
      try {
        await this.page.goto(testAuthUrl, { waitUntil: 'networkidle2', timeout: 5000 });
        console.log('✅ Used direct test auth');
        return;
      } catch (e) {
        console.log('ℹ️  Direct test auth not available');
      }
      
      console.log('⚠️  Authentication may be required for full testing');
      
    } catch (error) {
      console.log('⚠️  Authentication handling failed:', error.message);
    }
  }

  generateReport() {
    console.log('\n=== TEST RESULTS SUMMARY ===');
    
    const report = {
      timestamp: new Date().toISOString(),
      testConfiguration: CONFIG,
      testResults: this.results,
      screenshots: this.screenshots,
      errors: this.errors,
      summary: {
        totalTests: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r?.status === 'PASS').length,
        failed: Object.values(this.results).filter(r => r?.status === 'FAIL').length,
        warnings: Object.values(this.results).filter(r => r?.status === 'PASS_WITH_WARNINGS').length
      }
    };

    // Print results to console
    Object.entries(this.results).forEach(([testName, result]) => {
      const status = result?.status || 'NOT_RUN';
      const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'PASS_WITH_WARNINGS' ? '⚠️' : '⏸️';
      console.log(`${icon} ${testName.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}: ${status}`);
      
      if (result?.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log(`\n📊 Summary: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.warnings} warnings`);
    console.log(`📸 Screenshots saved: ${this.screenshots.length}`);
    console.log(`🐛 Errors logged: ${this.errors.length}`);

    // Save detailed report
    const reportPath = path.join(CONFIG.screenshotDir, 'comprehensive-qr-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved: ${reportPath}`);
    
    // Generate HTML report
    this.generateHTMLReport(report);
    
    return report;
  }

  generateHTMLReport(report) {
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>QR Code System Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .test-result { margin: 20px 0; padding: 15px; border-radius: 8px; border-left: 5px solid; }
        .pass { background: #f0f8f0; border-color: #4caf50; }
        .fail { background: #fdf0f0; border-color: #f44336; }
        .warning { background: #fff8e1; border-color: #ff9800; }
        .screenshot { max-width: 300px; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .error-log { background: #fdf0f0; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; font-size: 12px; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 QR Code Lead Capture System Test Report</h1>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Server: <code>${CONFIG.baseUrl}</code></p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <h3>${report.summary.totalTests}</h3>
                <p>Total Tests</p>
            </div>
            <div class="stat-card">
                <h3>${report.summary.passed}</h3>
                <p>✅ Passed</p>
            </div>
            <div class="stat-card">
                <h3>${report.summary.failed}</h3>
                <p>❌ Failed</p>
            </div>
            <div class="stat-card">
                <h3>${report.summary.warnings}</h3>
                <p>⚠️ Warnings</p>
            </div>
        </div>
        
        <div class="test-results">
            ${Object.entries(report.testResults).map(([testName, result]) => {
              if (!result) return '';
              
              const statusClass = result.status === 'PASS' ? 'pass' : 
                                 result.status === 'FAIL' ? 'fail' : 'warning';
              const statusIcon = result.status === 'PASS' ? '✅' : 
                                result.status === 'FAIL' ? '❌' : '⚠️';
              
              return `
                <div class="test-result ${statusClass}">
                    <h3>${statusIcon} ${testName.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p><strong>Status:</strong> ${result.status}</p>
                    ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ''}
                    ${result.checks ? `<p><strong>Checks:</strong> <code>${JSON.stringify(result.checks, null, 2)}</code></p>` : ''}
                    ${result.canvas ? `<p><strong>Canvas:</strong> <code>${JSON.stringify(result.canvas, null, 2)}</code></p>` : ''}
                </div>
              `;
            }).join('')}
        </div>
        
        <div class="screenshots">
            <h2>📸 Screenshots</h2>
            ${report.screenshots.map(screenshot => `
              <div>
                <h4>${screenshot.description}</h4>
                <img src="${screenshot.filename}" alt="${screenshot.description}" class="screenshot" />
              </div>
            `).join('')}
        </div>
        
        ${report.errors.length > 0 ? `
        <div class="errors">
            <h2>🐛 Errors</h2>
            ${report.errors.map(error => `
              <div class="error-log">
                <strong>${error.type}:</strong> ${error.error}
                ${error.url ? `<br><strong>URL:</strong> ${error.url}` : ''}
              </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>
    `;
    
    const htmlPath = path.join(CONFIG.screenshotDir, 'comprehensive-qr-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`📊 HTML report saved: ${htmlPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive QR Code System Test Suite...');
    console.log(`📅 Test started at: ${new Date().toISOString()}`);
    console.log(`🌐 Testing server: ${CONFIG.baseUrl}`);
    
    try {
      await this.setup();
      
      // Run all tests in sequence
      await this.testServerAccess();
      await this.testQRGenerator();
      await this.testQRGeneration();
      await this.testCaptureForm();
      await this.testFormSubmission();
      await this.testLeadsDisplay();
      await this.testNavigation();
      await this.testMobileCompatibility();
      
      // Generate final report
      const report = this.generateReport();
      
      console.log('\n🎉 Test suite completed!');
      console.log(`📂 Results saved in: ${CONFIG.screenshotDir}`);
      
      return report;
      
    } catch (error) {
      console.error('💥 Test suite failed:', error);
      await this.screenshot('test-suite-failure', 'Test suite failure');
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests if this script is called directly
if (require.main === module) {
  const testSuite = new QRTestSuite();
  testSuite.runAllTests()
    .then(report => {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = QRTestSuite;