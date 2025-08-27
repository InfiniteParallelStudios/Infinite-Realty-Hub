const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

async function comprehensiveMarketErrorTest() {
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    const testResults = {
        timestamp: new Date().toISOString(),
        pages: [],
        consoleErrors: [],
        networkErrors: [],
        screenshots: []
    };

    // Listen for console messages
    page.on('console', msg => {
        if (msg.type() === 'error') {
            testResults.consoleErrors.push({
                page: page.url(),
                message: msg.text(),
                timestamp: new Date().toISOString()
            });
            console.log(`CONSOLE ERROR on ${page.url()}: ${msg.text()}`);
        }
    });

    // Listen for network failures
    page.on('response', response => {
        if (!response.ok() && (response.status() >= 400)) {
            testResults.networkErrors.push({
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                page: page.url(),
                timestamp: new Date().toISOString()
            });
            console.log(`NETWORK ERROR: ${response.status()} ${response.statusText()} - ${response.url()}`);
        }
    });

    const baseUrl = 'http://localhost:3000';
    const pagesToTest = [
        { path: '/newsletter', name: 'Newsletter' },
        { path: '/market-test', name: 'Market Test' },
        { path: '/dashboard', name: 'Dashboard' }
    ];

    for (const pageInfo of pagesToTest) {
        try {
            console.log(`\n=== TESTING ${pageInfo.name.toUpperCase()} PAGE ===`);
            const fullUrl = `${baseUrl}${pageInfo.path}`;
            
            // Navigate to page
            await page.goto(fullUrl, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000); // Allow time for dynamic content to load

            const pageResult = {
                name: pageInfo.name,
                path: pageInfo.path,
                url: fullUrl,
                timestamp: new Date().toISOString(),
                errors: [],
                marketWidgetStatus: null,
                visibleText: null,
                screenshots: []
            };

            // Take initial screenshot
            const screenshotPath = `test-screenshots/market-error-test-${pageInfo.name.toLowerCase()}-${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            pageResult.screenshots.push(screenshotPath);
            console.log(`Screenshot saved: ${screenshotPath}`);

            // Check for specific error messages
            const errorMessages = [
                'failed to fetch market data',
                'error loading contacts',
                'Error:',
                'Failed to',
                'Cannot',
                'undefined',
                'null'
            ];

            for (const errorMsg of errorMessages) {
                try {
                    const elements = await page.locator(`text=${errorMsg}`).all();
                    if (elements.length > 0) {
                        for (let i = 0; i < elements.length; i++) {
                            const text = await elements[i].textContent();
                            pageResult.errors.push({
                                type: 'visible_error',
                                message: text,
                                searchTerm: errorMsg
                            });
                            console.log(`Found error message: "${text}"`);
                        }
                    }
                } catch (e) {
                    // Continue if locator fails
                }
            }

            // Check market widget status specifically
            try {
                const marketWidgets = await page.locator('[class*="market"], [data-testid*="market"], [id*="market"]').all();
                if (marketWidgets.length > 0) {
                    pageResult.marketWidgetStatus = `Found ${marketWidgets.length} market widget(s)`;
                    for (let i = 0; i < marketWidgets.length; i++) {
                        const widgetText = await marketWidgets[i].textContent();
                        console.log(`Market widget ${i + 1} text:`, widgetText?.substring(0, 200));
                        
                        if (widgetText?.includes('failed to fetch') || widgetText?.includes('error')) {
                            pageResult.errors.push({
                                type: 'market_widget_error',
                                message: widgetText
                            });
                        }
                    }
                } else {
                    pageResult.marketWidgetStatus = 'No market widgets found';
                }
            } catch (e) {
                pageResult.marketWidgetStatus = `Error checking market widgets: ${e.message}`;
            }

            // Get all visible text to analyze
            try {
                const bodyText = await page.locator('body').textContent();
                pageResult.visibleText = bodyText?.substring(0, 2000); // First 2000 chars
            } catch (e) {
                pageResult.visibleText = `Error getting page text: ${e.message}`;
            }

            // Test specific functionality per page
            if (pageInfo.path === '/newsletter') {
                console.log('Testing Newsletter page functionality...');
                
                // Check for Generate Newsletter button
                try {
                    const generateBtn = page.locator('button').filter({ hasText: /generate newsletter/i });
                    if (await generateBtn.count() > 0) {
                        console.log('Found Generate Newsletter button');
                        // Don't click it to avoid side effects, just record its presence
                        pageResult.generateButtonFound = true;
                    } else {
                        pageResult.generateButtonFound = false;
                    }
                } catch (e) {
                    pageResult.generateButtonError = e.message;
                }

                // Check for live widgets toggle
                try {
                    const toggles = await page.locator('input[type="checkbox"], button').filter({ hasText: /live widget/i }).all();
                    pageResult.liveWidgetToggleFound = toggles.length > 0;
                } catch (e) {
                    pageResult.liveWidgetToggleError = e.message;
                }
            }

            if (pageInfo.path === '/market-test') {
                console.log('Testing Market Test page results...');
                
                // Look for test results
                try {
                    const testResults = await page.locator('[class*="test"], [data-testid*="test"]').all();
                    pageResult.testResultsFound = testResults.length;
                    
                    // Look for failed tests
                    const failedTests = await page.locator('text=/failed|error|fail/i').all();
                    if (failedTests.length > 0) {
                        pageResult.failedTestsFound = failedTests.length;
                        for (let i = 0; i < Math.min(failedTests.length, 5); i++) {
                            const failText = await failedTests[i].textContent();
                            pageResult.errors.push({
                                type: 'test_failure',
                                message: failText
                            });
                        }
                    }
                } catch (e) {
                    pageResult.testResultsError = e.message;
                }
            }

            testResults.pages.push(pageResult);

        } catch (error) {
            console.error(`Error testing ${pageInfo.name}:`, error);
            testResults.pages.push({
                name: pageInfo.name,
                path: pageInfo.path,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Save comprehensive results
    const reportPath = 'test-screenshots/comprehensive-market-error-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

    // Generate HTML report
    const htmlReport = generateHTMLReport(testResults);
    fs.writeFileSync('test-screenshots/comprehensive-market-error-report.html', htmlReport);

    console.log('\n=== FINAL SUMMARY ===');
    console.log(`Total pages tested: ${testResults.pages.length}`);
    console.log(`Console errors found: ${testResults.consoleErrors.length}`);
    console.log(`Network errors found: ${testResults.networkErrors.length}`);
    console.log(`Screenshots taken: ${testResults.screenshots.length}`);

    // Print critical findings
    const criticalErrors = [];
    testResults.pages.forEach(page => {
        if (page.errors && page.errors.length > 0) {
            page.errors.forEach(error => {
                if (error.message && error.message.toLowerCase().includes('failed to fetch market data')) {
                    criticalErrors.push(`${page.name}: ${error.message}`);
                }
            });
        }
    });

    if (criticalErrors.length > 0) {
        console.log('\n🚨 CRITICAL: "failed to fetch market data" errors found:');
        criticalErrors.forEach(error => console.log(`  - ${error}`));
    } else {
        console.log('\n✅ No "failed to fetch market data" errors found in visible text');
    }

    console.log(`\nFull report saved to: ${reportPath}`);
    console.log(`HTML report saved to: test-screenshots/comprehensive-market-error-report.html`);

    await browser.close();
    return testResults;
}

function generateHTMLReport(testResults) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Comprehensive Market Error Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .error { color: red; background: #ffe6e6; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .success { color: green; background: #e6ffe6; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .warning { color: orange; background: #fff3e0; padding: 10px; margin: 5px 0; border-radius: 5px; }
        .page-section { border: 1px solid #ccc; margin: 20px 0; padding: 15px; border-radius: 8px; }
        .screenshot { max-width: 300px; border: 1px solid #ccc; margin: 10px 0; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Comprehensive Market Error Test Report</h1>
    <p><strong>Test Date:</strong> ${testResults.timestamp}</p>
    <p><strong>Pages Tested:</strong> ${testResults.pages.length}</p>
    <p><strong>Console Errors:</strong> ${testResults.consoleErrors.length}</p>
    <p><strong>Network Errors:</strong> ${testResults.networkErrors.length}</p>

    ${testResults.pages.map(page => `
        <div class="page-section">
            <h2>${page.name} (${page.path})</h2>
            ${page.error ? `<div class="error">Page Error: ${page.error}</div>` : ''}
            ${page.marketWidgetStatus ? `<p><strong>Market Widgets:</strong> ${page.marketWidgetStatus}</p>` : ''}
            
            ${page.errors && page.errors.length > 0 ? `
                <h3>Errors Found:</h3>
                ${page.errors.map(error => `
                    <div class="error">
                        <strong>${error.type}:</strong> ${error.message}
                    </div>
                `).join('')}
            ` : '<div class="success">No errors found on this page</div>'}

            ${page.screenshots && page.screenshots.length > 0 ? `
                <h3>Screenshots:</h3>
                ${page.screenshots.map(screenshot => `
                    <p>Screenshot: ${screenshot}</p>
                `).join('')}
            ` : ''}
            
            ${page.visibleText ? `
                <h3>Page Content (First 500 chars):</h3>
                <pre>${page.visibleText.substring(0, 500)}...</pre>
            ` : ''}
        </div>
    `).join('')}

    ${testResults.consoleErrors.length > 0 ? `
        <div class="page-section">
            <h2>Console Errors</h2>
            ${testResults.consoleErrors.map(error => `
                <div class="error">
                    <strong>${error.page}:</strong> ${error.message}
                    <br><small>${error.timestamp}</small>
                </div>
            `).join('')}
        </div>
    ` : ''}

    ${testResults.networkErrors.length > 0 ? `
        <div class="page-section">
            <h2>Network Errors</h2>
            ${testResults.networkErrors.map(error => `
                <div class="error">
                    <strong>${error.status} ${error.statusText}:</strong> ${error.url}
                    <br><small>On page: ${error.page}</small>
                    <br><small>${error.timestamp}</small>
                </div>
            `).join('')}
        </div>
    ` : ''}
</body>
</html>`;
}

// Run the test
comprehensiveMarketErrorTest().catch(console.error);