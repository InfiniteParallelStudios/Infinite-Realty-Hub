#!/usr/bin/env node

/**
 * FUNCTIONAL BUTTON TESTING SUITE
 * Tests that ALL buttons actually perform meaningful functions when clicked
 * Not just that they're clickable, but that they DO SOMETHING
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class FunctionalButtonTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.functionalButtons = [];
    this.nonFunctionalButtons = [];
  }

  async initialize() {
    console.log('🔧 FUNCTIONAL BUTTON TESTING: Verifying ALL buttons actually work');
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 300,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Listen for all events to detect functionality
    this.page.on('dialog', async dialog => {
      console.log(`   📢 Alert/Dialog triggered: "${dialog.message()}"`);
      await dialog.accept();
    });
    
    this.page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('api')) {
        console.log(`   📡 API call detected: ${response.url()}`);
      }
    });
  }

  async testButtonFunctionality(page, buttonDescription) {
    console.log(`🔍 Testing: ${buttonDescription}`);
    
    try {
      await this.page.goto(`${this.baseUrl}${page}`, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all buttons on the page
      const buttons = await this.page.$$('button');
      console.log(`   Found ${buttons.length} buttons on ${page}`);
      
      const buttonTests = [];
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        
        try {
          // Get button info
          const buttonInfo = await this.page.evaluate(btn => {
            return {
              text: btn.textContent?.trim() || '',
              disabled: btn.disabled,
              className: btn.className,
              type: btn.type,
              id: btn.id
            };
          }, button);
          
          if (buttonInfo.disabled || !buttonInfo.text) {
            continue; // Skip disabled or empty buttons
          }
          
          console.log(`   🔘 Testing button: "${buttonInfo.text}"`);
          
          // Record initial state
          const initialUrl = this.page.url();
          const initialContent = await this.page.content();
          
          // Test for various signs of functionality
          let functionalityDetected = {
            urlChanged: false,
            modalOpened: false,
            contentChanged: false,
            dialogTriggered: false,
            apiCalled: false,
            emailTriggered: false,
            telTriggered: false
          };
          
          // Set up listeners for this specific button test
          let dialogDetected = false;
          let navigationDetected = false;
          
          const dialogListener = async (dialog) => {
            dialogDetected = true;
            functionalityDetected.dialogTriggered = true;
            console.log(`     ✅ Dialog/Alert triggered by "${buttonInfo.text}"`);
            await dialog.accept();
          };
          
          const responseListener = (response) => {
            if (response.url().includes('supabase') || response.url().includes('api')) {
              functionalityDetected.apiCalled = true;
              console.log(`     ✅ API call triggered by "${buttonInfo.text}"`);
            }
            if (response.url().startsWith('mailto:')) {
              functionalityDetected.emailTriggered = true;
              console.log(`     ✅ Email client triggered by "${buttonInfo.text}"`);
            }
            if (response.url().startsWith('tel:')) {
              functionalityDetected.telTriggered = true;
              console.log(`     ✅ Phone dialer triggered by "${buttonInfo.text}"`);
            }
          };
          
          this.page.on('dialog', dialogListener);
          this.page.on('response', responseListener);
          
          // Click the button
          await button.click();
          await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for any effects
          
          // Check for changes
          const newUrl = this.page.url();
          const newContent = await this.page.content();
          
          if (newUrl !== initialUrl) {
            functionalityDetected.urlChanged = true;
            console.log(`     ✅ URL changed by "${buttonInfo.text}": ${initialUrl} → ${newUrl}`);
          }
          
          // Check for modal/popup/new content
          if (newContent.length !== initialContent.length) {
            functionalityDetected.contentChanged = true;
            console.log(`     ✅ Page content changed by "${buttonInfo.text}"`);
          }
          
          // Check for modals specifically
          const modals = await this.page.$$('[role="dialog"], .modal, .popup');
          if (modals.length > 0) {
            functionalityDetected.modalOpened = true;
            console.log(`     ✅ Modal opened by "${buttonInfo.text}"`);
          }
          
          // Clean up listeners
          this.page.off('dialog', dialogListener);
          this.page.off('response', responseListener);
          
          // Determine if button is functional
          const isFunctional = Object.values(functionalityDetected).some(Boolean);
          
          const result = {
            text: buttonInfo.text,
            page: page,
            functional: isFunctional,
            functionality: functionalityDetected,
            issue: isFunctional ? null : 'No functionality detected'
          };
          
          if (isFunctional) {
            console.log(`     ✅ "${buttonInfo.text}" is FUNCTIONAL`);
            this.functionalButtons.push(result);
          } else {
            console.log(`     ❌ "${buttonInfo.text}" appears NON-FUNCTIONAL`);
            this.nonFunctionalButtons.push(result);
          }
          
          buttonTests.push(result);
          
          // Reset page if URL changed
          if (newUrl !== initialUrl) {
            await this.page.goto(`${this.baseUrl}${page}`, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error) {
          console.log(`     💥 Error testing button: ${error.message}`);
          this.nonFunctionalButtons.push({
            text: buttonInfo?.text || 'Unknown',
            page: page,
            functional: false,
            issue: `Error: ${error.message}`
          });
        }
      }
      
      return buttonTests;
      
    } catch (error) {
      console.log(`💥 Error testing page ${page}: ${error.message}`);
      return [];
    }
  }

  async runComprehensiveFunctionalityTest() {
    console.log('🧪 TESTING: Comprehensive Button Functionality');
    
    const testPages = [
      { page: '/testing', description: 'Testing Page Buttons' },
      // Add more pages as they become accessible
    ];
    
    for (const { page, description } of testPages) {
      const pageResults = await this.testButtonFunctionality(page, description);
      this.testResults.push({
        page,
        description,
        results: pageResults
      });
    }
    
    return {
      totalButtons: this.functionalButtons.length + this.nonFunctionalButtons.length,
      functionalButtons: this.functionalButtons.length,
      nonFunctionalButtons: this.nonFunctionalButtons.length,
      functionalityRate: ((this.functionalButtons.length / (this.functionalButtons.length + this.nonFunctionalButtons.length)) * 100).toFixed(2)
    };
  }

  async analyzeSourceCodeForMissingFunctionality() {
    console.log('\n🔍 ANALYZING SOURCE CODE for non-functional buttons...');
    
    const srcDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/src';
    const issues = [];
    
    // Function to recursively find files
    const findFiles = (dir, extension) => {
      const files = [];
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...findFiles(fullPath, extension));
        } else if (item.endsWith(extension)) {
          files.push(fullPath);
        }
      }
      
      return files;
    };
    
    const tsxFiles = findFiles(srcDir, '.tsx');
    
    for (const file of tsxFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for buttons without onClick handlers
        const buttonRegex = /<button[^>]*>(.*?)<\/button>/gs;
        const matches = content.match(buttonRegex) || [];
        
        for (const match of matches) {
          if (!match.includes('onClick') && !match.includes('type="submit"')) {
            const textMatch = match.match(/>([^<]+)</);
            const buttonText = textMatch ? textMatch[1].trim() : 'Unknown';
            
            if (buttonText && buttonText.length > 0 && !buttonText.includes('<')) {
              issues.push({
                file: file.replace('/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/src/', ''),
                buttonText,
                issue: 'Missing onClick handler',
                code: match.replace(/\s+/g, ' ').trim()
              });
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return issues;
  }

  async generateFunctionalityReport() {
    console.log('📊 Generating functionality report...');
    
    const codeIssues = await this.analyzeSourceCodeForMissingFunctionality();
    
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Button Functionality Testing',
      summary: {
        totalButtonsTested: this.functionalButtons.length + this.nonFunctionalButtons.length,
        functionalButtons: this.functionalButtons.length,
        nonFunctionalButtons: this.nonFunctionalButtons.length,
        functionalityRate: this.functionalButtons.length + this.nonFunctionalButtons.length > 0 
          ? ((this.functionalButtons.length / (this.functionalButtons.length + this.nonFunctionalButtons.length)) * 100).toFixed(2)
          : '0'
      },
      functionalButtons: this.functionalButtons,
      nonFunctionalButtons: this.nonFunctionalButtons,
      codeAnalysis: {
        issuesFound: codeIssues.length,
        issues: codeIssues
      }
    };
    
    // Save report
    const logsDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const reportFile = path.join(logsDir, 'button-functionality-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📄 Button functionality report saved: ${reportFile}`);
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      
      const results = await this.runComprehensiveFunctionalityTest();
      const report = await this.generateFunctionalityReport();
      
      console.log('\n' + '='.repeat(70));
      console.log('🔧 BUTTON FUNCTIONALITY TEST RESULTS');
      console.log('='.repeat(70));
      console.log(`📊 Total Buttons Tested: ${results.totalButtons}`);
      console.log(`✅ Functional Buttons: ${results.functionalButtons}`);
      console.log(`❌ Non-Functional Buttons: ${results.nonFunctionalButtons}`);
      console.log(`📈 Functionality Rate: ${results.functionalityRate}%`);
      
      if (this.nonFunctionalButtons.length > 0) {
        console.log('\n⚠️  NON-FUNCTIONAL BUTTONS FOUND:');
        this.nonFunctionalButtons.forEach((button, index) => {
          console.log(`   ${index + 1}. "${button.text}" on ${button.page} - ${button.issue}`);
        });
      }
      
      if (report.codeAnalysis.issuesFound > 0) {
        console.log(`\n🔍 CODE ANALYSIS: Found ${report.codeAnalysis.issuesFound} buttons without onClick handlers`);
        report.codeAnalysis.issues.slice(0, 5).forEach((issue, index) => {
          console.log(`   ${index + 1}. "${issue.buttonText}" in ${issue.file}`);
        });
        if (report.codeAnalysis.issues.length > 5) {
          console.log(`   ... and ${report.codeAnalysis.issues.length - 5} more`);
        }
      }
      
      return report;
      
    } catch (error) {
      console.error(`💥 Button functionality testing failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new FunctionalButtonTester();
  tester.run()
    .then(report => {
      if (report.summary.nonFunctionalButtons > 0) {
        console.log('\n🚨 NON-FUNCTIONAL BUTTONS DETECTED');
        process.exit(1);
      } else {
        console.log('\n🎉 ALL BUTTONS ARE FUNCTIONAL!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = FunctionalButtonTester;