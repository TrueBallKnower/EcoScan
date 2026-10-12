const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function settle(page){await page.waitForFunction(()=>['confirmed','rejected'].includes(document.getElementById('drop-zone').dataset.state));}
const base=process.env.ECOSCAN_TEST_URL || 'http://127.0.0.1:8000';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
await page.goto(base); 
assert.ok(await page.locator('main section').count()>=25);
assert.ok(!(await page.locator('body').textContent()).includes('Romain'));
assert.equal(await page.locator('.single-inlet').count(),1);
assert.equal(await page.locator('.internal-bins>div').count(),3);
assert.equal(await page.locator('[data-bin]').count(),0);
assert.ok(await page.locator('#scan').isDisabled());
await page.click('#reset');await page.click('#redeem');assert.match(await page.locator('#redeem-status').textContent(),/insuffisant/);
await page.click('#connect');assert.match(await page.locator('#session-status').textContent(),/active/);
for(const value of ['pet','can','paper','cup','food','mix']) {
 await page.selectOption('#item',value);assert.ok((await page.locator('#advice').textContent()).length>150);
 const before=Number(await page.locator('#points').textContent());await page.click('#scan');await settle(page);
 const uncertain=['cup','food'].includes(value), route=uncertain?'check':value;
 for(const destination of value==='mix'?['pet','can','paper']:[route])assert.ok(await page.locator(`[data-route="${destination}"]`).evaluate(e=>e.classList.contains('routed')));
 assert.equal(Number(await page.locator('#points').textContent()),before+(uncertain?0:value==='mix'?30:10));
 assert.match(await page.locator('#sort-feedback').textContent(),uncertain?/incertaine/:/automatiquement/);
 assert.ok(await page.locator('#scan').isDisabled());
 const credited=await page.locator('#points').textContent();await page.locator('#scan').evaluate(e=>e.dispatchEvent(new MouseEvent('click')));assert.equal(await page.locator('#points').textContent(),credited);
 await page.click('#new-item');assert.ok(await page.locator('#scan').isEnabled());
}
await page.click('#reset');await page.selectOption('#item','pet');await page.click('#scan');await settle(page);await page.click('#new-item');await page.click('#scan');await settle(page);await page.click('#redeem');assert.equal(await page.locator('#points').textContent(),'0');assert.match(await page.locator('#redeem-status').textContent(),/20 points retirés/);
await page.click('#redeem');assert.equal(await page.locator('#points').textContent(),'0');assert.match(await page.locator('#redeem-status').textContent(),/insuffisant/);
async function prepareDeposit(target){if((await target.locator('#connect').textContent()).startsWith('Simuler'))await target.click('#connect');await target.selectOption('#item','pet');await target.click('#new-item');}
await page.click('#new-item');await page.locator('#fill-level').fill('90');assert.match(await page.locator('#fill-status').textContent(),/seuil de collecte/);
await page.locator('#fill-level').fill('100');assert.match(await page.locator('#fill-status').textContent(),/bac plein/);assert.ok(await page.locator('#scan').isDisabled());
await page.locator('#scan').evaluate(e=>e.dispatchEvent(new MouseEvent('click')));assert.equal(await page.locator('#points').textContent(),'0');
await page.locator('#fill-level').fill('20');assert.ok(await page.locator('#scan').isEnabled());assert.match(await page.locator('#fill-status').textContent(),/capacité disponible/);
await page.check('#offline');assert.match(await page.locator('#offline-status').textContent(),/hors ligne/);assert.ok(await page.locator('#scan').isDisabled());
await page.click('#connect');assert.ok(await page.locator('#connect').isDisabled());await page.uncheck('#offline');assert.ok(await page.locator('#connect').isEnabled());
await page.locator('#faq summary').first().click();assert.ok(await page.locator('#faq details').first().getAttribute('open')!==null);
await page.click('#reset');await prepareDeposit(page);await page.click('#scan');await settle(page);assert.equal(await page.locator('#points').textContent(),'10');await page.reload();assert.equal(await page.locator('#points').textContent(),'10');assert.ok(await page.locator('#scan').isDisabled());await page.click('#reset');assert.equal(await page.locator('#points').textContent(),'0');
const answers=[0,1,2,1,0];for(const answer of answers){await page.locator('.answer').nth(answer).click();assert.ok((await page.locator('#quiz-feedback').textContent()).startsWith('Bonne réponse'));await page.click('#quiz-next');}
assert.match(await page.locator('#question').textContent(),/5 \/ 5/);await page.click('#quiz-restart');assert.match(await page.locator('#quiz-progress').textContent(),/Question 1/);
await page.locator('.answer').nth(2).click();assert.match(await page.locator('#quiz-feedback').textContent(),/À retenir/);
await page.locator('.pledge').first().click();assert.equal(await page.locator('.pledge').first().getAttribute('aria-pressed'),'true');
for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});await page.goto(base);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);if(width===360){await page.click('#menu-button');assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'),'false');await page.click('#menu-button');await page.locator('#navigation a[href="#demo"]').click();assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'),'false');}}
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.locator('.planet').evaluate(e=>getComputedStyle(e).animationName),'none');
for(const el of await page.locator('.reveal-ready').all()){await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(750); assert.equal(await el.evaluate(e=>getComputedStyle(e).opacity),'1');}
await prepareDeposit(page);await page.locator('#scan').focus();await page.keyboard.press('Enter');await settle(page);assert.ok(Number(await page.locator('#points').textContent())>=10);
const links=await page.locator('a[href^="#"]').evaluateAll(els=>els.map(e=>e.getAttribute('href').slice(1)));for(const id of links)assert.equal(await page.locator(`[id="${id}"]`).count(),1,`anchor ${id}`);
assert.deepEqual(errors,[]);
const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:800}});await nojs.goto(base);assert.ok(await nojs.locator('#concept').isVisible());assert.ok(await nojs.locator('#station').isVisible());await nojs.locator('#faq summary').first().click();assert.ok(await nojs.locator('#faq details').first().getAttribute('open')!==null);assert.ok(await nojs.locator('#navigation').isVisible());assert.ok(await nojs.locator('#demo noscript').isVisible());assert.ok(await nojs.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
const blocked=await browser.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked');}})});await blocked.goto(base);await prepareDeposit(blocked);await blocked.click('#scan');await settle(blocked);assert.equal(await blocked.locator('#points').textContent(),'10');assert.match(await blocked.locator('#storage-status').textContent(),/indisponible/);
for(const asset of ['assets/favicon.svg','assets/econova-blueprint.svg','assets/econova-concept.png','assets/ecoscan-station-qr.svg','docs/FAISABILITE.md']){const response=await page.request.get(base+'/'+asset);assert.equal(response.status(),200);}
const diagram=await page.request.get(base+'/assets/econova-blueprint-v2.svg');const diagramText=await diagram.text();assert.match(diagramText,/Concept · sans cotes validées/);assert.match(diagramText,/Aucune performance mesurée/);
await page.locator('.blueprint-card img').scrollIntoViewIfNeeded();await page.locator('.blueprint-card img').evaluate(img=>img.decode());assert.ok(await page.locator('.blueprint-card img').evaluate(img=>img.naturalWidth>1000));
console.log('PASS: core content sections, entrée unique, 3 bacs internes, session/tri automatique/contrôle incertain/anti-double-points/échange, plein/hors-ligne/FAQ, blueprint PNG/SVG, points/persistance/reset, quiz/score/reprise/erreur, gestes, 4 largeurs, menu/Escape/liens, reduced motion, sans JS, stockage bloqué, ressource locale; aucune erreur JS.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
