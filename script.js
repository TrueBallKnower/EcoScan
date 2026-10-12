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
let connected = false, deposited = false, points = 0;
try { const saved = Number(localStorage.getItem('ecoscan-demo-points')); if(Number.isSafeInteger(saved) && saved >= 0 && saved <= 1000000) points = saved; }
catch { $('storage-status').textContent = 'Stockage indisponible : les points restent disponibles pendant cette visite.'; }
function renderPoints() { $('points').textContent = points; }
function savePoints() {
  try { localStorage.setItem('ecoscan-demo-points',String(points)); }
  catch { $('storage-status').textContent = 'Stockage indisponible : les points ne seront pas conservés après cette visite.'; }
  renderPoints();
}
function updateAvailability() {
  const offline = $('offline').checked, full = Number($('fill-level').value) >= 100;
  $('scan').disabled = !connected || deposited || offline || full;
  $('connect').disabled = offline && !connected;
  $('scan-status').textContent = deposited ? 'Dépôt simulé traité. Préparez un nouveau dépôt pour continuer.' : offline ? 'Connexion indisponible dans la simulation : dépôt et transfert de points suspendus.' : full ? 'Compartiment cible plein : dépôt suspendu. Un passage de collecte serait nécessaire.' : connected ? 'Session active : déposez votre objet dans l’ouverture unique. Le tri et les points sont automatiques dans cette démo.' : 'Connectez d’abord le téléphone de démonstration.';
}
function resetJourney() {
  deposited = false; $('sort-feedback').textContent = ''; $('earn-feedback').textContent = '';
  document.querySelectorAll('[data-route]').forEach(el => el.classList.remove('routed'));
  $('step-scan').classList.toggle('active',connected); $('step-sort').classList.remove('active'); $('step-earn').classList.remove('active');
  updateAvailability();
}
function showItem() {
  resetJourney();
  const [title, symbol, advice, reduce] = items[$('item').value];
  $('item-title').textContent = title; $('item-symbol').textContent = symbol;
  $('advice').replaceChildren();
  for (const [label, text] of [['Matière et limites du scénario',advice],['Éviter le prochain déchet',reduce]]) {
    const p = document.createElement('p'), strong = document.createElement('strong');
    strong.textContent = label + ' : '; p.append(strong,document.createTextNode(text)); $('advice').append(p);
  }
}
$('connect').addEventListener('click', () => {
  if($('offline').checked && !connected) return;
  connected = !connected;
  $('connect').textContent = connected ? 'Terminer la session simulée' : 'Simuler la connexion à ECO-001';
  $('session-status').textContent = connected ? 'Session fictive active · ÉcoNova ECO-001. Aucun téléphone réel n’est connecté.' : 'Session terminée. Le prochain dépôt nécessite une nouvelle connexion simulée.';
  resetJourney();
});
$('scan').addEventListener('click', () => {
  if(!connected || deposited || $('offline').checked || Number($('fill-level').value) >= 100) return;
  deposited = true;
  const value = $('item').value, uncertain = ['cup','food'].includes(value), route = uncertain ? 'check' : value;
  const routes = value === 'mix' ? ['pet','can','paper'] : [route];
  routes.forEach(destination => document.querySelector(`[data-route="${destination}"]`).classList.add('routed'));
  $('step-sort').classList.add('active');
  $('sort-feedback').textContent = value === 'mix' ? 'Dépôt mélangé simulé : trois objets séparés puis automatiquement orientés vers PET, aluminium et papier. Le mécanisme de séparation n’est pas réel dans cette démo.' : uncertain ? 'Analyse simulée incertaine : objet orienté vers un contrôle dédié, isolé des filières recyclables. Aucun point crédité. La gestion physique de ce cas reste à prototyper.' : `Tri simulé : ${items[value][0]} orienté automatiquement vers le compartiment interne ${value === 'pet' ? 'PET' : value === 'can' ? 'aluminium' : 'papier'}. Vous n’avez pas choisi de bac.`;
  if(!uncertain) {
    const awarded = Math.min(value === 'mix' ? 30 : 10,1000000-points); points += awarded; savePoints();
    $('step-earn').classList.add('active');
    $('wallet-receipt').textContent = `+${awarded} EcoPoints fictifs reçus automatiquement pour ce dépôt simulé.`;
    $('earn-feedback').textContent = 'Crédit local effectué une seule fois. Ce reçu ne prouve aucun tri réel ni transfert vers une application.';
  } else { $('wallet-receipt').textContent = 'Dépôt incertain : aucun EcoPoint ajouté.'; }
  updateAvailability();
});
$('new-item').addEventListener('click', () => {resetJourney(); $('item').focus();});
$('item').addEventListener('change',showItem);
$('reset').addEventListener('click', () => {
  points = 0; savePoints(); resetJourney(); $('redeem-status').textContent = '';
  $('wallet-receipt').textContent = 'Portefeuille fictif remis à zéro.';
});
$('redeem').addEventListener('click', () => {
  if(points < 20) { $('redeem-status').textContent = 'Solde insuffisant : il faut 20 points fictifs. Aucun point n’a été retiré.'; return; }
  points -= 20; savePoints();
  $('redeem-status').textContent = 'Échange simulé : 20 points retirés du solde local. Aucun cadeau, code, avantage ou bon réel n’a été créé.';
});
$('item').value = 'mix';
renderPoints(); showItem();
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
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.section>h2,.section>.grid,.campus-art').forEach(el => {el.classList.add('reveal-ready');observer.observe(el);});
}

function updateStation() {
  const fill = Number($('fill-level').value), offline = $('offline').checked;
  $('fill-value').textContent = `${fill} %`; $('fill-meter').value = fill;
  $('fill-meter').textContent = `${fill} %`;
  $('fill-status').textContent = fill >= 100 ? 'Simulation : bac plein. Orienter vers un autre point de collecte autorisé et prévenir l’équipe ; ne pas laisser de déchets au sol.' : fill >= 85 ? 'Simulation : seuil de collecte atteint (85 % choisi pour cette démo). Une intervention serait à planifier ; aucune alerte réelle n’est envoyée.' : fill >= 70 ? 'Simulation : niveau à surveiller. Anticiper la tournée selon les contraintes du lieu.' : 'Simulation : capacité disponible. Le niveau ne renseigne pas sur la qualité du tri.';
  $('offline-status').textContent = offline ? 'Mode hors ligne simulé : le dépôt de cette démo est suspendu et aucun point n’est transféré. Un vrai tri local avec synchronisation différée reste à concevoir.' : 'Connexion simulée disponible : la session et le crédit fictif peuvent reprendre. Aucune connexion réelle à une station.';
  updateAvailability();
}
$('fill-level').addEventListener('input',updateStation); $('offline').addEventListener('change',updateStation); updateStation();
