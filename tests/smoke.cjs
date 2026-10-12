const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.ECOSCAN_TEST_URL || 'http://127.0.0.1:8000';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
await page.goto(base); 
assert.equal(await page.locator('main section').count(),14);
for(const value of ['pet','can','paper','cup','food']) {await page.selectOption('#item',value);assert.ok((await page.locator('#advice').textContent()).length>150);}
await page.click('#reset');await page.click('#earn');assert.equal(await page.locator('#points').textContent(),'10');await page.reload();assert.equal(await page.locator('#points').textContent(),'10');await page.click('#reset');assert.equal(await page.locator('#points').textContent(),'0');
const answers=[0,1,2,1,0];for(const answer of answers){await page.locator('.answer').nth(answer).click();assert.ok((await page.locator('#quiz-feedback').textContent()).startsWith('Bonne réponse'));await page.click('#quiz-next');}
assert.match(await page.locator('#question').textContent(),/5 \/ 5/);await page.click('#quiz-restart');assert.match(await page.locator('#quiz-progress').textContent(),/Question 1/);
await page.locator('.answer').nth(2).click();assert.match(await page.locator('#quiz-feedback').textContent(),/À retenir/);
await page.locator('.pledge').first().click();assert.equal(await page.locator('.pledge').first().getAttribute('aria-pressed'),'true');
for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});await page.goto(base);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);if(width===360){await page.click('#menu-button');assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'),'false');await page.click('#menu-button');await page.locator('#navigation a[href="#demo"]').click();assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'),'false');}}
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.locator('.planet').evaluate(e=>getComputedStyle(e).animationName),'none');
for(const el of await page.locator('.reveal-ready').all()){await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(750); assert.equal(await el.evaluate(e=>getComputedStyle(e).opacity),'1');}
await page.locator('#earn').focus();await page.keyboard.press('Enter');assert.ok(Number(await page.locator('#points').textContent())>=10);
const links=await page.locator('a[href^="#"]').evaluateAll(els=>els.map(e=>e.getAttribute('href').slice(1)));for(const id of links)assert.equal(await page.locator(`[id="${id}"]`).count(),1,`anchor ${id}`);
assert.deepEqual(errors,[]);
const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:800}});await nojs.goto(base);assert.ok(await nojs.locator('#concept').isVisible());assert.ok(await nojs.locator('#navigation').isVisible());assert.ok(await nojs.locator('noscript').isVisible());assert.ok(await nojs.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
const blocked=await browser.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked');}})});await blocked.goto(base);await blocked.click('#earn');assert.equal(await blocked.locator('#points').textContent(),'10');assert.match(await blocked.locator('#storage-status').textContent(),/indisponible/);
const response=await page.request.get(base+'/assets/favicon.svg');assert.equal(response.status(),200);
console.log('PASS: sections, 5 objets, points/persistance/reset, quiz/score/reprise/erreur, gestes, 4 largeurs, menu/Escape/liens, reduced motion, sans JS, stockage bloqué, ressource locale; aucune erreur JS.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
