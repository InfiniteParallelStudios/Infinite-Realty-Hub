#!/usr/bin/env node

/**
 * CONTACT EDIT BUTTON TESTING
 * Specific test to verify contact edit functionality
 */

const puppeteer = require('puppeteer');

class ContactEditTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🔍 TESTING: Contact Edit Button Functionality');
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 200
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async testContactEditButton() {
    console.log('📝 Testing Contact Edit Button');
    
    // First, let's check the contact page source code analysis
    await this.page.goto(`${this.baseUrl}/contacts`, { waitUntil: 'networkidle2' });
    
    const currentUrl = this.page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/auth/signin')) {
      console.log('⚠️  Page redirected to authentication - contacts are protected');
      console.log('🔍 Looking for edit button in the source code instead...');
      
      // Read the actual component file to analyze the edit button
      const fs = require('fs');
      const contactListPath = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/src/components/crm/contact-list.tsx';
      
      if (fs.existsSync(contactListPath)) {
        const content = fs.readFileSync(contactListPath, 'utf8');
        
        // Look for edit button
        const editButtonMatch = content.match(/<button[^>]*>[\s\S]*?Edit[\s\S]*?<\/button>/g);
        const onClickMatch = content.match(/onClick.*Edit/g);
        
        console.log('\n📋 ANALYSIS RESULTS:');
        console.log('='.repeat(50));
        
        if (editButtonMatch) {
          console.log('✅ Edit button found in component');
          console.log('📝 Button code:');
          editButtonMatch.forEach((match, index) => {
            console.log(`   ${index + 1}. ${match.replace(/\s+/g, ' ').trim()}`);
          });
        } else {
          console.log('❌ No Edit button found in component');
        }
        
        if (onClickMatch) {
          console.log('✅ Edit button has onClick handler');
          onClickMatch.forEach((match, index) => {
            console.log(`   ${index + 1}. ${match}`);
          });
        } else {
          console.log('❌ Edit button missing onClick handler - THIS IS THE ISSUE!');
        }
        
        // Look for the specific line
        const lines = content.split('\n');
        const editButtonLine = lines.find(line => line.includes('Edit') && line.includes('button'));
        if (editButtonLine) {
          const lineNumber = lines.indexOf(editButtonLine) + 1;
          console.log(`\n🎯 Found Edit button at line ${lineNumber}:`);
          console.log(`   ${editButtonLine.trim()}`);
          
          if (!editButtonLine.includes('onClick')) {
            console.log('🚨 CONFIRMED: Edit button has NO onClick handler!');
            console.log('💡 SOLUTION: Add onClick handler to make button functional');
          }
        }
        
        return {
          buttonExists: !!editButtonMatch,
          hasOnClick: !!onClickMatch,
          issue: !onClickMatch ? 'Missing onClick handler' : 'Unknown',
          needsFix: !onClickMatch
        };
      }
    }
    
    return {
      buttonExists: false,
      hasOnClick: false,
      issue: 'Could not access contacts page due to authentication',
      needsFix: true
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      const result = await this.testContactEditButton();
      
      console.log('\n' + '='.repeat(60));
      console.log('🎯 CONTACT EDIT BUTTON TEST RESULTS');
      console.log('='.repeat(60));
      console.log(`Button Exists: ${result.buttonExists ? '✅' : '❌'}`);
      console.log(`Has Click Handler: ${result.hasOnClick ? '✅' : '❌'}`);
      console.log(`Issue: ${result.issue}`);
      console.log(`Needs Fix: ${result.needsFix ? '🔧 YES' : '✅ NO'}`);
      
      if (result.needsFix) {
        console.log('\n🛠️  RECOMMENDED FIX:');
        console.log('Add onClick handler to the Edit button in contact-list.tsx');
        console.log('Example: onClick={() => onEditContact(contact.id)}');
      }
      
      return result;
      
    } catch (error) {
      console.error(`💥 Test failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new ContactEditTester();
  tester.run()
    .then(result => {
      if (result.needsFix) {
        console.log('\n🚨 ISSUE CONFIRMED: Edit button needs onClick handler');
        process.exit(1);
      } else {
        console.log('\n✅ Edit button is functional');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = ContactEditTester;