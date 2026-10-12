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
  pet: ['Bouteille PET', '♲', 'Les bouteilles de boisson en PET peuvent être collectées dans une filière dédiée. Tous les plastiques ne vont pas dans ce bac : vérifiez la signalétique locale et videz la bouteille.', 'Emportez une gourde et utilisez un point d’eau adapté.'],
  can: ['Canette', '◉', 'Une canette de boisson vide peut rejoindre une collecte de l’aluminium si elle est acceptée sur place. Suivez les consignes du bac ; ne présumez pas que tous les emballages métallisés sont de l’aluminium.', 'Choisissez un contenant réutilisable lorsque c’est possible.'],
  paper: ['Papier', '▤', 'Le papier propre et sec peut être orienté vers la collecte du papier selon les règles locales. Papier souillé, mouchoirs et revêtements spéciaux ne se traitent pas nécessairement de la même manière.', 'Lisez à l’écran, imprimez recto verso si nécessaire et réutilisez les versos libres.'],
  cup: ['Gobelet de café', '☕', 'Un gobelet peut comporter un revêtement qui empêche son recyclage avec le papier. Ne vous fiez pas seulement à son apparence : consultez les consignes du lieu et séparez le couvercle si demandé.', 'Apportez une tasse réutilisable et demandez si elle peut être remplie.'],
  food: ['Emballage alimentaire', '▱', 'Les emballages alimentaires sont très variables : plastique, carton, aluminium ou couches composites. Videz les restes et vérifiez les matériaux et les filières acceptées ; en cas de doute, demandez au responsable du point de collecte.', 'Utilisez une boîte réutilisable et adaptez les portions pour limiter les restes.']
};
function showItem() {
  const [title, symbol, advice, reduce] = items[$('item').value];
  $('item-title').textContent = title; $('item-symbol').textContent = symbol;
  $('advice').replaceChildren();
  for (const [label, text] of [['Conseil de tri général',advice],['Éviter le prochain déchet',reduce]]) {
    const p = document.createElement('p'), strong = document.createElement('strong');
    strong.textContent = label + ' : '; p.append(strong,document.createTextNode(text)); $('advice').append(p);
  }
  $('earn-feedback').textContent = '';
}
$('item').addEventListener('change',showItem); showItem();
let points = 0;
try { const saved = Number(localStorage.getItem('ecoscan-demo-points')); if(Number.isSafeInteger(saved) && saved >= 0 && saved <= 1000000) points = saved; }
catch { $('storage-status').textContent = 'Stockage indisponible : les points restent disponibles pendant cette visite.'; }
function renderPoints() { $('points').textContent = points; }
function savePoints() { try {localStorage.setItem('ecoscan-demo-points',String(points));} catch { $('storage-status').textContent = 'Stockage indisponible : les points ne seront pas conservés après cette visite.'; } renderPoints(); }
renderPoints();
$('earn').addEventListener('click', () => { points = Math.min(points + 10,1000000); savePoints(); $('earn-feedback').textContent = '10 points fictifs ajoutés. Aucun tri réel n’a été vérifié.'; });
$('reset').addEventListener('click', () => { points = 0; savePoints(); $('earn-feedback').textContent = 'Votre compteur de démonstration est remis à zéro.'; });
const questions = [
  { q:'Quel réflexe préserve les ressources le plus en amont ?', a:['Réduire les achats et les déchets','Recycler chaque objet après usage','Remplacer plus souvent ses objets'], correct:0, explanation:'Réduire évite de mobiliser des ressources dès le départ. Le réemploi et la réparation viennent ensuite, avant le recyclage.' },
  { q:'Un gobelet qui ressemble à du papier va-t-il toujours dans le bac papier ?', a:['Oui, son apparence suffit','Non, il faut vérifier son revêtement et les consignes','Oui, s’il contient du café'], correct:1, explanation:'Certains gobelets sont composites. L’apparence ne suffit pas à déterminer la filière : consultez les consignes locales.' },
  { q:'Que prouvent les 65 % affichés par EcoScan ?', a:['Un résultat déjà mesuré à l’UNIL','Une garantie de performance','Un objectif du concept, encore non validé'], correct:2, explanation:'65 % est un objectif de réduction des erreurs de tri du PowerPoint. Il ne s’agit pas d’un résultat mesuré.' },
  { q:'Que fait réellement la démonstration de ce site ?', a:['Elle analyse votre caméra avec une IA','Elle affiche des conseils selon votre sélection','Elle vérifie le contenu des poubelles du campus'], correct:1, explanation:'La démo répond à une sélection manuelle. Elle n’utilise ni caméra ni reconnaissance IA et ne vérifie aucun dépôt.' },
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
