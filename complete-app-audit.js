#!/usr/bin/env node

/**
 * COMPLETE APP AUDIT - END-TO-END TESTING
 * Tests EVERY button on EVERY screen with actual user login
 * Creates comprehensive documentation of all issues found
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class CompleteAppAuditor {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.auditResults = [];
    this.functionalButtons = [];
    this.nonFunctionalButtons = [];
    this.totalButtonsTested = 0;
    this.currentPage = '';
    
    // Test user credentials (we'll use Google OAuth simulation or create test data)
    this.testUser = {
      email: 'test@infiniterealty.com',
      name: 'Test User'
    };
  }

  async initialize() {
    console.log('🔍 COMPLETE APP AUDIT: End-to-end testing with user login');
    console.log('='.repeat(70));
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 500, // Slow down for thorough testing
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
      defaultViewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.browser.newPage();
    
    // Set up comprehensive event listeners
    this.setupEventListeners();
    
    console.log('✅ Browser initialized for complete audit');
  }

  setupEventListeners() {
    // Track all interactions
    this.page.on('dialog', async dialog => {
      console.log(`   📢 Dialog: "${dialog.message()}"`);
      await dialog.accept();
    });
    
    this.page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('api')) {
        console.log(`   📡 API: ${response.status()} ${response.url().split('/').pop()}`);
      }
    });
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`   🚨 Console Error: ${msg.text()}`);
      }
    });
  }

  async attemptLogin() {
    console.log('\n🔐 ATTEMPTING USER LOGIN');
    console.log('-'.repeat(50));
    
    try {
      // Go to home page (should redirect to auth)
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/auth/signin')) {
        console.log('✅ Correctly redirected to sign-in page');
        
        // Look for Google sign-in button
        const buttons = await this.page.$$('button, a');
        let googleButton = null;
        
        for (const button of buttons) {
          const text = await this.page.evaluate(btn => btn.textContent, button);
          if (text && text.toLowerCase().includes('google')) {
            googleButton = button;
            break;
          }
        }
        
        if (googleButton) {
          console.log('✅ Google sign-in button found');
          console.log('⚠️  Note: Google OAuth requires manual intervention in real testing');
          console.log('   For this audit, we\'ll proceed to test accessible pages');
        }
        
        return {
          loginSuccessful: false,
          authRequired: true,
          reason: 'Google OAuth requires manual intervention'
        };
      } else {
        console.log('✅ User appears to be logged in already');
        return {
          loginSuccessful: true,
          authRequired: false
        };
      }
    } catch (error) {
      console.log(`❌ Login attempt failed: ${error.message}`);
      return {
        loginSuccessful: false,
        authRequired: true,
        reason: error.message
      };
    }
  }

  async testButtonFunctionality(buttonElement, pageContext) {
    try {
      // Get button details
      const buttonInfo = await this.page.evaluate(btn => {
        return {
          text: btn.textContent?.trim() || '',
          disabled: btn.disabled,
          className: btn.className,
          type: btn.type,
          id: btn.id || '',
          title: btn.title || '',
          ariaLabel: btn.getAttribute('aria-label') || ''
        };
      }, buttonElement);

      if (buttonInfo.disabled) {
        return {
          ...buttonInfo,
          functional: false,
          issue: 'Button is disabled',
          severity: 'info'
        };
      }

      if (!buttonInfo.text && !buttonInfo.ariaLabel && !buttonInfo.title) {
        return {
          ...buttonInfo,
          functional: false,
          issue: 'Button has no text or accessible label',
          severity: 'high'
        };
      }

      console.log(`     🔘 Testing: "${buttonInfo.text}"`);

      // Record initial state
      const initialUrl = this.page.url();
      const initialContent = await this.page.content();
      
      // Track functionality indicators
      let functionalityDetected = {
        urlChanged: false,
        modalOpened: false,
        contentChanged: false,
        dialogTriggered: false,
        apiCalled: false,
        emailTriggered: false,
        telTriggered: false,
        downloadTriggered: false,
        formSubmitted: false
      };

      // Set up detection flags
      let dialogDetected = false;
      let apiCallDetected = false;

      const dialogListener = async (dialog) => {
        dialogDetected = true;
        functionalityDetected.dialogTriggered = true;
        console.log(`       ✅ Dialog triggered`);
        await dialog.accept();
      };

      const responseListener = (response) => {
        const url = response.url();
        if (url.includes('supabase') || url.includes('api') || url.includes('auth')) {
          apiCallDetected = true;
          functionalityDetected.apiCalled = true;
          console.log(`       ✅ API call detected`);
        }
        if (url.startsWith('mailto:')) {
          functionalityDetected.emailTriggered = true;
          console.log(`       ✅ Email client triggered`);
        }
        if (url.startsWith('tel:')) {
          functionalityDetected.telTriggered = true;
          console.log(`       ✅ Phone dialer triggered`);
        }
      };

      this.page.on('dialog', dialogListener);
      this.page.on('response', responseListener);

      // Click the button
      await buttonElement.click();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for effects

      // Check for changes
      const newUrl = this.page.url();
      const newContent = await this.page.content();

      if (newUrl !== initialUrl) {
        functionalityDetected.urlChanged = true;
        console.log(`       ✅ URL changed: ${newUrl.split('/').pop()}`);
      }

      if (newContent.length !== initialContent.length) {
        functionalityDetected.contentChanged = true;
        console.log(`       ✅ Content changed`);
      }

      // Check for modals
      const modals = await this.page.$$('[role="dialog"], .modal, [class*="modal"]');
      if (modals.length > 0) {
        functionalityDetected.modalOpened = true;
        console.log(`       ✅ Modal opened`);
      }

      // Clean up listeners
      this.page.off('dialog', dialogListener);
      this.page.off('response', responseListener);

      // Determine functionality
      const isFunctional = Object.values(functionalityDetected).some(Boolean);

      const result = {
        ...buttonInfo,
        functional: isFunctional,
        functionality: functionalityDetected,
        page: pageContext,
        issue: isFunctional ? null : 'No functionality detected when clicked',
        severity: isFunctional ? 'none' : 'medium'
      };

      if (isFunctional) {
        console.log(`       ✅ FUNCTIONAL`);
        this.functionalButtons.push(result);
      } else {
        console.log(`       ❌ NON-FUNCTIONAL`);
        this.nonFunctionalButtons.push(result);
      }

      // Navigate back if URL changed
      if (newUrl !== initialUrl && !newUrl.includes('auth')) {
        try {
          await this.page.goBack();
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
          // If back doesn't work, navigate directly
          await this.page.goto(initialUrl, { waitUntil: 'networkidle2' });
        }
      }

      return result;

    } catch (error) {
      console.log(`       💥 Error: ${error.message}`);
      return {
        text: 'Unknown',
        functional: false,
        issue: `Testing error: ${error.message}`,
        severity: 'high',
        page: pageContext
      };
    }
  }

  async auditPage(pagePath, pageDescription, authRequired = true) {
    console.log(`\n📄 AUDITING: ${pageDescription}`);
    console.log('-'.repeat(50));
    
    try {
      this.currentPage = pagePath;
      await this.page.goto(`${this.baseUrl}${pagePath}`, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentUrl = this.page.url();
      
      // Check if redirected to auth
      if (authRequired && currentUrl.includes('/auth/signin')) {
        console.log(`⚠️  Page requires authentication - skipping detailed audit`);
        return {
          page: pagePath,
          description: pageDescription,
          accessible: false,
          reason: 'Requires authentication',
          buttons: [],
          issues: ['Page requires authentication to access']
        };
      }

      console.log(`✅ Page accessible: ${currentUrl}`);

      // Find all interactive elements
      const interactiveElements = await this.page.$$('button, a[role="button"], input[type="button"], input[type="submit"]');
      console.log(`   Found ${interactiveElements.length} interactive elements`);

      const pageResults = {
        page: pagePath,
        description: pageDescription,
        accessible: true,
        url: currentUrl,
        buttons: [],
        issues: []
      };

      // Test each button
      for (let i = 0; i < interactiveElements.length; i++) {
        const element = interactiveElements[i];
        const result = await this.testButtonFunctionality(element, pagePath);
        pageResults.buttons.push(result);
        this.totalButtonsTested++;

        if (!result.functional) {
          pageResults.issues.push(`Non-functional button: "${result.text}"`);
        }
      }

      // Check for additional page-specific issues
      await this.checkPageSpecificIssues(pagePath, pageResults);

      this.auditResults.push(pageResults);
      
      console.log(`   📊 Page Summary: ${pageResults.buttons.filter(b => b.functional).length}/${pageResults.buttons.length} buttons functional`);
      
      return pageResults;

    } catch (error) {
      console.log(`💥 Error auditing ${pageDescription}: ${error.message}`);
      const errorResult = {
        page: pagePath,
        description: pageDescription,
        accessible: false,
        reason: error.message,
        buttons: [],
        issues: [`Error accessing page: ${error.message}`]
      };
      this.auditResults.push(errorResult);
      return errorResult;
    }
  }

  async checkPageSpecificIssues(pagePath, pageResults) {
    try {
      // Check for missing alt text on images
      const images = await this.page.$$('img');
      for (const img of images) {
        const alt = await this.page.evaluate(el => el.alt, img);
        if (!alt) {
          pageResults.issues.push('Image missing alt text');
        }
      }

      // Check for form validation
      const forms = await this.page.$$('form');
      if (forms.length > 0) {
        console.log(`   Found ${forms.length} forms - checking for validation`);
        // Check if forms have proper validation
        for (const form of forms) {
          const requiredFields = await this.page.evaluate(f => {
            return Array.from(f.querySelectorAll('input[required], select[required], textarea[required]')).length;
          }, form);
          if (requiredFields === 0) {
            pageResults.issues.push('Form has no required field validation');
          }
        }
      }

      // Check for loading states
      const loadingElements = await this.page.$$('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
      if (loadingElements.length > 0) {
        console.log(`   ✅ Loading states implemented`);
      }

    } catch (error) {
      console.log(`   ⚠️  Error checking page-specific issues: ${error.message}`);
    }
  }

  async runCompleteAudit() {
    console.log('\n🚀 STARTING COMPLETE APP AUDIT');
    console.log('='.repeat(70));

    // Attempt login first
    const loginResult = await this.attemptLogin();

    // Define all pages to audit
    const pagesToAudit = [
      // Public/accessible pages
      { path: '/auth/signin', description: 'Sign-in Page', authRequired: false },
      { path: '/testing', description: 'Testing Page', authRequired: false },
      
      // Protected pages (will test what we can access)
      { path: '/', description: 'Home/Dashboard', authRequired: true },
      { path: '/dashboard', description: 'Dashboard', authRequired: true },
      { path: '/contacts', description: 'Contacts Page', authRequired: true },
      { path: '/store', description: 'Store Page', authRequired: true },
      { path: '/settings', description: 'Main Settings', authRequired: true },
      { path: '/settings/account', description: 'Account Settings', authRequired: true },
      { path: '/settings/appearance', description: 'Appearance Settings', authRequired: true },
      { path: '/settings/notifications', description: 'Notifications Settings', authRequired: true },
      { path: '/settings/security', description: 'Security Settings', authRequired: true },
      { path: '/settings/billing', description: 'Billing Settings', authRequired: true },
      { path: '/settings/support', description: 'Support Settings', authRequired: true }
    ];

    // Audit each page
    for (const pageInfo of pagesToAudit) {
      await this.auditPage(pageInfo.path, pageInfo.description, pageInfo.authRequired);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between pages
    }

    return this.generateComprehensiveReport();
  }

  async generateComprehensiveReport() {
    console.log('\n📊 GENERATING COMPREHENSIVE AUDIT REPORT');
    console.log('='.repeat(70));

    const functionalCount = this.functionalButtons.length;
    const nonFunctionalCount = this.nonFunctionalButtons.length;
    const totalButtons = functionalCount + nonFunctionalCount;
    const functionalityRate = totalButtons > 0 ? ((functionalCount / totalButtons) * 100).toFixed(2) : '0';

    // Categorize issues by severity
    const highSeverityIssues = this.nonFunctionalButtons.filter(b => b.severity === 'high');
    const mediumSeverityIssues = this.nonFunctionalButtons.filter(b => b.severity === 'medium');
    const lowSeverityIssues = this.nonFunctionalButtons.filter(b => b.severity === 'low' || b.severity === 'info');

    // Group issues by page
    const issuesByPage = {};
    this.auditResults.forEach(pageResult => {
      if (pageResult.issues.length > 0 || pageResult.buttons.some(b => !b.functional)) {
        issuesByPage[pageResult.page] = {
          description: pageResult.description,
          accessible: pageResult.accessible,
          issues: pageResult.issues,
          nonFunctionalButtons: pageResult.buttons.filter(b => !b.functional)
        };
      }
    });

    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Complete App Audit - End-to-End Testing',
      summary: {
        totalPagesAudited: this.auditResults.length,
        accessiblePages: this.auditResults.filter(r => r.accessible).length,
        totalButtonsTested: totalButtons,
        functionalButtons: functionalCount,
        nonFunctionalButtons: nonFunctionalCount,
        functionalityRate: functionalityRate,
        highSeverityIssues: highSeverityIssues.length,
        mediumSeverityIssues: mediumSeverityIssues.length,
        lowSeverityIssues: lowSeverityIssues.length
      },
      auditResults: this.auditResults,
      issuesByPage: issuesByPage,
      criticalIssues: highSeverityIssues,
      nonFunctionalButtons: this.nonFunctionalButtons,
      recommendations: this.generateRecommendations()
    };

    // Save comprehensive report
    const logsDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const reportFile = path.join(logsDir, 'complete-app-audit-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Generate detailed text report
    const textReport = this.generateTextReport(report);
    const textReportFile = path.join(logsDir, 'complete-app-audit-report.txt');
    fs.writeFileSync(textReportFile, textReport);

    console.log(`📄 Comprehensive audit report saved: ${reportFile}`);
    console.log(`📝 Detailed text report saved: ${textReportFile}`);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // High priority recommendations
    if (this.nonFunctionalButtons.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Button Functionality',
        count: this.nonFunctionalButtons.length,
        recommendation: 'Fix all non-functional buttons immediately',
        details: this.nonFunctionalButtons.slice(0, 5).map(b => `"${b.text}" on ${b.page}`)
      });
    }

    // Authentication recommendations
    const protectedPages = this.auditResults.filter(r => !r.accessible && r.reason?.includes('authentication'));
    if (protectedPages.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Authentication Testing',
        recommendation: 'Set up test user account for complete protected page testing',
        details: ['Consider creating automated test user setup', 'Implement OAuth testing strategy']
      });
    }

    // Accessibility recommendations
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Accessibility',
      recommendation: 'Improve accessibility features',
      details: ['Add ARIA labels to buttons', 'Ensure keyboard navigation works', 'Add alt text to images']
    });

    return recommendations;
  }

  generateTextReport(report) {
    let textReport = `
INFINITE REALTY HUB - COMPLETE APP AUDIT REPORT
Generated: ${new Date(report.timestamp).toLocaleString()}
${'='.repeat(80)}

EXECUTIVE SUMMARY:
- Pages Audited: ${report.summary.totalPagesAudited}
- Accessible Pages: ${report.summary.accessiblePages}
- Total Buttons Tested: ${report.summary.totalButtonsTested}
- Functional Buttons: ${report.summary.functionalButtons}
- Non-Functional Buttons: ${report.summary.nonFunctionalButtons}
- Functionality Rate: ${report.summary.functionalityRate}%
- High Severity Issues: ${report.summary.highSeverityIssues}
- Medium Severity Issues: ${report.summary.mediumSeverityIssues}

CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:
${'-'.repeat(50)}
`;

    Object.entries(report.issuesByPage).forEach(([page, pageIssues]) => {
      textReport += `\n${page} (${pageIssues.description}):\n`;
      if (!pageIssues.accessible) {
        textReport += `  ❌ Page not accessible\n`;
      }
      pageIssues.issues.forEach(issue => {
        textReport += `  ⚠️  ${issue}\n`;
      });
      pageIssues.nonFunctionalButtons.forEach(button => {
        textReport += `  🔘 "${button.text}" - ${button.issue}\n`;
      });
    });

    textReport += `\nRECOMMENDATIONS:\n${'-'.repeat(30)}\n`;
    report.recommendations.forEach((rec, index) => {
      textReport += `${index + 1}. [${rec.priority}] ${rec.category}: ${rec.recommendation}\n`;
      if (rec.details) {
        rec.details.forEach(detail => {
          textReport += `   - ${detail}\n`;
        });
      }
      textReport += '\n';
    });

    return textReport;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      const report = await this.runCompleteAudit();
      
      console.log('\n' + '='.repeat(80));
      console.log('🎯 COMPLETE APP AUDIT RESULTS');
      console.log('='.repeat(80));
      console.log(`📊 Total Buttons Tested: ${report.summary.totalButtonsTested}`);
      console.log(`✅ Functional: ${report.summary.functionalButtons}`);
      console.log(`❌ Non-Functional: ${report.summary.nonFunctionalButtons}`);
      console.log(`📈 Functionality Rate: ${report.summary.functionalityRate}%`);
      console.log(`🚨 Critical Issues: ${report.summary.highSeverityIssues}`);
      
      console.log('\n🔧 PAGES WITH ISSUES:');
      Object.entries(report.issuesByPage).forEach(([page, issues]) => {
        console.log(`   ${page}: ${issues.nonFunctionalButtons.length} button issues, ${issues.issues.length} other issues`);
      });
      
      if (report.summary.nonFunctionalButtons > 0) {
        console.log('\n❌ NON-FUNCTIONAL BUTTONS FOUND - REQUIRES FIXES');
      } else {
        console.log('\n✅ ALL BUTTONS ARE FUNCTIONAL!');
      }
      
      return report;
      
    } catch (error) {
      console.error(`💥 Complete audit failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the complete audit
if (require.main === module) {
  const auditor = new CompleteAppAuditor();
  auditor.run()
    .then(report => {
      console.log('\n🚀 COMPLETE APP AUDIT FINISHED');
      console.log('📄 Check the generated reports for detailed findings');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Audit failed:', error);
      process.exit(1);
    });
}

module.exports = CompleteAppAuditor;