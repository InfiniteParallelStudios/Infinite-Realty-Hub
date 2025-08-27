const { chromium } = require('playwright');

async function finalErrorTest() {
  console.log('🎯 FINAL COMPREHENSIVE ERROR TEST');
  console.log('Checking for ALL errors the user reported, especially the pipeline syntax error\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1500 });
  const page = await browser.newPage();
  
  let allErrors = [];
  let chunkErrors = [];
  let syntaxErrors = [];
  let turbopackErrors = [];
  
  // Capture ALL console messages with detailed categorization
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    // Only log errors and warnings to reduce noise
    if (type === 'error' || type === 'warn') {
      console.log(`[${type.toUpperCase()}] ${text}`);
      if (location.url && location.url !== 'about:blank') {
        console.log(`    📍 ${location.url}:${location.lineNumber}`);
      }
    }
    
    if (type === 'error') {
      allErrors.push(text);
      
      // Categorize specific error types the user reported
      if (text.includes('chunk') || text.includes('Loading chunk') || text.includes('app-pages-internals')) {
        chunkErrors.push(text);
        console.log('🚨 CHUNK LOADING ERROR:', text);
      }
      
      if (text.includes('Unexpected token') || text.includes('SyntaxError')) {
        syntaxErrors.push(text);
        console.log('🚨 SYNTAX ERROR:', text);
      }
      
      if (text.includes('Turbopack') || text.includes('turbo')) {
        turbopackErrors.push(text);
        console.log('🚨 TURBOPACK ERROR:', text);
      }
    }
  });

  page.on('pageerror', error => {
    console.log(`💥 RUNTIME ERROR: ${error.message}`);
    allErrors.push(error.message);
    
    if (error.message.includes('Unexpected token')) {
      syntaxErrors.push(error.message);
    }
  });

  // Test specific pages the user mentioned
  const testPages = [
    { url: 'http://localhost:3000', name: 'Root Page' },
    { url: 'http://localhost:3000/auth/signin', name: 'Sign In' },
    { url: 'http://localhost:3000/qr-generator', name: 'QR Generator' },
    { url: 'http://localhost:3000/contacts', name: 'Contacts' },
    { url: 'http://localhost:3000/dashboard', name: 'Dashboard' },
    { url: 'http://localhost:3000/pipeline', name: 'Pipeline (The problem page)' },
    { url: 'http://localhost:3000/team', name: 'Team' },
    { url: 'http://localhost:3000/settings', name: 'Settings' }
  ];

  for (const testPage of testPages) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🔍 TESTING: ${testPage.name}`);
    console.log(`🌐 URL: ${testPage.url}`);
    console.log('='.repeat(50));
    
    const pageStartErrors = allErrors.length;
    
    try {
      await page.goto(testPage.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // Check what actually loaded
      const pageInfo = await page.evaluate(() => ({
        title: document.title,
        url: window.location.href,
        hasContent: document.body.textContent.length > 100,
        contentPreview: document.body.textContent.slice(0, 100)
      }));
      
      console.log(`📄 Loaded: ${pageInfo.title}`);
      console.log(`📍 Final URL: ${pageInfo.url}`);
      console.log(`📝 Content: ${pageInfo.contentPreview}...`);
      
      const newErrors = allErrors.length - pageStartErrors;
      if (newErrors === 0) {
        console.log('✅ NO NEW ERRORS');
      } else {
        console.log(`❌ ${newErrors} NEW ERRORS`);
      }
      
    } catch (error) {
      console.log(`💥 FAILED: ${error.message}`);
      allErrors.push(`Page load failed: ${testPage.name} - ${error.message}`);
    }
  }

  // Special focus on pipeline page functionality
  console.log(`\n${'='.repeat(50)}`);
  console.log('🎯 SPECIAL PIPELINE TEST - Direct page check');
  console.log('='.repeat(50));
  
  try {
    // Test if pipeline page compiles and serves correctly
    const response = await page.goto('http://localhost:3000/pipeline', { 
      waitUntil: 'domcontentloaded', 
      timeout: 10000 
    });
    
    console.log(`📡 Response status: ${response.status()}`);
    console.log(`📡 Response headers: ${JSON.stringify(response.headers(), null, 2)}`);
    
    // Check if the response contains HTML (not an error)
    const contentType = response.headers()['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.log('✅ Pipeline page serves HTML correctly');
      
      // Wait and check for client-side errors
      await page.waitForTimeout(5000);
      
      // Check if the page has the expected pipeline content structure
      const pipelineContent = await page.evaluate(() => {
        const hasProtectedRoute = document.body.textContent.includes('ProtectedRoute') || 
                                  document.body.textContent.includes('auth') ||
                                  document.body.textContent.includes('sign');
        
        const hasPipelineContent = document.body.textContent.includes('Pipeline') ||
                                   document.body.textContent.includes('Sales') ||
                                   document.body.textContent.includes('demo');
        
        return { hasProtectedRoute, hasPipelineContent };
      });
      
      if (pipelineContent.hasProtectedRoute) {
        console.log('🔒 Pipeline redirected to auth (expected behavior)');
      } else if (pipelineContent.hasPipelineContent) {
        console.log('📊 Pipeline page content loaded successfully');
      } else {
        console.log('❓ Unknown pipeline page state');
      }
      
    } else {
      console.log('❌ Pipeline page did not return HTML');
    }
    
  } catch (error) {
    console.log(`💥 Pipeline special test failed: ${error.message}`);
  }

  // FINAL COMPREHENSIVE REPORT
  console.log('\n' + '='.repeat(100));
  console.log('🏁 FINAL ERROR REPORT - EXACTLY WHAT THE USER WILL SEE');
  console.log('='.repeat(100));

  if (allErrors.length === 0) {
    console.log('\n🎉 PERFECT SUCCESS! ZERO ERRORS DETECTED!');
    console.log('✅ The red error box should be completely empty');
    console.log('✅ All pages load without JavaScript errors');
    console.log('✅ No chunk loading failures');
    console.log('✅ No syntax errors');
    console.log('✅ No Turbopack errors');
  } else {
    console.log(`\n🚨 ${allErrors.length} TOTAL ERRORS FOUND:`);
    
    if (syntaxErrors.length > 0) {
      console.log(`\n💥 ${syntaxErrors.length} SYNTAX ERRORS (CRITICAL):`);;
      syntaxErrors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
      console.log('\n❌ THE PIPELINE "Unexpected token" ERROR IS STILL PRESENT!');
    } else {
      console.log('\n✅ NO SYNTAX ERRORS - Pipeline fix successful!');
    }
    
    if (chunkErrors.length > 0) {
      console.log(`\n📦 ${chunkErrors.length} CHUNK LOADING ERRORS:`);;
      chunkErrors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
    } else {
      console.log('✅ NO CHUNK LOADING ERRORS');
    }
    
    if (turbopackErrors.length > 0) {
      console.log(`\n⚡ ${turbopackErrors.length} TURBOPACK ERRORS:`);;
      turbopackErrors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
    } else {
      console.log('✅ NO TURBOPACK ERRORS');
    }
    
    console.log('\n📋 ALL OTHER ERRORS:');
    allErrors.filter(error => 
      !syntaxErrors.includes(error) && 
      !chunkErrors.includes(error) && 
      !turbopackErrors.includes(error)
    ).forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
  }

  console.log('\n👀 Browser staying open for 20 seconds for final manual verification...');
  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Final error test complete!');
    console.log('🎯 Check your browser\'s red error box - it should match this report!');
  }, 20000);
}

finalErrorTest().catch(console.error);