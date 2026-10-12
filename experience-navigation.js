'use strict';
// Five reading paths in one static document. Existing anchors remain the URLs.
(() => {
  const main=document.querySelector('main');
  if(!main)return;
  const definitions={
    discover:{label:'Découvrir ÉcoNova',summary:'Le concept, le film et les plaques qui guideraient chaque objet.',sections:['accueil','promesse','concept','video-explicative','station','architecture','fonctionnement','technologies'],links:[['station','La station'],['video-explicative','Le film'],['architecture','Sous la coque'],['fonctionnement','Le parcours']]},
    try:{label:'Essayer EcoScan',summary:'Testez une session, le tri et les points fictifs, sans créer de compte.',sections:['demo','qr-session','app','boutique','quiz'],links:[['guided-action','Démarrer la démo'],['qr-session','QR et connexion'],['app','L’app envisagée'],['boutique','La boutique']]},
    build:{label:'Construire le projet',summary:'Du premier banc de test aux preuves nécessaires avant un pilote.',sections:['faisabilite','mise-en-place','laboratoire','recherche','exploitation','engagements','preuves','feuille-de-route'],links:[['faisabilite','Faisabilité'],['mise-en-place','Premier prototype'],['laboratoire','Protocoles'],['exploitation','Collecte et entretien']]},
    mission:{label:'Une mission écologique',summary:'Réduire, réemployer et apprendre sur le terrain avant de promettre un impact.',sections:['planete','enjeux','gestes','mission','vision-monde','campus','campus-pilote','impact','objectifs-mondiaux','participer'],links:[['mission','La mission'],['gestes','Les écogestes'],['campus-pilote','Un pilote proposé'],['objectifs-mondiaux','Objectifs mondiaux']]},
    resources:{label:'Les ressources du projet',summary:'Retrouvez les réponses, les documents et les sources du concept.',sections:['ressources','faq','sources'],links:[['ressources','Les documents'],['faq','Questions fréquentes'],['sources','Les sources']]}
  };
  const sections=[...main.querySelectorAll(':scope > section')];
  sections.forEach(section=>{
    if(definitions[section.dataset.viewGroup])return;
    const found=Object.keys(definitions).find(group=>definitions[group].sections.includes(section.id));
    section.dataset.viewGroup=found||'resources';
  });
  const navigation=[...document.querySelectorAll('[data-nav-group]')];
  const guide=document.getElementById('workspace-guide');
  const back=document.getElementById('back-top');
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active='discover',lastURL='',transitionTimer;
  function targetFor(hash) {
    if(!hash||hash==='#')return null;
    try{return document.getElementById(decodeURIComponent(hash.slice(1)));}catch{return null;}
  }
  function groupFor(target) {
    const section=target?.closest('main > section');
    return section&&definitions[section.dataset.viewGroup]?section.dataset.viewGroup:null;
  }
  function updateBack() {
    if(!back)return;
    const first=sections.find(section=>section.dataset.viewGroup===active);
    if(first)back.href='#'+first.id;
    back.hidden=scrollY<Math.max(700,innerHeight*.8);
  }
  function updateGuide() {
    if(!guide)return;
    guide.hidden=active==='discover'&&['','#','#accueil'].includes(location.hash);
    const title=document.getElementById('workspace-title'),summary=document.getElementById('workspace-summary'),shortcuts=document.getElementById('workspace-shortcuts');
    if(title)title.textContent=definitions[active].label;
    if(summary)summary.textContent=definitions[active].summary;
    if(shortcuts){
      shortcuts.replaceChildren();
      definitions[active].links.forEach(([id,label])=>{
        if(!document.getElementById(id))return;
        const link=document.createElement('a');link.href='#'+id;link.textContent=label;shortcuts.append(link);
      });
    }
  }
  function focusTarget(target) {
    const destination=target.matches('section')?target.querySelector('h1,h2')||target:target;
    if(!destination.hasAttribute('tabindex')&&!destination.matches('a[href],button,input,select,textarea'))destination.tabIndex=-1;
    destination.focus({preventScroll:true});
  }
  function moveTo(target,{focus=false,smooth=false}={}) {
    if(!target)return;
    target.scrollIntoView({behavior:smooth&&!reduced()?'smooth':'auto',block:'start'});
    if(focus)focusTarget(target);
  }
  function activate(group,target,{focus=false,smooth=false,initial=false,showGuide=false}={}) {
    const previous=active,changed=group!==active;
    active=group;
    // Hide only via JavaScript: every section remains available without it.
    sections.forEach(section=>{
      const visible=section.dataset.viewGroup===active;
      if(!visible)section.querySelectorAll('video').forEach(video=>video.pause());
      section.hidden=!visible;
    });
    document.body.dataset.activeView=active;main.dataset.activeView=active;
    navigation.forEach(link=>{
      const current=link.dataset.navGroup===active;
      link.classList.toggle('current-section',current);
      if(current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    updateGuide();
    clearTimeout(transitionTimer);main.classList.remove('workspace-transition');
    if(changed&&!initial&&!reduced()){
      void main.offsetWidth;main.classList.add('workspace-transition');
      transitionTimer=setTimeout(()=>main.classList.remove('workspace-transition'),200);
    }
    const scrollTarget=showGuide&&guide&&!guide.hidden?guide:target;
    moveTo(scrollTarget,{smooth:smooth&&!changed});
    if(focus&&target)focusTarget(target);
    updateBack();
    document.dispatchEvent(new CustomEvent('ecoscan:viewchange',{detail:{group:active,previous,targetId:target?.id||null}}));
    // The existing reading-progress widget recalculates against the visible path.
    dispatchEvent(new Event('resize'));
  }
  function syncFromURL(initial=false) {
    if(!initial&&lastURL===location.href)return;
    lastURL=location.href;
    const target=targetFor(location.hash),group=groupFor(target)||active;
    activate(group,target,{initial});
    // Browser fragment/restoration handling can run after popstate. Reconcile once.
    const expectedURL=location.href;
    if(target)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(location.href===expectedURL)moveTo(target);}));
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
    const link=event.target.closest('a[href]');
    if(!link||link.hasAttribute('download')||link.target==='_blank')return;
    const hash=link.getAttribute('href');
    if(!hash?.startsWith('#'))return;
    const target=targetFor(hash);
    if(!target)return;
    const group=groupFor(target);
    if(!group&&target!==main)return;
    event.preventDefault();
    if(location.hash!==hash)history.pushState(history.state,'',hash);
    lastURL=location.href;
    activate(group||active,target,{focus:true,smooth:true,showGuide:link.matches('#navigation [data-nav-group]')});
  });
  addEventListener('hashchange',()=>syncFromURL());
  addEventListener('popstate',()=>syncFromURL());
  addEventListener('scroll',updateBack,{passive:true});
  addEventListener('resize',updateBack);
  syncFromURL(true);
})();
