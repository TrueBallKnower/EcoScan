'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=(process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8011/EcoScan').replace(/\/$/,'');
const output=process.env.ECOSCAN_SCREENSHOT_DIR||'/tmp/ecoscan-workspace';
const view=(page,group)=>page.waitForFunction(group=>document.body.dataset.activeView===group,group);
const anchor=async(page,id,group)=>{
  await page.evaluate(id=>{location.hash='#'+id;},id);
  await view(page,group);
};

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base);await view(page,'discover');
    assert.equal(await page.locator('#navigation [data-nav-group]').count(),5);
    assert.ok(await page.locator('#accueil').isVisible());
    assert.ok(await page.locator('#demo').isHidden());
    assert.ok(await page.locator('#faisabilite').isHidden());
    assert.ok(await page.locator('#mission').isHidden());
    assert.ok(await page.locator('#faq').isHidden());
    assert.equal(await page.locator('#navigation [aria-current="page"]').getAttribute('data-nav-group'),'discover');
    // A real navigation link retains browser history and moves keyboard focus.
    await page.locator('#navigation [data-nav-group="try"]').click();await view(page,'try');
    assert.ok(await page.locator('#workspace-guide').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=document.querySelector('header').getBoundingClientRect().bottom&&r.bottom<=innerHeight;}),'primary navigation reveals the contextual guide');
    assert.ok(await page.locator('#demo').isVisible());
    assert.ok(await page.locator('#station').isHidden());
    assert.equal(await page.evaluate(()=>document.activeElement.closest('section')?.id),'demo');
    await page.locator('#guided-action').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'item');
    await page.selectOption('#item','mix');
    await page.evaluate(()=>{
      window.demoNode=document.getElementById('demo');
      window.confirmedCount=0;
      document.addEventListener('ecoscan:phase',event=>{if(event.detail.phase==='confirmed')window.confirmedCount++;});
    });
    // Changing a reading path preserves a pending transaction and its one credit.
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.locator('#scan').click();
    await page.locator('#navigation [data-nav-group="build"]').click();await view(page,'build');
    await page.waitForFunction(()=>document.getElementById('drop-zone').dataset.state==='confirmed');
    assert.equal(await page.locator('#points').textContent(),'30');
    assert.equal(await page.evaluate(()=>window.confirmedCount),1);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goBack();await view(page,'try');
    assert.equal(await page.locator('#points').textContent(),'30');
    assert.match(await page.locator('#dash-session').textContent(),/Active/);
    assert.ok(await page.evaluate(()=>window.demoNode===document.getElementById('demo')));
    await page.goForward();await view(page,'build');
    // Old and nested anchors reveal the corresponding path without reloading.
    for(const [id,group] of [['phone-wallet','try'],['protocol-title','build'],['sources','resources'],['station','discover'],['mission','mission'],['qr-session','try']]) {
      await anchor(page,id,group);
      assert.ok(await page.locator('#'+id).isVisible());
      assert.equal(await page.locator('#points').textContent(),'30');
    }
    // Filtering and app tabs survive navigation, with no catalogue or wallet reset.
    await anchor(page,'app','try');await page.locator('[data-app-tab="wallet"]').click();
    await anchor(page,'boutique','try');await page.locator('[data-shop-filter="daily"]').click();
    await page.evaluate(()=>{window.catalogueNode=document.getElementById('boutique');});
    await anchor(page,'faisabilite','build');await anchor(page,'boutique','try');
    assert.equal(await page.locator('[data-shop-filter="daily"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-shop-product]:visible').count(),1);
    assert.equal(await page.locator('[data-app-tab="wallet"]').getAttribute('aria-selected'),'true');
    assert.ok(await page.evaluate(()=>window.catalogueNode===document.getElementById('boutique')));
    await page.locator('[data-shop-detail="loop-notebook"]').click();
    assert.ok(await page.locator('#eco-shop-dialog').evaluate(dialog=>dialog.open));
    await anchor(page,'sources','resources');
    assert.ok(await page.locator('#eco-shop-dialog').evaluate(dialog=>!dialog.open),'a hidden catalogue must not leave an inert modal open');
    assert.equal(await page.locator('#points').textContent(),'30');
    await anchor(page,'eco-app-wallet','try');
    assert.ok(await page.locator('#eco-app-wallet').isVisible());
    await anchor(page,'no-such-section','try');
    assert.ok(await page.locator('#demo').isVisible(),'unknown anchors retain the active path');
    await anchor(page,'main','try');
    assert.equal(await page.locator('#points').textContent(),'30');

    await anchor(page,'video-explicative','discover');
    await page.locator('[data-video-time="50"]').click();
    await page.waitForFunction(()=>document.getElementById('explainer-video').readyState>=2);
    await page.locator('#explainer-video').evaluate(video=>video.play());
    await page.waitForFunction(()=>!document.getElementById('explainer-video').paused);
    await page.locator('#navigation [data-nav-group="resources"]').click();await view(page,'resources');
    assert.ok(await page.locator('#explainer-video').evaluate(video=>video.paused));
    assert.equal(await page.locator('#navigation [aria-current="page"]').count(),1);

    const mobile=await browser.newPage({viewport:{width:360,height:800},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
    mobile.on('pageerror',error=>errors.push(error.message));
    await mobile.goto(base+'/?station=ECO-001#demo');await view(mobile,'try');
    assert.match(await mobile.locator('#qr-arrival').textContent(),/ECO-001/);
    await mobile.locator('#menu-button').tap();
    await mobile.locator('#navigation [data-nav-group="resources"]').focus();await mobile.keyboard.press('Enter');
    await view(mobile,'resources');
    assert.equal(await mobile.locator('#menu-button').getAttribute('aria-expanded'),'false');
    assert.equal(await mobile.evaluate(()=>document.activeElement.closest('section')?.dataset.viewGroup),'resources');
    assert.equal(await mobile.evaluate(()=>location.hash),'#ressources');
    assert.ok(await mobile.locator('#workspace-guide').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=document.querySelector('header').getBoundingClientRect().bottom&&r.bottom<=innerHeight;}));
    assert.equal(await mobile.evaluate(()=>new URLSearchParams(location.search).get('station')),'ECO-001');
    await mobile.goBack();await view(mobile,'try');
    for(const group of ['discover','try','build','mission','resources']) {
      await mobile.locator('#menu-button').tap();await mobile.locator(`#navigation [data-nav-group="${group}"]`).tap();await view(mobile,group);
      assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`360px overflow in ${group}`);
      assert.equal(await mobile.locator('main').evaluate(el=>getComputedStyle(el).animationName),'none');
      const visibleGroups=await mobile.locator('main>section:visible').evaluateAll(els=>[...new Set(els.map(el=>el.dataset.viewGroup))]);
      assert.deepEqual(visibleGroups,[group]);
    }
    await mobile.screenshot({path:output+'/mobile-360-resources.png'});
    const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:800}});
    await nojs.goto(base);
    for(const id of ['station','demo','faisabilite','mission','faq','sources'])assert.ok(await nojs.locator('#'+id).isVisible(),`no-JS ${id}`);
    assert.ok(await nojs.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);
    console.log('PASS workspace: five focused paths, focus and history, old/nested/unknown anchors, QR query retention, unchanged live transaction/session/points/DOM, hidden video paused, tactile/keyboard menu, reduced motion, mobile overflow, all content without JavaScript.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
