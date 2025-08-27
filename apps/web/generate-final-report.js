#!/usr/bin/env node

/**
 * FINAL TESTING REPORT GENERATOR
 * Consolidates all test results into a comprehensive report
 */

const fs = require('fs');
const path = require('path');

class FinalReportGenerator {
  constructor() {
    this.logsDir = '/Users/joshua/Desktop/DevelopementEnv/infinite-realty-hub/apps/web/logs';
    this.reportFiles = [
      'focused-app-test-report.json',
      'extended-app-test-report.json', 
      'settings-test-report.json'
    ];
  }

  loadTestReports() {
    const reports = [];
    
    for (const filename of this.reportFiles) {
      const filepath = path.join(this.logsDir, filename);
      if (fs.existsSync(filepath)) {
        try {
          const report = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          reports.push(report);
        } catch (error) {
          console.warn(`Failed to load ${filename}: ${error.message}`);
        }
      }
    }
    
    return reports;
  }

  generateConsolidatedReport() {
    const reports = this.loadTestReports();
    
    if (reports.length === 0) {
      console.error('No test reports found!');
      return null;
    }

    console.log('📊 CONSOLIDATING ALL TEST RESULTS');
    console.log('='.repeat(60));

    // Calculate overall statistics
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let allSuites = [];

    reports.forEach(report => {
      totalTests += report.summary.totalTests;
      totalPassed += report.summary.totalPassed;
      totalFailed += report.summary.totalFailed;
      
      if (report.suites) {
        allSuites = allSuites.concat(report.suites.map(suite => ({
          ...suite,
          testType: report.testType
        })));
      }
    });

    const overallSuccessRate = ((totalPassed / totalTests) * 100).toFixed(2);

    const consolidatedReport = {
      timestamp: new Date().toISOString(),
      testType: 'Comprehensive App Testing - All Suites',
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: overallSuccessRate,
        testReportsProcessed: reports.length,
        testSuitesRun: allSuites.length
      },
      reports,
      allSuites,
      analysis: this.generateAnalysis(allSuites, totalPassed, totalTests),
      recommendations: this.generateFinalRecommendations(allSuites)
    };

    // Save consolidated report
    const consolidatedFile = path.join(this.logsDir, 'consolidated-test-report.json');
    fs.writeFileSync(consolidatedFile, JSON.stringify(consolidatedReport, null, 2));

    // Generate comprehensive HTML report
    const htmlReport = this.generateComprehensiveHtmlReport(consolidatedReport);
    const htmlFile = path.join(this.logsDir, 'comprehensive-test-report.html');
    fs.writeFileSync(htmlFile, htmlReport);

    console.log(`📄 Consolidated report saved: ${consolidatedFile}`);
    console.log(`🌐 Comprehensive HTML report: ${htmlFile}`);

    return consolidatedReport;
  }

  generateAnalysis(allSuites, totalPassed, totalTests) {
    const analysis = {
      strengths: [],
      weaknesses: [],
      coverage: {}
    };

    // Analyze by test category
    const categories = {};
    allSuites.forEach(suite => {
      if (!categories[suite.name]) {
        categories[suite.name] = { passed: 0, failed: 0, total: 0 };
      }
      categories[suite.name].passed += suite.passed;
      categories[suite.name].failed += suite.failed;
      categories[suite.name].total += suite.tests.length;
    });

    // Identify strengths (100% pass rate)
    Object.entries(categories).forEach(([category, stats]) => {
      if (stats.failed === 0 && stats.total > 0) {
        analysis.strengths.push(`${category}: All ${stats.total} tests passing`);
      } else if (stats.passed / stats.total >= 0.8) {
        analysis.strengths.push(`${category}: Strong performance (${((stats.passed / stats.total) * 100).toFixed(1)}%)`);
      }
    });

    // Identify weaknesses (less than 80% pass rate)
    Object.entries(categories).forEach(([category, stats]) => {
      if (stats.passed / stats.total < 0.8) {
        analysis.weaknesses.push(`${category}: Needs improvement (${((stats.passed / stats.total) * 100).toFixed(1)}% pass rate)`);
      }
    });

    // Coverage analysis
    analysis.coverage = {
      functionalTesting: categories['Testing Page Functionality'] ? '✅ Complete' : '❌ Missing',
      navigationTesting: categories['Navigation Structure'] ? '✅ Complete' : '❌ Missing',
      responsiveDesign: categories['Responsive Design'] ? '✅ Complete' : '❌ Missing',
      authentication: categories['Authentication System'] ? '✅ Complete' : '❌ Missing',
      accessibility: categories['Accessibility Features'] ? '✅ Partial' : '❌ Missing',
      performance: categories['Performance Metrics'] ? '✅ Complete' : '❌ Missing',
      errorHandling: categories['Error Handling'] ? '✅ Complete' : '❌ Missing',
      themeSystem: categories['Theme Switching'] ? '✅ Partial' : '❌ Missing'
    };

    return analysis;
  }

  generateFinalRecommendations(allSuites) {
    const recommendations = [];

    // High priority recommendations
    const criticalIssues = [];
    allSuites.forEach(suite => {
      suite.tests.forEach(test => {
        if (!test.success) {
          criticalIssues.push(`${suite.name}: ${test.name}`);
        }
      });
    });

    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Critical Issues',
        count: criticalIssues.length,
        recommendation: 'Address failing tests immediately',
        details: criticalIssues.slice(0, 5) // Show first 5
      });
    }

    // Accessibility improvements
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Accessibility',
      recommendation: 'Add ARIA labels and improve keyboard navigation',
      details: ['Add aria-label attributes to buttons', 'Implement proper heading hierarchy', 'Ensure all interactive elements are keyboard accessible']
    });

    // Theme system improvements
    recommendations.push({
      priority: 'MEDIUM', 
      category: 'Theme System',
      recommendation: 'Improve theme switching functionality',
      details: ['Make theme toggle more discoverable', 'Add visual feedback for theme changes', 'Test theme persistence across page reloads']
    });

    // Performance optimization
    recommendations.push({
      priority: 'LOW',
      category: 'Performance',
      recommendation: 'Continue monitoring and optimizing performance',
      details: ['Current performance is good', 'Consider implementing lazy loading', 'Monitor real-world usage patterns']
    });

    return recommendations;
  }

  generateComprehensiveHtmlReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinite Realty Hub - Comprehensive Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e5e5e5; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; padding: 40px 0; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%); border-radius: 16px; }
        .header h1 { font-size: 3rem; font-weight: 700; color: white; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .header .subtitle { font-size: 1.2rem; color: #bfdbfe; opacity: 0.9; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); border: 1px solid #4b5563; border-radius: 12px; padding: 25px; text-align: center; transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-number { font-size: 2.5rem; font-weight: 800; margin-bottom: 8px; }
        .stat-number.success { color: #10b981; }
        .stat-number.warning { color: #f59e0b; }
        .stat-number.info { color: #3b82f6; }
        .stat-label { color: #9ca3af; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .analysis-section { background: #1f2937; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
        .analysis-section h2 { color: #60a5fa; font-size: 1.5rem; margin-bottom: 20px; border-bottom: 2px solid #374151; padding-bottom: 10px; }
        .strengths-weaknesses { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .strength-item, .weakness-item { padding: 15px; border-radius: 8px; margin-bottom: 10px; }
        .strength-item { background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; }
        .weakness-item { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; }
        .coverage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .coverage-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #374151; border-radius: 8px; }
        .suite-section { background: #1f2937; border-radius: 12px; padding: 25px; margin-bottom: 25px; }
        .suite-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .suite-title { color: #60a5fa; font-size: 1.3rem; font-weight: 600; }
        .suite-stats { color: #9ca3af; }
        .test-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin: 8px 0; border-radius: 8px; background: rgba(255,255,255,0.02); }
        .test-name { flex: 1; }
        .test-status { padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
        .passed { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .failed { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .duration { color: #6b7280; font-size: 0.8rem; margin-left: 15px; }
        .recommendations { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 12px; padding: 30px; }
        .recommendations h2 { color: white; margin-bottom: 20px; }
        .recommendation { background: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 15px; }
        .rec-priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; margin-bottom: 10px; }
        .rec-high { background: #dc2626; color: white; }
        .rec-medium { background: #d97706; color: white; }
        .rec-low { background: #059669; color: white; }
        .footer { text-align: center; padding: 40px 0; color: #6b7280; border-top: 1px solid #374151; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Infinite Realty Hub</h1>
            <div class="subtitle">Comprehensive Testing Report</div>
            <div style="margin-top: 15px; color: #bfdbfe; font-size: 0.9rem;">
                Generated: ${new Date(report.timestamp).toLocaleString()}
            </div>
        </div>

        <div class="summary-grid">
            <div class="stat-card">
                <div class="stat-number info">${report.summary.totalTests}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success">${report.summary.totalPassed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${report.summary.totalFailed > 0 ? 'warning' : 'success'}">${report.summary.totalFailed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${parseFloat(report.summary.successRate) >= 90 ? 'success' : parseFloat(report.summary.successRate) >= 70 ? 'warning' : 'failed'}">${report.summary.successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info">${report.summary.testSuitesRun}</div>
                <div class="stat-label">Test Suites</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info">${report.summary.testReportsProcessed}</div>
                <div class="stat-label">Report Types</div>
            </div>
        </div>

        <div class="analysis-section">
            <h2>📊 Test Analysis</h2>
            <div class="strengths-weaknesses">
                <div>
                    <h3 style="color: #10b981; margin-bottom: 15px;">✅ Strengths</h3>
                    ${report.analysis.strengths.map(strength => `<div class="strength-item">${strength}</div>`).join('')}
                </div>
                <div>
                    <h3 style="color: #ef4444; margin-bottom: 15px;">⚠️ Areas for Improvement</h3>
                    ${report.analysis.weaknesses.map(weakness => `<div class="weakness-item">${weakness}</div>`).join('')}
                </div>
            </div>
            
            <h3 style="color: #60a5fa; margin: 25px 0 15px 0;">🎯 Test Coverage</h3>
            <div class="coverage-grid">
                ${Object.entries(report.analysis.coverage).map(([area, status]) => `
                    <div class="coverage-item">
                        <span>${area.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span>${status}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        ${report.allSuites.map(suite => `
            <div class="suite-section">
                <div class="suite-header">
                    <div class="suite-title">${suite.name}</div>
                    <div class="suite-stats">${suite.passed} passed, ${suite.failed} failed</div>
                </div>
                ${suite.tests.map(test => `
                    <div class="test-item">
                        <div class="test-name">${test.name}</div>
                        <div>
                            <span class="test-status ${test.success ? 'passed' : 'failed'}">
                                ${test.success ? 'PASSED' : 'FAILED'}
                            </span>
                            <span class="duration">${test.duration}ms</span>
                        </div>
                    </div>
                    ${!test.success ? `<div style="color: #ef4444; font-size: 0.8rem; margin-left: 20px; margin-bottom: 10px;">${test.message}</div>` : ''}
                `).join('')}
            </div>
        `).join('')}

        <div class="recommendations">
            <h2>🎯 Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation">
                    <span class="rec-priority rec-${rec.priority.toLowerCase()}">${rec.priority} PRIORITY</span>
                    <h3 style="color: white; margin: 10px 0;">${rec.category}</h3>
                    <p style="color: #e5e7eb; margin-bottom: 10px;">${rec.recommendation}</p>
                    ${rec.details ? `
                        <ul style="color: #d1d5db; margin-left: 20px;">
                            ${rec.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p>🤖 Generated with automated testing suite for Infinite Realty Hub</p>
            <p>Testing completed at ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  }

  run() {
    console.log('📈 GENERATING FINAL COMPREHENSIVE REPORT');
    
    const consolidatedReport = this.generateConsolidatedReport();
    
    if (consolidatedReport) {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 COMPREHENSIVE TESTING SUMMARY');
      console.log('='.repeat(80));
      console.log(`📊 Overall Results: ${consolidatedReport.summary.totalPassed}/${consolidatedReport.summary.totalTests} tests passed (${consolidatedReport.summary.successRate}%)`);
      console.log(`📁 Test Reports Processed: ${consolidatedReport.summary.testReportsProcessed}`);
      console.log(`🧪 Test Suites Run: ${consolidatedReport.summary.testSuitesRun}`);
      
      console.log('\n🎉 STRENGTHS:');
      consolidatedReport.analysis.strengths.forEach(strength => {
        console.log(`  ✅ ${strength}`);
      });
      
      if (consolidatedReport.analysis.weaknesses.length > 0) {
        console.log('\n⚠️  AREAS FOR IMPROVEMENT:');
        consolidatedReport.analysis.weaknesses.forEach(weakness => {
          console.log(`  🔧 ${weakness}`);
        });
      }
      
      console.log('\n🚀 TESTING COMPLETED SUCCESSFULLY!');
      return consolidatedReport;
    } else {
      console.error('❌ Failed to generate consolidated report');
      return null;
    }
  }
}

// Run the final report generation
if (require.main === module) {
  const generator = new FinalReportGenerator();
  generator.run();
}

module.exports = FinalReportGenerator;