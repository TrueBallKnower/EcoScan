'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8012/EcoScan';
const output=process.env.ECOSCAN_SCREENSHOT_DIR||'/tmp/ecoscan-shop';
async function open(page,id){await page.evaluate(value=>{location.hash=value;},id);await page.locator('#'+id).waitFor({state:'visible'});await page.waitForTimeout(250);}
async function deposit(page){await page.click('#scan');await page.waitForFunction(()=>document.getElementById('drop-zone').dataset.state==='confirmed');}
const balance=page=>page.locator('#points').textContent();

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base);
    await open(page,'demo');await page.click('#restart-demo');
    await open(page,'app');
    await page.click('#eco-app-connect');
    assert.match(await page.locator('#session-status').textContent(),/active/);
    assert.match(await page.locator('#eco-app-session').textContent(),/active/);
    await page.click('#eco-app-tab-wallet');await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#eco-app-tab-shop').getAttribute('aria-selected'),'true');
    await page.keyboard.press('Home');assert.equal(await page.locator('#eco-app-tab-journey').getAttribute('aria-selected'),'true');
    await open(page,'demo');await page.selectOption('#item','mix');await deposit(page);
    assert.equal(await balance(page),'30');assert.equal(await page.locator('#eco-app-balance').textContent(),'30');
    assert.equal(await page.locator('#eco-shop-balance').textContent(),'30');
    await open(page,'boutique');
    assert.equal(await page.locator('[data-shop-product]').count(),3);
    assert.equal(await page.locator('[data-shop-product="repair-kit"], [data-shop-detail="repair-kit"], [data-shop-filter="repair"]').count(),0);
    const packshots=await page.locator('.eco-shop-art img').all();assert.equal(packshots.length,3);
    for(const image of packshots){
      await image.scrollIntoViewIfNeeded();await image.evaluate(element=>element.decode());
      const asset=await image.evaluate(element=>({source:element.getAttribute('src'),current:element.currentSrc,width:element.naturalWidth,height:element.naturalHeight}));
      assert.ok(asset.width>600&&asset.height>600,`packshot dimensions ${asset.width}×${asset.height}`);
      assert.equal(new URL(asset.current).origin,new URL(page.url()).origin,'packshot comes from the same site');
      assert.match(new URL(asset.current).pathname,/\/assets\/[^/]+\.(?:webp|png|jpe?g)$/i);
      const published=new URL(asset.source,'https://trueballknower.github.io/EcoScan/');
      assert.equal(published.protocol,'https:');assert.equal(published.origin,'https://trueballknower.github.io');assert.ok(published.pathname.startsWith('/EcoScan/assets/'));
    }
    await page.click('[data-shop-filter="daily"]');assert.equal(await page.locator('[data-shop-product]:visible').count(),1);assert.equal(await page.locator('[data-shop-product="loop-notebook"]').isVisible(),true);
    await page.click('[data-shop-filter="reuse"]');
    assert.equal(await page.locator('[data-shop-product]:visible').count(),2);
    assert.match(await page.locator('#eco-shop-filter-status').textContent(),/2 concepts/);
    await page.click('[data-shop-detail="repair-pouch"]');
    assert.match(await page.locator('#eco-shop-confirm-status').textContent(),/de 30 à 10/);
    await page.click('#eco-shop-cancel');assert.equal(await balance(page),'30');
    await page.evaluate(()=>{
      window.shopRequests=[];window.shopResults=[];
      document.addEventListener('ecoscan:exchange-request',event=>window.shopRequests.push(event.detail));
      document.addEventListener('ecoscan:exchange-result',event=>window.shopResults.push(event.detail));
    });
    await page.click('[data-shop-detail="repair-pouch"]');await page.click('#eco-shop-confirm');
    assert.equal(await balance(page),'10');assert.equal(await page.locator('#eco-app-balance').textContent(),'10');
    assert.equal(await page.locator('#eco-shop-result').isVisible(),true);
    assert.equal(await page.locator('#eco-shop-offer').isVisible(),false);
    const receipt=await page.locator('#eco-app-latest-exchange').textContent();
    await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ecoscan:exchange-request',{detail:window.shopRequests[0]})));
    assert.equal(await balance(page),'10');
    assert.equal(await page.evaluate(()=>window.shopResults.at(-1).duplicate),true);
    assert.equal(await page.locator('#eco-app-latest-exchange').textContent(),receipt);
    await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ecoscan:state-request')));
    assert.equal(await page.locator('#eco-shop-result').isVisible(),true,'wallet refresh must keep completed receipt');
    await page.click('#eco-shop-done');await page.click('[data-shop-filter="all"]');
    await page.click('[data-shop-detail="loop-notebook"]');
    assert.equal(await page.locator('#eco-shop-confirm').isDisabled(),true);
    assert.match(await page.locator('#eco-shop-confirm-status').textContent(),/manque 20 points/);
    await page.keyboard.press('Escape');assert.equal(await balance(page),'10');
    await page.click('[data-shop-detail="repair-pouch"]');
    await open(page,'app');assert.equal(await page.locator('#eco-shop-dialog').isVisible(),false,'navigation closes an unconfirmed offer');
    await open(page,'boutique');
    await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ecoscan:exchange-request',{detail:{id:'test-price-mismatch',productId:'carry-bag',cost:1,label:'Sac ReCycle'}})));
    assert.equal(await balance(page),'10','caller cannot set a product price');
    await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ecoscan:exchange-request',{detail:{id:'test-unknown-product',productId:'unknown',cost:0}})));
    assert.equal(await balance(page),'10');
    await page.evaluate(()=>document.dispatchEvent(new CustomEvent('ecoscan:exchange-request',{detail:{id:'test-removed-product',productId:'repair-kit',cost:60}})));
    assert.equal(await balance(page),'10','the removed product never debits the shared wallet');
    assert.equal(await page.evaluate(()=>window.shopResults.at(-1).ok),false,'the removed product is refused');
    assert.match(await page.evaluate(()=>window.shopResults.at(-1).message),/non reconnu/,'the removed product is unknown, rather than merely unaffordable');
    for(const productId of ['__proto__','toString']){
      await page.evaluate(productId=>document.dispatchEvent(new CustomEvent('ecoscan:exchange-request',{detail:{id:'test-inherited-'+productId,productId}})),productId);
      assert.equal(await balance(page),'10','inherited properties are not catalogue products');
      assert.equal(await page.evaluate(()=>window.shopResults.at(-1).ok),false);
    }
    await open(page,'demo');await page.click('#new-item');await deposit(page);
    assert.equal(await balance(page),'40');await page.click('#redeem');
    assert.equal(await balance(page),'20');assert.equal(await page.locator('#eco-app-balance').textContent(),'20');
    await open(page,'boutique');await page.click('[data-shop-detail="repair-pouch"]');
    await page.evaluate(()=>document.getElementById('reset').click());
    assert.equal(await page.locator('#eco-shop-dialog').isVisible(),false);
    assert.equal(await page.locator('#eco-app-balance').textContent(),'0');
    assert.match(await page.locator('#eco-app-latest-exchange').textContent(),/Aucun échange/);
    await open(page,'app');await page.click('#eco-app-connect');
    assert.match(await page.locator('#eco-app-session').textContent(),/Aucune session/);
    await page.locator('#app').screenshot({path:output+'/app-desktop.png'});
    assert.deepEqual(errors,[]);

    const busyPage=await browser.newPage({viewport:{width:1200,height:900}});
    await busyPage.goto(base+'#demo');await busyPage.click('#restart-demo');await busyPage.click('#connect');
    await deposit(busyPage);assert.equal(await balance(busyPage),'30');await busyPage.click('#new-item');
    await busyPage.click('#scan');
    assert.equal(await busyPage.locator('#eco-app-connect').isDisabled(),true);
    assert.match(await busyPage.locator('#eco-app-wallet-note').textContent(),/tri est en cours/);
    await busyPage.evaluate(()=>{
      window.busyResult=null;
      document.addEventListener('ecoscan:exchange-result',event=>{if(event.detail.id==='test-busy')window.busyResult=event.detail;});
      document.dispatchEvent(new CustomEvent('ecoscan:exchange-request',{detail:{id:'test-busy',productId:'repair-pouch',cost:20}}));
    });
    assert.equal(await busyPage.evaluate(()=>window.busyResult.ok),false);
    assert.match(await busyPage.evaluate(()=>window.busyResult.message),/dépôt en cours/);
    assert.equal(await balance(busyPage),'30');
    await busyPage.evaluate(()=>document.dispatchEvent(new CustomEvent('ecoscan:command',{detail:{command:'end-session',stationId:'ECO-001'}})));
    await busyPage.waitForTimeout(2300);assert.equal(await balance(busyPage),'30','ending shared session cancels pending credit');
    assert.match(await busyPage.locator('#eco-app-session').textContent(),/Aucune session/);
    await busyPage.close();

    const mobile=await browser.newPage({viewport:{width:360,height:850},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
    await mobile.goto(base);await open(mobile,'demo');await mobile.locator('#restart-demo').tap();
    await open(mobile,'app');await mobile.locator('#eco-app-connect').tap();
    await mobile.locator('#eco-app-tab-wallet').tap();
    assert.equal(await mobile.locator('#eco-app-wallet').isVisible(),true);
    await mobile.locator('[data-app-open="shop"]').tap();
    await mobile.locator('[data-app-filter="reuse"]').tap();
    assert.equal(await mobile.locator('#boutique').isVisible(),true);
    assert.equal(await mobile.locator('[data-shop-product]:visible').count(),2);
    await mobile.locator('[data-shop-detail="repair-pouch"]').tap();
    assert.equal(await mobile.locator('#eco-shop-confirm').isDisabled(),true);
    await mobile.locator('#eco-shop-cancel').tap();
    await open(mobile,'demo');await mobile.selectOption('#item','mix');await mobile.locator('#scan').tap();
    await mobile.waitForFunction(()=>document.getElementById('drop-zone').dataset.state==='confirmed');
    await open(mobile,'boutique');await mobile.locator('[data-shop-detail="repair-pouch"]').tap();
    await mobile.locator('#eco-shop-confirm').tap();assert.equal(await balance(mobile),'10');
    await mobile.locator('#eco-shop-done').tap();
    for(const width of [320,360,390,768]){
      await mobile.setViewportSize({width,height:850});
      assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`shop overflow ${width}`);
    }
    await mobile.setViewportSize({width:390,height:850});await mobile.locator('[data-shop-filter="all"]').tap();
    const heights=await mobile.locator('.eco-shop-filters button,.eco-shop-detail:visible').evaluateAll(elements=>elements.map(element=>element.getBoundingClientRect().height));
    assert.ok(heights.every(height=>height>=44),JSON.stringify(heights));
    await mobile.locator('#boutique').screenshot({path:output+'/shop-mobile.png'});
    await mobile.locator('a[href="#eco-app-wallet"]').tap();assert.equal(await mobile.locator('#eco-app-wallet').isVisible(),true);
    assert.equal(await mobile.locator('#eco-app-balance').textContent(),'10');
    const animation=await mobile.locator('#eco-app-wallet').evaluate(element=>getComputedStyle(element).animationName);
    assert.equal(animation,'none');
    await mobile.locator('#app').screenshot({path:output+'/app-mobile.png'});

    const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:850}});
    await nojs.goto(base+'#boutique');assert.equal(await nojs.locator('[data-shop-product]:visible').count(),3);
    assert.equal(await nojs.locator('[data-shop-detail]:visible').count(),0);
    assert.equal(await nojs.locator('#app noscript').isVisible(),true);
    assert.ok(await nojs.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    console.log('PASS shop/app: 3 decoded local high-resolution packshots, daily/reuse filters, removed product refusal, one shared session/wallet, real deposit and exchange updates, cancellation, insufficient/busy/unknown/mismatched cost, idempotent debit, reset, keyboard/touch, 4 widths, reduced motion, readable no-JS catalogue.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
