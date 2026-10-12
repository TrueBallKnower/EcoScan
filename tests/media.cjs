'use strict';
const{chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.ECOSCAN_TEST_URL||'http://127.0.0.1:8000';
async function open(page,id){await page.evaluate(value=>{location.hash=value;},id);await page.locator('#'+id).waitFor({state:'visible'});await page.waitForTimeout(220);}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused&&!v.autoplay&&v.preload==='none'));assert.equal(await page.locator('[data-video-time]').count(),9);
await open(page,'video-explicative');assert.equal(await page.locator('[data-film-language="en"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#explainer-video track[default]').getAttribute('srclang'),'fr');
// Picking a narration before watching must not start playback or preload the film.
for(const language of ['fr','en']){
 await page.locator(`[data-film-language="${language}"]`).click();
 assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused&&!v.autoplay&&v.preload==='none'));
 assert.equal(await page.locator(`[data-film-language="${language}"]`).getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('[data-film-language][aria-pressed="true"]').count(),1);
 assert.match(await page.locator('#film-download').getAttribute('href'),language==='en'?/econova-film-v2-en\.mp4/:/econova-film-v2\.mp4/);
 assert.equal(await page.locator('#film-download').getAttribute('download'),`Econova-film-concept-${language}.mp4`);
}
await page.locator('[data-video-time="50"]').click();await page.waitForFunction(()=>document.getElementById('explainer-video').readyState>=2);assert.equal(await page.locator('#explainer-video').evaluate(v=>Math.round(v.duration)),92);await page.waitForFunction(()=>Math.abs(document.getElementById('explainer-video').currentTime-50)<.2);assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused));
assert.match(await page.locator('#video-status').textContent(),/Chapitre sélectionné/);
// A paused film keeps its chapter; a playing film keeps the visitor's playback choice.
await page.locator('[data-film-language="fr"]').click();await page.waitForFunction(()=>{const v=document.getElementById('explainer-video');return v.readyState>=2&&Math.abs(v.currentTime-50)<.2;});assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused));assert.equal(await page.locator('#explainer-video').evaluate(v=>Math.round(v.duration)),92);
await page.locator('#explainer-video').evaluate(v=>v.play());await page.waitForFunction(()=>document.getElementById('explainer-video').currentTime>51);const languageSwitchTime=await page.locator('#explainer-video').evaluate(v=>v.currentTime);
await page.locator('[data-film-language="en"]').click();await page.waitForFunction(time=>{const v=document.getElementById('explainer-video');return v.readyState>=2&&!v.paused&&v.currentTime>=time-.2&&v.currentTime<time+1.5;},languageSwitchTime);
assert.equal(await page.locator('#explainer-video').evaluate(v=>Math.round(v.duration)),92);assert.match(await page.locator('#explainer-video source').getAttribute('src'),/\/econova-film-v2-en\.mp4(?:\?|$)/);
await open(page,'demo');assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused));const pausedTime=await page.locator('#explainer-video').evaluate(v=>v.currentTime);
await open(page,'video-explicative');assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused));assert.ok(Math.abs(await page.locator('#explainer-video').evaluate(v=>v.currentTime)-pausedTime)<.1);
await page.locator('#explainer-video').evaluate(v=>{v.currentTime=65;});await page.waitForFunction(()=>document.querySelector('[data-video-time="62"]').getAttribute('aria-pressed')==='true');assert.equal(await page.locator('[data-video-time][aria-pressed="true"]').count(),1);
await page.locator('#explainer-video').screenshot({path:'/workspace/ecoscan-validation/video-browser-frame.png'});
for(const time of ['0','83']){await page.locator(`[data-video-time="${time}"]`).click();await page.waitForFunction(t=>Math.abs(document.getElementById('explainer-video').currentTime-t)<.2,Number(time));}
for(const file of ['assets/econova-film-v2-fr.vtt','assets/econova-film-v2-en.vtt','assets/econova-film-v2-en-fr.vtt']){const vtt=await page.request.get(base+'/'+file);assert.equal(vtt.status(),200);const text=await vtt.text();assert.match(text,/^WEBVTT/);assert.match(text,/00:01:32.000/);assert.equal((text.match(/\d\d:\d\d:\d\d\.\d{3}\s*-->/g)||[]).length,26);}
for(const file of ['assets/econova-film-v2-poster.jpg','assets/econova-film-v2.mp4','assets/econova-film-v2-en.mp4','docs/VIDEO_V2_TRANSCRIPTION.md'])assert.equal((await page.request.get(base+'/'+file)).status(),200);
await page.locator('.video-transcript summary').click();assert.equal(await page.locator('.video-transcript li').count(),9);
await page.locator('.video-frame').scrollIntoViewIfNeeded();await page.waitForTimeout(900);assert.equal(await page.locator('.video-frame').evaluate(e=>getComputedStyle(e).opacity),'1');assert.ok(await page.locator('#reading-progress').evaluate(e=>getComputedStyle(e).transform!=='matrix(0, 0, 0, 1, 0, 0)'));
for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.locator('.planet').evaluate(e=>getComputedStyle(e).animationName),'none');assert.ok(await page.locator('#explainer-video').evaluate(v=>v.paused));
const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base);assert.ok(await nojs.locator('#explainer-video').isVisible());await nojs.locator('.video-transcript summary').click();assert.equal(await nojs.locator('.video-transcript li').count(),9);assert.deepEqual(errors,[]);
console.log('PASS media: bilingual MP4 92s playback/decoded frame, narration switching before load/paused/playing with time preserved, 9 chapter seeks, no autoplay, hidden-film pause with position preserved, 3 caption files/transcript/downloads, reveal/progress, 4 widths, reduced motion, no-JS video.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
