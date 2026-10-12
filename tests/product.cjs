'use strict';
const{chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8000';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
assert.equal(await page.title(),'EcoScan — Un seul geste. Un nouveau cycle.');assert.equal(await page.locator('h1').count(),1);assert.match(await page.locator('h1').textContent(),/Un seul geste/);
for(const id of ['promesse','mise-en-place','laboratoire','recherche','exploitation','preuves','sources'])assert.equal(await page.locator('#'+id).count(),1);
for(const key of ['sorting','flow','session','impact']){
 await page.locator(`[data-protocol=${key}]`).click();assert.equal(await page.locator(`[data-protocol=${key}]`).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#protocol-steps li').count(),5);assert.ok((await page.locator('#protocol-limit').textContent()).startsWith('Limite :'));
 const downloadPromise=page.waitForEvent('download');await page.click('#download-protocol');const download=await downloadPromise;assert.equal(download.suggestedFilename(),`EcoScan-protocole-${key}.md`);assert.match(await page.locator('#protocol-status').textContent(),/Aucun test/);
}
for(const img of await page.locator('.hero-product img,.product-brand img,.blueprint-card img').all()){
 await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());assert.ok(await img.evaluate(el=>el.naturalWidth>0));
}
for(const width of [360,390,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);}
for(const asset of ['product.css','product.js','assets/logo-ecoscan.svg','assets/logo-ecoscan-light.svg','assets/econova-compact-studio.webp','assets/econova-blueprint-v2.svg','docs/RECHERCHE_INNOVATION.md'])assert.equal((await page.request.get(base+'/'+asset)).status(),200,asset);
await page.locator('#guided-action').scrollIntoViewIfNeeded();await page.click('#reset');await page.click('#guided-action');await page.selectOption('#item','mix');await page.click('#scan');await page.waitForFunction(()=>document.getElementById('drop-zone').dataset.state==='confirmed');assert.equal(await page.locator('#points').textContent(),'30');assert.equal(await page.locator('#dash-points').textContent(),'30');
assert.deepEqual(errors,[]);
const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:360,height:850}});await nojs.goto(base);assert.ok(await nojs.locator('#mise-en-place').isVisible());assert.ok(await nojs.locator('#laboratoire noscript').isVisible());assert.ok(await nojs.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
console.log('PASS product: identity/mission, new sections, 4 protocol selectors and actual downloads, brand/hero/blueprint assets, 5 widths, unchanged mixture simulation, no-JS fallback, zero JS errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
