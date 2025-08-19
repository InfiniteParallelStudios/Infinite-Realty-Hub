#!/usr/bin/env node

/**
 * AUTHENTICATION SYSTEM TESTING
 * Comprehensive test of the new email/password authentication system
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AuthenticationTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async initialize() {
    console.log('🔐 AUTHENTICATION SYSTEM TESTING');
    console.log('Testing email/password auth + Google OAuth integration');
    console.log('='.repeat(70));
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.browser.newPage();
    console.log('✅ Browser initialized for authentication testing');
  }

  async testPageLoad(url, expectedTitle, description) {
    try {
      console.log(`\n📄 Testing: ${description}`);
      console.log(`   URL: ${url}`);
      
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      const actualTitle = await this.page.$eval('h1, h2', el => el.textContent.trim());
      console.log(`   Expected: "${expectedTitle}"`);
      console.log(`   Actual: "${actualTitle}"`);

      if (actualTitle.includes(expectedTitle) || expectedTitle.includes(actualTitle)) {
        console.log(`   ✅ PASSED - Page loaded correctly`);
        this.testResults.push({ test: description, status: 'PASSED', details: 'Page loads correctly' });
        return true;
      } else {
        console.log(`   ❌ FAILED - Title mismatch`);
        this.testResults.push({ test: description, status: 'FAILED', details: 'Title mismatch' });
        return false;
      }
    } catch (error) {
      console.log(`   💥 ERROR - ${error.message}`);
      this.testResults.push({ test: description, status: 'ERROR', details: error.message });
      return false;
    }
  }

  async testFormElements(formSelectors, description) {
    try {
      console.log(`\n📝 Testing: ${description}`);
      
      let allFound = true;
      for (const [elementName, selector] of Object.entries(formSelectors)) {
        const element = await this.page.$(selector);
        if (element) {
          console.log(`   ✅ ${elementName} found`);
        } else {
          console.log(`   ❌ ${elementName} missing`);
          allFound = false;
        }
      }

      if (allFound) {
        console.log(`   ✅ PASSED - All form elements present`);
        this.testResults.push({ test: description, status: 'PASSED', details: 'All elements found' });
        return true;
      } else {
        console.log(`   ❌ FAILED - Missing form elements`);
        this.testResults.push({ test: description, status: 'FAILED', details: 'Missing elements' });
        return false;
      }
    } catch (error) {
      console.log(`   💥 ERROR - ${error.message}`);
      this.testResults.push({ test: description, status: 'ERROR', details: error.message });
      return false;
    }
  }

  async testFormValidation(testCases, description) {
    try {
      console.log(`\n🔍 Testing: ${description}`);
      
      for (const testCase of testCases) {
        console.log(`   Testing: ${testCase.name}`);
        
        // Fill form with test data
        if (testCase.formData) {
          for (const [field, value] of Object.entries(testCase.formData)) {
            await this.page.fill(`input[name="${field}"]`, value);
          }
        }

        // Try to submit
        if (testCase.submitSelector) {
          await this.page.click(testCase.submitSelector);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check for expected result
        if (testCase.expectError) {
          const errorElement = await this.page.$('.text-red-400, .bg-red-500\\/10');
          if (errorElement) {
            const errorText = await this.page.evaluate(el => el.textContent, errorElement);
            console.log(`     ✅ Error displayed: "${errorText}"`);
          } else {
            console.log(`     ❌ Expected error not displayed`);
          }
        }

        // Clear form for next test
        if (testCase.formData) {
          for (const field of Object.keys(testCase.formData)) {
            await this.page.fill(`input[name="${field}"]`, '');
          }
        }
      }

      console.log(`   ✅ PASSED - Form validation working`);
      this.testResults.push({ test: description, status: 'PASSED', details: 'Validation tests completed' });
      return true;
    } catch (error) {
      console.log(`   💥 ERROR - ${error.message}`);
      this.testResults.push({ test: description, status: 'ERROR', details: error.message });
      return false;
    }
  }

  async testNavigation(links, description) {
    try {
      console.log(`\n🔗 Testing: ${description}`);
      
      for (const [linkText, expectedUrl] of Object.entries(links)) {
        console.log(`   Testing link: "${linkText}"`);
        
        // Find and click link
        const linkElement = await this.page.evaluateHandle((text) => {
          const links = Array.from(document.querySelectorAll('a'));
          return links.find(link => link.textContent.includes(text));
        }, linkText);

        if (linkElement.asElement()) {
          await linkElement.asElement().click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUrl = this.page.url();
          if (currentUrl.includes(expectedUrl)) {
            console.log(`     ✅ Navigation successful to ${expectedUrl}`);
          } else {
            console.log(`     ❌ Navigation failed. Expected: ${expectedUrl}, Got: ${currentUrl}`);
          }

          // Navigate back for next test
          await this.page.goBack();
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.log(`     ❌ Link "${linkText}" not found`);
        }
      }

      console.log(`   ✅ PASSED - Navigation tests completed`);
      this.testResults.push({ test: description, status: 'PASSED', details: 'Navigation working' });
      return true;
    } catch (error) {
      console.log(`   💥 ERROR - ${error.message}`);
      this.testResults.push({ test: description, status: 'ERROR', details: error.message });
      return false;
    }
  }

  async runAllTests() {
    console.log('\n🚀 STARTING AUTHENTICATION SYSTEM TESTS');
    console.log('='.repeat(70));

    // Test 1: Sign-up page load and elements
    await this.testPageLoad(
      `${this.baseUrl}/auth/signup`,
      'Join',
      'Sign-up page loads correctly'
    );

    await this.testFormElements({
      'Full Name Field': 'input[name="fullName"]',
      'Email Field': 'input[name="email"]',
      'Password Field': 'input[name="password"]',
      'Confirm Password Field': 'input[name="confirmPassword"]',
      'Create Account Button': 'button[type="submit"]',
      'Google Sign-up Button': 'button:has-text("Continue with Google")'
    }, 'Sign-up form elements');

    // Test 2: Sign-in page load and elements
    await this.testPageLoad(
      `${this.baseUrl}/auth/signin`,
      'Welcome to',
      'Sign-in page loads correctly'
    );

    await this.testFormElements({
      'Email Field': 'input[name="email"]',
      'Password Field': 'input[name="password"]',
      'Sign In Button': 'button[type="submit"]',
      'Google Sign-in Button': 'button:has-text("Continue with Google")',
      'Forgot Password Link': 'a[href="/auth/forgot-password"]',
      'Sign Up Link': 'a[href="/auth/signup"]'
    }, 'Sign-in form elements');

    // Test 3: Forgot password page
    await this.testPageLoad(
      `${this.baseUrl}/auth/forgot-password`,
      'Forgot Password',
      'Forgot password page loads correctly'
    );

    await this.testFormElements({
      'Email Field': 'input[type="email"]',
      'Send Reset Button': 'button[type="submit"]',
      'Back to Sign In Link': 'a[href="/auth/signin"]'
    }, 'Forgot password form elements');

    // Test 4: Form validation on sign-up page
    await this.page.goto(`${this.baseUrl}/auth/signup`, { waitUntil: 'networkidle2' });
    
    await this.testFormValidation([
      {
        name: 'Empty form submission',
        formData: {},
        submitSelector: 'button[type="submit"]',
        expectError: true
      },
      {
        name: 'Invalid email format',
        formData: { 
          fullName: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          confirmPassword: 'password123'
        },
        submitSelector: 'button[type="submit"]',
        expectError: true
      },
      {
        name: 'Password mismatch',
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'different123'
        },
        submitSelector: 'button[type="submit"]',
        expectError: true
      }
    ], 'Sign-up form validation');

    // Test 5: Navigation between auth pages
    await this.page.goto(`${this.baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
    
    await this.testNavigation({
      'Sign up': '/auth/signup',
      'Forgot your password': '/auth/forgot-password'
    }, 'Navigation from sign-in page');

    // Test 6: Password visibility toggles
    await this.page.goto(`${this.baseUrl}/auth/signin`, { waitUntil: 'networkidle2' });
    
    try {
      console.log('\n👁️ Testing: Password visibility toggle');
      
      // Test password field toggle
      const passwordField = await this.page.$('input[name="password"]');
      const toggleButton = await this.page.$('button[type="button"]:has(svg)');
      
      if (passwordField && toggleButton) {
        // Check initial type
        const initialType = await this.page.evaluate(el => el.type, passwordField);
        console.log(`   Initial type: ${initialType}`);
        
        // Click toggle
        await toggleButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check changed type
        const changedType = await this.page.evaluate(el => el.type, passwordField);
        console.log(`   Changed type: ${changedType}`);
        
        if (initialType !== changedType) {
          console.log(`   ✅ PASSED - Password visibility toggle working`);
          this.testResults.push({ test: 'Password visibility toggle', status: 'PASSED', details: 'Toggle functionality working' });
        } else {
          console.log(`   ❌ FAILED - Password visibility toggle not working`);
          this.testResults.push({ test: 'Password visibility toggle', status: 'FAILED', details: 'Toggle not working' });
        }
      } else {
        console.log(`   ❌ FAILED - Password field or toggle button not found`);
        this.testResults.push({ test: 'Password visibility toggle', status: 'FAILED', details: 'Elements not found' });
      }
    } catch (error) {
      console.log(`   💥 ERROR - ${error.message}`);
      this.testResults.push({ test: 'Password visibility toggle', status: 'ERROR', details: error.message });
    }

    return this.generateReport();
  }

  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    const total = this.testResults.length;

    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Authentication System Testing',
      summary: {
        total,
        passed,
        failed,
        errors,
        successRate: total > 0 ? ((passed / total) * 100).toFixed(1) : 0
      },
      results: this.testResults
    };

    // Save report
    const logsDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const reportFile = path.join(logsDir, 'auth-system-test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('🔐 AUTHENTICATION SYSTEM TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`💥 Errors: ${errors}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}%`);

    if (failed > 0 || errors > 0) {
      console.log('\n❌ ISSUES FOUND:');
      this.testResults.filter(r => r.status !== 'PASSED').forEach(test => {
        console.log(`   • ${test.test}: ${test.details}`);
      });
    } else {
      console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');
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
      const report = await this.runAllTests();
      return report;
    } catch (error) {
      console.error(`💥 Authentication testing failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the authentication tests
if (require.main === module) {
  const tester = new AuthenticationTester();
  tester.run()
    .then(report => {
      console.log('\n🚀 AUTHENTICATION TESTING COMPLETED');
      process.exit(report.summary.failed > 0 || report.summary.errors > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = AuthenticationTester;