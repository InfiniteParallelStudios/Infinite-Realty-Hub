const { chromium } = require('playwright');
const fs = require('fs');

async function performVisualCheck() {
  console.log('🔍 Starting ACTUAL Visual Testing...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // Create screenshot directory
  const screenshotDir = './visual-checks';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const issues = [];
  const pages = [
    { name: 'Home', url: 'http://localhost:3000/' },
    { name: 'Sign In', url: 'http://localhost:3000/auth/signin' },
    { name: 'Dashboard', url: 'http://localhost:3000/dashboard' },
    { name: 'Contacts', url: 'http://localhost:3000/contacts' },
    { name: 'Pipeline', url: 'http://localhost:3000/pipeline' },
    { name: 'QR Generator', url: 'http://localhost:3000/qr-generator' },
    { name: 'Newsletter', url: 'http://localhost:3000/newsletter' },
    { name: 'Team', url: 'http://localhost:3000/team' },
    { name: 'Market Test', url: 'http://localhost:3000/market-test' },
    { name: 'Settings', url: 'http://localhost:3000/settings' }
  ];

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('404') && !text.includes('NEXT_REDIRECT')) {
        issues.push({
          type: 'Console Error',
          page: page.url(),
          message: text
        });
      }
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    issues.push({
      type: 'Page Error',
      page: page.url(),
      message: error.message
    });
  });

  for (const pageInfo of pages) {
    console.log(`\n📄 Testing: ${pageInfo.name}`);
    console.log(`   URL: ${pageInfo.url}`);
    
    try {
      // Navigate to page
      await page.goto(pageInfo.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for page to fully render
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({ 
        path: `${screenshotDir}/${pageInfo.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true 
      });
      
      // Check for error text visible on page
      const visibleErrors = await page.evaluate(() => {
        const bodyText = document.body.innerText.toLowerCase();
        const errorIndicators = [
          'error', 'failed', 'exception', 'cannot read', 
          'undefined', 'null', '404', '500', 'not found'
        ];
        
        const foundErrors = [];
        errorIndicators.forEach(indicator => {
          if (bodyText.includes(indicator)) {
            // Get more context around the error
            const regex = new RegExp(`.{0,50}${indicator}.{0,50}`, 'gi');
            const matches = bodyText.match(regex);
            if (matches) {
              matches.forEach(match => {
                // Filter out false positives
                if (!match.includes('error boundaries') && 
                    !match.includes('error handling') &&
                    !match.includes('404 status codes') &&
                    !match.includes('test error')) {
                  foundErrors.push(match.trim());
                }
              });
            }
          }
        });
        
        return [...new Set(foundErrors)]; // Remove duplicates
      });
      
      if (visibleErrors.length > 0) {
        console.log(`   ⚠️ Found potential error text:`);
        visibleErrors.forEach(err => {
          console.log(`      "${err}"`);
          issues.push({
            type: 'Visible Error Text',
            page: pageInfo.url,
            message: err
          });
        });
      }
      
      // Check if page has content
      const hasContent = await page.evaluate(() => {
        return document.body.innerText.trim().length > 100;
      });
      
      if (!hasContent) {
        console.log(`   ⚠️ Page appears to have minimal content`);
        issues.push({
          type: 'Empty Page',
          page: pageInfo.url,
          message: 'Page has less than 100 characters of content'
        });
      }
      
      // Check for broken buttons
      const brokenButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a[role="button"], [onclick]'));
        const broken = [];
        
        buttons.forEach(btn => {
          // Check if button has no click handler and no href
          if (btn.tagName === 'BUTTON') {
            const hasHandler = btn.onclick || 
                             btn.hasAttribute('onclick') || 
                             btn.closest('[onclick]');
            if (!hasHandler && !btn.disabled) {
              const text = btn.innerText || btn.getAttribute('aria-label') || 'Unnamed button';
              broken.push(text);
            }
          }
        });
        
        return broken;
      });
      
      if (brokenButtons.length > 0) {
        console.log(`   ⚠️ Found potentially broken buttons:`);
        brokenButtons.forEach(btn => {
          console.log(`      - ${btn}`);
          issues.push({
            type: 'Broken Button',
            page: pageInfo.url,
            message: `Button "${btn}" may not have click handler`
          });
        });
      }
      
      // Check for loading spinners stuck on screen
      const hasLoadingSpinner = await page.evaluate(() => {
        const spinners = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
        return spinners.length > 0;
      });
      
      if (hasLoadingSpinner) {
        console.log(`   ⚠️ Loading spinner detected on page`);
        issues.push({
          type: 'Stuck Loading',
          page: pageInfo.url,
          message: 'Loading spinner visible after page load'
        });
      }
      
      // Check all clickable elements
      const clickableElements = await page.$$eval('button, a, [role="button"]', elements => {
        return elements.map(el => ({
          tag: el.tagName,
          text: el.innerText || el.getAttribute('aria-label') || '',
          href: el.href || '',
          disabled: el.disabled || el.getAttribute('aria-disabled') === 'true',
          visible: el.offsetParent !== null
        }));
      });
      
      const visibleButtons = clickableElements.filter(el => el.visible && el.text);
      console.log(`   ✓ Found ${visibleButtons.length} clickable elements`);
      
      // Try clicking main navigation items
      if (pageInfo.url.includes('auth/signin')) {
        // Check sign in form
        const hasEmailInput = await page.$('input[type="email"], input[name*="email"]');
        const hasPasswordInput = await page.$('input[type="password"]');
        const hasSubmitButton = await page.$('button[type="submit"], button:has-text("Sign")');
        
        if (!hasEmailInput || !hasPasswordInput || !hasSubmitButton) {
          console.log(`   ❌ Sign in form incomplete`);
          issues.push({
            type: 'Form Issue',
            page: pageInfo.url,
            message: 'Sign in form missing required fields'
          });
        } else {
          console.log(`   ✓ Sign in form complete`);
        }
      }
      
      console.log(`   ✅ Page check completed`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      issues.push({
        type: 'Page Load Error',
        page: pageInfo.url,
        message: error.message
      });
      
      // Still take screenshot even on error
      try {
        await page.screenshot({ 
          path: `${screenshotDir}/${pageInfo.name.toLowerCase().replace(' ', '-')}-error.png`,
          fullPage: true 
        });
      } catch (screenshotError) {
        console.log(`   Could not capture screenshot`);
      }
    }
  }
  
  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 VISUAL TEST REPORT');
  console.log('='.repeat(60));
  
  if (issues.length === 0) {
    console.log('\n✅ ALL VISUAL TESTS PASSED!');
    console.log('No user-visible errors detected.');
  } else {
    console.log(`\n⚠️ Found ${issues.length} potential issues:\n`);
    
    // Group issues by type
    const groupedIssues = {};
    issues.forEach(issue => {
      if (!groupedIssues[issue.type]) {
        groupedIssues[issue.type] = [];
      }
      groupedIssues[issue.type].push(issue);
    });
    
    Object.keys(groupedIssues).forEach(type => {
      console.log(`\n${type}:`);
      groupedIssues[type].forEach(issue => {
        console.log(`  - ${issue.page}`);
        console.log(`    ${issue.message}`);
      });
    });
  }
  
  console.log('\n📸 Screenshots saved to:', screenshotDir);
  
  // Save detailed report
  const reportPath = `${screenshotDir}/visual-test-report.json`;
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalPages: pages.length,
    issuesFound: issues.length,
    issues: issues
  }, null, 2));
  
  console.log('📄 Detailed report saved to:', reportPath);
  
  await browser.close();
  
  return issues.length === 0;
}

// Run the visual check
performVisualCheck()
  .then(success => {
    if (success) {
      console.log('\n✅ Visual testing completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Visual testing completed with issues.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });