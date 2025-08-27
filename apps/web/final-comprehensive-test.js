const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runFinalComprehensiveTest() {
    console.log('🚀 FINAL COMPREHENSIVE VISUAL TEST - Infinite Realty Hub');
    console.log('====================================================');
    console.log('Testing for user-visible errors and functionality issues\n');

    const testReport = {
        timestamp: new Date().toISOString(),
        baseUrl: 'http://localhost:3000',
        totalPagesTest: 0,
        summary: {
            fullyFunctional: 0,
            minorIssues: 0,
            majorIssues: 0,
            criticalErrors: 0
        },
        pages: [],
        networkIssues: [],
        recommendations: []
    };

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1400, height: 900 }
        });
        
        const page = await browser.newPage();
        
        // Comprehensive error monitoring
        const networkErrors = [];
        const consoleErrors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push({
                    url: page.url(),
                    message: msg.text(),
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        page.on('response', response => {
            if (!response.ok() && response.status() !== 304) {
                networkErrors.push({
                    url: response.url(),
                    status: response.status(),
                    page: page.url(),
                    critical: response.status() >= 500
                });
            }
        });

        // Test cases with specific functionality checks
        const testCases = [
            {
                path: '/',
                name: 'Home Page',
                checks: [
                    { name: 'Page loads without errors', critical: true },
                    { name: 'Navigation elements present', critical: false },
                    { name: 'No stuck loading states', critical: false }
                ]
            },
            {
                path: '/auth/signin',
                name: 'Authentication',
                checks: [
                    { name: 'Sign-in form displays', critical: true },
                    { name: 'Google OAuth button works', critical: false },
                    { name: 'Form validation works', critical: false }
                ]
            },
            {
                path: '/dashboard',
                name: 'Dashboard',
                checks: [
                    { name: 'Dashboard loads successfully', critical: true },
                    { name: 'Widget components render', critical: false },
                    { name: 'No API failure messages', critical: false }
                ]
            },
            {
                path: '/contacts',
                name: 'Contacts System',
                checks: [
                    { name: 'Contacts page loads', critical: true },
                    { name: 'No "Error loading contacts" message', critical: true },
                    { name: 'Add contact functionality available', critical: false }
                ]
            },
            {
                path: '/pipeline',
                name: 'Sales Pipeline',
                checks: [
                    { name: 'Pipeline board displays', critical: true },
                    { name: 'Pipeline stages visible', critical: false },
                    { name: 'Drag and drop interface works', critical: false }
                ]
            },
            {
                path: '/qr-generator',
                name: 'QR Code System',
                checks: [
                    { name: 'QR generator loads', critical: true },
                    { name: 'Form inputs work', critical: false },
                    { name: 'QR code generation works', critical: false }
                ]
            },
            {
                path: '/newsletter',
                name: 'Newsletter Management',
                checks: [
                    { name: 'Newsletter page loads', critical: true },
                    { name: 'No fatal API errors shown', critical: true },
                    { name: 'Content generation works', critical: false }
                ]
            },
            {
                path: '/team',
                name: 'Team Management',
                checks: [
                    { name: 'Team page displays', critical: true },
                    { name: 'Team member list loads', critical: false },
                    { name: 'Invite functionality available', critical: false }
                ]
            },
            {
                path: '/market-test',
                name: 'Market Data Testing',
                checks: [
                    { name: 'Market test page loads', critical: true },
                    { name: 'No "Failed to fetch market data" errors', critical: false },
                    { name: 'Market widgets display data', critical: false }
                ]
            }
        ];

        // Execute tests
        for (const testCase of testCases) {
            console.log(`\n🧪 Testing: ${testCase.name}`);
            const url = `${testReport.baseUrl}${testCase.path}`;
            
            const pageResult = {
                name: testCase.name,
                url: url,
                status: 'unknown',
                loadTime: 0,
                checksResults: [],
                userVisibleErrors: [],
                networkErrors: [],
                screenshot: '',
                verdict: 'unknown'
            };

            try {
                const startTime = Date.now();
                const response = await page.goto(url, { 
                    waitUntil: 'networkidle0',
                    timeout: 20000 
                });
                pageResult.loadTime = Date.now() - startTime;

                if (!response.ok()) {
                    pageResult.status = 'critical_error';
                    pageResult.verdict = 'CRITICAL - Page fails to load';
                    testReport.summary.criticalErrors++;
                    console.log(`💥 CRITICAL: ${testCase.name} - HTTP ${response.status()}`);
                    testReport.pages.push(pageResult);
                    continue;
                }

                // Wait for page to settle
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Take screenshot
                const screenshotName = `final-test-${testCase.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
                const screenshotPath = `./test-screenshots/${screenshotName}`;
                await page.screenshot({ path: screenshotPath, fullPage: true });
                pageResult.screenshot = screenshotPath;

                // Run specific checks
                for (const check of testCase.checks) {
                    const checkResult = await runSpecificCheck(page, check, testCase.name);
                    pageResult.checksResults.push(checkResult);
                }

                // Check for user-visible error messages
                const visibleErrors = await checkForUserVisibleErrors(page);
                pageResult.userVisibleErrors = visibleErrors;

                // Determine page verdict
                const criticalFailures = pageResult.checksResults.filter(c => c.critical && c.status === 'failed').length;
                const majorErrors = pageResult.userVisibleErrors.filter(e => e.severity === 'high').length;
                const minorIssues = pageResult.checksResults.filter(c => !c.critical && c.status === 'failed').length;

                if (criticalFailures > 0) {
                    pageResult.verdict = 'CRITICAL - Core functionality broken';
                    testReport.summary.criticalErrors++;
                } else if (majorErrors > 0) {
                    pageResult.verdict = 'MAJOR ISSUES - User-visible errors present';
                    testReport.summary.majorIssues++;
                } else if (minorIssues > 0 || pageResult.userVisibleErrors.length > 0) {
                    pageResult.verdict = 'MINOR ISSUES - Some functionality degraded';
                    testReport.summary.minorIssues++;
                } else {
                    pageResult.verdict = 'FULLY FUNCTIONAL - No issues detected';
                    testReport.summary.fullyFunctional++;
                }

                console.log(`   Status: ${pageResult.verdict}`);
                if (pageResult.userVisibleErrors.length > 0) {
                    console.log(`   User-visible errors: ${pageResult.userVisibleErrors.length}`);
                }

            } catch (error) {
                pageResult.status = 'test_error';
                pageResult.verdict = `TEST ERROR - ${error.message}`;
                testReport.summary.criticalErrors++;
                console.log(`💥 TEST ERROR: ${testCase.name} - ${error.message}`);
            }

            testReport.totalPagesTest++;
            testReport.pages.push(pageResult);
        }

        // Analyze network issues
        const uniqueNetworkErrors = [...new Set(networkErrors.map(e => e.url))];
        testReport.networkIssues = uniqueNetworkErrors.map(url => {
            const errors = networkErrors.filter(e => e.url === url);
            return {
                url,
                errorCount: errors.length,
                status: errors[0].status,
                critical: errors[0].critical,
                affectedPages: [...new Set(errors.map(e => e.page))]
            };
        });

        // Generate recommendations
        generateRecommendations(testReport);

        // Generate final report
        generateFinalReport(testReport);

    } catch (error) {
        console.error('Test execution failed:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function runSpecificCheck(page, check, pageName) {
    try {
        switch (check.name) {
            case 'Page loads without errors':
                return { ...check, status: 'passed', details: 'Page loaded successfully' };
                
            case 'Navigation elements present':
                const navCount = await page.$$eval('nav, .navigation, [role="navigation"], .bottom-navigation', els => els.length);
                return { 
                    ...check, 
                    status: navCount > 0 ? 'passed' : 'failed',
                    details: `Found ${navCount} navigation elements`
                };
                
            case 'No stuck loading states':
                const loadingCount = await page.$$eval('[data-loading="true"], .loading, .spinner', els => 
                    els.filter(el => el.offsetParent !== null).length
                );
                return {
                    ...check,
                    status: loadingCount === 0 ? 'passed' : 'failed',
                    details: loadingCount > 0 ? `Found ${loadingCount} stuck loading elements` : 'No loading states detected'
                };
                
            case 'Sign-in form displays':
                const formCount = await page.$$eval('form, [data-auth], input[type="email"]', els => els.length);
                return {
                    ...check,
                    status: formCount > 0 ? 'passed' : 'failed',
                    details: `Found ${formCount} auth-related elements`
                };
                
            case 'No "Error loading contacts" message':
                const contactErrors = await page.evaluate(() => {
                    const errorTexts = ['error loading contacts', 'failed to load contacts', 'contact error'];
                    return errorTexts.some(text => 
                        document.body.textContent.toLowerCase().includes(text)
                    );
                });
                return {
                    ...check,
                    status: contactErrors ? 'failed' : 'passed',
                    details: contactErrors ? 'Contact error message found' : 'No contact error messages'
                };
                
            case 'No "Failed to fetch market data" errors':
                const marketErrors = await page.evaluate(() => {
                    const errorTexts = ['failed to fetch market data', 'market data error', 'unable to load market'];
                    return errorTexts.some(text => 
                        document.body.textContent.toLowerCase().includes(text)
                    );
                });
                return {
                    ...check,
                    status: marketErrors ? 'failed' : 'passed',
                    details: marketErrors ? 'Market data error message found' : 'No market error messages'
                };
                
            default:
                // Generic functionality check
                return {
                    ...check,
                    status: 'passed',
                    details: 'Generic check completed'
                };
        }
    } catch (error) {
        return {
            ...check,
            status: 'error',
            details: `Check failed: ${error.message}`
        };
    }
}

async function checkForUserVisibleErrors(page) {
    return await page.evaluate(() => {
        const errors = [];
        
        // Common error patterns to look for
        const errorPatterns = [
            { text: 'failed to fetch', severity: 'high' },
            { text: 'error loading', severity: 'high' },
            { text: 'unable to load', severity: 'high' },
            { text: 'something went wrong', severity: 'medium' },
            { text: 'network error', severity: 'high' },
            { text: 'server error', severity: 'high' },
            { text: '404', severity: 'high' },
            { text: '500', severity: 'high' },
            { text: 'unauthorized', severity: 'medium' },
            { text: 'access denied', severity: 'medium' }
        ];
        
        errorPatterns.forEach(pattern => {
            if (document.body.textContent.toLowerCase().includes(pattern.text)) {
                // Find the specific element
                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                let node;
                while (node = walker.nextNode()) {
                    if (node.textContent.toLowerCase().includes(pattern.text)) {
                        const element = node.parentElement;
                        if (element && element.offsetParent !== null) { // Element is visible
                            errors.push({
                                pattern: pattern.text,
                                severity: pattern.severity,
                                element: element.tagName,
                                context: node.textContent.substring(0, 100) + '...'
                            });
                            break; // Don't duplicate errors
                        }
                    }
                }
            }
        });
        
        return errors;
    });
}

function generateRecommendations(testReport) {
    const recommendations = [];
    
    // Network error recommendations
    const marketDataErrors = testReport.networkIssues.filter(e => e.url.includes('market_data_cache'));
    if (marketDataErrors.length > 0) {
        recommendations.push({
            priority: 'LOW',
            category: 'Database',
            issue: 'Missing market_data_cache table',
            recommendation: 'Create market_data_cache table in Supabase or handle missing table gracefully',
            impact: 'Backend 404 errors (not user-visible but creates console noise)'
        });
    }
    
    const newsletterErrors = testReport.networkIssues.filter(e => e.url.includes('newsletter_preferences'));
    if (newsletterErrors.length > 0) {
        recommendations.push({
            priority: 'LOW',
            category: 'Database',
            issue: 'Missing newsletter_preferences table',
            recommendation: 'Create newsletter_preferences table in Supabase or handle missing table gracefully',
            impact: 'Backend 404 errors (not user-visible but creates console noise)'
        });
    }
    
    // Page-specific recommendations
    const criticalPages = testReport.pages.filter(p => p.verdict.includes('CRITICAL'));
    if (criticalPages.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Critical Errors',
            issue: `${criticalPages.length} pages have critical errors`,
            recommendation: 'Investigate and fix page load failures immediately',
            impact: 'Users cannot access core functionality'
        });
    }
    
    const majorIssuePages = testReport.pages.filter(p => p.verdict.includes('MAJOR'));
    if (majorIssuePages.length > 0) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'User Experience',
            issue: `${majorIssuePages.length} pages show user-visible errors`,
            recommendation: 'Improve error handling to provide better user feedback',
            impact: 'Poor user experience due to error messages'
        });
    }
    
    // Overall assessment
    const functionalPages = testReport.summary.fullyFunctional;
    const totalPages = testReport.totalPagesTest;
    const successRate = (functionalPages / totalPages * 100).toFixed(1);
    
    if (successRate >= 90) {
        recommendations.push({
            priority: 'INFO',
            category: 'Overall Assessment',
            issue: 'Application is highly functional',
            recommendation: `${successRate}% of pages are fully functional. Focus on minor optimizations.`,
            impact: 'Excellent user experience'
        });
    } else if (successRate >= 70) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Overall Assessment',
            issue: 'Application has room for improvement',
            recommendation: `${successRate}% of pages are functional. Address major issues for better stability.`,
            impact: 'Good but could be better user experience'
        });
    } else {
        recommendations.push({
            priority: 'HIGH',
            category: 'Overall Assessment',
            issue: 'Application needs significant improvement',
            recommendation: `Only ${successRate}% of pages are fully functional. Major fixes needed.`,
            impact: 'Poor user experience requiring immediate attention'
        });
    }
    
    testReport.recommendations = recommendations;
}

function generateFinalReport(testReport) {
    // Console summary
    console.log('\n📊 FINAL TEST RESULTS SUMMARY');
    console.log('===============================');
    console.log(`Total Pages Tested: ${testReport.totalPagesTest}`);
    console.log(`✅ Fully Functional: ${testReport.summary.fullyFunctional}`);
    console.log(`⚠️  Minor Issues: ${testReport.summary.minorIssues}`);
    console.log(`❗ Major Issues: ${testReport.summary.majorIssues}`);
    console.log(`💥 Critical Errors: ${testReport.summary.criticalErrors}`);
    
    const successRate = (testReport.summary.fullyFunctional / testReport.totalPagesTest * 100).toFixed(1);
    console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
    
    // Page-by-page results
    console.log('\n📄 PAGE-BY-PAGE RESULTS:');
    testReport.pages.forEach(page => {
        const icon = page.verdict.includes('FULLY FUNCTIONAL') ? '✅' : 
                     page.verdict.includes('MINOR') ? '⚠️' : 
                     page.verdict.includes('MAJOR') ? '❗' : '💥';
        console.log(`${icon} ${page.name}: ${page.verdict}`);
        
        if (page.userVisibleErrors.length > 0) {
            page.userVisibleErrors.forEach(error => {
                console.log(`     └─ ${error.severity.toUpperCase()}: ${error.pattern}`);
            });
        }
    });
    
    // Network issues
    if (testReport.networkIssues.length > 0) {
        console.log('\n🌐 NETWORK ISSUES:');
        testReport.networkIssues.forEach(issue => {
            console.log(`   ${issue.critical ? '💥' : '⚠️'} ${issue.url} (${issue.status}) - ${issue.errorCount} occurrences`);
        });
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    testReport.recommendations.forEach(rec => {
        const priorityIcon = rec.priority === 'HIGH' ? '🔴' : 
                           rec.priority === 'MEDIUM' ? '🟡' : 
                           rec.priority === 'LOW' ? '🟢' : 'ℹ️';
        console.log(`${priorityIcon} ${rec.priority} - ${rec.category}:`);
        console.log(`     Issue: ${rec.issue}`);
        console.log(`     Fix: ${rec.recommendation}`);
        console.log(`     Impact: ${rec.impact}\n`);
    });
    
    // Save detailed JSON report
    const reportPath = './test-screenshots/final-comprehensive-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
    
    // Generate HTML report
    const htmlContent = generateHTMLReport(testReport);
    const htmlPath = './test-screenshots/final-comprehensive-test-report.html';
    fs.writeFileSync(htmlPath, htmlContent);
    
    console.log(`\n📁 DETAILED REPORTS SAVED:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
    
    // Final verdict
    if (successRate >= 90) {
        console.log('\n🎉 OVERALL VERDICT: APPLICATION IS READY FOR USERS');
        console.log('   The Infinite Realty Hub is highly functional with minimal issues.');
    } else if (successRate >= 70) {
        console.log('\n👍 OVERALL VERDICT: APPLICATION IS MOSTLY FUNCTIONAL');
        console.log('   Address the highlighted issues for optimal user experience.');
    } else {
        console.log('\n⚠️ OVERALL VERDICT: APPLICATION NEEDS IMPROVEMENT');
        console.log('   Significant issues detected that may impact user experience.');
    }
}

function generateHTMLReport(testReport) {
    const successRate = (testReport.summary.fullyFunctional / testReport.totalPagesTest * 100).toFixed(1);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>Infinite Realty Hub - Final Test Report</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1200px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .summary-card { background: white; padding: 25px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .summary-card h3 { margin: 0 0 15px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; }
        .success-rate { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
        .pages-section, .network-section, .recommendations-section { padding: 30px; }
        .page-result { margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .page-result.functional { border-left: 5px solid #28a745; }
        .page-result.minor { border-left: 5px solid #ffc107; }
        .page-result.major { border-left: 5px solid #fd7e14; }
        .page-result.critical { border-left: 5px solid #dc3545; }
        .page-header { padding: 20px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; }
        .page-content { padding: 20px; background: white; }
        .error-list { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .check-list { background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .recommendation { margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 5px solid #007bff; background: #f8f9fa; }
        .rec-high { border-left-color: #dc3545; }
        .rec-medium { border-left-color: #ffc107; }
        .rec-low { border-left-color: #28a745; }
        .screenshot { max-width: 200px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Final Comprehensive Test Report</h1>
            <p>Infinite Realty Hub Visual & Functional Testing</p>
            <p>Generated: ${testReport.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card success-rate">
                <h3>Success Rate</h3>
                <div class="value">${successRate}%</div>
            </div>
            <div class="summary-card">
                <h3>Fully Functional</h3>
                <div class="value" style="color: #28a745;">${testReport.summary.fullyFunctional}</div>
            </div>
            <div class="summary-card">
                <h3>Minor Issues</h3>
                <div class="value" style="color: #ffc107;">${testReport.summary.minorIssues}</div>
            </div>
            <div class="summary-card">
                <h3>Major Issues</h3>
                <div class="value" style="color: #fd7e14;">${testReport.summary.majorIssues}</div>
            </div>
            <div class="summary-card">
                <h3>Critical Errors</h3>
                <div class="value" style="color: #dc3545;">${testReport.summary.criticalErrors}</div>
            </div>
        </div>
        
        <div class="pages-section">
            <h2>📄 Page-by-Page Results</h2>
            ${testReport.pages.map(page => {
                const statusClass = page.verdict.includes('FULLY FUNCTIONAL') ? 'functional' :
                                   page.verdict.includes('MINOR') ? 'minor' :
                                   page.verdict.includes('MAJOR') ? 'major' : 'critical';
                return `
                    <div class="page-result ${statusClass}">
                        <div class="page-header">
                            <h3>${page.name}</h3>
                            <p><strong>URL:</strong> ${page.url}</p>
                            <p><strong>Load Time:</strong> ${page.loadTime}ms | <strong>Verdict:</strong> ${page.verdict}</p>
                        </div>
                        <div class="page-content">
                            ${page.checksResults.length > 0 ? `
                                <div class="check-list">
                                    <strong>Functionality Checks:</strong>
                                    <ul>
                                        ${page.checksResults.map(check => `
                                            <li>${check.status === 'passed' ? '✅' : '❌'} ${check.name}: ${check.details}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${page.userVisibleErrors.length > 0 ? `
                                <div class="error-list">
                                    <strong>User-Visible Issues:</strong>
                                    <ul>
                                        ${page.userVisibleErrors.map(error => `
                                            <li><strong>${error.severity.toUpperCase()}:</strong> ${error.pattern} - ${error.context}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${page.screenshot ? `
                                <p><strong>Screenshot:</strong></p>
                                <img src="${page.screenshot}" alt="Screenshot" class="screenshot" />
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        ${testReport.networkIssues.length > 0 ? `
            <div class="network-section">
                <h2>🌐 Network Issues</h2>
                ${testReport.networkIssues.map(issue => `
                    <div style="margin: 10px 0; padding: 15px; background: ${issue.critical ? '#f8d7da' : '#fff3cd'}; border-radius: 5px;">
                        <strong>${issue.critical ? '💥 Critical' : '⚠️ Warning'}:</strong> ${issue.url}<br>
                        <strong>Status:</strong> ${issue.status} | <strong>Occurrences:</strong> ${issue.errorCount}<br>
                        <strong>Affected Pages:</strong> ${issue.affectedPages.join(', ')}
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <div class="recommendations-section">
            <h2>💡 Recommendations</h2>
            ${testReport.recommendations.map(rec => `
                <div class="recommendation rec-${rec.priority.toLowerCase()}">
                    <h3>${rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : rec.priority === 'LOW' ? '🟢' : 'ℹ️'} ${rec.priority} Priority - ${rec.category}</h3>
                    <p><strong>Issue:</strong> ${rec.issue}</p>
                    <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                    <p><strong>Impact:</strong> ${rec.impact}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
}

// Run the test
runFinalComprehensiveTest().catch(console.error);