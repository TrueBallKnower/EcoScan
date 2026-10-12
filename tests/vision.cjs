'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8000';
async function open(page,id){await page.evaluate(value=>{location.hash=value;},id);await page.locator('#'+id).waitFor({state:'visible'});await page.waitForTimeout(220);}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/?station=ECO-001#demo');
assert.match(await page.locator('#qr-arrival').textContent(),/QR reconnu/);assert.equal(await page.locator('#scan').isDisabled(),true);
await page.click('#reset');await page.click('#guided-action');assert.match(await page.locator('#session-status').textContent(),/active/);assert.match(await page.locator('#guided-action').textContent(),/Déposer/);
await page.selectOption('#item','pet');await page.click('#guided-action');await page.waitForFunction(()=>document.getElementById('drop-zone').dataset.state==='confirmed');assert.equal(await page.locator('#points').textContent(),'10');assert.match(await page.locator('#guided-action').textContent(),/nouveau dépôt/);
await page.click('#guided-action');assert.equal(await page.locator('#scan').isDisabled(),false);await page.check('#offline');assert.equal(await page.locator('#guided-action').isDisabled(),true);await page.uncheck('#offline');
await page.locator('#fill-level').fill('100');assert.ok(await page.locator('#guided-action').isDisabled());await page.locator('#fill-level').fill('45');
await open(page,'faisabilite');assert.equal(await page.locator('#capacity-value').textContent(),'8');assert.match(await page.locator('#capacity-status').textContent(),/dépasse/);
await page.locator('#arrival-rate').fill('4');assert.match(await page.locator('#capacity-status').textContent(),/sous/);
await page.locator('#cycle-time').fill('2');await page.locator('#availability').fill('100');assert.equal(await page.locator('#capacity-value').textContent(),'30');await page.locator('#arrival-rate').fill('40');assert.match(await page.locator('#capacity-status').textContent(),/2 stations/);
for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+width);}
await open(page,'qr-session');await page.locator('#qr-session img').scrollIntoViewIfNeeded();await page.locator('#qr-session img').evaluate(i=>i.decode());assert.ok(await page.locator('#qr-session img').evaluate(i=>i.naturalWidth>0));await page.locator('#qr-session img').screenshot({path:'/workspace/ecoscan-validation/qr-rendered.png'});
assert.equal(await page.locator('#qr-session a.button').getAttribute('href'),'./?station=ECO-001#demo');assert.equal((await page.request.get(base+'/docs/FAISABILITE.md')).status(),200);
await page.goto(base+'/?station=unknown#demo');assert.match(await page.locator('#qr-arrival').textContent(),/inconnu/);assert.ok(await page.locator('#scan').isDisabled());
assert.deepEqual(errors,[]);console.log('PASS V3: guided connect/deposit/result, synchronized offline/full controls, 3 capacity assumptions/formula, 4 viewport widths, QR URL/asset/document, unknown station blocked.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
