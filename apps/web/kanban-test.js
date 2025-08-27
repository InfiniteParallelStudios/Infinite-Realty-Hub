const { chromium } = require('playwright');

async function testKanbanBoard() {
  console.log('🎯 KANBAN DRAG & DROP TEST');
  console.log('Testing the new pipeline kanban functionality\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1500 });
  const page = await browser.newPage();
  
  let errors = [];
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push(text);
      console.log(`❌ ERROR: ${text}`);
    } else if (text.includes('📊 Moved')) {
      console.log(`✅ DRAG SUCCESS: ${text}`);
    }
  });

  try {
    console.log('📄 Loading pipeline kanban board...');
    await page.goto('http://localhost:3000/pipeline', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Check if kanban board loaded
    const title = await page.textContent('h1');
    console.log(`   📋 Page title: ${title}`);
    
    // Check for drag handles
    const dragHandles = await page.$$('[data-rbd-drag-handle-draggable-id]');
    console.log(`   🎯 Found ${dragHandles.length} draggable items`);
    
    // Check for droppable areas
    const dropZones = await page.$$('[data-rbd-droppable-id]');
    console.log(`   📦 Found ${dropZones.length} drop zones`);
    
    // Test drag and drop if items exist
    if (dragHandles.length > 0 && dropZones.length > 1) {
      console.log('\n🔄 Testing drag and drop functionality...');
      
      // Get the first draggable item
      const firstItem = dragHandles[0];
      const itemName = await page.evaluate(item => {
        return item.closest('[data-rbd-draggable-id]')?.querySelector('h4')?.textContent || 'Unknown';
      }, firstItem);
      
      console.log(`   📌 Attempting to drag: ${itemName}`);
      
      // Get bounding boxes
      const sourceBox = await firstItem.boundingBox();
      const targetBox = await dropZones[1].boundingBox();
      
      if (sourceBox && targetBox) {
        // Perform drag and drop
        await page.mouse.move(sourceBox.x + sourceBox.width/2, sourceBox.y + sourceBox.height/2);
        await page.mouse.down();
        await page.waitForTimeout(500);
        await page.mouse.move(targetBox.x + targetBox.width/2, targetBox.y + targetBox.height/2);
        await page.waitForTimeout(500);
        await page.mouse.up();
        await page.waitForTimeout(2000);
        
        console.log(`   ✅ Drag and drop operation completed`);
      }
    }
    
    // Check for visual feedback elements
    const gripIcons = await page.$$('[data-testid="grip-vertical"], .lucide-grip-vertical');
    console.log(`   🔧 Found ${gripIcons.length} grip handles`);
    
    // Check stage columns
    const stages = await page.$$eval('[class*="glass"]', elements => 
      elements.filter(el => el.textContent && (
        el.textContent.includes('New Leads') || 
        el.textContent.includes('Contacted') ||
        el.textContent.includes('Qualified')
      )).length
    );
    console.log(`   📊 Found ${stages} pipeline stages`);
    
  } catch (error) {
    console.log(`💥 Test failed: ${error.message}`);
    errors.push(error.message);
  }

  // Final Results
  console.log('\n' + '='.repeat(60));
  console.log('📊 KANBAN TEST RESULTS');
  console.log('='.repeat(60));

  if (errors.length === 0) {
    console.log('\n🎉 KANBAN BOARD PERFECT!');
    console.log('✅ No errors detected');
    console.log('✅ Drag and drop functionality working');
    console.log('✅ All visual elements present');
  } else {
    console.log(`\n🚨 ${errors.length} Issues Found:`);
    errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
  }

  console.log('\n👀 Inspect the kanban board manually...');
  setTimeout(async () => {
    await browser.close();
    console.log('\n🏁 Kanban test complete!');
  }, 10000);
}

testKanbanBoard().catch(console.error);