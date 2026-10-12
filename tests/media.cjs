'use strict';
const{chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8000';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused&&!v.autoplay&&v.preload==='none'));assert.equal(await page.locator('[data-video-time]').count(),9);
await page.locator('[data-video-time="60"]').click();await page.waitForFunction(()=>document.getElementById('explainer-video').readyState>=2);assert.equal(await page.locator('#explainer-video').evaluate(v=>Math.round(v.duration)),108);await page.waitForFunction(()=>Math.abs(document.getElementById('explainer-video').currentTime-60)<.2);assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused));
assert.match(await page.locator('#video-status').textContent(),/Chapitre sélectionné/);await page.locator('#explainer-video').evaluate(v=>v.play());await page.waitForFunction(()=>document.getElementById('explainer-video').currentTime>61);await page.locator('#explainer-video').evaluate(v=>v.pause());
await page.locator('#explainer-video').screenshot({path:'/workspace/ecoscan-validation/video-browser-frame.png'});
for(const time of ['0','96']){await page.locator(`[data-video-time="${time}"]`).click();await page.waitForFunction(t=>Math.abs(document.getElementById('explainer-video').currentTime-t)<.2,Number(time));}
const vtt=await page.request.get(base+'/assets/econova-explainer-fr.vtt');assert.equal(vtt.status(),200);assert.match(await vtt.text(),/^WEBVTT/);assert.match(await vtt.text(),/00:01:48.000/);
for(const file of ['assets/econova-video-poster.jpg','assets/econova-explainer.mp4','docs/VIDEO_TRANSCRIPTION.md'])assert.equal((await page.request.get(base+'/'+file)).status(),200);
await page.locator('.video-transcript summary').click();assert.equal(await page.locator('.video-transcript li').count(),9);
await page.locator('.video-frame').scrollIntoViewIfNeeded();await page.waitForTimeout(900);assert.equal(await page.locator('.video-frame').evaluate(e=>getComputedStyle(e).opacity),'1');assert.ok(await page.locator('#reading-progress').evaluate(e=>getComputedStyle(e).transform!=='matrix(0, 0, 0, 1, 0, 0)'));
for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.locator('.planet').evaluate(e=>getComputedStyle(e).animationName),'none');assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused));
const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base);assert.ok(await nojs.locator('#explainer-video').isVisible());await nojs.locator('.video-transcript summary').click();assert.equal(await nojs.locator('.video-transcript li').count(),9);assert.deepEqual(errors,[]);
console.log('PASS media: MP4 108s playback/decoded frame, 9 chapter seeks, no autoplay, captions/transcript/downloads, reveal/progress, 4 widths, reduced motion, no-JS video.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
