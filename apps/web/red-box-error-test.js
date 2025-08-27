const { chromium } = require('playwright');

async function checkRedBoxErrors() {
  console.log('🔍 CHECKING FOR RED BOX ERRORS - What you actually see\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  
  let errorsCaught = [];
  let warningsCaught = [];

  // Listen for ALL console messages
  page.on('console', async msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    if (type === 'error') {
      errorsCaught.push({
        message: text,
        url: location.url,
        line: location.lineNumber
      });
      console.log(`🚨 ERROR: ${text}`);
      if (location.url) {
        console.log(`   📍 ${location.url}:${location.lineNumber}`);
      }
    } else if (type === 'warning' || type === 'warn') {
      warningsCaught.push({
        message: text,
        url: location.url
      });
      console.log(`⚠️  WARNING: ${text}`);
    }
  });

  // Check specific pages you mentioned having issues
  const pagesToCheck = [
    'http://localhost:3000',
    'http://localhost:3000/qr-generator',
    'http://localhost:3000/contacts',
    'http://localhost:3000/dashboard'
  ];

  for (const url of pagesToCheck) {
    console.log(`\n📄 Checking ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000); // Give time for all errors to show
      
      // Check for visible error messages on page
      const visibleErrors = await page.evaluate(() => {
        const errors = [];
        
        // Check for error overlays/red boxes
        const errorOverlays = document.querySelectorAll('[data-nextjs-dialog], .nextjs-error, [id*="error"], [class*="error"]');
        for (const overlay of errorOverlays) {
          if (overlay.textContent && overlay.textContent.trim()) {
            errors.push(`Visible Error: ${overlay.textContent.slice(0, 200)}`);
          }
        }
        
        return errors;
      });
      
      if (visibleErrors.length > 0) {
        console.log(`   👀 VISIBLE ERRORS ON PAGE:`);
        visibleErrors.forEach(err => console.log(`      ${err}`));
        errorsCaught.push(...visibleErrors.map(e => ({ message: e, url, line: 0 })));
      } else {
        console.log(`   ✅ No visible errors detected`);
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to load: ${error.message}`);
      errorsCaught.push({ message: `Page load failed: ${error.message}`, url, line: 0 });
    }
  }

  // Final report
  console.log('\n' + '='.repeat(70));
  console.log('🎯 FINAL ERROR REPORT - What\'s in your red error box');
  console.log('='.repeat(70));

  if (errorsCaught.length === 0 && warningsCaught.length === 0) {
    console.log('\n🎉 NO ERRORS OR WARNINGS DETECTED!');
    console.log('✅ Your red error box should be empty');
  } else {
    if (errorsCaught.length > 0) {
      console.log(`\n❌ ERRORS (${errorsCaught.length}) - These show in red error box:`);
      errorsCaught.forEach((error, i) => {
        console.log(`\n${i + 1}. ${error.message}`);
        if (error.url && error.url !== 'about:blank') {
          console.log(`   From: ${error.url}${error.line ? ':' + error.line : ''}`);
        }
      });
    }

    if (warningsCaught.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warningsCaught.length}):`);
      warningsCaught.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.message}`);
      });
    }
  }

  console.log('\n👀 Browser will stay open for 10 seconds - check manually');
  console.log('   Look for the red error box in bottom left corner');
  
  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Red box error check complete!');
  }, 10000);
}

checkRedBoxErrors().catch(console.error);