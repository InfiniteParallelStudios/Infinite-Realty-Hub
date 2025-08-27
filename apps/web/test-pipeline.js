const { chromium } = require('playwright');

async function testPipeline() {
  console.log('🧪 PIPELINE PAGE SPECIFIC TEST');
  console.log('Testing for the "Unexpected token \'<\'" error the user reported\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  let errors = [];
  let syntaxErrors = [];
  
  // Capture all console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    console.log(`[${type.toUpperCase()}] ${text}`);
    
    if (type === 'error') {
      errors.push(text);
      
      // Check specifically for the syntax error reported
      if (text.includes('Unexpected token') || text.includes('SyntaxError')) {
        syntaxErrors.push(text);
        console.log('🚨 SYNTAX ERROR DETECTED:', text);
      }
      
      // Check for chunk loading errors
      if (text.includes('chunk') || text.includes('Loading chunk')) {
        console.log('🚨 CHUNK ERROR DETECTED:', text);
      }
    }
  });

  page.on('pageerror', error => {
    console.log(`💥 RUNTIME ERROR: ${error.message}`);
    console.log(`📍 Stack: ${error.stack}`);
    errors.push(error.message);
    
    if (error.message.includes('Unexpected token') || error.message.includes('SyntaxError')) {
      syntaxErrors.push(error.message);
    }
  });

  try {
    console.log('🔍 Step 1: Loading main app page...');
    await page.goto('http://localhost:3000/auth/signin', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('✅ Main page loaded successfully');

    console.log('\n🔍 Step 2: Testing pipeline page directly...');
    await page.goto('http://localhost:3000/pipeline', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    console.log('✅ Pipeline page loaded');

    // Test if the pipeline page renders without errors
    const pageContent = await page.evaluate(() => {
      const title = document.querySelector('h1');
      const cards = document.querySelectorAll('[class*="glass"], [class*="card"]');
      const buttons = document.querySelectorAll('button');
      
      return {
        hasTitle: !!title,
        titleText: title ? title.textContent : null,
        cardCount: cards.length,
        buttonCount: buttons.length,
        bodyContent: document.body.textContent.slice(0, 200)
      };
    });

    console.log('\n📊 Pipeline page content analysis:');
    console.log(`   - Has title: ${pageContent.hasTitle}`);
    console.log(`   - Title text: ${pageContent.titleText}`);
    console.log(`   - Cards found: ${pageContent.cardCount}`);
    console.log(`   - Buttons found: ${pageContent.buttonCount}`);
    console.log(`   - Content preview: ${pageContent.bodyContent}...`);

    // Check if the pipeline stages are rendered
    const pipelineStages = await page.evaluate(() => {
      const stages = document.querySelectorAll('[class*="stage"], h3');
      return Array.from(stages).map(stage => stage.textContent).slice(0, 5);
    });

    if (pipelineStages.length > 0) {
      console.log('\n📋 Pipeline stages found:');
      pipelineStages.forEach((stage, i) => {
        console.log(`   ${i + 1}. ${stage}`);
      });
    }

    // Test navigation to pipeline via bottom navigation (as user mentioned)
    console.log('\n🔍 Step 3: Testing pipeline navigation from auth page...');
    await page.goto('http://localhost:3000/auth/signin');
    await page.waitForTimeout(2000);
    
    // Look for pipeline navigation button
    const pipelineNav = await page.$('a[href="/pipeline"], button:has-text("pipeline"), a:has-text("Pipeline")');
    if (pipelineNav) {
      console.log('📱 Found pipeline navigation button');
      await pipelineNav.click();
      await page.waitForTimeout(3000);
      console.log('✅ Pipeline navigation clicked');
    } else {
      console.log('❌ Pipeline navigation button not found - testing direct URL only');
    }

    // Final error check
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PIPELINE TEST RESULTS');
    console.log('='.repeat(60));

    if (syntaxErrors.length === 0) {
      console.log('\n🎉 SUCCESS! No syntax errors detected!');
      console.log('✅ The "Unexpected token \'<\'" error appears to be fixed');
    } else {
      console.log(`\n🚨 ${syntaxErrors.length} SYNTAX ERRORS STILL PRESENT:`);
      syntaxErrors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    if (errors.length === 0) {
      console.log('✅ NO CONSOLE ERRORS - Pipeline page is clean!');
    } else {
      console.log(`\n⚠️  ${errors.length} OTHER CONSOLE ERRORS:`);
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

  } catch (error) {
    console.log(`💥 TEST FAILED: ${error.message}`);
  }

  // Keep browser open for manual inspection
  console.log('\n👀 Browser staying open for 15 seconds for manual inspection...');
  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Pipeline test complete!');
  }, 15000);
}

testPipeline().catch(console.error);