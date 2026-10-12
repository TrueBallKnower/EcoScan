'use strict';
const $ = (id) => document.getElementById(id);
document.body.classList.add('js');
document.querySelectorAll('.interactive').forEach(el => el.hidden = false);
const menu = $('menu-button');
menu.hidden = false;
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  $('navigation').classList.toggle('open', open);
});
function closeMenu() { menu.setAttribute('aria-expanded','false'); $('navigation').classList.remove('open'); }
$('navigation').addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
const items = {
  mix: ['Dépôt mélangé de recyclables', '♲', 'Ce scénario contient une bouteille de boisson PET vide, une canette vide et du papier propre. La séparation des trois objets puis leur routage sont simulés. Une machine réelle devrait démontrer sa capacité à isoler les objets sans contamination ni blocage.', 'Réutilisez vos contenants et limitez les impressions avant de recycler.'],
  pet: ['Bouteille PET', '♲', 'Les bouteilles de boisson en PET peuvent être collectées dans une filière dédiée. Tous les plastiques ne vont pas dans ce bac : vérifiez la signalétique locale et videz la bouteille.', 'Emportez une gourde et utilisez un point d’eau adapté.'],
  can: ['Canette', '◉', 'Une canette de boisson vide peut rejoindre une collecte de l’aluminium si elle est acceptée sur place. Suivez les consignes du bac ; ne présumez pas que tous les emballages métallisés sont de l’aluminium.', 'Choisissez un contenant réutilisable lorsque c’est possible.'],
  paper: ['Papier', '▤', 'Le papier propre et sec peut être orienté vers la collecte du papier selon les règles locales. Papier souillé, mouchoirs et revêtements spéciaux ne se traitent pas nécessairement de la même manière.', 'Lisez à l’écran, imprimez recto verso si nécessaire et réutilisez les versos libres.'],
  cup: ['Gobelet de café', '☕', 'Un gobelet peut comporter un revêtement qui empêche son recyclage avec le papier. Ne vous fiez pas seulement à son apparence : consultez les consignes du lieu et séparez le couvercle si demandé.', 'Apportez une tasse réutilisable et demandez si elle peut être remplie.'],
  food: ['Emballage alimentaire', '▱', 'Les emballages alimentaires sont très variables : plastique, carton, aluminium ou couches composites. Videz les restes et vérifiez les matériaux et les filières acceptées ; en cas de doute, demandez au responsable du point de collecte.', 'Utilisez une boîte réutilisable et adaptez les portions pour limiter les restes.']
};
// One shared state for station, phone, levels and animated transactions.
let connected = false, deposited = false, busy = false, points = 0, deposits = 0;
let transaction = 0;
let earnedLastDeposit = 0;
const exchangeRequests = new Map();
const conceptProducts = Object.freeze({
  'repair-pouch':{cost:20,label:'Pochette seconde vie'},
  'loop-notebook':{cost:30,label:'Carnet Loop'},
  'carry-bag':{cost:40,label:'Sac ReCycle'}
});
const levels = {pet:45,can:45,paper:45};
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
try { const saved = Number(localStorage.getItem('ecoscan-demo-points')); if(Number.isSafeInteger(saved) && saved >= 0 && saved <= 1000000) points = saved; }
catch { $('storage-status').textContent = 'Stockage indisponible : les points restent disponibles pendant cette visite.'; }
function routesFor(value) { return value === 'mix' ? ['pet','can','paper'] : ['cup','food'].includes(value) ? ['check'] : [value]; }
function isFull(value = $('item').value) { return routesFor(value).some(route => levels[route] >= 100); }
function renderPoints() { $('points').textContent = points; $('dash-points').textContent = points; updateGuide(); document.dispatchEvent(new CustomEvent('ecoscan:wallet',{detail:{points,deposits,earned:earnedLastDeposit,phase:$('drop-zone').dataset.state,connected,busy,offline:$('offline').checked}})); }
function savePoints() {
  try {localStorage.setItem('ecoscan-demo-points',String(points));}
  catch { $('storage-status').textContent = 'Stockage indisponible : les points ne seront pas conservés après cette visite.'; }
  renderPoints();
}
function setPhase(phase, message, route = null) {
  $('drop-zone').dataset.state = phase;
  if(message) $('scan-status').textContent = message;
  const order=['detecting','scanning','routing','confirmed'], index=order.indexOf(phase);
  document.querySelectorAll('[data-lab]').forEach((el,i)=>el.classList.toggle('active',index>=i));
  document.dispatchEvent(new CustomEvent('ecoscan:phase',{detail:{phase,route}}));
}
function updateAvailability() {
  const offline=$('offline').checked, full=isFull();
  $('scan').disabled = !connected || deposited || busy || offline || full;
  $('connect').disabled = offline && !connected;
  $('item').disabled=busy;
  document.querySelectorAll('[data-object]').forEach(button=>{button.disabled=busy;button.draggable=!busy;});
  $('drop-zone').setAttribute('aria-disabled',String($('scan').disabled));
  $('dash-session').textContent=connected?'Active (fictive)':'Inactive';
  const phoneShortcut=$('phone-shortcut');
  if(phoneShortcut)phoneShortcut.textContent=connected?'Session active · voir le portefeuille ↓':'Étape 1 : connecter l’app de démonstration ↓';
  $('dash-network').textContent=offline?'Hors ligne simulé':'En ligne fictif';
  $('dash-deposits').textContent=deposits;
  renderPoints();
  updateGuide();
  if(busy) return;
  if(deposited) { $('scan-status').textContent='Dépôt simulé traité. Préparez un nouveau dépôt pour continuer.'; return; }
  const phase=offline?'blocked-offline':!connected?'disconnected':full?'blocked-full':'ready';
  setPhase(phase,offline?'Connexion indisponible : dépôt et crédit fictif suspendus.':!connected?'Connectez d’abord le téléphone de démonstration.':full?'Compartiment nécessaire plein : dépôt suspendu. Réglez son niveau pour simuler une collecte.':'Prêt : glissez un objet dans l’ouverture ou utilisez le bouton de dépôt.');
}
function resetJourney() {
  transaction++; busy=false; deposited=false; earnedLastDeposit=0;
  $('sort-feedback').textContent=''; $('earn-feedback').textContent='';
  $('wallet-receipt').textContent='En attente d’un nouveau dépôt simulé.';
  $('points').classList.remove('wallet-credit');
  document.querySelectorAll('[data-route]').forEach(el=>el.classList.remove('routed'));
  document.querySelectorAll('[data-lab]').forEach(el=>el.classList.remove('active'));
  $('step-scan').classList.toggle('active',connected); $('step-sort').classList.remove('active'); $('step-earn').classList.remove('active');
  updateAvailability();
}
function showItem() {
  resetJourney();
  const [title,symbol,advice,reduce]=items[$('item').value];
  $('item-title').textContent=title; $('item-symbol').textContent=symbol; $('moving-object').textContent=symbol;
  document.querySelectorAll('[data-object]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.object===$('item').value)));
  $('advice').replaceChildren();
  for(const [label,text] of [['Matière et limites du scénario',advice],['Éviter le prochain déchet',reduce]]) {
    const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=label+' : ';p.append(strong,document.createTextNode(text));$('advice').append(p);
  }
}
$('connect').addEventListener('click',()=>{
  if($('offline').checked&&!connected)return;
  connected=!connected;
  $('connect').textContent=connected?'Terminer la session simulée':'Simuler la connexion à ECO-001';
  $('session-status').textContent=connected?'Session fictive active · ÉcoNova ECO-001. Aucun téléphone réel n’est connecté.':'Session terminée. Le prochain dépôt nécessite une nouvelle connexion simulée.';
  resetJourney();
});
async function startDeposit() {
  if(!connected || deposited || busy || $('offline').checked || isFull()) { updateAvailability(); return; }
  const id=++transaction,value=$('item').value,routes=routesFor(value),uncertain=routes.includes('check');
  busy=true; updateAvailability();
  const valid=()=>id===transaction && connected && !$('offline').checked && !isFull(value);
  const pause=()=>new Promise(resolve=>setTimeout(resolve,reducedMotion()?25:420));
  setPhase('detecting','Objet détecté dans l’ouverture — déplacement virtuel.');
  await pause(); if(!valid())return;
  setPhase('scanning','Analyse simulée — identification programmée, sans caméra ni IA réelle.');
  await pause(); if(!valid())return;
  $('step-sort').classList.add('active');
  for(const route of routes) {
    setPhase('routing',route==='check'?'Routage simulé vers le contrôle isolé.':`Plaques orientées vers ${route==='pet'?'PET':route==='can'?'l’aluminium':'le papier'} — routage simulé.`,route);
    document.querySelector(`[data-route="${route}"]`).classList.add('routed');
    await pause(); if(!valid())return;
  }
  // Commit once, after all stages. Cancellation never grants points.
  busy=false; deposited=true;
  setPhase(uncertain?'rejected':'confirmed');
  $('sort-feedback').textContent=value==='mix'?'Dépôt mélangé simulé : trois objets séparés puis automatiquement orientés vers PET, aluminium et papier. Le mécanisme de séparation reste à tester.':uncertain?'Analyse simulée incertaine : contrôle dédié, isolé des filières. Aucun point crédité.':`Tri simulé : ${items[value][0]} orienté automatiquement vers le compartiment ${value==='pet'?'PET':value==='can'?'aluminium':'papier'}.`;
  if(!uncertain) {
    const awarded=Math.min(value==='mix'?30:10,1000000-points);earnedLastDeposit=awarded;points+=awarded;deposits++;savePoints();
    $('step-earn').classList.add('active');$('points').classList.add('wallet-credit');
    $('wallet-receipt').textContent=`+${awarded} EcoPoints fictifs reçus après validation du dépôt simulé.`;
    $('earn-feedback').textContent='Validation simulée terminée. Un seul crédit local pour ce dépôt ; aucun transfert vers une application réelle.';
  } else {$('wallet-receipt').textContent='Objet incertain : aucun EcoPoint ajouté.';}
  updateAvailability();
}
$('scan').addEventListener('click',startDeposit);
$('drop-zone').addEventListener('click',startDeposit);
$('drop-zone').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();startDeposit();}});
let draggedObject=null;
document.querySelectorAll('[data-object]').forEach(button=>{
  button.addEventListener('click',()=>{if(busy)return;$('item').value=button.dataset.object;showItem();});
  button.addEventListener('dragstart',event=>{
    if(busy){event.preventDefault();return;}
    draggedObject=button.dataset.object;event.dataTransfer.setData('text/plain',draggedObject);event.dataTransfer.effectAllowed='move';
    if(connected&&!$('offline').checked&&!isFull(draggedObject))$('drop-zone').classList.add('dragging');
  });
  button.addEventListener('dragend',()=>{draggedObject=null;$('drop-zone').classList.remove('dragging');});
});
$('drop-zone').addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect=busy?'none':'move';});
$('drop-zone').addEventListener('dragleave',()=> $('drop-zone').classList.remove('dragging'));
$('drop-zone').addEventListener('drop',event=>{
  event.preventDefault();$('drop-zone').classList.remove('dragging');
  const value=draggedObject||event.dataTransfer.getData('text/plain');draggedObject=null;
  if(busy || !Object.hasOwn(items,value))return;
  $('item').value=value;showItem();startDeposit();
});
// Pointer fallback for browsers that do not start native HTML dragging on a button.
let pointerDrag=null;
document.querySelectorAll('[data-object]').forEach(button=>button.addEventListener('pointerdown',event=>{
  if(event.pointerType==='touch'||event.button!==0||busy)return;
  pointerDrag={value:button.dataset.object,x:event.clientX,y:event.clientY,moved:false};
}));
document.addEventListener('pointermove',event=>{
  if(!pointerDrag)return;
  if(Math.hypot(event.clientX-pointerDrag.x,event.clientY-pointerDrag.y)>12)pointerDrag.moved=true;
  if(pointerDrag.moved){const target=document.elementFromPoint(event.clientX,event.clientY);$('drop-zone').classList.toggle('dragging',Boolean(target?.closest('#drop-zone')));}
});
document.addEventListener('pointerup',event=>{
  const candidate=pointerDrag;pointerDrag=null;$('drop-zone').classList.remove('dragging');
  if(!candidate?.moved||busy)return;
  const target=document.elementFromPoint(event.clientX,event.clientY);
  if(target?.closest('#drop-zone')){$('item').value=candidate.value;showItem();startDeposit();}
});
document.addEventListener('pointercancel',()=>{pointerDrag=null;});
document.addEventListener('dragstart',()=>{pointerDrag=null;});
$('new-item').addEventListener('click',()=>{resetJourney();$('item').focus();});
$('item').addEventListener('change',showItem);
function resetDemo(all=false) {
  exchangeRequests.clear();document.dispatchEvent(new CustomEvent('ecoscan:wallet-reset'));
  points=0;deposits=0;savePoints();resetJourney();$('redeem-status').textContent='';$('wallet-receipt').textContent='Portefeuille fictif remis à zéro.';
  if(all) {
    connected=false;$('connect').textContent='Simuler la connexion à ECO-001';$('session-status').textContent='Aucune session active.';
    $('offline').checked=false;Object.keys(levels).forEach(key=>levels[key]=45);$('fill-level').value=45;$('item').value='mix';showItem();updateStation();
  }
}
$('reset').addEventListener('click',()=>resetDemo());$('restart-demo').addEventListener('click',()=>resetDemo(true));
// The app and concept catalogue request changes from this wallet; neither owns a balance.
document.addEventListener('ecoscan:state-request',renderPoints);
document.addEventListener('ecoscan:command',event=>{
  const command=event.detail?.command;
  if(command==='connect-station' && event.detail.stationId==='ECO-001' && !connected && !$('offline').checked)$('connect').click();
  else if(command==='end-session' && connected)$('connect').click();
  renderPoints();
});
document.addEventListener('ecoscan:exchange-request',event=>{
  const request=event.detail||{},id=request.id;
  if(typeof id!=='string'||!id||id.length>120)return;
  if(exchangeRequests.has(id)){
    document.dispatchEvent(new CustomEvent('ecoscan:exchange-result',{detail:{...exchangeRequests.get(id),points,duplicate:true}}));
    return;
  }
  const product=Object.prototype.hasOwnProperty.call(conceptProducts,request.productId)?conceptProducts[request.productId]:null;
  let result={id,productId:request.productId,ok:false,points};
  if(!product || request.cost!==product.cost)result.message='Concept ou montant non reconnu. Aucun point retiré.';
  else if(busy)result.message='Terminez le dépôt en cours avant de simuler un échange.';
  else if(points<product.cost)result.message=`Solde insuffisant : ${product.cost} points fictifs nécessaires. Aucun point retiré.`;
  else {
    points-=product.cost;savePoints();
    result={...result,ok:true,points,cost:product.cost,label:product.label,message:`Échange simulé : ${product.cost} points retirés pour ${product.label}. Aucun produit réservé ni commande créée.`};
  }
  exchangeRequests.set(id,result);
  document.dispatchEvent(new CustomEvent('ecoscan:exchange-result',{detail:result}));
});

$('redeem').addEventListener('click',()=>{
  if(points<20){$('redeem-status').textContent='Solde insuffisant : il faut 20 points fictifs. Aucun point retiré.';return;}
  points-=20;savePoints();$('redeem-status').textContent='Échange simulé : 20 points retirés du solde local. Aucun bon ni cadeau réel créé.';
});
$('item').value='mix';renderPoints();showItem();
const questions = [
  { q:'Quel réflexe préserve les ressources le plus en amont ?', a:['Réduire les achats et les déchets','Recycler chaque objet après usage','Remplacer plus souvent ses objets'], correct:0, explanation:'Réduire évite de mobiliser des ressources dès le départ. Le réemploi et la réparation viennent ensuite, avant le recyclage.' },
  { q:'Un gobelet qui ressemble à du papier va-t-il toujours dans le bac papier ?', a:['Oui, son apparence suffit','Non, il faut vérifier son revêtement et les consignes','Oui, s’il contient du café'], correct:1, explanation:'Certains gobelets sont composites. L’apparence ne suffit pas à déterminer la filière : consultez les consignes locales.' },
  { q:'Que prouvent les 65 % affichés par EcoScan ?', a:['Un résultat déjà mesuré à l’UNIL','Une garantie de performance','Un objectif du concept, encore non validé'], correct:2, explanation:'65 % est un objectif de réduction des erreurs de tri du PowerPoint. Il ne s’agit pas d’un résultat mesuré.' },
  { q:'Que fait réellement la démonstration de ce site ?', a:['Elle analyse votre caméra avec une IA','Elle simule un tri automatique selon votre sélection','Elle vérifie le contenu des poubelles du campus'], correct:1, explanation:'La sélection alimente un scénario : connexion, tri automatique et portefeuille sont simulés. La démo n’utilise ni caméra ni vraie IA et ne vérifie aucun dépôt.' },
  { q:'Quel geste aide à limiter le gaspillage à la cafétéria ?', a:['Prendre une portion adaptée et un contenant réutilisable','Trier uniquement le ticket de caisse','Prendre systématiquement des couverts jetables'], correct:0, explanation:'Adapter sa portion limite les restes ; utiliser un contenant réutilisable évite certains emballages à usage unique.' }
];
let questionIndex = 0, score = 0, answered = false;
function renderQuestion(focus = false) {
  answered = false; const question = questions[questionIndex];
  $('quiz-progress').textContent = `Question ${questionIndex + 1} / ${questions.length}`;
  $('question').textContent = question.q; $('answers').replaceChildren(); $('quiz-feedback').textContent = '';
  $('quiz-next').hidden = true; $('quiz-restart').hidden = true;
  question.a.forEach((text,index) => { const button = document.createElement('button'); button.className = 'answer'; button.textContent = text;
    button.addEventListener('click',() => {
      if(answered) return; answered = true; if(index === question.correct) score++;
      [...$('answers').children].forEach((b,i) => { b.disabled = true; if(i === question.correct) b.classList.add('correct'); else if(i === index) b.classList.add('wrong'); });
      $('quiz-feedback').textContent = (index === question.correct ? 'Bonne réponse. ' : 'À retenir : ') + question.explanation;
      $('quiz-next').textContent = questionIndex === questions.length - 1 ? 'Voir mon résultat →' : 'Question suivante →'; $('quiz-next').hidden = false;
    }); $('answers').append(button); });
  if(focus) $('question').focus();
}
$('quiz-next').addEventListener('click',() => {
  if(!answered) return;
  if(questionIndex < questions.length - 1) {questionIndex++; renderQuestion(true);} else {
    $('quiz-progress').textContent = 'Quiz terminé'; $('question').textContent = `${score} / ${questions.length} — chaque idée compte.`;
    $('answers').replaceChildren(); $('quiz-feedback').textContent = 'Gardez le réflexe : réduire, réemployer, réparer, puis recycler selon les consignes locales.';
    $('quiz-next').hidden = true; $('quiz-restart').hidden = false; $('question').focus();
  }
});
$('quiz-restart').addEventListener('click',() => {questionIndex = 0; score = 0; renderQuestion(true);}); renderQuestion();
document.querySelectorAll('.pledge').forEach(button => button.addEventListener('click',() => {
  const selected = button.getAttribute('aria-pressed') !== 'true'; button.setAttribute('aria-pressed',String(selected));
  const count = document.querySelectorAll('.pledge[aria-pressed="true"]').length;
  $('pledge-status').textContent = count ? `${count} geste${count>1?'s':''} choisi${count>1?'s':''} pour cette visite. Aucun engagement n’est transmis ni enregistré.` : 'Vous pouvez choisir un autre geste à essayer.';
}));
// Progressive, staggered entrance; content remains visible without JavaScript.
if('IntersectionObserver' in window && !reducedMotion()) {
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.08});
  document.querySelectorAll('.section>h2,.section>.lead,.section>.grid,.campus-art,.future-grid,.architecture-chain,.readiness-grid,.qr-poster,.feasibility-lab,.demo-intro,.video-frame').forEach(el=>{
    if(el.matches('.grid,.future-grid,.architecture-chain,.readiness-grid')) [...el.children].forEach((card,i)=>{card.classList.add('sequence-card');card.style.setProperty('--entrance-delay',`${Math.min(i,4)*85}ms`);});
    el.classList.add('reveal-ready');observer.observe(el);
  });
}

function updateStation() {
  const fill=levels[$('fill-bin').value],offline=$('offline').checked;
  $('fill-level').value=fill;$('fill-value').textContent=`${fill} %`;$('fill-meter').value=fill;$('fill-meter').textContent=`${fill} %`;
  for(const key of Object.keys(levels)){$('level-'+key).textContent=`${levels[key]} %`;$('meter-'+key).value=levels[key];}
  $('fill-status').textContent=fill>=100?'Simulation : bac plein. Ne pas déposer dans cette filière.':fill>=85?'Simulation : seuil de collecte atteint (85 % fictif).':fill>=70?'Simulation : niveau à surveiller.':'Simulation : capacité disponible. Le niveau ne prouve pas la qualité du tri.';
  $('offline-status').textContent=offline?'Mode hors ligne simulé : dépôt suspendu, aucun crédit transféré.':'Connexion simulée disponible : aucune liaison à une vraie station.';
  if(busy && (offline||isFull())){resetJourney();$('sort-feedback').textContent='Opération annulée avant validation : aucun EcoPoint crédité.';}
  updateAvailability();
}
$('fill-level').addEventListener('input',()=>{levels[$('fill-bin').value]=Number($('fill-level').value);updateStation();});
$('fill-bin').addEventListener('change',updateStation);$('offline').addEventListener('change',updateStation);updateStation();
const viewCaptions={exterior:'Extérieur : ouverture commune, affichage de session fictive et accès maintenance. Aucun équipement fabriqué.',cutaway:'Coupe du même modèle compact : habillage retiré pour expliquer les organes, trois bacs internes et contrôle isolé à l’arrière. Aucun équipement construit.',mechanism:'Même modèle compact : plaques latérales articulées, trappe centrale aluminium et volet de contrôle arrière. Le mouvement et le glissement restent à tester sur un banc.'};
document.querySelectorAll('[data-view]').forEach(button=>{if(button.tagName!=='BUTTON')return;button.addEventListener('click',()=>{
  document.querySelector('.machine-shell').dataset.view=button.dataset.view;
  document.querySelectorAll('button[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('blueprint-caption').textContent=viewCaptions[button.dataset.view];
  document.querySelector('.automatic-station').setAttribute('aria-label','ÉcoNova — '+viewCaptions[button.dataset.view]);
});});
const details={isolation:'Séparation : présenter les objets un par un sur un convoyeur envisagé. Un dépôt mélangé nécessite une séparation mécanique encore non démontrée.',sensor:'Caméra et éclairage internes : observer les objets, pas les passants. Une image seule ne certifie pas tous les matériaux ; capteurs et précision à valider.',routing:'Aiguillage motorisé envisagé : diriger une matière reconnue vers son bac ; isoler les inconnus pour contrôle plutôt que contaminer une filière.',maintenance:'Capteurs de remplissage envisagés et porte verrouillable réservée à la collecte. Nettoyage, sécurité et accès technique à prototyper.'};
document.querySelectorAll('[data-detail]').forEach(button=>button.addEventListener('click',()=>{$('blueprint-detail').textContent=details[button.dataset.detail];document.querySelectorAll('[data-detail]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
$('blueprint-play').addEventListener('click',()=>{
  document.querySelector('button[data-view="mechanism"]').click();
  document.querySelector('[data-video-time="50"]').click();
});

// Guided entry mirrors the same station state, never a second wallet.
function updateGuide() {
  const offline=$('offline').checked,full=isFull();
  $('guided-action').disabled=busy||offline||(connected&&!deposited&&full);
  $('guided-action').textContent=busy?'Traitement simulé en cours…':!connected?'1. Connecter la station de démo':deposited?'Essayer un nouveau dépôt':'2. Déposer l’objet sélectionné';
  $('guided-status').textContent=offline?'Réseau simulé coupé : rétablissez-le dans le tableau de bord.':busy?'La station simule l’analyse et le tri. Les points arrivent seulement après validation.':!connected?'Une connexion fictive suffit pour commencer ; aucun compte n’est créé.':full&&!deposited?'Un bac requis est plein. Ajustez son niveau dans le tableau de bord.':deposited?($('drop-zone').dataset.state==='rejected'?`Objet à contrôler : aucun crédit. Solde local : ${points} EcoPoints fictifs.`:`Dépôt simulé validé. Votre portefeuille contient ${points} EcoPoints fictifs. Vous pouvez essayer un autre objet ou simuler un échange.`):'Sélectionnez un objet ou conservez le mélange proposé. Vous n’avez aucun bac à choisir.';
}
$('guided-action').addEventListener('click',()=>{
  if(busy||$('offline').checked)return;
  if(!connected){$('connect').click();$('item').focus({preventScroll:true});$('item').scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'center'});}
  else if(deposited){resetJourney();$('item').focus();}
  else {startDeposit();$('drop-zone').scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'center'});}
});
const stationFromURL=new URLSearchParams(location.search).get('station');
if(stationFromURL){$('qr-arrival').textContent=stationFromURL==='ECO-001'?'QR reconnu : station fictive ECO-001. Confirmez la connexion pour lancer la démo.':'Identifiant de station inconnu. Aucun appareil connecté ; utilisez la démo ECO-001.';}
function updateCapacity() {
  const arrival=Number($('arrival-rate').value),cycle=Number($('cycle-time').value),available=Number($('availability').value),capacity=60/cycle*available/100;
  $('arrival-value').textContent=`${arrival} objets/min`;$('cycle-value').textContent=`${cycle} s/objet`;$('availability-value').textContent=`${available} %`;
  $('capacity-value').textContent=capacity.toLocaleString('fr-CH',{maximumFractionDigits:1});
  $('capacity-status').textContent=arrival>capacity?`Dans ce scénario fictif, ${arrival} objets/min dépasse la capacité calculée. Une file pourrait se former ; au moins ${Math.ceil(arrival/capacity)} stations seraient nécessaires dans ce modèle simplifié, avant prise en compte des pics et contraintes réelles.`:`Dans ce scénario fictif, le flux moyen reste sous la capacité calculée. Cela ne garantit pas l’absence de file : variabilité, maintenance et mélanges ne sont pas modélisés.`;
}
['arrival-rate','cycle-time','availability'].forEach(id=>$(id).addEventListener('input',updateCapacity));updateCapacity();updateGuide();

// Manual video playback and chapter seeking; never auto-play on scroll.
const explainer=$('explainer-video');
let filmRequested=false;
explainer.addEventListener('play',()=>{filmRequested=true;});
let pendingVideoTime=null;
function seekChapter() {
  if(pendingVideoTime===null || explainer.readyState<1 || !Number.isFinite(explainer.duration))return;
  const target=Math.min(pendingVideoTime,Math.max(0,explainer.duration-.1));
  const canSeek=Array.from({length:explainer.seekable.length},(_,i)=>[explainer.seekable.start(i),explainer.seekable.end(i)]).some(([start,end])=>target>=start && target<=end);
  if(!canSeek){explainer.preload='auto';return;}
  explainer.currentTime=target;pendingVideoTime=null;
  $('video-status').textContent='Chapitre sélectionné. Appuyez sur lecture pour regarder le film.';
}
['loadedmetadata','loadeddata','progress','canplay','durationchange'].forEach(event=>explainer.addEventListener(event,seekChapter));
document.querySelectorAll('[data-video-time]').forEach(button=>button.addEventListener('click',()=>{
  filmRequested=true;
  pendingVideoTime=Number(button.dataset.videoTime);
  document.querySelectorAll('[data-video-time]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('video-status').textContent='Chargement du chapitre…';
  document.querySelector('.video-frame').scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});
  if(explainer.readyState<1){explainer.preload='auto';explainer.load();}else seekChapter();
}));
explainer.addEventListener('error',()=>{$('video-status').textContent='La lecture est indisponible. Téléchargez la vidéo ou consultez la transcription.';});
// Change the narration while preserving the position and the visitor's playback choice.
const filmLanguages={
  en:{source:'econova-film-v2-en.mp4',label:'Voix anglaise · sous-titres français.',tracks:[{source:'econova-film-v2-en-fr.vtt',language:'fr',label:'Français — traduction',kind:'subtitles'},{source:'econova-film-v2-en.vtt',language:'en',label:'English',kind:'captions'}]},
  fr:{source:'econova-film-v2.mp4',label:'Voix française · sous-titres français.',tracks:[{source:'econova-film-v2-fr.vtt',language:'fr',label:'Français',kind:'captions'}]}
};
let filmLanguage='en',resumeAfterLanguageChange=false;
function resumeSelectedFilm() {
  if(!resumeAfterLanguageChange||pendingVideoTime!==null||explainer.readyState<2||explainer.closest('section').hidden)return;
  resumeAfterLanguageChange=false;
  explainer.play().catch(()=>{$('video-status').textContent='Narration changée. Appuyez sur lecture pour continuer.';});
}
['canplay','seeked'].forEach(event=>explainer.addEventListener(event,resumeSelectedFilm));
document.addEventListener('ecoscan:viewchange',event=>{if(event.detail.group!=='discover')resumeAfterLanguageChange=false;});
document.querySelectorAll('[data-film-language]').forEach(button=>button.addEventListener('click',()=>{
  const language=button.dataset.filmLanguage,film=filmLanguages[language];
  if(!film||language===filmLanguage)return;
  const time=pendingVideoTime??(Number.isFinite(explainer.currentTime)?explainer.currentTime:0);
  const started=filmRequested||explainer.preload!=='none'||!explainer.paused||time>0;
  const showSubtitles=[...explainer.textTracks].some(track=>track.mode==='showing');
  resumeAfterLanguageChange=!explainer.paused;
  explainer.pause();filmLanguage=language;
  explainer.querySelector('source').src='./assets/'+film.source+'?v=journeys-20261012';
  explainer.querySelectorAll('track').forEach(track=>track.remove());
  film.tracks.forEach((settings,index)=>{
    const track=document.createElement('track');track.src='./assets/'+settings.source+'?v=journeys-20261012';
    track.kind=settings.kind;track.srclang=settings.language;track.label=settings.label;track.default=index===0&&showSubtitles;explainer.append(track);
  });
  pendingVideoTime=started?time:null;explainer.preload=started?'auto':'none';explainer.load();
  document.querySelectorAll('[data-film-language]').forEach(candidate=>candidate.setAttribute('aria-pressed',String(candidate===button)));
  $('film-language-status').textContent=film.label+' La position dans le film est conservée.';
  $('film-download').href='./assets/'+film.source+'?v=journeys-20261012';$('film-fallback-download').href=$('film-download').href;$('film-download').download='Econova-film-concept-'+language+'.mp4';
  explainer.setAttribute('aria-label','Film de concept ÉcoNova : '+(language==='en'?'narration anglaise et sous-titres français':'narration française'));
  if(!started)$('video-status').textContent='Narration sélectionnée. Appuyez sur lecture pour regarder le film.';
}));

let scrollScheduled=false;
function updateReadingProgress() {
  scrollScheduled=false;
  const total=document.documentElement.scrollHeight-innerHeight;
  $('reading-progress').style.transform=`scaleX(${total>0?Math.min(1,Math.max(0,scrollY/total)):0})`;
}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateReadingProgress);}},{passive:true});
addEventListener('resize',updateReadingProgress);updateReadingProgress();

// Active chapter follows both chapter buttons and the native playback controls.
function updateActiveChapter() {
  if(pendingVideoTime!==null)return;
  const buttons=[...document.querySelectorAll('[data-video-time]')];
  let active=buttons[0];
  buttons.forEach(button=>{if(Number(button.dataset.videoTime)<=explainer.currentTime+.05)active=button;});
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button===active)));
}
['timeupdate','seeked','loadedmetadata'].forEach(event=>explainer.addEventListener(event,updateActiveChapter));
