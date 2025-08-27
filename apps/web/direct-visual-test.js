const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testInfiniteRealtyHub() {
    console.log('🚀 Starting Direct Visual Test of Infinite Realty Hub at http://localhost:3000');
    
    const results = {
        timestamp: new Date().toISOString(),
        baseUrl: 'http://localhost:3000',
        tests: []
    };

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1280, height: 720 }
        });
        
        const page = await browser.newPage();
        
        // Monitor console and network
        const consoleMessages = [];
        const networkErrors = [];
        
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
            });
            if (msg.type() === 'error') {
                console.log(`❌ Console Error: ${msg.text()}`);
            }
        });
        
        page.on('response', response => {
            if (!response.ok() && response.status() !== 304) {
                networkErrors.push({
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
                console.log(`🌐 Network Error: ${response.status()} ${response.url()}`);
            }
        });

        // Test each page
        const testPages = [
            { path: '/', name: 'Home Page' },
            { path: '/auth/signin', name: 'Sign In' },
            { path: '/dashboard', name: 'Dashboard' },
            { path: '/contacts', name: 'Contacts' },
            { path: '/pipeline', name: 'Pipeline' }, 
            { path: '/qr-generator', name: 'QR Generator' },
            { path: '/newsletter', name: 'Newsletter' },
            { path: '/team', name: 'Team' },
            { path: '/market-test', name: 'Market Test' }
        ];

        for (const testPage of testPages) {
            console.log(`\n🧪 Testing: ${testPage.name}`);
            const url = `http://localhost:3000${testPage.path}`;
            
            const testResult = {
                name: testPage.name,
                url: url,
                status: 'unknown',
                loadTime: 0,
                errors: [],
                userVisibleIssues: [],
                screenshot: ''
            };

            try {
                const startTime = Date.now();
                
                // Navigate to page
                const response = await page.goto(url, { 
                    waitUntil: 'networkidle0',
                    timeout: 15000 
                });
                
                testResult.loadTime = Date.now() - startTime;
                
                if (!response.ok()) {
                    testResult.status = 'failed';
                    testResult.errors.push(`HTTP ${response.status()}: ${response.statusText()}`);
                    console.log(`❌ Failed to load: HTTP ${response.status()}`);
                    continue;
                }

                // Wait for content to load
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Take screenshot
                const screenshotName = `${testPage.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
                const screenshotPath = `./test-screenshots/${screenshotName}`;
                await page.screenshot({ 
                    path: screenshotPath, 
                    fullPage: true 
                });
                testResult.screenshot = screenshotPath;

                // Check for user-visible error messages
                const errorMessages = await page.evaluate(() => {
                    const errors = [];
                    
                    // Look for common error text patterns
                    const errorTexts = [
                        'Failed to fetch market data',
                        'Error loading contacts',
                        'Unable to load',
                        'Something went wrong',
                        'Error:',
                        'Failed to'
                    ];
                    
                    errorTexts.forEach(errorText => {
                        const elements = document.evaluate(
                            `//*[contains(text(), "${errorText}")]`,
                            document,
                            null,
                            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                            null
                        );
                        
                        if (elements.snapshotLength > 0) {
                            for (let i = 0; i < elements.snapshotLength; i++) {
                                const element = elements.snapshotItem(i);
                                if (element.offsetParent !== null) { // Element is visible
                                    errors.push({
                                        text: errorText,
                                        fullText: element.textContent.trim(),
                                        tagName: element.tagName
                                    });
                                }
                            }
                        }
                    });
                    
                    return errors;
                });

                testResult.userVisibleIssues = errorMessages;

                // Check for loading states that might be stuck
                const stuckLoading = await page.evaluate(() => {
                    const loadingElements = document.querySelectorAll(
                        '[data-loading="true"], .loading, .spinner, [class*="loading"], [class*="spinner"]'
                    );
                    return Array.from(loadingElements)
                        .filter(el => el.offsetParent !== null)
                        .map(el => ({
                            tagName: el.tagName,
                            className: el.className,
                            textContent: el.textContent.trim().substring(0, 50)
                        }));
                });

                if (stuckLoading.length > 0) {
                    testResult.userVisibleIssues.push({
                        text: 'Stuck loading state',
                        details: `Found ${stuckLoading.length} loading elements`,
                        elements: stuckLoading
                    });
                }

                // Determine status
                if (errorMessages.length > 0 || stuckLoading.length > 0) {
                    testResult.status = 'failed';
                    console.log(`❌ ${testPage.name}: Found ${errorMessages.length} errors, ${stuckLoading.length} loading issues`);
                } else {
                    testResult.status = 'passed';
                    console.log(`✅ ${testPage.name}: No visible errors detected`);
                }

            } catch (error) {
                testResult.status = 'error';
                testResult.errors.push(error.message);
                console.log(`💥 ${testPage.name}: Test error - ${error.message}`);
            }

            results.tests.push(testResult);
        }

        // Generate summary
        const passed = results.tests.filter(t => t.status === 'passed').length;
        const failed = results.tests.filter(t => t.status === 'failed').length;
        const errors = results.tests.filter(t => t.status === 'error').length;

        console.log('\n📊 VISUAL TEST SUMMARY');
        console.log('======================');
        console.log(`Total Pages: ${results.tests.length}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Errors: ${errors}`);

        // Show critical findings
        const failedTests = results.tests.filter(t => t.status === 'failed');
        if (failedTests.length > 0) {
            console.log('\n🚨 PAGES WITH ISSUES:');
            failedTests.forEach(test => {
                console.log(`\n❌ ${test.name} (${test.url}):`);
                test.userVisibleIssues.forEach(issue => {
                    console.log(`   • ${issue.text || issue}`);
                    if (issue.fullText) {
                        console.log(`     Full text: ${issue.fullText.substring(0, 100)}...`);
                    }
                });
            });
        }

        // Save detailed report
        fs.writeFileSync('./test-screenshots/direct-visual-test-results.json', 
                         JSON.stringify(results, null, 2));
        console.log('\n📁 Detailed results saved to: ./test-screenshots/direct-visual-test-results.json');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testInfiniteRealtyHub().catch(console.error);