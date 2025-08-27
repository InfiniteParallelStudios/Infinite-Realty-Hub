const { chromium } = require('playwright');

async function pixelPerfectTest() {
  console.log('🔬 PIXEL-PERFECT APP TESTING - Testing every square inch\n');
  console.log('This will mimic exactly what you see in your browser...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000, // Very slow for visual inspection
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  let allErrors = [];
  let pageErrors = [];
  
  // Capture EVERYTHING
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    
    console.log(`[${type.toUpperCase()}] ${text}`);
    if (location.url && location.url !== 'about:blank') {
      console.log(`    📍 ${location.url}:${location.lineNumber}`);
    }
    
    if (type === 'error') {
      allErrors.push({ type, text, location });
    }
  });

  page.on('pageerror', error => {
    console.log(`💥 RUNTIME ERROR: ${error.message}`);
    console.log(`📍 Stack: ${error.stack}`);
    pageErrors.push(error);
  });

  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure) {
      console.log(`🌐 FAILED REQUEST: ${request.method()} ${request.url()}`);
      console.log(`    Error: ${failure.errorText}`);
      allErrors.push({ 
        type: 'network', 
        text: `Failed ${request.method()} ${request.url()}: ${failure.errorText}`,
        location: { url: request.url() }
      });
    }
  });

  const testPage = async (url, pageName, interactions = []) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 TESTING: ${pageName.toUpperCase()}`);
    console.log(`🌐 URL: ${url}`);
    console.log('='.repeat(80));
    
    try {
      console.log('📄 Loading page...');
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      
      // Wait for any dynamic content to load
      console.log('⏳ Waiting for content to stabilize...');
      await page.waitForTimeout(5000);
      
      // Check for any visible error messages
      const errorMessages = await page.evaluate(() => {
        const errors = [];
        
        // Check for Next.js error overlays
        const nextErrors = document.querySelectorAll('[data-nextjs-dialog]');
        nextErrors.forEach(el => {
          if (el.textContent) errors.push(`Next.js Error: ${el.textContent}`);
        });
        
        // Check for React error boundaries
        const reactErrors = document.querySelectorAll('[data-reactroot] *');
        reactErrors.forEach(el => {
          const text = el.textContent || '';
          if (text.includes('Error:') || text.includes('TypeError:') || text.includes('Failed to')) {
            errors.push(`React Error: ${text.slice(0, 100)}`);
          }
        });
        
        // Check for any element with error in class or text
        const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
        errorElements.forEach(el => {
          if (el.textContent && el.textContent.trim()) {
            errors.push(`Error Element: ${el.textContent.slice(0, 100)}`);
          }
        });
        
        return errors;
      });
      
      if (errorMessages.length > 0) {
        console.log('🚨 VISIBLE ERRORS ON PAGE:');
        errorMessages.forEach(err => console.log(`    ❌ ${err}`));
      } else {
        console.log('✅ No visible errors on page');
      }
      
      // Take screenshot for manual inspection
      await page.screenshot({
        path: `screenshot-${pageName.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: true
      });
      console.log(`📸 Screenshot saved: screenshot-${pageName.replace(/\s+/g, '-').toLowerCase()}.png`);
      
      // Run interactions
      for (const interaction of interactions) {
        console.log(`\n🖱️  Testing: ${interaction.name}`);
        try {
          await interaction.action(page);
          console.log(`    ✅ ${interaction.name} - OK`);
        } catch (error) {
          console.log(`    ❌ ${interaction.name} - Failed: ${error.message}`);
          allErrors.push({ 
            type: 'interaction', 
            text: `${interaction.name}: ${error.message}`,
            location: { url }
          });
        }
      }
      
    } catch (error) {
      console.log(`💥 FAILED TO TEST ${pageName}: ${error.message}`);
      pageErrors.push({ message: `${pageName}: ${error.message}`, stack: error.stack });
    }
  };

  // Define comprehensive interactions for each page type
  const authPageInteractions = [
    {
      name: 'Google Sign In Button',
      action: async (page) => {
        const googleBtn = await page.$('button:has-text("Google"), button:has-text("Continue with Google")');
        if (googleBtn) {
          await googleBtn.hover();
          console.log('      → Google button found and hoverable');
        } else {
          throw new Error('Google sign in button not found');
        }
      }
    },
    {
      name: 'Email Input Field',
      action: async (page) => {
        const emailInput = await page.$('input[type="email"]');
        if (emailInput) {
          await emailInput.click();
          await emailInput.fill('test@example.com');
          await page.waitForTimeout(500);
          await emailInput.clear();
          console.log('      → Email input works');
        } else {
          throw new Error('Email input not found');
        }
      }
    },
    {
      name: 'Password Input Field',
      action: async (page) => {
        const passwordInput = await page.$('input[type="password"]');
        if (passwordInput) {
          await passwordInput.click();
          await passwordInput.fill('testpassword');
          await page.waitForTimeout(500);
          await passwordInput.clear();
          console.log('      → Password input works');
        } else {
          throw new Error('Password input not found');
        }
      }
    }
  ];

  const qrGeneratorInteractions = [
    {
      name: 'Contact Name Input',
      action: async (page) => {
        const nameInput = await page.$('input[type="text"]:first-of-type');
        if (nameInput) {
          await nameInput.click();
          await nameInput.fill('Test Agent Name');
          console.log('      → Name input works');
        } else {
          throw new Error('Name input not found');
        }
      }
    },
    {
      name: 'Phone Input',
      action: async (page) => {
        const phoneInput = await page.$('input[type="tel"]');
        if (phoneInput) {
          await phoneInput.click();
          await phoneInput.fill('(555) 123-4567');
          console.log('      → Phone input works');
        } else {
          throw new Error('Phone input not found');
        }
      }
    },
    {
      name: 'Generate QR Button',
      action: async (page) => {
        const generateBtn = await page.$('button:has-text("Generate")');
        if (generateBtn) {
          await generateBtn.click();
          await page.waitForTimeout(3000);
          console.log('      → Generate button clicked');
          
          // Check if QR code appears
          const canvas = await page.$('canvas');
          if (canvas) {
            console.log('      → QR code canvas appeared');
          }
        } else {
          throw new Error('Generate QR button not found');
        }
      }
    }
  ];

  const navigationInteractions = [
    {
      name: 'All Navigation Links',
      action: async (page) => {
        const navLinks = await page.$$('nav a, [role="navigation"] a, a[href^="/"]');
        console.log(`      → Found ${navLinks.length} navigation links`);
        
        for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
          const link = navLinks[i];
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          if (href && href.startsWith('/') && !href.includes('callback')) {
            await link.hover();
            console.log(`      → Link "${text}" (${href}) is hoverable`);
          }
        }
      }
    }
  ];

  // Comprehensive page testing
  const pagesToTest = [
    { 
      url: 'http://localhost:3000', 
      name: 'Home Page', 
      interactions: [...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/auth/signin', 
      name: 'Sign In Page', 
      interactions: [...authPageInteractions, ...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/auth/signup', 
      name: 'Sign Up Page', 
      interactions: [...authPageInteractions, ...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/qr-generator', 
      name: 'QR Generator', 
      interactions: [...qrGeneratorInteractions, ...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/contacts', 
      name: 'Contacts Page', 
      interactions: [...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/dashboard', 
      name: 'Dashboard Page', 
      interactions: [...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/team', 
      name: 'Team Page', 
      interactions: [...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/settings', 
      name: 'Settings Page', 
      interactions: [...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/newsletter', 
      name: 'Newsletter Page', 
      interactions: [...navigationInteractions]
    },
    { 
      url: 'http://localhost:3000/market-test', 
      name: 'Market Test Page', 
      interactions: [...navigationInteractions]
    }
  ];

  // Test every single page
  for (const pageTest of pagesToTest) {
    await testPage(pageTest.url, pageTest.name, pageTest.interactions);
    await page.waitForTimeout(2000); // Pause between tests
  }

  // Final comprehensive error report
  console.log('\n' + '='.repeat(100));
  console.log('🎯 COMPREHENSIVE ERROR ANALYSIS - EVERYTHING FOUND');
  console.log('='.repeat(100));

  if (allErrors.length === 0 && pageErrors.length === 0) {
    console.log('\n🎉 PERFECT! NO ERRORS DETECTED ANYWHERE!');
    console.log('✅ Your red error box should be completely empty');
    console.log('✅ Every page loads without issues');
    console.log('✅ All interactions work properly');
  } else {
    console.log(`\n🚨 FOUND ${allErrors.length + pageErrors.length} TOTAL ISSUES:`);
    
    if (allErrors.length > 0) {
      console.log(`\n❌ CONSOLE/NETWORK ERRORS (${allErrors.length}):`);
      allErrors.forEach((error, i) => {
        console.log(`\n${i + 1}. [${error.type.toUpperCase()}] ${error.text}`);
        if (error.location && error.location.url) {
          console.log(`   📍 ${error.location.url}${error.location.lineNumber ? ':' + error.location.lineNumber : ''}`);
        }
      });
    }
    
    if (pageErrors.length > 0) {
      console.log(`\n💥 RUNTIME ERRORS (${pageErrors.length}):`);
      pageErrors.forEach((error, i) => {
        console.log(`\n${i + 1}. ${error.message}`);
        if (error.stack) {
          console.log(`   📍 ${error.stack.split('\n')[1]}`);
        }
      });
    }
  }

  console.log('\n📸 Screenshots saved for manual inspection');
  console.log('👀 Browser staying open for 20 seconds for your inspection...');
  
  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Pixel-perfect testing complete!');
    console.log('Check the screenshots and this output to see exactly what errors remain.');
  }, 20000);
}

pixelPerfectTest().catch(console.error);