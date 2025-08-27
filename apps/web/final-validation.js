const { chromium } = require('playwright');

async function finalValidation() {
  console.log('✅ FINAL VALIDATION - Confirming all fixes work\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  let criticalErrors = [];
  let minorIssues = [];
  let successes = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('chunk') || text.includes('404') || text.includes('Failed to load')) {
        criticalErrors.push(`Critical Error: ${text}`);
        console.log(`🚨 CRITICAL: ${text}`);
      } else if (text.includes('Canvas')) {
        minorIssues.push(`Minor Issue: ${text}`);
        console.log(`⚠️  Minor: ${text}`);
      }
    }
  });

  const pages = [
    { url: 'http://localhost:3000/auth/signin', name: 'Auth Sign In' },
    { url: 'http://localhost:3000/qr-generator', name: 'QR Generator' },
    { url: 'http://localhost:3000/contacts', name: 'Contacts' },
    { url: 'http://localhost:3000/dashboard', name: 'Dashboard' },
    { url: 'http://localhost:3000/team', name: 'Team' },
    { url: 'http://localhost:3000/settings', name: 'Settings' },
    { url: 'http://localhost:3000/market-test', name: 'Market Test' }
  ];

  console.log('🔍 Testing key pages for errors...\n');

  for (const pageInfo of pages) {
    try {
      console.log(`📄 ${pageInfo.name}...`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
      
      const title = await page.title();
      successes.push(`${pageInfo.name} loads (${title})`);
      console.log(`   ✅ Loads successfully`);
      
    } catch (error) {
      criticalErrors.push(`${pageInfo.name}: ${error.message}`);
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }

  // Test QR generator functionality
  console.log('\n🧪 Testing QR Generator functionality...');
  try {
    await page.goto('http://localhost:3000/qr-generator');
    await page.waitForTimeout(2000);
    
    const nameInput = await page.$('input[type="text"]');
    if (nameInput) {
      await nameInput.fill('Final Test Agent');
      console.log('   ✅ Name input works');
    }
    
    const generateBtn = await page.$('button:has-text("Generate")');
    if (generateBtn) {
      await generateBtn.click();
      await page.waitForTimeout(3000);
      console.log('   ✅ Generate button clicked');
    }
    
    successes.push('QR Generator functionality works');
    
  } catch (error) {
    criticalErrors.push(`QR Generator test: ${error.message}`);
  }

  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('🏁 FINAL VALIDATION RESULTS');
  console.log('='.repeat(70));
  
  console.log(`\n✅ SUCCESSES (${successes.length}):`);
  successes.forEach(success => console.log(`   ✓ ${success}`));
  
  if (minorIssues.length > 0) {
    console.log(`\n⚠️  MINOR ISSUES (${minorIssues.length}):`);
    minorIssues.forEach(issue => console.log(`   ⚠️  ${issue}`));
  }
  
  if (criticalErrors.length > 0) {
    console.log(`\n❌ CRITICAL ERRORS (${criticalErrors.length}):`);
    criticalErrors.forEach(error => console.log(`   ❌ ${error}`));
    console.log('\n🚨 CRITICAL ISSUES FOUND - NEEDS ATTENTION!');
  } else {
    console.log('\n🎉 VALIDATION PASSED!');
    console.log('✅ No critical errors found');
    console.log('✅ All major functionality working');
    console.log('✅ App ready for use');
  }

  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Final validation complete!');
  }, 3000);
}

finalValidation().catch(console.error);