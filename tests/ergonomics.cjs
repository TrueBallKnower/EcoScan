'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=(process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8012/EcoScan').replace(/\/$/,'');
const output=process.env.ECOSCAN_SCREENSHOT_DIR||'/tmp/ecoscan-ergonomics';
const go=async(page,id)=>{
  await page.evaluate(id=>{location.hash='#'+id;},id);
  await page.waitForFunction(()=>document.body.dataset.activeView==='try');
};

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const errors=[];
    for(const width of [360,390,1440]) {
      const context=await browser.newContext({viewport:{width,height:width<700?(width===360?800:844):950},hasTouch:width<700,isMobile:width<700,reducedMotion:'reduce'});
      const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
      const press=async(selector)=>width<700?page.locator(selector).tap():page.locator(selector).click();
      await page.goto(base+'/#eco-app-wallet');
      await page.locator('#eco-app-start-deposit').waitFor({state:'visible'});
      assert.equal(await page.locator('#points').textContent(),'0');
      assert.equal(await page.locator('#eco-app-balance').textContent(),'0');
      assert.equal(await page.locator('#eco-app-start-deposit').getAttribute('href'),'#guided-action');
      if(width===360)await page.locator('.eco-app-phone').screenshot({path:output+'/empty-wallet-360.png'});
      await press('#eco-app-start-deposit');
      assert.equal(await page.evaluate(()=>location.hash),'#guided-action');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'guided-action');
      assert.equal(await page.locator('#points').textContent(),'0','navigation never grants points');

      // Every close path is harmless; opening starts at the product heading.
      for(const close of ['#eco-shop-close','Escape','#eco-shop-cancel']) {
        await go(page,'boutique');await press('[data-shop-detail="carry-bag"]');
        assert.equal(await page.evaluate(()=>document.activeElement.id),'eco-shop-product-name');
        assert.ok(await page.locator('#eco-shop-product-name').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'product title visible on first screen');
        assert.equal(await page.locator('#eco-shop-dialog').evaluate(dialog=>dialog.scrollTop),0);
        assert.ok(await page.locator('#eco-shop-close').evaluate(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.top>=0&&r.bottom<=innerHeight;}));
        assert.ok(await page.locator('#eco-shop-confirm').isDisabled());
        assert.ok(await page.locator('#eco-shop-try-deposit').isVisible());
        if(width===360&&close==='#eco-shop-close')await page.screenshot({path:output+'/product-title-360.png'});
        if(close==='Escape')await page.keyboard.press('Escape');else await press(close);
        assert.ok(await page.locator('#eco-shop-dialog').evaluate(dialog=>!dialog.open));
        assert.equal(await page.locator('#points').textContent(),'0');
        assert.equal(await page.locator('#eco-shop-balance').textContent(),'0');
      }
      await go(page,'boutique');await press('[data-shop-detail="repair-pouch"]');
      await page.evaluate(()=>{
        window.closedBeforeNavigation=null;
        document.addEventListener('ecoscan:viewchange',event=>{
          if(event.detail.targetId==='guided-action')window.closedBeforeNavigation=!document.getElementById('eco-shop-dialog').open;
        });
      });
      await press('#eco-shop-try-deposit');
      assert.equal(await page.evaluate(()=>window.closedBeforeNavigation),true,'modal closes before navigation');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'guided-action');
      assert.equal(await page.evaluate(()=>location.hash),'#guided-action');
      assert.equal(await page.locator('#points').textContent(),'0');
      assert.equal(await page.locator('#drop-zone').getAttribute('data-state'),'disconnected');
      await press('#guided-action');
      assert.equal(await page.locator('#points').textContent(),'0','connecting never grants points');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'item');
      await page.selectOption('#item','mix');await press('#scan');
      await page.waitForFunction(()=>document.getElementById('drop-zone').dataset.state==='confirmed');
      for(const id of ['points','dash-points','eco-app-balance','eco-shop-balance'])assert.equal(await page.locator('#'+id).textContent(),'30');
      await go(page,'eco-app-wallet');
      assert.ok(await page.locator('#eco-app-start-deposit').isHidden());
      await press('[data-app-open="shop"]');
      assert.equal(await page.locator('[data-app-tab="shop"]').getAttribute('aria-selected'),'true');
      assert.equal(await page.locator('#points').textContent(),'30','browsing rewards never spends points');
      await go(page,'boutique');await press('[data-shop-detail="repair-pouch"]');
      assert.ok(await page.locator('#eco-shop-try-deposit').isHidden(),'affordable offers show confirmation without the insufficient-balance detour');
      assert.ok(await page.locator('#eco-shop-confirm').isEnabled());
      await press('#eco-shop-close');
      assert.equal(await page.locator('#points').textContent(),'30');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}px`);
      await context.close();
    }
    const navigation=await browser.newPage({viewport:{width:320,height:800},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
    navigation.on('pageerror',error=>errors.push(error.message));
    for(const width of [320,360,390]) {
      await navigation.setViewportSize({width,height:800});
      await navigation.goto(base+'/#demo');
      assert.match(await navigation.locator('#menu-button').textContent(),/Essayer/);
      assert.match(await navigation.locator('#menu-button').getAttribute('aria-label'),/Changer de parcours.*Essayer/);
      await navigation.locator('#menu-button').tap();await navigation.locator('[data-nav-group="resources"]').tap();
      assert.match(await navigation.locator('#menu-button').textContent(),/Ressources/);
      assert.match(await navigation.locator('#menu-button').getAttribute('aria-label'),/Ressources/);
      assert.equal(await navigation.locator('#menu-button').getAttribute('aria-expanded'),'false');
      assert.ok(await navigation.locator('#menu-button').evaluate(el=>el.getBoundingClientRect().height>=44));
      assert.ok(await navigation.locator('header').evaluate(el=>el.getBoundingClientRect().height<=90),`closed header stays on one row at ${width}px`);
      assert.ok(await navigation.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`navigation overflow at ${width}px`);
      await navigation.locator('#menu-button').tap();await navigation.keyboard.press('Escape');
      assert.equal(await navigation.locator('#menu-button').getAttribute('aria-expanded'),'false');
      assert.equal(await navigation.evaluate(()=>document.activeElement.id),'menu-button');
    }
    assert.deepEqual(errors,[]);
    console.log('PASS ergonomics: touch360/390 and desktop, empty-wallet deposit path, visible modal title/top44px close, cancel/Escape without debit, modal closes before deposit navigation, no credit on navigation/connection, one shared 30-point award, reward browsing preserves balance, affordable offers, mobile route labels/ARIA/one-row header/Escape at320/360/390, no overflow/errors.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
