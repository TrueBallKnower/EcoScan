'use strict';
// Local drafting aid: suggested test protocols, not hardware certification.
const protocols = {
  sorting: {
    title:'Reconnaissance et routage : séparer la prédiction de la preuve',
    summary:'Commencer avec des bouteilles PET de boisson et canettes connues, propres puis représentatives des usages réels. Définir séparément la catégorie annoncée, le bac visé et le bac effectivement atteint.',
    steps:[
      'Photographier et identifier les objets de test, leur état et la filière attendue avant l’essai. Conserver aussi des inconnus et des objets composites.',
      'Présenter chaque objet dans les mêmes conditions, puis varier orientation et éclairage selon un protocole documenté.',
      'Noter séparément la prédiction, le refus, l’action du mécanisme et l’arrivée vérifiée dans le bac. Une prédiction correcte ne suffit pas.',
      'Distinguer fausse acceptation, mauvais routage, refus prudent, blocage et test non exécuté. Conserver les échecs pour comprendre leurs causes.',
      'Tester de nouveaux objets jamais utilisés pour régler le système. Comparer les résultats au périmètre et aux critères fixés avant le test.'
    ],
    limit:'Limite : un essai sur quelques objets connus ne prouve ni la composition de tous les emballages ni la fiabilité d’une station publique.'
  },
  flow: {
    title:'Mélanges et blocages : la mécanique avant la cadence',
    summary:'Vérifier que l’entrée commune peut présenter les objets un par un. Le travail sur un mélange reste indépendant de la rapidité du modèle de reconnaissance.',
    steps:[
      'Définir les formats acceptés et les cas exclus : sacs fermés, liquides, objets dangereux ou imbriqués non traitables.',
      'Tester d’abord un objet à la fois dans un banc sécurisé, puis des mélanges contrôlés et identifiés.',
      'Noter double présentation, chevauchement, bourrage et trajet vers le contrôle. Vérifier qu’une erreur ne contamine pas une autre filière.',
      'Déclencher les scénarios de panne prévus : interruption, moteur indisponible, bac plein, ouverture technique. Vérifier la mise en sécurité avant toute reprise.',
      'Mesurer le cycle complet et les interventions nécessaires, pas seulement l’inférence. Documenter l’effet du nettoyage et de l’usure.'
    ],
    limit:'Limite : ce protocole est un plan de discussion. Des pièces mobiles nécessitent un banc fermé et une conception de sécurité adaptée par des personnes compétentes.'
  },
  session: {
    title:'QR, session et points : empêcher le crédit sans dépôt',
    summary:'Le QR fixe identifie une station ; il peut être copié. Un portefeuille futur doit relier une confirmation physique à une session et à un événement unique.',
    steps:[
      'Vérifier l’adresse, l’identifiant de station et la confirmation de session. Distinguer ouverture d’une URL et authentification.',
      'Tester QR copié à distance, session expirée, utilisateur suivant et perte de connexion. Ne pas créditer sur un simple clic ou une image.',
      'Réémettre le même événement de dépôt : un seul crédit doit être accepté. Documenter l’état avant et après la reprise réseau.',
      'Simuler annulation, arrêt du mécanisme et routage inconnu. Chaque cas non confirmé doit conserver un solde inchangé.',
      'Définir clôture, consentement, données minimales, rétention et accès. Vérifier que les journaux ne publient pas des données personnelles.'
    ],
    limit:'Limite : le site démontre seulement un solde local fictif. Il ne fournit ni authentification matérielle, ni serveur de portefeuille, ni résistance à la fraude d’une vraie app.'
  },
  impact: {
    title:'Utilité et ressources : accepter une comparaison défavorable',
    summary:'Évaluer si la solution facilite les gestes et conserve mieux les matières, en tenant compte des ressources nécessaires pour la fabriquer et l’exploiter.',
    steps:[
      'Observer une situation initiale avec les responsables des filières : objets mal orientés, refus et déchets évités doivent être distingués.',
      'Comparer, dans des conditions documentées, signalétique simple, campagne pédagogique et dispositif proposé. Expliquer les différences de contexte.',
      'Recueillir les difficultés d’usage, y compris sans téléphone, les besoins d’accessibilité et les contraintes de l’équipe de collecte.',
      'Recenser énergie, consommables, nettoyage, réparation, pièces et durée de vie. Ne pas transformer les points en CO₂ économisé sans méthode.',
      'Fixer avant l’essai les raisons de continuer, de corriger ou d’arrêter. Publier les échecs, les données manquantes et les limites de l’échantillon.'
    ],
    limit:'Limite : aucune économie d’impact ni réduction mesurée n’est déduite de ce questionnaire. Une analyse adaptée et des mesures de terrain seraient nécessaires.'
  }
};
let activeProtocol='sorting';
function displayProtocol(key) {
  if(!Object.hasOwn(protocols,key))return;
  activeProtocol=key;
  const protocol=protocols[key];
  document.getElementById('protocol-title').textContent=protocol.title;
  document.getElementById('protocol-summary').textContent=protocol.summary;
  const list=document.getElementById('protocol-steps');list.replaceChildren();
  protocol.steps.forEach(step=>{const li=document.createElement('li');li.textContent=step;list.append(li);});
  document.getElementById('protocol-limit').textContent=protocol.limit;
  document.getElementById('protocol-status').textContent='';
  document.querySelectorAll('[data-protocol]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.protocol===key)));
}
document.querySelectorAll('[data-protocol]').forEach(button=>button.addEventListener('click',()=>displayProtocol(button.dataset.protocol)));
document.getElementById('download-protocol').addEventListener('click',()=>{
  const protocol=protocols[activeProtocol];
  const content='# EcoScan / ÉcoNova — protocole proposé\n\n'+protocol.title+'\n\n'+protocol.summary+'\n\n'+protocol.steps.map((step,index)=>`${index+1}. ${step}`).join('\n\n')+'\n\n'+protocol.limit+'\n\nDocument de concept — aucun essai réalisé ni matériel certifié.\n';
  const url=URL.createObjectURL(new Blob([content],{type:'text/markdown;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`EcoScan-protocole-${activeProtocol}.md`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.getElementById('protocol-status').textContent='Protocole de discussion téléchargé. Aucun test de matériel n’a été exécuté.';
});
displayProtocol(activeProtocol);
// Source of truth remains the existing simulation state; this file adds no wallet.

// Compact feedback uses the existing wallet events: no extra counter or points rule.
function showInlineReceipt(detail) {
  const receipt=document.getElementById('demo-result');
  if(!receipt)return;
  const complete=['confirmed','rejected'].includes(detail.phase);
  receipt.hidden=!complete;
  if(!complete)return;
  document.getElementById('demo-result-title').textContent=detail.phase==='rejected'?'Contrôle requis · aucun point ajouté':`Dépôt validé · +${detail.earned} EcoPoints fictifs`;
  document.getElementById('demo-result-detail').textContent=`Solde local : ${detail.points} points fictifs. Aucun tri réel ni transfert vers une app.`;
  receipt.dataset.result=detail.phase;
}
document.addEventListener('ecoscan:wallet',event=>showInlineReceipt(event.detail));
document.addEventListener('ecoscan:phase',event=>{
  const preview=document.getElementById('mechanism-preview');
  if(!preview)return;
  preview.dataset.mechanismPhase=event.detail.phase;
  if(event.detail.route){
    preview.dataset.mechanismRoute=event.detail.route;
    // Restart the object only after each new plate command, including mixed input.
    const object=preview.querySelector('.preview-object');
    object.style.animation='none';void object.offsetWidth;object.style.animation='';
  }
  if(!['confirmed','rejected'].includes(event.detail.phase))document.getElementById('demo-result').hidden=true;
  if(['ready','disconnected','blocked-full','blocked-offline'].includes(event.detail.phase))preview.dataset.mechanismRoute='neutral';
});
const navTargets=[...document.querySelectorAll('#navigation a[href^="#"]')].map(link=>({link,target:document.querySelector(link.getAttribute('href'))})).filter(item=>item.target);
let navigationScheduled=false;
function updateNavigation() {
  navigationScheduled=false;
  let active=null,nearest=-Infinity;
  navTargets.forEach(item=>{const top=item.target.getBoundingClientRect().top;if(top<=140&&top>nearest){active=item;nearest=top;}});
  navTargets.forEach(item=>{item.link.classList.toggle('current-section',item===active);if(item===active)item.link.setAttribute('aria-current','location');else item.link.removeAttribute('aria-current');});
  const back=document.getElementById('back-top');if(back)back.hidden=scrollY<1200;
}
addEventListener('scroll',()=>{if(!navigationScheduled){navigationScheduled=true;requestAnimationFrame(updateNavigation);}},{passive:true});
addEventListener('resize',updateNavigation);updateNavigation();
