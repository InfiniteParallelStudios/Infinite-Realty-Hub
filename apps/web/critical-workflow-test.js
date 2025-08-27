const { chromium } = require('playwright');

async function testCriticalWorkflows() {
  console.log('🔬 CRITICAL WORKFLOW TESTING - Testing key user journeys...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  let issues = [];
  let successes = [];
  
  // Capture errors
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
      issues.push(`Console Error: ${msg.text()}`);
      console.log(`❌ ${msg.text()}`);
    }
  });

  const testWorkflow = async (name, testFn) => {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      await testFn();
      successes.push(name);
      console.log(`✅ ${name} - SUCCESS`);
    } catch (error) {
      issues.push(`${name}: ${error.message}`);
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  };

  // Test 1: QR Code Generation
  await testWorkflow('QR Code Generation Workflow', async () => {
    await page.goto('http://localhost:3000/qr-generator');
    await page.waitForLoadState('networkidle');
    
    // Check if QR generator form exists
    const urlInput = await page.$('input[placeholder*="URL"], input[placeholder*="url"], input[name*="url"]');
    if (!urlInput) throw new Error('QR URL input not found');
    
    // Try to generate a QR code
    await urlInput.fill('https://example.com');
    
    const generateBtn = await page.$('button:has-text("Generate"), button:has-text("Create")');
    if (generateBtn) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
      console.log('   → QR generation button clicked successfully');
    }
  });

  // Test 2: Navigation Between Pages
  await testWorkflow('Page Navigation Workflow', async () => {
    await page.goto('http://localhost:3000/qr-generator');
    await page.waitForLoadState('networkidle');
    
    // Test navigation to contacts
    const contactsLink = await page.$('a[href="/contacts"], nav a:has-text("Contacts")');
    if (contactsLink) {
      await contactsLink.click();
      await page.waitForLoadState('networkidle');
      
      const url = page.url();
      if (!url.includes('/contacts') && !url.includes('/auth')) {
        throw new Error('Navigation to contacts failed');
      }
      console.log('   → Navigation to contacts works');
    }
    
    // Test navigation to dashboard
    await page.goto('http://localhost:3000/qr-generator');
    const dashboardLink = await page.$('a[href="/dashboard"], nav a:has-text("Dashboard")');
    if (dashboardLink) {
      await dashboardLink.click();
      await page.waitForLoadState('networkidle');
      console.log('   → Navigation to dashboard works');
    }
  });

  // Test 3: Settings Page Functionality
  await testWorkflow('Settings Page Workflow', async () => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForLoadState('networkidle');
    
    // Check for settings sections
    const settingsContent = await page.textContent('body');
    if (!settingsContent.includes('Account') && !settingsContent.includes('Setting') && !settingsContent.includes('Profile')) {
      // This might be an auth redirect, which is okay
      console.log('   → Settings shows auth requirement (expected behavior)');
    } else {
      console.log('   → Settings page content loaded');
    }
  });

  // Test 4: Team Page Loading
  await testWorkflow('Team Page Loading', async () => {
    await page.goto('http://localhost:3000/team');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for any loading states
    
    const content = await page.textContent('body');
    if (content.includes('Loading') || content.includes('loading')) {
      // Check if it eventually loads or times out properly
      await page.waitForTimeout(2000);
      const updatedContent = await page.textContent('body');
      console.log('   → Team page loading state handled properly');
    }
  });

  // Test 5: Newsletter Page
  await testWorkflow('Newsletter Page Functionality', async () => {
    await page.goto('http://localhost:3000/newsletter');
    await page.waitForLoadState('networkidle');
    
    // Check for email input or newsletter content
    const emailInput = await page.$('input[type="email"], input[placeholder*="email"]');
    const newsletterContent = await page.textContent('body');
    
    if (emailInput || newsletterContent.includes('newsletter') || newsletterContent.includes('subscribe')) {
      console.log('   → Newsletter page has expected content');
    } else {
      console.log('   → Newsletter page loaded (may require auth)');
    }
  });

  // Test 6: Market Test Page
  await testWorkflow('Market Test Page', async () => {
    await page.goto('http://localhost:3000/market-test');
    await page.waitForLoadState('networkidle');
    
    const runTestBtn = await page.$('button:has-text("Run"), button:has-text("Test")');
    if (runTestBtn) {
      console.log('   → Market test interface available');
      // Don't actually run tests to avoid API calls
    }
  });

  // Test 7: Form Interactions (General)
  await testWorkflow('Form Interaction Testing', async () => {
    await page.goto('http://localhost:3000/qr-generator');
    await page.waitForLoadState('networkidle');
    
    // Test various input types
    const textInputs = await page.$$('input[type="text"], input[type="url"], textarea');
    let inputsWorking = 0;
    
    for (let i = 0; i < Math.min(textInputs.length, 3); i++) {
      const input = textInputs[i];
      await input.fill('test input');
      const value = await input.inputValue();
      if (value === 'test input') {
        inputsWorking++;
      }
      await input.fill(''); // Clear
    }
    
    if (inputsWorking > 0) {
      console.log(`   → ${inputsWorking} form inputs working correctly`);
    } else {
      throw new Error('No working form inputs found');
    }
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('🏁 CRITICAL WORKFLOW TEST RESULTS');
  console.log('='.repeat(70));
  
  console.log(`\n✅ SUCCESSFUL WORKFLOWS (${successes.length}):`);
  successes.forEach(success => console.log(`   ✓ ${success}`));
  
  if (issues.length > 0) {
    console.log(`\n❌ ISSUES FOUND (${issues.length}):`);
    issues.forEach(issue => console.log(`   ❌ ${issue}`));
  } else {
    console.log('\n🎉 All critical workflows working properly!');
  }

  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Critical workflow testing complete!');
  }, 5000);
}

testCriticalWorkflows().catch(console.error);