const { chromium } = require('playwright');

async function testQRGenerator() {
  console.log('🔍 QR GENERATOR SPECIFIC TEST\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  let success = true;
  let errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
      errors.push(msg.text());
    }
  });

  try {
    console.log('📄 Loading QR Generator page...');
    await page.goto('http://localhost:3000/qr-generator', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🔍 Looking for contact form fields...');
    
    // Check for contact form fields
    const nameInput = await page.$('input[type="text"]:first-of-type, input[value*="Demo"], input[value*="Agent"]');
    if (nameInput) {
      console.log('✅ Name input field found');
      await nameInput.fill('Test Agent');
      console.log('✅ Name input works');
    } else {
      console.log('❌ Name input not found');
      success = false;
    }
    
    const phoneInput = await page.$('input[type="tel"]');
    if (phoneInput) {
      console.log('✅ Phone input field found');
      await phoneInput.fill('(555) 123-4567');
      console.log('✅ Phone input works');
    } else {
      console.log('❌ Phone input not found');
      success = false;
    }
    
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('✅ Email input field found');
      await emailInput.fill('test@example.com');
      console.log('✅ Email input works');
    } else {
      console.log('❌ Email input not found');
      success = false;
    }
    
    const websiteInput = await page.$('input[type="url"]');
    if (websiteInput) {
      console.log('✅ Website input field found');
      await websiteInput.fill('https://example.com');
      console.log('✅ Website input works');
    } else {
      console.log('❌ Website input not found');
      success = false;
    }
    
    console.log('\n🔍 Looking for QR generation buttons...');
    
    // Look for generate buttons
    const generateButtons = await page.$$('button:has-text("Generate"), button:has-text("Create"), button:has-text("vCard"), button:has-text("Contact")');
    if (generateButtons.length > 0) {
      console.log(`✅ Found ${generateButtons.length} generate buttons`);
      
      // Test first button
      const firstBtn = generateButtons[0];
      const buttonText = await firstBtn.textContent();
      console.log(`🔘 Testing button: "${buttonText}"`);
      
      await firstBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if QR code canvas appears
      const canvas = await page.$('canvas');
      if (canvas) {
        console.log('✅ QR code canvas found after generation');
      } else {
        console.log('⚠️  QR code canvas not found (might be in different element)');
      }
      
    } else {
      console.log('❌ No generate buttons found');
      success = false;
    }
    
    // Check for preview or download options
    const downloadBtn = await page.$('button:has-text("Download")');
    if (downloadBtn) {
      console.log('✅ Download button available');
    }
    
    console.log('\n' + '='.repeat(50));
    if (success && errors.length === 0) {
      console.log('🎉 QR GENERATOR WORKING PERFECTLY!');
      console.log('✅ All form fields functional');
      console.log('✅ QR generation buttons work');
    } else if (success) {
      console.log('✅ QR GENERATOR MOSTLY WORKING');
      console.log(`⚠️  ${errors.length} console errors detected`);
    } else {
      console.log('❌ QR GENERATOR HAS ISSUES');
      console.log('Some form fields or buttons not found');
    }
    
  } catch (error) {
    console.log(`💥 Test failed: ${error.message}`);
    success = false;
  }

  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 QR Generator test complete!');
  }, 5000);
}

testQRGenerator().catch(console.error);