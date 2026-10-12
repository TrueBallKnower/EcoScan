'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8011/EcoScan';
const output=process.env.ECOSCAN_SCREENSHOT_DIR||'/tmp/ecoscan-experience';
const complete=page=>page.waitForFunction(()=>['confirmed','rejected'].includes(document.getElementById('drop-zone').dataset.state));

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base);
    await page.click('#reset');
    await page.click('#connect');
    await page.selectOption('#item','mix');
    // Observe the shared transaction, including physical plate changes before credit.
    await page.evaluate(()=>{
      window.routingEvents=[];
      document.addEventListener('ecoscan:phase',event=>{
        if(event.detail.phase==='routing')window.routingEvents.push({route:event.detail.route,points:Number(document.getElementById('points').textContent)});
      });
    });
    await page.click('#scan');
    for(const [route,selector,minimum,sign] of [['pet','.preview-selector',10,-1],['can','.preview-trap',40,1],['paper','.preview-selector',10,1]]) {
      await page.waitForFunction(({route,selector,minimum,sign})=>{
        const preview=document.getElementById('mechanism-preview');
        const matrix=new DOMMatrixReadOnly(getComputedStyle(preview.querySelector(selector)).transform);
        const angle=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
        return preview.dataset.mechanismRoute===route&&angle*sign>minimum;
      },{route,selector,minimum,sign});
      assert.equal(await page.locator('#points').textContent(),'0',`no credit while ${route} is routing`);
      assert.ok(await page.locator('#demo-result').isHidden());
    }
    await complete(page);
    assert.deepEqual(await page.evaluate(()=>window.routingEvents),[{route:'pet',points:0},{route:'can',points:0},{route:'paper',points:0}]);
    assert.match(await page.locator('#demo-result-title').textContent(),/\+30 EcoPoints/);
    assert.match(await page.locator('#demo-result-detail').textContent(),/Solde local : 30/);
    assert.equal(await page.locator('#dash-points').textContent(),'30');
    await page.click('#new-item');
    assert.ok(await page.locator('#demo-result').isHidden());
    await page.selectOption('#item','cup');
    await page.click('#scan');await complete(page);
    assert.equal(await page.locator('#points').textContent(),'30');
    assert.match(await page.locator('#demo-result-title').textContent(),/aucun point ajouté/);
    assert.equal(await page.locator('#demo-result').getAttribute('data-result'),'rejected');
    await page.click('#restart-demo');
    assert.ok(await page.locator('#demo-result').isHidden());

    // A capped balance must display the actual gain rather than the nominal award.
    await page.evaluate(()=>localStorage.setItem('ecoscan-demo-points','999995'));
    await page.reload();await page.emulateMedia({reducedMotion:'reduce'});
    await page.click('#connect');await page.selectOption('#item','pet');await page.click('#scan');await complete(page);
    assert.equal(await page.locator('#points').textContent(),'1000000');
    assert.match(await page.locator('#demo-result-title').textContent(),/\+5 EcoPoints/);
    assert.match(await page.locator('#demo-result-detail').textContent(),/Solde local : 1000000/);

    const mobileContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
    const mobile=await mobileContext.newPage();mobile.on('pageerror',error=>errors.push(error.message));
    await mobile.goto(base+'/#demo');
    await mobile.locator('#guided-action').tap();
    assert.equal(await mobile.evaluate(()=>document.activeElement.id),'item');
    assert.ok(await mobile.locator('#item').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=document.querySelector('header').getBoundingClientRect().bottom&&r.bottom<=innerHeight;}));
    await mobile.locator('#guided-action').tap();await complete(mobile);
    assert.match(await mobile.locator('#demo-result-title').textContent(),/\+30 EcoPoints/);
    assert.ok(await mobile.locator('#demo-result-title').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=document.querySelector('header').getBoundingClientRect().bottom&&r.bottom<=innerHeight;}),'mobile receipt must be visible after the guided deposit');
    await mobile.screenshot({path:path.join(output,'mobile-390-receipt.png')});
    await mobile.locator('#menu-button').tap();
    assert.ok(await mobile.locator('#menu-button').evaluate(el=>el.getBoundingClientRect().height>=44));
    for(const link of await mobile.locator('#navigation a').all())assert.ok(await link.evaluate(el=>el.getBoundingClientRect().height>=44));
    await mobile.locator('#navigation a[href="#video-explicative"]').tap();
    await mobile.waitForFunction(()=>document.querySelector('#navigation a[href="#video-explicative"]').getAttribute('aria-current')==='location');
    assert.ok(await mobile.locator('#back-top').isVisible());
    assert.equal(await mobile.locator('#menu-button').getAttribute('aria-expanded'),'false');
    await mobile.locator('[data-video-time="50"]').tap();
    await mobile.waitForFunction(()=>Math.abs(document.getElementById('explainer-video').currentTime-50)<.2);
    assert.ok(await mobile.locator('#explainer-video').evaluate(video=>video.paused&&!video.autoplay));
    assert.ok(await mobile.locator('.video-frame').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('header').getBoundingClientRect().bottom),'chapter selection keeps film below the fixed header');
    await mobile.locator('#explainer-video').evaluate(video=>{video.currentTime=65;});
    await mobile.waitForFunction(()=>document.querySelector('[data-video-time="62"]').getAttribute('aria-pressed')==='true');
    assert.equal(await mobile.locator('[data-video-time][aria-pressed="true"]').count(),1);
    assert.equal(await mobile.locator('.preview-object').evaluate(el=>getComputedStyle(el).animationName),'none');
    assert.equal(await mobile.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');

    for(const view of ['exterior','cutaway','mechanism']) {
      await mobile.locator(`button[data-view="${view}"]`).tap();
      const img=mobile.locator(`[data-model-view="${view}"]`);
      await img.evaluate(el=>el.decode());
      assert.ok(await img.isVisible());
      assert.deepEqual(await img.evaluate(el=>[el.naturalWidth,el.naturalHeight]),[1440,1080]);
      assert.equal(await mobile.locator('.model-view:visible').count(),1);
      assert.equal(await mobile.locator(`button[data-view="${view}"]`).getAttribute('aria-pressed'),'true');
    }
    await mobile.locator('.canonical-model').scrollIntoViewIfNeeded();
    await mobile.screenshot({path:path.join(output,'mobile-390-model.png')});
    for(const width of [360,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`no horizontal overflow at ${width}px`);
    }
    await mobile.locator('#back-top').tap();
    await mobile.waitForFunction(()=>scrollY<1200);
    assert.ok(await mobile.locator('#back-top').isHidden());
    assert.deepEqual(errors,[]);
    await mobileContext.close();
    console.log('PASS experience: sequential moving plates before award, actual gain and balance, reset/rejection, mobile guided focus and visible receipt, comfortable navigation/current section/back-top, native chapter synchronization and manual playback, matching 3 model views, reduced motion and 4 widths.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
