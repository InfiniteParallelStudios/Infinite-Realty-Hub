const { chromium } = require('playwright');

async function debugError() {
  console.log('🚨 EMERGENCY ERROR DEBUG');
  console.log('Finding the EXACT source of the Unexpected token error\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  let errorFound = false;
  let errorDetails = null;
  
  // Capture the EXACT error
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    if (type === 'error' && text.includes('Unexpected token')) {
      errorFound = true;
      errorDetails = { text, location };
      console.log('🚨 FOUND THE ERROR:');
      console.log(`   Text: ${text}`);
      console.log(`   File: ${location.url}`);
      console.log(`   Line: ${location.lineNumber}`);
    }
    
    console.log(`[${type}] ${text}`);
    if (location.url && !location.url.includes('about:blank')) {
      console.log(`    → ${location.url}:${location.lineNumber}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR: ${error.message}`);
    console.log(`💥 STACK: ${error.stack}`);
    
    if (error.message.includes('Unexpected token')) {
      errorFound = true;
      errorDetails = { text: error.message, stack: error.stack };
    }
  });

  try {
    console.log('🔍 Loading page to capture the exact error...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Wait a bit for any errors to show up
    await page.waitForTimeout(5000);
    
    if (errorFound) {
      console.log('\n🎯 ERROR ANALYSIS:');
      console.log('='.repeat(50));
      console.log(JSON.stringify(errorDetails, null, 2));
    } else {
      console.log('\n❓ No "Unexpected token" error detected in this session');
    }
    
  } catch (error) {
    console.log(`💥 Debug failed: ${error.message}`);
  }

  setTimeout(async () => {
    await browser.close();
  }, 10000);
}

debugError().catch(console.error);