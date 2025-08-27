const { chromium } = require('playwright');

async function quickErrorCheck() {
  console.log('🔍 QUICK ERROR CHECK - Focusing on red box errors\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  let criticalErrors = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      criticalErrors.push(text);
      console.log(`🚨 ERROR: ${text}`);
    } else if (type === 'warn' && text.includes('Canvas')) {
      criticalErrors.push(text);
      console.log(`⚠️  CANVAS WARNING: ${text}`);
    }
  });

  page.on('pageerror', error => {
    criticalErrors.push(error.message);
    console.log(`💥 RUNTIME ERROR: ${error.message}`);
  });

  const pages = [
    'http://localhost:3000/auth/signin',
    'http://localhost:3000/qr-generator',
    'http://localhost:3000/contacts',
    'http://localhost:3000/dashboard'
  ];

  for (const url of pages) {
    console.log(`\n📄 Testing ${url.split('/').pop()}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(3000);
      console.log('   ✅ Loaded successfully');
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      criticalErrors.push(`Page load failed: ${error.message}`);
    }
  }

  // Test QR generation specifically
  console.log('\n🧪 Testing QR generation...');
  try {
    await page.goto('http://localhost:3000/qr-generator');
    await page.waitForTimeout(2000);
    
    const generateBtn = await page.$('button:has-text("Generate")');
    if (generateBtn) {
      await generateBtn.click();
      await page.waitForTimeout(4000); // Give more time for canvas
      console.log('   ✅ QR generation attempted');
    }
  } catch (error) {
    console.log(`   ❌ QR test failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 CRITICAL ERROR SUMMARY');
  console.log('='.repeat(60));

  if (criticalErrors.length === 0) {
    console.log('\n🎉 NO CRITICAL ERRORS DETECTED!');
    console.log('✅ Red error box should be clean');
  } else {
    console.log(`\n🚨 ${criticalErrors.length} CRITICAL ERRORS FOUND:`);
    criticalErrors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  }

  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Quick error check complete!');
  }, 8000);
}

quickErrorCheck().catch(console.error);