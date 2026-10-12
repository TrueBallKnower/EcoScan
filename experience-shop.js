/* EcoScan app and circular catalogue. All currency mutations belong to script.js. */
(() => {
  'use strict';
  const app = document.getElementById('app');
  const shop = document.getElementById('boutique');
  if (!app || !shop) return;

  const products = Object.freeze({
    'repair-pouch': { label: 'Pochette seconde vie', cost: 20, category: 'reuse', material: 'Chutes textiles et fermeture remplaçable : une piste à sourcer.', use: 'Ranger un câble, des écouteurs ou de petits objets déjà possédés.', care: 'Une couture accessible, une fermeture démontable et une réparation simple seraient prioritaires.', validation: 'À vérifier avant toute fabrication : origine et composition du tissu, solidité, lavage, durée de vie et atelier de confection.' },
    'loop-notebook': { label: 'Carnet Loop', cost: 30, category: 'daily', material: 'Papier recyclé et couverture de réemploi : matières à vérifier.', use: 'Prendre des notes, réparer une idée, garder les pages utiles.', care: 'Une reliure démontable permettrait de remplacer les pages plutôt que le carnet entier.', validation: 'À vérifier : part recyclée, origine des fibres, encres, recyclabilité de la couverture et besoin réel face aux carnets déjà disponibles.' },
    'carry-bag': { label: 'Sac ReCycle', cost: 40, category: 'reuse', material: 'Textile de récupération : aucun pourcentage ni fournisseur validé.', use: 'Transporter ce que vous avez déjà, avec un sac utilisé longtemps.', care: 'Anses renforcées et panneaux cousus permettraient des réparations locales.', validation: 'À vérifier : traçabilité du textile, nettoyage, résistance, réparabilité et usage assez durable pour justifier sa fabrication.' }
  });
  const productFilters = new Set(['all', 'reuse', 'daily']);
  let state = { points: initialPoints(), connected: false, busy: false, offline: false, phase: 'disconnected', earned: 0 };
  let selectedProduct = null;
  let pendingExchange = null;
  let offerCompleted = false;
  let requestSerial = 0;
  let activeFilter = 'all';
  let recentExchange = '';
  const dialog = document.getElementById('eco-shop-dialog');
  const confirmButton = document.getElementById('eco-shop-confirm');
  const put = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };

  function initialPoints() {
    const value = Number(document.getElementById('points')?.textContent);
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  }

  function updateState(detail = {}) {
    if (Number.isSafeInteger(detail.points) && detail.points >= 0) state.points = detail.points;
    for (const key of ['connected', 'busy', 'offline']) if (typeof detail[key] === 'boolean') state[key] = detail[key];
    if (typeof detail.phase === 'string') {
      state.phase = detail.phase;
      if (typeof detail.busy !== 'boolean') state.busy = ['detecting', 'scanning', 'routing'].includes(detail.phase);
      if (typeof detail.connected !== 'boolean') {
        if (detail.phase === 'disconnected') state.connected = false;
        else if (detail.phase !== 'blocked-offline') state.connected = true;
      }
      if (typeof detail.offline !== 'boolean') state.offline = detail.phase === 'blocked-offline';
    }
    if (Number.isSafeInteger(detail.earned)) state.earned = detail.earned;
    renderState();
  }

  function renderState() {
    put('eco-app-balance', String(state.points));
    put('eco-shop-balance', String(state.points));
    put('eco-app-session', state.offline ? 'Connexion simulée suspendue' : state.connected ? 'Session fictive active · ECO-001' : 'Aucune session fictive active');
    put('eco-app-station-status', state.offline ? 'Hors ligne dans la démonstration' : state.busy ? 'Traitement simulé en cours' : state.connected ? 'Connectée pour la démonstration' : 'Disponible pour une démonstration');
    const connect = document.getElementById('eco-app-connect');
    connect.textContent = state.connected ? 'Terminer la session fictive' : 'Connecter ECO-001 pour la démo';
    connect.disabled = state.busy || (state.offline && !state.connected);
    connect.dataset.command = state.connected ? 'end-session' : 'connect-station';
    put('eco-app-wallet-note', state.busy ? 'Le tri est en cours. Le solde changera après validation.' : state.phase === 'confirmed' ? `Dernier dépôt : +${state.earned} points fictifs après validation.` : state.phase === 'rejected' ? 'Objet à contrôler : aucun point ajouté.' : 'Un seul solde, partagé avec la simulation du site.');
    document.getElementById('eco-app-start-deposit').hidden=state.points>0;
    if (selectedProduct && !pendingExchange && !offerCompleted) renderOffer();
  }

  function selectTab(name, focus = false) {
    app.querySelectorAll('[data-app-tab]').forEach(button => {
      const selected = button.dataset.appTab === name;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    });
    app.querySelectorAll('[data-app-panel]').forEach(panel => { panel.hidden = panel.dataset.appPanel !== name; });
  }

  app.querySelectorAll('[data-app-tab]').forEach(button => {
    button.addEventListener('click', () => selectTab(button.dataset.appTab));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...app.querySelectorAll('[data-app-tab]')];
      const current = tabs.indexOf(button);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].dataset.appTab, true);
    });
  });
  document.getElementById('eco-app-connect').addEventListener('click', event => {
    document.dispatchEvent(new CustomEvent('ecoscan:command', { detail: { command: event.currentTarget.dataset.command, stationId: 'ECO-001' } }));
  });
  app.querySelectorAll('[data-app-open]').forEach(button => button.addEventListener('click', () => selectTab(button.dataset.appOpen, true)));

  function applyFilter(filter, announce = true) {
    if (!productFilters.has(filter)) filter = 'all';
    activeFilter = filter;
    let count = 0;
    shop.querySelectorAll('[data-shop-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.shopFilter === filter)));
    shop.querySelectorAll('[data-shop-product]').forEach(card => {
      if (!Object.hasOwn(products, card.dataset.shopProduct)) { card.hidden = true; return; }
      const product = products[card.dataset.shopProduct];
      card.hidden = filter !== 'all' && product.category !== filter;
      if (!card.hidden) count++;
    });
    if (announce) put('eco-shop-filter-status', `${count} ${count > 1 ? 'concepts affichés' : 'concept affiché'}.`);
  }
  shop.querySelectorAll('[data-shop-filter]').forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.shopFilter)));
  app.querySelectorAll('[data-app-filter]').forEach(link => link.addEventListener('click', () => applyFilter(link.dataset.appFilter)));

  function renderOffer() {
    const product = products[selectedProduct];
    if (!product) return;
    put('eco-shop-product-name', product.label);
    put('eco-shop-product-price', `${product.cost} EcoPoints fictifs`);
    put('eco-shop-product-material', product.material);
    put('eco-shop-product-use', product.use);
    put('eco-shop-product-care', product.care);
    put('eco-shop-product-validation', product.validation);
    const affordable = state.points >= product.cost;
    confirmButton.disabled = !affordable || state.busy;
    confirmButton.textContent = `Confirmer l’échange fictif · ${product.cost} points`;
    document.getElementById('eco-shop-try-deposit').hidden=affordable||state.busy;
    put('eco-shop-confirm-status', state.busy ? 'Le dépôt est en cours. Attendez sa validation avant un échange.' : affordable ? `Après confirmation, votre solde local passerait de ${state.points} à ${state.points - product.cost} points. Aucun produit ne sera commandé.` : `Votre solde est de ${state.points} points. Il manque ${product.cost - state.points} points pour simuler cet échange. Aucun point ne sera retiré.`);
    document.getElementById('eco-shop-result').hidden = true;
    document.getElementById('eco-shop-offer').hidden = false;
  }

  function openProduct(productId) {
    if (!Object.hasOwn(products, productId) || pendingExchange) return;
    selectedProduct = productId;
    offerCompleted = false;
    renderOffer();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.scrollTop=0;
    document.getElementById('eco-shop-product-name').focus({preventScroll:true});
  }
  shop.querySelectorAll('[data-shop-detail]').forEach(button => button.addEventListener('click', () => openProduct(button.dataset.shopDetail)));

  function closeDialog() {
    if (pendingExchange) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    selectedProduct = null;
    offerCompleted = false;
  }
  document.getElementById('eco-shop-cancel').addEventListener('click', closeDialog);
  document.getElementById('eco-shop-close').addEventListener('click', closeDialog);
  document.getElementById('eco-shop-try-deposit').addEventListener('click',closeDialog);
  document.getElementById('eco-shop-done').addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', event => { if (pendingExchange) event.preventDefault(); });
  dialog.addEventListener('click', event => { if (event.target === dialog && !pendingExchange) closeDialog(); });

  confirmButton.addEventListener('click', () => {
    const product = products[selectedProduct];
    if (!product || pendingExchange || state.busy || state.points < product.cost) return;
    const id = `eco-shop-${Date.now().toString(36)}-${++requestSerial}`;
    pendingExchange = { id, productId: selectedProduct };
    confirmButton.disabled = true;
    put('eco-shop-confirm-status', 'Vérification du solde local…');
    document.dispatchEvent(new CustomEvent('ecoscan:exchange-request', { detail: { id, productId: selectedProduct, cost: product.cost, label: product.label } }));
    // A missing central handler never produces a success message or changes currency.
    if (pendingExchange) {
      pendingExchange = null;
      put('eco-shop-confirm-status', 'Échange indisponible pour cette visite. Aucun point retiré. Vous pouvez fermer cette fenêtre.');
      confirmButton.disabled = true;
    }
  });

  document.addEventListener('ecoscan:exchange-result', event => {
    const detail = event.detail || {};
    if (!pendingExchange || detail.id !== pendingExchange.id) return;
    const product = products[pendingExchange.productId];
    pendingExchange = null;
    if (Number.isSafeInteger(detail.points) && detail.points >= 0) state.points = detail.points;
    if (detail.ok) {
      offerCompleted = true;
      recentExchange = `${product.label} · ${product.cost} points fictifs utilisés`;
      put('eco-app-latest-exchange', recentExchange);
      put('eco-shop-result-title', 'Échange de démonstration confirmé');
      put('eco-shop-result-message', `${product.cost} points fictifs retirés du portefeuille local pour « ${product.label} ». Aucun produit fabriqué, réservé ou expédié.`);
      put('eco-shop-announcement', `Échange fictif confirmé : ${product.label}. Solde local : ${state.points} points.`);
      document.getElementById('eco-shop-offer').hidden = true;
      document.getElementById('eco-shop-result').hidden = false;
      document.getElementById('eco-shop-done').focus();
      renderState();
    } else {
      renderOffer();
      put('eco-shop-confirm-status', detail.message || 'Échange refusé. Aucun point retiré.');
    }
  });
  document.addEventListener('ecoscan:wallet', event => updateState(event.detail));
  document.addEventListener('ecoscan:phase', event => updateState(event.detail));
  document.addEventListener('ecoscan:wallet-reset', () => {
    pendingExchange = null;
    recentExchange = '';
    put('eco-app-latest-exchange', 'Aucun échange pendant cette visite.');
    put('eco-shop-announcement', 'Démonstration remise à zéro.');
    closeDialog();
  });

  document.querySelectorAll('[data-shop-interactive]').forEach(element => { element.hidden = false; });
  selectTab('journey');
  applyFilter(activeFilter, false);
  renderState();
  document.dispatchEvent(new CustomEvent('ecoscan:state-request'));
  // Honour direct tab links without overriding the main site router.
  if (window.location.hash === '#eco-app-wallet') selectTab('wallet');
  document.querySelectorAll('a[href="#eco-app-wallet"]').forEach(link => link.addEventListener('click', () => selectTab('wallet')));
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#eco-app-wallet') selectTab('wallet');
    if (dialog.open && window.location.hash !== '#boutique') closeDialog();
  });
  document.addEventListener('ecoscan:viewchange', event => {
    if (event.detail.targetId === 'eco-app-wallet') selectTab('wallet');
    if (dialog.open && event.detail.targetId !== 'boutique') closeDialog();
  });
})();
