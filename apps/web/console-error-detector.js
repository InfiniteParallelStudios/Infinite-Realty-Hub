const { chromium } = require('playwright');

async function detectAllConsoleErrors() {
  console.log('🔍 COMPLETE CONSOLE ERROR DETECTION - Checking red error box\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const page = await browser.newPage();
  
  // Enable console API
  await page.addInitScript(() => {
    window.consoleErrors = [];
    window.consoleWarnings = [];
    
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    console.error = (...args) => {
      window.consoleErrors.push(args.join(' '));
      originalError(...args);
    };
    
    console.warn = (...args) => {
      window.consoleWarnings.push(args.join(' '));
      originalWarn(...args);
    };
    
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('Error') || message.includes('error') || message.includes('❌')) {
        window.consoleErrors.push(message);
      }
      originalLog(...args);
    };
  });

  let allErrors = [];
  let allWarnings = [];
  let networkErrors = [];

  // Capture ALL console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    console.log(`📢 ${type.toUpperCase()}: ${text}`);
    
    if (type === 'error') {
      allErrors.push({
        type: 'console.error',
        message: text,
        location: msg.location()
      });
    } else if (type === 'warning' || type === 'warn') {
      allWarnings.push({
        type: 'console.warn',
        message: text,
        location: msg.location()
      });
    }
  });

  // Capture page errors (uncaught exceptions)
  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR: ${error.message}`);
    allErrors.push({
      type: 'pageerror',
      message: error.message,
      stack: error.stack
    });
  });

  // Capture failed network requests
  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure) {
      console.log(`🌐 REQUEST FAILED: ${request.url()} - ${failure.errorText}`);
      networkErrors.push({
        url: request.url(),
        error: failure.errorText,
        method: request.method()
      });
    }
  });

  // Test multiple pages to catch all errors
  const pagesToTest = [
    'http://localhost:3000',
    'http://localhost:3000/auth/signin',
    'http://localhost:3000/qr-generator',
    'http://localhost:3000/contacts',
    'http://localhost:3000/dashboard',
    'http://localhost:3000/team',
    'http://localhost:3000/settings',
    'http://localhost:3000/newsletter',
    'http://localhost:3000/market-test'
  ];

  for (const url of pagesToTest) {
    try {
      console.log(`\n🔍 Testing ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      
      // Wait extra time for all errors to surface
      await page.waitForTimeout(3000);
      
      // Check for React errors in the page
      const reactErrors = await page.evaluate(() => {
        const errors = [];
        
        // Check for React error boundaries
        const errorElements = document.querySelectorAll('[data-reactroot] *');
        for (const element of errorElements) {
          if (element.textContent && (
            element.textContent.includes('Error:') ||
            element.textContent.includes('TypeError:') ||
            element.textContent.includes('ReferenceError:') ||
            element.textContent.includes('SyntaxError:')
          )) {
            errors.push(`React Error in DOM: ${element.textContent.slice(0, 200)}`);
          }
        }
        
        // Check window.consoleErrors we captured
        if (window.consoleErrors && window.consoleErrors.length > 0) {
          errors.push(...window.consoleErrors.map(e => `Captured Error: ${e}`));
        }
        
        // Check for Next.js specific errors
        const nextErrors = window.__NEXT_DATA__?.errors || [];
        errors.push(...nextErrors.map(e => `Next.js Error: ${JSON.stringify(e)}`));
        
        return errors;
      });
      
      if (reactErrors.length > 0) {
        console.log(`   Found ${reactErrors.length} React/DOM errors`);
        allErrors.push(...reactErrors.map(err => ({
          type: 'react-dom',
          message: err,
          page: url
        })));
      }
      
    } catch (error) {
      console.log(`❌ Failed to test ${url}: ${error.message}`);
      allErrors.push({
        type: 'page-load-error',
        message: `Failed to load ${url}: ${error.message}`,
        page: url
      });
    }
  }

  // Generate comprehensive report
  console.log('\n' + '='.repeat(80));
  console.log('🚨 COMPLETE ERROR ANALYSIS - ALL CONSOLE ERRORS FOUND');
  console.log('='.repeat(80));

  if (allErrors.length === 0 && allWarnings.length === 0 && networkErrors.length === 0) {
    console.log('\n🎉 NO ERRORS FOUND!');
    console.log('✅ The red error box should be empty');
    console.log('✅ All console output is clean');
  } else {
    if (allErrors.length > 0) {
      console.log(`\n❌ ERRORS FOUND (${allErrors.length}):`);
      allErrors.forEach((error, i) => {
        console.log(`\n${i + 1}. [${error.type}] ${error.message}`);
        if (error.location) {
          console.log(`   Location: ${error.location.url}:${error.location.lineNumber}`);
        }
        if (error.page) {
          console.log(`   Page: ${error.page}`);
        }
      });
    }

    if (allWarnings.length > 0) {
      console.log(`\n⚠️  WARNINGS FOUND (${allWarnings.length}):`);
      allWarnings.forEach((warning, i) => {
        console.log(`\n${i + 1}. [${warning.type}] ${warning.message}`);
      });
    }

    if (networkErrors.length > 0) {
      console.log(`\n🌐 NETWORK ERRORS FOUND (${networkErrors.length}):`);
      networkErrors.forEach((netErr, i) => {
        console.log(`\n${i + 1}. ${netErr.method} ${netErr.url}`);
        console.log(`   Error: ${netErr.error}`);
      });
    }
  }

  console.log('\n📋 SUMMARY FOR FIXING:');
  const criticalErrors = allErrors.filter(e => 
    e.message.includes('chunk') || 
    e.message.includes('TypeError') ||
    e.message.includes('ReferenceError') ||
    e.message.includes('SyntaxError') ||
    e.message.includes('Failed to load')
  );

  if (criticalErrors.length > 0) {
    console.log(`🚨 ${criticalErrors.length} CRITICAL ERRORS need immediate fixing:`);
    criticalErrors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.message}`);
    });
  } else {
    console.log('✅ No critical JavaScript errors detected');
  }

  // Keep browser open longer for manual inspection
  console.log('\n⏳ Browser staying open for 15 seconds for manual inspection of red error box...');
  console.log('👀 Please check the browser developer tools console manually');
  
  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Console error detection complete!');
    process.exit(criticalErrors.length > 0 ? 1 : 0);
  }, 15000);
}

detectAllConsoleErrors().catch(console.error);