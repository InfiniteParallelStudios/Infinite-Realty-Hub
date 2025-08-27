const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class InfiniteRealtyHubTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'http://localhost:3000';
        this.testResults = {
            timestamp: new Date().toISOString(),
            testType: 'Comprehensive Visual Testing',
            summary: {
                totalPagesTest: 0,
                passedTests: 0,
                failedTests: 0,
                criticalErrors: 0
            },
            detailedResults: []
        };
        this.screenshotDir = './test-screenshots';
    }

    async initialize() {
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }

        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1280, height: 720 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();

        // Enable console and network monitoring
        this.page.on('console', msg => this.logConsoleMessage(msg));
        this.page.on('response', response => this.logNetworkResponse(response));
        this.page.on('pageerror', error => this.logPageError(error));
    }

    logConsoleMessage(msg) {
        const message = {
            type: msg.type(),
            text: msg.text(),
            url: this.page.url(),
            timestamp: new Date().toISOString()
        };
        
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log(`Console ${msg.type()}: ${msg.text()} at ${this.page.url()}`);
        }
    }

    async logNetworkResponse(response) {
        if (!response.ok() && response.status() !== 304) {
            console.log(`Network Error: ${response.status()} ${response.url()}`);
        }
    }

    logPageError(error) {
        console.log(`Page Error: ${error.message} at ${this.page.url()}`);
    }

    async testPage(pagePath, testName, specificTests = []) {
        const fullUrl = `${this.baseUrl}${pagePath}`;
        console.log(`\n🧪 Testing: ${testName} (${fullUrl})`);
        
        const pageResult = {
            testName,
            url: fullUrl,
            status: 'pending',
            loadTime: 0,
            screenshotPath: '',
            consoleErrors: [],
            networkErrors: [],
            visualErrors: [],
            specificTestResults: [],
            userVisibleErrors: []
        };

        try {
            const startTime = Date.now();

            // Navigate to page
            const response = await this.page.goto(fullUrl, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            pageResult.loadTime = Date.now() - startTime;

            // Check if page loaded successfully
            if (!response || !response.ok()) {
                pageResult.status = 'failed';
                pageResult.visualErrors.push(`Page failed to load: ${response?.status()} ${response?.statusText()}`);
                this.testResults.summary.failedTests++;
                this.testResults.summary.criticalErrors++;
                return pageResult;
            }

            // Wait for page to stabilize
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Take screenshot
            const screenshotName = `${testName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
            const screenshotPath = path.join(this.screenshotDir, screenshotName);
            await this.page.screenshot({ path: screenshotPath, fullPage: true });
            pageResult.screenshotPath = screenshotPath;

            // Check for user-visible error messages
            await this.checkForUserVisibleErrors(pageResult);

            // Run specific tests if provided
            for (const test of specificTests) {
                try {
                    const result = await test(this.page);
                    pageResult.specificTestResults.push(result);
                } catch (error) {
                    pageResult.specificTestResults.push({
                        name: test.name,
                        status: 'failed',
                        error: error.message
                    });
                }
            }

            // Check console for errors
            const consoleErrors = await this.page.evaluate(() => {
                return window.consoleErrors || [];
            });
            pageResult.consoleErrors = consoleErrors;

            // Determine overall status
            const hasErrors = pageResult.consoleErrors.length > 0 || 
                             pageResult.networkErrors.length > 0 || 
                             pageResult.visualErrors.length > 0 ||
                             pageResult.userVisibleErrors.length > 0;

            pageResult.status = hasErrors ? 'failed' : 'passed';
            
            if (pageResult.status === 'passed') {
                this.testResults.summary.passedTests++;
                console.log(`✅ ${testName}: PASSED`);
            } else {
                this.testResults.summary.failedTests++;
                console.log(`❌ ${testName}: FAILED`);
                
                // Log specific issues
                if (pageResult.userVisibleErrors.length > 0) {
                    console.log(`   User-visible errors: ${pageResult.userVisibleErrors.length}`);
                    pageResult.userVisibleErrors.forEach(error => console.log(`     - ${error}`));
                }
                if (pageResult.consoleErrors.length > 0) {
                    console.log(`   Console errors: ${pageResult.consoleErrors.length}`);
                }
                if (pageResult.networkErrors.length > 0) {
                    console.log(`   Network errors: ${pageResult.networkErrors.length}`);
                }
            }

        } catch (error) {
            pageResult.status = 'failed';
            pageResult.visualErrors.push(`Test execution error: ${error.message}`);
            this.testResults.summary.failedTests++;
            this.testResults.summary.criticalErrors++;
            console.log(`❌ ${testName}: CRITICAL ERROR - ${error.message}`);
        }

        this.testResults.summary.totalPagesTest++;
        this.testResults.detailedResults.push(pageResult);
        return pageResult;
    }

    async checkForUserVisibleErrors(pageResult) {
        // Check for common error messages that users would see
        const errorSelectors = [
            'text/Failed to fetch market data',
            'text/Error loading contacts', 
            'text/Unable to load',
            'text/Something went wrong',
            'text/Error:',
            '.error-message',
            '.alert-error',
            '[data-error="true"]'
        ];

        for (const selector of errorSelectors) {
            try {
                const elements = await this.page.$$eval(`text/${selector.replace('text/', '')}`, els => els.length);
                if (elements > 0) {
                    pageResult.userVisibleErrors.push(`Found user-visible error: "${selector}"`);
                }
            } catch (e) {
                // Element not found - this is good
            }
        }

        // Check for loading states that might be stuck
        try {
            const loadingElements = await this.page.$$eval('[data-loading="true"], .loading, .spinner', els => els.length);
            if (loadingElements > 0) {
                // Wait a bit more to see if loading completes
                await new Promise(resolve => setTimeout(resolve, 3000));
                const stillLoading = await this.page.$$eval('[data-loading="true"], .loading, .spinner', els => els.length);
                if (stillLoading > 0) {
                    pageResult.userVisibleErrors.push(`Page appears to be stuck in loading state (${stillLoading} loading elements)`);
                }
            }
        } catch (e) {
            // No loading elements found
        }
    }

    // Specific test functions
    async testAuthentication(page) {
        const elements = await page.$$eval('button, a', els => 
            els.filter(el => 
                el.textContent.toLowerCase().includes('sign') ||
                el.textContent.toLowerCase().includes('login') ||
                el.textContent.toLowerCase().includes('auth')
            ).length
        );
        
        return {
            name: 'Authentication Elements',
            status: elements > 0 ? 'passed' : 'failed',
            details: `Found ${elements} authentication-related elements`
        };
    }

    async testNavigation(page) {
        const navElements = await page.$$eval('nav, .navigation, [role="navigation"]', els => els.length);
        const bottomNav = await page.$$eval('.bottom-navigation, [data-bottom-nav]', els => els.length);
        
        return {
            name: 'Navigation Elements',
            status: (navElements > 0 || bottomNav > 0) ? 'passed' : 'failed',
            details: `Found ${navElements} nav elements and ${bottomNav} bottom nav elements`
        };
    }

    async testMarketData(page) {
        // Look for market data components
        const marketElements = await page.$$eval('[data-testid*="market"], .market-data, .market-widget', els => els.length);
        
        return {
            name: 'Market Data Components',
            status: 'completed',
            details: `Found ${marketElements} market data elements`
        };
    }

    async testContactSystem(page) {
        const contactElements = await page.$$eval('.contact, [data-contact], .crm', els => els.length);
        
        return {
            name: 'Contact System',
            status: 'completed', 
            details: `Found ${contactElements} contact-related elements`
        };
    }

    async runComprehensiveTest() {
        console.log('🚀 Starting Comprehensive Visual Testing of Infinite Realty Hub');
        console.log(`Base URL: ${this.baseUrl}`);
        
        await this.initialize();

        // Define test cases
        const testCases = [
            {
                path: '/',
                name: 'Home Page',
                tests: [this.testNavigation, this.testAuthentication]
            },
            {
                path: '/auth/signin',
                name: 'Sign In Page',
                tests: [this.testAuthentication]
            },
            {
                path: '/dashboard',
                name: 'Dashboard',
                tests: [this.testNavigation, this.testMarketData]
            },
            {
                path: '/contacts',
                name: 'Contacts Page',
                tests: [this.testNavigation, this.testContactSystem]
            },
            {
                path: '/pipeline',
                name: 'Pipeline Page',
                tests: [this.testNavigation]
            },
            {
                path: '/qr-generator',
                name: 'QR Generator',
                tests: [this.testNavigation]
            },
            {
                path: '/newsletter',
                name: 'Newsletter Page',
                tests: [this.testNavigation]
            },
            {
                path: '/team',
                name: 'Team Page',
                tests: [this.testNavigation]
            },
            {
                path: '/market-test',
                name: 'Market Test Page',
                tests: [this.testMarketData]
            }
        ];

        // Run all tests
        for (const testCase of testCases) {
            await this.testPage(testCase.path, testCase.name, testCase.tests);
        }

        await this.browser.close();

        // Generate final report
        this.generateReport();
    }

    generateReport() {
        const reportPath = path.join(this.screenshotDir, 'comprehensive-visual-test-report.json');
        const htmlReportPath = path.join(this.screenshotDir, 'comprehensive-visual-test-report.html');
        
        // Save JSON report
        fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));

        // Generate HTML report
        const htmlContent = this.generateHTMLReport();
        fs.writeFileSync(htmlReportPath, htmlContent);

        console.log('\n📊 TEST SUMMARY');
        console.log('================');
        console.log(`Total Pages Tested: ${this.testResults.summary.totalPagesTest}`);
        console.log(`Passed: ${this.testResults.summary.passedTests}`);
        console.log(`Failed: ${this.testResults.summary.failedTests}`);
        console.log(`Critical Errors: ${this.testResults.summary.criticalErrors}`);
        console.log(`\n📁 Reports saved:`);
        console.log(`JSON: ${reportPath}`);
        console.log(`HTML: ${htmlReportPath}`);

        // Show critical findings
        const criticalIssues = this.testResults.detailedResults
            .filter(result => result.status === 'failed')
            .map(result => ({
                page: result.testName,
                userErrors: result.userVisibleErrors,
                loadTime: result.loadTime
            }));

        if (criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL FINDINGS:');
            criticalIssues.forEach(issue => {
                console.log(`\n❌ ${issue.page}:`);
                if (issue.userErrors.length > 0) {
                    issue.userErrors.forEach(error => console.log(`   - ${error}`));
                }
                console.log(`   Load Time: ${issue.loadTime}ms`);
            });
        }
    }

    generateHTMLReport() {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Infinite Realty Hub - Visual Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .test-result { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .test-result.passed { border-left: 4px solid #28a745; }
        .test-result.failed { border-left: 4px solid #dc3545; }
        .screenshot { max-width: 200px; border-radius: 4px; }
        .error-list { background: #f8d7da; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .success-list { background: #d4edda; padding: 10px; border-radius: 4px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Infinite Realty Hub - Visual Test Report</h1>
            <p>Generated: ${this.testResults.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${this.testResults.summary.totalPagesTest}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value passed">${this.testResults.summary.passedTests}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value failed">${this.testResults.summary.failedTests}</div>
            </div>
            <div class="summary-card">
                <h3>Critical</h3>
                <div class="value failed">${this.testResults.summary.criticalErrors}</div>
            </div>
        </div>

        ${this.testResults.detailedResults.map(result => `
            <div class="test-result ${result.status}">
                <h2>${result.testName} ${result.status === 'passed' ? '✅' : '❌'}</h2>
                <p><strong>URL:</strong> ${result.url}</p>
                <p><strong>Load Time:</strong> ${result.loadTime}ms</p>
                
                ${result.userVisibleErrors.length > 0 ? `
                    <div class="error-list">
                        <strong>User-Visible Errors:</strong>
                        <ul>${result.userVisibleErrors.map(error => `<li>${error}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                
                ${result.specificTestResults.length > 0 ? `
                    <div class="success-list">
                        <strong>Specific Test Results:</strong>
                        <ul>${result.specificTestResults.map(test => `<li>${test.name}: ${test.status} - ${test.details}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                
                ${result.screenshotPath ? `
                    <p><strong>Screenshot:</strong></p>
                    <img src="${result.screenshotPath}" alt="Screenshot" class="screenshot" />
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
    }
}

// Run the comprehensive test
const tester = new InfiniteRealtyHubTester();
tester.runComprehensiveTest().catch(console.error);