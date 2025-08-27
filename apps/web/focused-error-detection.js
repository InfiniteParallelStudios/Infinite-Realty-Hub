const playwright = require('playwright');
const fs = require('fs');

async function focusedErrorDetection() {
    const browser = await playwright.chromium.launch({ 
        headless: false,
        slowMo: 1000 // Slow down to see what's happening
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Track all errors comprehensively
    const allErrors = {
        consoleErrors: [],
        networkErrors: [],
        pageErrors: [],
        marketDataErrors: []
    };

    // Console error tracking
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error' || text.toLowerCase().includes('failed') || text.toLowerCase().includes('error')) {
            const error = {
                type: msg.type(),
                message: text,
                url: page.url(),
                timestamp: new Date().toISOString()
            };
            allErrors.consoleErrors.push(error);
            console.log(`🔴 CONSOLE ${msg.type().toUpperCase()}: ${text}`);
        }
    });

    // Network failure tracking
    page.on('response', response => {
        if (!response.ok()) {
            const error = {
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                headers: response.headers(),
                page: page.url(),
                timestamp: new Date().toISOString()
            };
            allErrors.networkErrors.push(error);
            console.log(`🔴 NETWORK ERROR: ${response.status()} ${response.statusText()} - ${response.url()}`);
        }
    });

    // Page error tracking
    page.on('pageerror', error => {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            url: page.url(),
            timestamp: new Date().toISOString()
        };
        allErrors.pageErrors.push(errorInfo);
        console.log(`🔴 PAGE ERROR: ${error.message}`);
    });

    const baseUrl = 'http://localhost:3000';
    const testPages = ['/newsletter', '/market-test', '/dashboard'];

    for (const pagePath of testPages) {
        try {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🔍 DETAILED INSPECTION: ${pagePath.toUpperCase()}`);
            console.log(`${'='.repeat(60)}`);
            
            const fullUrl = `${baseUrl}${pagePath}`;
            
            // Navigate and wait for everything to load
            console.log(`📍 Navigating to: ${fullUrl}`);
            await page.goto(fullUrl, { waitUntil: 'networkidle' });
            
            // Wait for any dynamic content
            await page.waitForTimeout(5000);
            
            // Take screenshot
            const screenshotPath = `test-screenshots/focused-error-${pagePath.replace('/', '')}-${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);

            // Search for specific error text patterns
            const errorPatterns = [
                'failed to fetch market data',
                'Failed to fetch market data', 
                'FAILED TO FETCH MARKET DATA',
                'error loading',
                'Error loading',
                'ERROR LOADING',
                'API Error',
                'Network Error',
                'Loading failed',
                'Data unavailable',
                'Service unavailable'
            ];

            console.log(`🔍 Searching for error messages on page...`);
            for (const pattern of errorPatterns) {
                try {
                    const elements = await page.locator(`text=${pattern}`).all();
                    if (elements.length > 0) {
                        console.log(`🎯 FOUND ERROR PATTERN: "${pattern}" - ${elements.length} instances`);
                        
                        for (let i = 0; i < elements.length; i++) {
                            const element = elements[i];
                            const text = await element.textContent();
                            const boundingBox = await element.boundingBox();
                            
                            allErrors.marketDataErrors.push({
                                pattern,
                                fullText: text,
                                page: pagePath,
                                position: boundingBox,
                                timestamp: new Date().toISOString()
                            });
                            
                            console.log(`   ${i + 1}. Text: "${text}"`);
                            console.log(`      Position: ${JSON.stringify(boundingBox)}`);
                        }
                    }
                } catch (e) {
                    // Pattern not found, continue
                }
            }

            // Check for any elements that might contain error states
            console.log(`🔍 Checking for error-related elements...`);
            const errorSelectors = [
                '[class*="error"]',
                '[data-testid*="error"]',
                '[id*="error"]',
                '.text-red-500',
                '.text-red-400',
                '.bg-red-500',
                '.border-red-500'
            ];

            for (const selector of errorSelectors) {
                try {
                    const elements = await page.locator(selector).all();
                    if (elements.length > 0) {
                        console.log(`🎯 FOUND ERROR ELEMENTS: ${selector} - ${elements.length} instances`);
                        for (let i = 0; i < Math.min(elements.length, 3); i++) {
                            const text = await elements[i].textContent();
                            if (text && text.trim()) {
                                console.log(`   ${i + 1}. "${text.substring(0, 100)}..."`);
                            }
                        }
                    }
                } catch (e) {
                    // Selector failed, continue
                }
            }

            // Inspect page content for hidden errors
            console.log(`🔍 Analyzing page content for market data related text...`);
            const bodyText = await page.locator('body').textContent();
            const lowerBody = bodyText?.toLowerCase() || '';
            
            // Look for market data related content
            if (lowerBody.includes('market') || lowerBody.includes('data')) {
                console.log(`📊 Page contains market/data related content`);
                
                // Extract lines containing market or data
                const lines = bodyText?.split('\n') || [];
                const marketLines = lines.filter(line => {
                    const lowerLine = line.toLowerCase();
                    return (lowerLine.includes('market') || lowerLine.includes('data')) && 
                           (lowerLine.includes('error') || lowerLine.includes('failed') || lowerLine.includes('loading'));
                });
                
                if (marketLines.length > 0) {
                    console.log(`🎯 FOUND MARKET DATA ERROR LINES:`);
                    marketLines.forEach((line, index) => {
                        console.log(`   ${index + 1}. "${line.trim()}"`);
                    });
                }
            }

            // Check for loading states that might be stuck
            const loadingSelectors = [
                '[class*="loading"]',
                '[class*="spinner"]',
                '.animate-spin',
                '[data-testid*="loading"]'
            ];

            for (const selector of loadingSelectors) {
                try {
                    const elements = await page.locator(selector).all();
                    if (elements.length > 0) {
                        console.log(`⏳ FOUND LOADING ELEMENTS: ${selector} - ${elements.length} instances`);
                    }
                } catch (e) {
                    // Continue
                }
            }

            console.log(`✅ Completed inspection of ${pagePath}`);
            
        } catch (error) {
            console.error(`❌ Error inspecting ${pagePath}:`, error.message);
            allErrors.pageErrors.push({
                message: error.message,
                page: pagePath,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Generate comprehensive report
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 COMPREHENSIVE ERROR ANALYSIS REPORT`);
    console.log(`${'='.repeat(60)}`);
    
    console.log(`\n🔴 Console Errors: ${allErrors.consoleErrors.length}`);
    allErrors.consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.type}] ${error.message}`);
        console.log(`      Page: ${error.url}`);
        console.log(`      Time: ${error.timestamp}`);
    });

    console.log(`\n🌐 Network Errors: ${allErrors.networkErrors.length}`);
    allErrors.networkErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.status} ${error.statusText}`);
        console.log(`      URL: ${error.url}`);
        console.log(`      Page: ${error.page}`);
    });

    console.log(`\n🎯 Market Data Specific Errors: ${allErrors.marketDataErrors.length}`);
    allErrors.marketDataErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. Pattern: "${error.pattern}"`);
        console.log(`      Text: "${error.fullText}"`);
        console.log(`      Page: ${error.page}`);
    });

    console.log(`\n📄 Page Errors: ${allErrors.pageErrors.length}`);
    allErrors.pageErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.message}`);
        console.log(`      Page: ${error.page || 'Unknown'}`);
    });

    // Critical findings
    const criticalFindings = allErrors.marketDataErrors.filter(error => 
        error.pattern.toLowerCase().includes('failed to fetch market data')
    );

    if (criticalFindings.length > 0) {
        console.log(`\n🚨 CRITICAL: Found "${criticalFindings.length}" instances of "failed to fetch market data" errors!`);
        criticalFindings.forEach((finding, index) => {
            console.log(`   ${index + 1}. Page: ${finding.page}`);
            console.log(`      Full Text: "${finding.fullText}"`);
            console.log(`      Position: ${JSON.stringify(finding.position)}`);
        });
    } else {
        console.log(`\n✅ No visible "failed to fetch market data" errors found in UI`);
    }

    // Save detailed report
    const reportPath = 'test-screenshots/focused-error-detection-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(allErrors, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);

    // Keep browser open for manual inspection
    console.log(`\n👁️ Browser will remain open for 60 seconds for manual inspection...`);
    await page.waitForTimeout(60000);

    await browser.close();
    return allErrors;
}

// Run the focused test
focusedErrorDetection().catch(console.error);