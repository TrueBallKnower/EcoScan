'use strict';
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8000';
const settle=p=>p.waitForFunction(()=>['confirmed','rejected'].includes(document.getElementById('drop-zone').dataset.state));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
 const point=async()=>Number(await page.locator('#points').textContent());
 await page.click('#reset');await page.locator('[data-object=pet]').click();await page.locator('#drop-zone').focus();await page.keyboard.press('Space');assert.equal(await point(),0);assert.equal(await page.locator('#drop-zone').getAttribute('data-state'),'disconnected');
 await page.click('#connect');await page.locator('[data-object=pet]').dragTo(page.locator('#drop-zone'));assert.equal(await point(),0);assert.equal(await page.locator('#item').isDisabled(),true);
 await page.locator('#scan').evaluate(e=>{e.dispatchEvent(new MouseEvent('click'));e.dispatchEvent(new MouseEvent('click'));});await settle(page);assert.equal(await point(),10);assert.equal(await page.locator('#dash-deposits').textContent(),'1');assert.equal(await page.locator('#dash-points').textContent(),'10');
 // Cancellation while scanning must never credit a stale asynchronous operation.
 await page.click('#new-item');await page.click('#scan');await page.click('#connect');await page.waitForTimeout(1500);assert.equal(await point(),10);assert.equal(await page.locator('#dash-session').textContent(),'Inactive');
 await page.click('#connect');await page.click('#scan');await page.check('#offline');await page.waitForTimeout(1500);assert.equal(await point(),10);assert.equal(await page.locator('#drop-zone').getAttribute('data-state'),'blocked-offline');await page.uncheck('#offline');
 await page.click('#scan');await page.locator('#fill-level').fill('100');await page.waitForTimeout(1500);assert.equal(await point(),10);assert.equal(await page.locator('#drop-zone').getAttribute('data-state'),'blocked-full');
 // A full PET bin does not block aluminium; mixed input needs all three.
 await page.locator('[data-object=can]').click();assert.ok(await page.locator('#scan').isEnabled());await page.click('#scan');await settle(page);assert.equal(await point(),20);
 await page.selectOption('#item','mix');assert.ok(await page.locator('#scan').isDisabled());await page.locator('#fill-level').fill('45');
 await page.locator('[data-object=pet]').click();await page.click('#scan');await page.click('#reset');await page.waitForTimeout(1500);assert.equal(await point(),0);assert.equal(await page.locator('#dash-deposits').textContent(),'0');
 // Keyboard and touchscreen alternatives to dragging.
 await page.locator('#drop-zone').focus();await page.keyboard.press('Space');await settle(page);assert.equal(await point(),10);
 await page.setViewportSize({width:360,height:800});await page.locator('[data-object=paper]').click();await page.click('#scan');await settle(page);assert.equal(await point(),20);
 await page.click('#redeem');assert.equal(await point(),0);assert.equal(await page.locator('#dash-points').textContent(),'0');
 await page.locator('[data-object=cup]').click();await page.click('#scan');await settle(page);assert.equal(await point(),0);assert.equal(await page.locator('#drop-zone').getAttribute('data-state'),'rejected');
 for(const view of ['exterior','cutaway','mechanism']){await page.locator(`button[data-view=${view}]`).click();assert.equal(await page.locator('.machine-shell').getAttribute('data-view'),view);assert.equal(await page.locator(`button[data-view=${view}]`).getAttribute('aria-pressed'),'true');assert.ok((await page.locator('#blueprint-caption').textContent()).length>50);}
 for(const detail of ['isolation','sensor','routing','maintenance']){await page.locator(`[data-detail=${detail}]`).click();assert.ok((await page.locator('#blueprint-detail').textContent()).length>70);}
 await page.click('#blueprint-play');assert.equal(await page.locator('.machine-shell').getAttribute('data-view'),'mechanism');
 await page.click('#restart-demo');assert.equal(await point(),0);assert.equal(await page.locator('#dash-deposits').textContent(),'0');assert.equal(await page.locator('#dash-session').textContent(),'Inactive');for(const material of ['pet','can','paper'])assert.equal(await page.locator('#level-'+material).textContent(),'45 %');
 await page.emulateMedia({reducedMotion:'reduce'});await page.click('#connect');await page.selectOption('#item','mix');await page.click('#scan');await settle(page);assert.equal(await point(),30);assert.equal(await page.locator('.scan-beam').evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 const touch=await browser.newContext({viewport:{width:360,height:800},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const mobile=await touch.newPage();await mobile.goto(base);await mobile.locator('#connect').tap();await mobile.locator('[data-object=pet]').tap();await mobile.locator('#scan').tap();await settle(mobile);assert.equal(await mobile.locator('#points').textContent(),'10');await touch.close();

 console.log('PASS V2: mouse drag/drop and touchscreen alternative, blocked session, credit after validation only, duplicate trigger, cancellation by logout/offline/full/reset, target-specific levels, keyboard/mobile, uncertain object, shared counters, 3 blueprint views/4 details, restart and reduced motion.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
