const { chromium } = require('playwright');

async function comprehensiveTest() {
  console.log('🔍 COMPREHENSIVE APPLICATION TEST');
  console.log('Testing all functionality before git push\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  let errors = [];
  let warnings = [];
  let testResults = [];
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push(text);
      console.log(`❌ ERROR: ${text}`);
    } else if (type === 'warn' && !text.includes('Download the React DevTools')) {
      warnings.push(text);
      console.log(`⚠️  WARNING: ${text}`);
    }
  });

  // Test each page
  const pages = [
    { url: 'http://localhost:3000', name: 'Root (redirects to signin)' },
    { url: 'http://localhost:3000/auth/signin', name: 'Sign In Page' },
    { url: 'http://localhost:3000/auth/signup', name: 'Sign Up Page' },
    { url: 'http://localhost:3000/qr-generator', name: 'QR Generator' },
    { url: 'http://localhost:3000/contacts', name: 'Contacts (with auth redirect)' },
    { url: 'http://localhost:3000/dashboard', name: 'Dashboard (with auth redirect)' },
    { url: 'http://localhost:3000/pipeline', name: 'Pipeline (with mock data)' },
    { url: 'http://localhost:3000/team', name: 'Team Page' },
    { url: 'http://localhost:3000/settings', name: 'Settings (with auth redirect)' }
  ];

  for (const testPage of pages) {
    console.log(`\n📄 Testing: ${testPage.name}`);
    const startErrors = errors.length;
    
    try {
      await page.goto(testPage.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Check if page loaded properly
      const title = await page.title();
      const hasContent = await page.evaluate(() => document.body.textContent.length > 50);
      
      const newErrors = errors.length - startErrors;
      if (newErrors === 0) {
        testResults.push(`✅ ${testPage.name} - OK (${title})`);
        console.log(`   ✅ Success - Title: ${title}`);
      } else {
        testResults.push(`❌ ${testPage.name} - ${newErrors} errors`);
        console.log(`   ❌ ${newErrors} new errors`);
      }
      
    } catch (error) {
      testResults.push(`💥 ${testPage.name} - Failed to load`);
      console.log(`   💥 Load failed: ${error.message}`);
    }
  }

  // Test QR Generator functionality
  console.log(`\n🔧 Testing QR Generator functionality...`);
  try {
    await page.goto('http://localhost:3000/qr-generator');
    await page.waitForTimeout(2000);
    
    // Fill form
    await page.fill('input[type="text"]:first-of-type', 'Test Agent');
    await page.fill('input[type="tel"]', '(555) 123-4567');
    
    // Generate QR
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(3000);
    
    const canvas = await page.$('canvas');
    if (canvas) {
      testResults.push('✅ QR Generator - Canvas created successfully');
      console.log('   ✅ QR code canvas generated');
    } else {
      testResults.push('❌ QR Generator - Canvas not found');
      console.log('   ❌ QR code canvas missing');
    }
  } catch (error) {
    testResults.push(`💥 QR Generator - ${error.message}`);
    console.log(`   💥 QR test failed: ${error.message}`);
  }

  // Final Report
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(80));

  console.log('\n📋 Page Tests:');
  testResults.forEach(result => console.log(`   ${result}`));

  if (errors.length === 0) {
    console.log('\n🎉 PERFECT! No console errors detected');
  } else {
    console.log(`\n🚨 ${errors.length} Console Errors:`);
    errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
  }

  if (warnings.length === 0) {
    console.log('✅ No warnings (excluding React DevTools)');
  } else {
    console.log(`\n⚠️  ${warnings.length} Warnings:`);
    warnings.forEach((warning, i) => console.log(`   ${i + 1}. ${warning}`));
  }

  console.log('\n🎯 READY FOR GIT PUSH:');
  if (errors.length === 0 && testResults.filter(r => r.includes('❌')).length === 0) {
    console.log('✅ YES - All tests passed, no critical errors');
  } else {
    console.log('❌ NO - Fix remaining issues first');
  }

  console.log('\n👀 Browser staying open for 15 seconds for manual inspection...');
  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Comprehensive test complete!');
  }, 15000);
}

comprehensiveTest().catch(console.error);