const { chromium } = require('playwright');

async function detectAllErrors() {
  console.log('🔍 COMPREHENSIVE ERROR DETECTION STARTING...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // Open devtools to see console errors
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const allErrors = [];
  const allWarnings = [];
  const allPageErrors = [];
  
  // Listen for all console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    const url = page.url();
    
    if (type === 'error') {
      console.log(`❌ CONSOLE ERROR on ${url}:`);
      console.log(`   ${text}\n`);
      allErrors.push({ type: 'console', url, message: text });
    } else if (type === 'warning') {
      console.log(`⚠️  CONSOLE WARNING on ${url}:`);
      console.log(`   ${text}\n`);
      allWarnings.push({ type: 'console', url, message: text });
    }
  });
  
  // Listen for page errors (JavaScript exceptions)
  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR on ${page.url()}:`);
    console.log(`   ${error.message}`);
    console.log(`   ${error.stack}\n`);
    allPageErrors.push({ type: 'page', url: page.url(), message: error.message, stack: error.stack });
  });
  
  // Listen for failed requests
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    
    if (status >= 400) {
      console.log(`🚫 NETWORK ERROR: ${status} ${url}\n`);
      allErrors.push({ type: 'network', status, url });
    }
  });
  
  const pages = [
    'http://localhost:3000/',
    'http://localhost:3000/auth/signin',
    'http://localhost:3000/dashboard',
    'http://localhost:3000/contacts',
    'http://localhost:3000/pipeline',
    'http://localhost:3000/qr-generator',
    'http://localhost:3000/newsletter',
    'http://localhost:3000/team',
    'http://localhost:3000/market-test',
    'http://localhost:3000/settings'
  ];
  
  for (const url of pages) {
    console.log(`\n📄 Testing: ${url}`);
    console.log('='.repeat(60));
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for React to fully render
      await page.waitForTimeout(3000);
      
      // Check for error text on the page
      const pageContent = await page.textContent('body');
      
      if (pageContent.includes('Error') || 
          pageContent.includes('error') || 
          pageContent.includes('Failed') ||
          pageContent.includes('failed') ||
          pageContent.includes('undefined') ||
          pageContent.includes('null')) {
        
        const errorTexts = await page.$$eval('*', elements => {
          return elements
            .filter(el => {
              const text = el.textContent || '';
              return (text.includes('Error') || 
                     text.includes('error') || 
                     text.includes('Failed') || 
                     text.includes('failed')) && 
                     text.length < 200 && 
                     el.children.length === 0;
            })
            .map(el => el.textContent.trim());
        });
        
        if (errorTexts.length > 0) {
          console.log(`🔴 VISIBLE ERROR TEXT FOUND:`);
          errorTexts.forEach(text => {
            console.log(`   "${text}"`);
          });
          console.log('');
        }
      }
      
      // Check for specific error patterns
      const hasSpinners = await page.locator('[class*="loading"], [class*="spinner"], [class*="animate-spin"]').count();
      if (hasSpinners > 0) {
        console.log(`⏳ LOADING SPINNERS DETECTED: ${hasSpinners} spinners still visible`);
      }
      
      // Test buttons that might be broken
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.includes('Sign In')) {
          try {
            await button.click({ timeout: 1000 });
            console.log(`✓ Button "${text}" clickable`);
          } catch (e) {
            console.log(`❌ Button "${text}" not clickable: ${e.message}`);
          }
        }
      }
      
      console.log(`✅ Page check completed\n`);
      
    } catch (error) {
      console.log(`❌ ERROR LOADING PAGE: ${error.message}\n`);
      allPageErrors.push({ type: 'load', url, message: error.message });
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE ERROR DETECTION SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n🔢 TOTALS:`);
  console.log(`   Console Errors: ${allErrors.filter(e => e.type === 'console').length}`);
  console.log(`   Console Warnings: ${allWarnings.length}`);
  console.log(`   Page Errors: ${allPageErrors.filter(e => e.type === 'page').length}`);
  console.log(`   Network Errors: ${allErrors.filter(e => e.type === 'network').length}`);
  console.log(`   Page Load Errors: ${allPageErrors.filter(e => e.type === 'load').length}`);
  
  if (allErrors.length === 0 && allPageErrors.length === 0) {
    console.log(`\n✅ NO ERRORS DETECTED! App is clean! 🎉`);
  } else {
    console.log(`\n⚠️  ${allErrors.length + allPageErrors.length} ERRORS NEED FIXING:`);
    
    [...allErrors, ...allPageErrors].forEach((error, i) => {
      console.log(`\n${i + 1}. [${error.type.toUpperCase()}] ${error.url || 'Unknown page'}`);
      console.log(`   ${error.message}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack.split('\n')[0]}`);
      }
    });
  }
  
  console.log(`\n🔍 Error detection complete. Browser remains open for manual inspection.`);
  console.log(`   Close the browser when you're done reviewing.`);
  
  // Don't close browser - let user inspect
  // await browser.close();
}

detectAllErrors().catch(console.error);