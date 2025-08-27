const { chromium } = require('playwright');

async function finalErrorCheck() {
  console.log('🔍 FINAL ERROR CHECK - Verifying NO JavaScript errors exist...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let hasAnyErrors = false;
  let errors = [];
  
  // Capture ALL console messages
  page.on('console', msg => {
    const text = msg.text();
    console.log(`📢 CONSOLE ${msg.type().toUpperCase()}: ${text}`);
    
    if (msg.type() === 'error') {
      hasAnyErrors = true;
      errors.push(text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR: ${error.message}`);
    hasAnyErrors = true;
    errors.push(error.message);
  });
  
  try {
    console.log('🌐 Loading home page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    console.log('🌐 Loading QR generator...');
    await page.goto('http://localhost:3000/qr-generator', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('🌐 Loading team page...');
    await page.goto('http://localhost:3000/team', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.log(`❌ PAGE LOAD ERROR: ${error.message}`);
    hasAnyErrors = true;
    errors.push(error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL ERROR CHECK RESULTS');
  console.log('='.repeat(60));
  
  if (!hasAnyErrors) {
    console.log('✅ SUCCESS: NO JAVASCRIPT ERRORS DETECTED!');
    console.log('✅ The chunk loading error has been completely eliminated!');
    console.log('✅ Application is running error-free!');
  } else {
    console.log('❌ ERRORS STILL EXIST:');
    errors.forEach(error => console.log(`   - ${error}`));
  }
  
  // Keep browser open for 8 seconds for visual inspection
  setTimeout(async () => {
    await browser.close();
    process.exit(hasAnyErrors ? 1 : 0);
  }, 8000);
}

finalErrorCheck().catch(console.error);