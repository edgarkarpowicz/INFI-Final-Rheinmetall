(function () {
  'use strict';

  const D = window.PRESENTATION_DATA;

  const TANK_CALLOUTS = [
    '¡+1 Pedido OTAN! Book-to-Bill 2,28x',
    'Lote 155 mm AQAP-2110 ¡APROBADO!',
    'OEE +4,2 pp tras cambio SMED en Unterlüß',
    'Modo Paz: 1 turno · Modo 2026: ¡3 turnos!',
    'Alerta DOS: ¡Reservar nitrocelulosa Tier-1!',
    'Cero daños ISO 45001 · Cierre EHS 95,22%',
  ];

  const JET_CALLOUTS = [
    '¡Cielo despejado Skynex! Q4 al 100%',
    'Escolta aérea: Backlog €78.000M a la vista',
    'Radar Bremen: Zero drones no autorizados',
    'Entrega exprés de microchips para Electronic Solutions',
  ];

  const ARTILLERY_CALLOUTS = [
    '¡Salva 155 mm L52! Meta 1,1M u./año',
    'Lote AQAP-2110 aprobado sin demoras GQAR',
    'Unterlüß + Murcia a 3 turnos · Margen 19,87%',
    '¡OEE +4,2 pp con cambio rápido SMED!',
  ];

  const BOXER_CALLOUTS = [
    'GTK Boxer 8×8 · Kassel + Telford UK',
    'Vehicle Systems: €7.020M en pedidos 9M',
    'Módulo Lance 30 mm listo · MPS 97,15%',
    'Patrulla logística · Sin retrasos Tier-1 OTIF',
  ];

  const SLIDES = [
    { id: 'cover', tag: 'Portada', short: 'Inicio' },
    { id: 'company', tag: 'Identidad & Mercado', short: 'Rheinmetall & Competencia' },
    { id: 'defense', tag: 'Estructura Operativa', short: 'División Defensa' },
    { id: 'context', tag: 'Contexto Estratégico', short: 'Antes vs. Después Ucrania' },
    { id: 'utility', tag: 'Propuesta de Valor', short: 'Justificación del Tablero' },
    { id: 'kpi-explorer', tag: 'Detalle por Sector', short: 'Detalle por Sector y KPI' },
    { id: 'stakeholders', tag: 'Gobierno del Dato', short: 'Stakeholders' },
    { id: 'kpi-map', tag: 'Resumen Ejecutivo', short: 'Mapa de los 10 KPIs' },
    { id: 'data-arch', tag: 'Origen de Datos', short: 'Arquitectura de Datos' },
    { id: 'etl-pipeline', tag: 'Integración en Vivo', short: 'Pipeline ETL' },
    { id: 'closing', tag: 'Conclusión', short: 'Cierre Ejecutivo' },
  ];

  function slideIndexById(id) {
    const idx = SLIDES.findIndex(function (s) { return s.id === id; });
    return idx >= 0 ? idx : 0;
  }

  function parseInitialSlide() {
    const m = window.location.hash.match(/slide=(\d+)/);
    if (!m) return 0;
    const n = Number(m[1]);
    return Number.isFinite(n) ? Math.max(0, Math.min(SLIDES.length - 1, n)) : 0;
  }

  function parseInitialTheme() {
    return window.location.hash.includes('theme=dark') ? 'dark' : 'light';
  }

  const state = {
    slideIndex: parseInitialSlide(),
    eraIndex: 0,
    stakeholderIndex: 0,
    sectorIndex: 0,
    fleetVisible: true,
    theme: parseInitialTheme(),
    calloutIndex: 0,
    jetCalloutIndex: 0,
    artilleryCalloutIndex: 0,
    boxerCalloutIndex: 0,
    calloutTimer: null,
    jetTimer: null,
    artilleryTimer: null,
    boxerTimer: null,
  };

  const els = {
    slideMount: document.getElementById('slideMount'),
    progressFill: document.getElementById('progressFill'),
    miniTank: document.getElementById('miniTank'),
    slideDots: document.getElementById('slideDots'),
    slideCounter: document.getElementById('slideCounter'),
    btnPrev: document.getElementById('btnPrev'),
    btnNext: document.getElementById('btnNext'),
    btnMap: document.getElementById('btnMap'),
    btnCloseMap: document.getElementById('btnCloseMap'),
    btnFleet: document.getElementById('btnFleet'),
    btnTheme: document.getElementById('btnTheme'),
    themeLabel: document.getElementById('themeLabel'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    tacticalBackdrop: document.getElementById('tacticalBackdrop'),
    tankStage: document.getElementById('tankStage'),
    tankCallout: document.getElementById('tankCallout'),
    jetStage: document.getElementById('jetStage'),
    jetCallout: document.getElementById('jetCallout'),
    artilleryStage: document.getElementById('artilleryStage'),
    artilleryCallout: document.getElementById('artilleryCallout'),
    boxerStage: document.getElementById('boxerStage'),
    boxerCallout: document.getElementById('boxerCallout'),
    overviewModal: document.getElementById('overviewModal'),
    overviewGrid: document.getElementById('overviewGrid'),
    sectorDetailModal: document.getElementById('sectorDetailModal'),
    sectorDetailBody: document.getElementById('sectorDetailBody'),
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pillClassForResult(text) {
    const lower = String(text || '').toLowerCase();
    if (lower.includes('óptimo')) return 'pill-green';
    if (lower.includes('crít')) return 'pill-red';
    return 'pill-amber';
  }

  function fireTankSalute(customMsg) {
    if (!state.fleetVisible) toggleFleet(true);
    const msg = customMsg || TANK_CALLOUTS[state.calloutIndex % TANK_CALLOUTS.length];
    state.calloutIndex += 1;
    els.tankCallout.textContent = msg;

    els.tankStage.classList.remove('is-firing');
    void els.tankStage.offsetWidth;
    els.tankStage.classList.add('is-firing');

    clearTimeout(state.calloutTimer);
    state.calloutTimer = setTimeout(function () {
      els.tankStage.classList.remove('is-firing');
    }, 1850);
  }

  function fireJetBoost(customMsg) {
    if (!state.fleetVisible) toggleFleet(true);
    if (!els.jetStage) return;
    const msg = customMsg || JET_CALLOUTS[state.jetCalloutIndex % JET_CALLOUTS.length];
    state.jetCalloutIndex += 1;
    els.jetCallout.textContent = msg;

    els.jetStage.classList.remove('is-boosting');
    void els.jetStage.offsetWidth;
    els.jetStage.classList.add('is-boosting');

    clearTimeout(state.jetTimer);
    state.jetTimer = setTimeout(function () {
      els.jetStage.classList.remove('is-boosting');
    }, 2000);
  }

  function fireArtillerySalvo(customMsg) {
    if (!state.fleetVisible) toggleFleet(true);
    if (!els.artilleryStage) return;
    const msg = customMsg || ARTILLERY_CALLOUTS[state.artilleryCalloutIndex % ARTILLERY_CALLOUTS.length];
    state.artilleryCalloutIndex += 1;
    els.artilleryCallout.textContent = msg;

    els.artilleryStage.classList.remove('is-firing');
    void els.artilleryStage.offsetWidth;
    els.artilleryStage.classList.add('is-firing');

    clearTimeout(state.artilleryTimer);
    state.artilleryTimer = setTimeout(function () {
      els.artilleryStage.classList.remove('is-firing');
    }, 1900);
  }

  function fireBoxerReport(customMsg) {
    if (!state.fleetVisible) toggleFleet(true);
    if (!els.boxerStage) return;
    const msg = customMsg || BOXER_CALLOUTS[state.boxerCalloutIndex % BOXER_CALLOUTS.length];
    state.boxerCalloutIndex += 1;
    els.boxerCallout.textContent = msg;

    els.boxerStage.classList.remove('is-reporting');
    void els.boxerStage.offsetWidth;
    els.boxerStage.classList.add('is-reporting');

    clearTimeout(state.boxerTimer);
    state.boxerTimer = setTimeout(function () {
      els.boxerStage.classList.remove('is-reporting');
    }, 1900);
  }

  function renderSparklineSvg(values, targetValue, isLowGood) {
    if (!Array.isArray(values) || !values.length) return '';
    const w = 96;
    const h = 36;
    const padX = 6;
    const padY = 5;
    const all = values.concat(typeof targetValue === 'number' ? [targetValue] : []);
    const min = Math.min.apply(null, all);
    const max = Math.max.apply(null, all);
    const span = max - min || 1;

    const toY = function (v) {
      return h - padY - ((v - min) / span) * (h - padY * 2);
    };

    const pts = values.map(function (v, idx) {
      const x = padX + (idx / (values.length - 1)) * (w - padX * 2);
      const y = toY(v);
      return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), v: v };
    });

    const linePath = pts.map(function (p, idx) {
      return (idx === 0 ? 'M ' : 'L ') + p.x + ' ' + p.y;
    }).join(' ');

    const areaPath = linePath + ' L ' + pts[pts.length - 1].x + ' ' + (h - 2) + ' L ' + pts[0].x + ' ' + (h - 2) + ' Z';
    const targetY = typeof targetValue === 'number' ? toY(targetValue).toFixed(1) : null;
    const last = pts[pts.length - 1];
    const lastGood = isLowGood ? last.v <= targetValue : last.v >= targetValue;
    const dotColor = lastGood ? 'var(--status-green)' : 'var(--accent-blue)';

    return `
      <svg class="kpi-spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolución Q1 a Q4 2026">
        ${targetY !== null ? `<line x1="2" y1="${targetY}" x2="${w - 2}" y2="${targetY}" stroke="var(--status-green)" stroke-width="1" stroke-dasharray="3 2" opacity="0.65" />` : ''}
        <path d="${areaPath}" fill="var(--accent-blue)" opacity="0.12" />
        <path d="${linePath}" fill="none" stroke="var(--accent-blue)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        ${pts.map(function (p) {
      return `<circle cx="${p.x}" cy="${p.y}" r="1.8" fill="var(--bg-surface)" stroke="var(--accent-blue)" stroke-width="1.2" />`;
    }).join('')}
        <circle cx="${last.x}" cy="${last.y}" r="3" fill="${dotColor}" />
      </svg>
    `;
  }

  function renderSlide0Cover() {
    return `
      <div class="slide-inner">
        <div class="cover-hero">
          <div class="anim-rise delay-1">
            <span class="slide-kicker">Defensa · Industria 4.0 · Control de Gestión</span>
            <h1 class="cover-title font-display">
              Rheinmetall AG<br />
              <span style="color: var(--accent-blue)">Tablero Estratégico &amp; KPI 2026</span>
            </h1>
            <p class="slide-subtitle" style="font-size: 14.5px; margin-bottom: 18px">
              De una cartera geopolítica récord al control operacional diario en plantas de artillería,
              vehículos blindados y electrónica de defensa.
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 18px">
              <button class="cta-primary" type="button" data-go-slide="1">
                <span>Iniciar Recorrido</span>
                <span>→</span>
              </button>
              <button class="tactical-tip-btn" type="button" data-fire-tank="¡Blindado calibrado y listo para exposición!">
                <span>Saludo del Tanque 🎯</span>
              </button>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 12px; color: var(--text-muted)">
              <span class="pill pill-blue">${esc(D.meta.authors)}</span>
              <span>${esc(D.meta.course)}</span>
            </div>
          </div>

          <div class="rhm-card anim-rise delay-2">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
              <span class="stat-label">Pulso Consolidado 9M 2026</span>
              <span class="pill pill-green">DAX 40 · Escala OTAN</span>
            </div>
            <div class="grid-2" style="gap: 10px">
              <div class="rhm-subcard">
                <div class="stat-label">Backlog Grupo</div>
                <div class="kpi-big-num font-mono" style="margin-top: 4px">€78.000M</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px">+218% vs. pre-2022</div>
              </div>
              <div class="rhm-subcard">
                <div class="stat-label">Book-to-Bill 9M</div>
                <div class="kpi-big-num font-mono" style="margin-top: 4px">2,28x</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px">Meta ≥ 1,50x (+CapEx)</div>
              </div>
              <div class="rhm-subcard">
                <div class="stat-label">Ventas Defensa 9M</div>
                <div class="kpi-big-num font-mono" style="margin-top: 4px">€8.376M</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px">3 sub-divisiones clave</div>
              </div>
              <div class="rhm-subcard">
                <div class="stat-label">Sistema KPI</div>
                <div class="kpi-big-num font-mono" style="margin-top: 4px">5 × 2</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px">10 KPIs Leading/Lagging</div>
              </div>
            </div>
            <p style="margin: 12px 0 0; font-size: 11.5px; color: var(--text-muted)">
              Tip: clic en tanque, artillería 155 mm, Boxer 8×8 o caza para interactuar · <span class="font-mono">F</span> oculta/muestra la flota.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function renderSlide1Company() {
    const activeEra = D.timeline[state.eraIndex] || D.timeline[0];
    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise">
          <span class="slide-kicker">01 · Identidad Corporativa</span>
          <h2 class="slide-title font-display">¿Qué es Rheinmetall AG? Historia &amp; Posición Competitiva</h2>
          <p class="slide-subtitle">
            Conglomerado alemán fundado en 1889 (Düsseldorf), integrante del DAX 40 con +31.000 colaboradores en +130 plantas globales.
          </p>
        </div>

        <div class="rhm-card anim-rise delay-1" style="margin-bottom: 12px; padding: 14px 16px">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px">
            <span class="stat-label">Evolución Histórica (Clic en cada etapa)</span>
            <span class="pill pill-blue font-mono">${esc(activeEra.era)}</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 9px">
            ${D.timeline
        .map(function (item, idx) {
          return `
                  <button
                    class="timeline-pill ${idx === state.eraIndex ? 'is-active' : ''}"
                    type="button"
                    data-era="${idx}"
                  >
                    <div style="display: flex; justify-content: space-between; align-items: center">
                      <span class="font-mono" style="font-size: 11px; font-weight: 700; color: var(--accent-blue)">
                        ${esc(item.era)}
                      </span>
                      <span class="font-mono" style="font-size: 10px; color: var(--text-muted)">0${idx + 1}</span>
                    </div>
                    <div style="font-size: 12px; font-weight: 600; margin-top: 2px">${esc(item.title)}</div>
                  </button>
                `;
        })
        .join('')}
          </div>
          <div class="rhm-subcard" style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.42">
            <strong style="color: var(--text-primary)">${esc(activeEra.title)}:</strong> ${esc(activeEra.fact)}
          </div>
        </div>

        <div class="grid-3 anim-rise delay-2">
          ${D.competitors
        .map(function (comp) {
          return `
                <div class="rhm-card ${comp.highlight ? 'card-highlight' : ''}" style="padding: 15px 16px">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px">
                    <span class="stat-label">${esc(comp.tier)}</span>
                    <span class="pill ${comp.highlight ? 'pill-green' : 'pill-blue'} font-mono">
                      ${esc(comp.margin)}
                    </span>
                  </div>
                  <div style="font-size: 14px; font-weight: 700; margin: 6px 0 6px">${esc(comp.names)}</div>
                  <div class="bar-track" style="margin-bottom: 8px">
                    <div class="bar-fill ${comp.highlight ? 'is-green' : 'is-muted'}" style="width: ${Number(comp.barPct || 50)}%"></div>
                  </div>
                  <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.42">
                    ${esc(comp.focus)}
                  </p>
                </div>
              `;
        })
        .join('')}
        </div>
      </div>
    `;
  }

  function renderSlide2Defense() {
    const g = D.defenseGroup9m;
    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise">
          <span class="slide-kicker">02 · División Defensa</span>
          <h2 class="slide-title font-display">Estructura Operativa de la División Defensa</h2>
          <p class="slide-subtitle">
            Tres verticales estratégicas agrupadas bajo el Grupo Consolidado, desde munición química de alta cadencia hasta sensores tácticos.
          </p>
        </div>

        <div class="rhm-card anim-rise delay-1" style="padding: 15px 18px">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px">
            <div style="display: flex; align-items: center; gap: 8px">
              <strong class="font-display" style="font-size: 16px">División Defensa</strong>
              <span style="font-size: 12px; color: var(--text-muted)">· Grupo Consolidado (3 sub-divisiones)</span>
            </div>
            <span class="pill pill-blue font-mono">9M 2026</span>
          </div>

          <div class="super-strip">
            <div>
              <div class="stat-label">Ventas Grupo</div>
              <div class="font-mono" style="font-size: 15px; font-weight: 700; margin-top: 2px">${esc(g.ventas)}</div>
            </div>
            <div>
              <div class="stat-label">Pedidos Grupo</div>
              <div class="font-mono" style="font-size: 15px; font-weight: 700; color: var(--accent-blue); margin-top: 2px">${esc(g.pedidos)}</div>
            </div>
            <div>
              <div class="stat-label">Margen Op.</div>
              <div class="font-mono" style="font-size: 15px; font-weight: 700; margin-top: 2px">
                ${esc(g.margen)} <span style="font-size: 11px; color: var(--text-muted); font-weight: 400">(${esc(g.ebit)} EBIT)</span>
              </div>
            </div>
          </div>

          <!-- Proportion Bar of Sales across 3 verticals -->
          <div class="stack-bar" title="Participación sobre ventas Defensa 9M: W&A 34,9% · VS 37,1% · ES 28,0%">
            <div class="stack-seg" style="width: 34.9%; background: var(--accent-blue)"></div>
            <div class="stack-seg" style="width: 37.1%; background: var(--status-green)"></div>
            <div class="stack-seg" style="width: 28.0%; background: var(--status-yellow)"></div>
          </div>

          <div class="grid-3">
            ${D.divisions
        .map(function (div, idx) {
          const dotColor = idx === 0 ? 'var(--accent-blue)' : idx === 1 ? 'var(--status-green)' : 'var(--status-yellow)';
          return `
                  <div class="rhm-subcard" style="display: flex; flex-direction: column; justify-content: space-between; gap: 8px; padding: 13px 14px">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 5px">
                        <span class="pill pill-blue" style="font-size: 10.5px">${esc(div.vehicleTag)}</span>
                        <span class="font-mono" style="font-size: 11px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px">
                          <span style="width: 7px; height: 7px; border-radius: 99px; background: ${dotColor}; display: inline-block"></span>
                          ${esc(div.stats9m.sharePct)}% mix
                        </span>
                      </div>
                      <h3 class="font-display" style="margin: 0 0 3px; font-size: 17px">${esc(div.name)}</h3>
                      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px">📍 ${esc(div.plants)}</div>
                      <div class="kv-row" style="padding: 5px 0; font-size: 12px">
                        <span class="kv-key">Rol</span>
                        <span>${esc(div.role)}</span>
                      </div>
                      <div class="kv-row" style="padding: 5px 0; font-size: 12px">
                        <span class="kv-key">Productos</span>
                        <span style="color: var(--text-secondary)">${esc(div.products)}</span>
                      </div>
                      <div class="kv-row" style="padding: 5px 0; font-size: 12px">
                        <span class="kv-key">Clientes</span>
                        <span style="color: var(--text-secondary)">${esc(div.clients)}</span>
                      </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; padding-top: 8px; border-top: 1px solid var(--border-color)">
                      <div>
                        <div class="stat-label">Ventas</div>
                        <div class="font-mono" style="font-size: 12.5px; font-weight: 700">${esc(div.stats9m.ventas)}</div>
                      </div>
                      <div>
                        <div class="stat-label">Pedidos</div>
                        <div class="font-mono" style="font-size: 12.5px; font-weight: 700; color: var(--accent-blue)">
                          ${esc(div.stats9m.pedidos)}
                        </div>
                      </div>
                      <div>
                        <div class="stat-label">Margen</div>
                        <div class="font-mono" style="font-size: 12.5px; font-weight: 700">${esc(div.stats9m.margen)}</div>
                      </div>
                    </div>
                  </div>
                `;
        })
        .join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderContextCard(sideData, isAfter) {
    return `
      <div class="rhm-card ${isAfter ? 'card-after' : 'card-before'}" style="padding: 12px 14px">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px">
          <span class="pill ${isAfter ? 'pill-green' : 'pill-amber'} font-mono">${esc(sideData.badge)}</span>
          <span style="font-size: 11px; font-weight: 600; color: var(--text-muted)">${esc(sideData.mood)}</span>
        </div>
        <div class="grid-3" style="gap: 8px; margin-bottom: 8px">
          ${sideData.metrics
        .map(function (m) {
          return `
                <div class="rhm-subcard" style="padding: 7px 9px">
                  <div class="stat-label">${esc(m.label)}</div>
                  <div class="font-mono" style="font-size: 12.5px; font-weight: 700; margin-top: 2px; color: ${isAfter ? 'var(--accent-blue)' : 'var(--text-primary)'
            }">
                    ${esc(m.value)}
                  </div>
                </div>
              `;
        })
        .join('')}
        </div>
        <ul class="bullet-clean" style="gap: 4px; font-size: 12px; margin-top: 4px">
          ${sideData.bullets
        .map(function (b) {
          return `<li>${esc(b)}</li>`;
        })
        .join('')}
        </ul>
      </div>
    `;
  }

  function renderSlide3Context() {
    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise">
          <span class="slide-kicker">03 · Quiebre Geopolítico</span>
          <h2 class="slide-title font-display">Contexto Actual: Antes vs. Después de Ucrania (Zeitenwende)</h2>
          <p class="slide-subtitle" style="max-width: none">
            Febrero de 2022 invirtió el problema central: de competir por presupuestos bajos a escalar plantas a 3 turnos.
          </p>
        </div>

        <div class="rhm-card anim-rise delay-1" style="padding: 10px 15px; margin-bottom: 10px">
          <div class="grid-2" style="gap: 16px">
            ${D.contextCompare.scaleBars
        .map(function (bar) {
          return `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px">
                      <strong>${esc(bar.label)}</strong>
                      <span class="font-mono" style="color: var(--accent-blue); font-weight: 700">
                        ${esc(bar.beforeLabel)} → ${esc(bar.afterLabel)}
                      </span>
                    </div>
                    <div style="display: grid; gap: 4px">
                      <div class="bar-track" style="height: 6px"><div class="bar-fill is-muted" style="width: ${bar.beforePct}%"></div></div>
                      <div class="bar-track" style="height: 6px"><div class="bar-fill" style="width: ${bar.afterPct}%"></div></div>
                    </div>
                  </div>
                `;
        })
        .join('')}
          </div>
        </div>

        <div class="grid-2 anim-rise delay-2" style="margin-bottom: 10px">
          ${renderContextCard(D.contextCompare.before, false)}
          ${renderContextCard(D.contextCompare.after, true)}
        </div>

        <div class="rhm-card anim-rise delay-3" style="padding: 11px 15px">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px">
            <span class="stat-label" style="color: var(--status-red-text)">Tensiones Operativas Reales (2025–2026)</span>
            <span style="font-size: 11px; color: var(--text-muted)">Por qué escalar demanda exige control diario</span>
          </div>
          <div class="grid-4">
            ${(D.contextCompare.tensions2026 || [])
        .map(function (t) {
          return `
                  <div class="rhm-subcard" style="padding: 8px 10px">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px">
                      <strong style="font-size: 12px; color: var(--text-primary)">${esc(t.title)}</strong>
                      <span class="pill pill-red" style="font-size: 9.5px; padding: 1px 7px">${esc(t.tag)}</span>
                    </div>
                    <div style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.35">
                      ${esc(t.detail)}
                    </div>
                  </div>
                `;
        })
        .join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderSlide4Utility() {
    const loopSteps = [
      { step: '01', label: 'Objetivo (OE)', desc: 'Meta estratégica anual' },
      { step: '02', label: 'Dato Real', desc: 'Señal operativa medida' },
      { step: '03', label: 'Meta SMART', desc: 'Semáforo Verde/Am./Rojo' },
      { step: '04', label: 'Decisión', desc: 'CapEx · SMED · Stock · EHS', accent: true },
    ];

    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise">
          <span class="slide-kicker">04 · Propuesta de Valor</span>
          <h2 class="slide-title font-display">¿Por Qué Necesita Rheinmetall este Tablero y Qué Resuelve?</h2>
          <p class="slide-subtitle" style="max-width: none">
            Cada sector enfrenta una tensión concreta al escalar producción. Hacé clic en cualquier tarjeta para ver los KPIs implementados.
          </p>
        </div>

        <div class="flow-chain anim-rise delay-1" style="margin-bottom: 12px">
          ${loopSteps
        .map(function (n, i) {
          const arrow = i < loopSteps.length - 1 ? '<span class="flow-arrow" aria-hidden="true">→</span>' : '';
          return `
                <div class="flow-node ${n.accent ? 'is-accent' : ''}">
                  <div class="font-mono" style="font-size: 10px; font-weight: 700; color: var(--accent-blue)">${n.step}</div>
                  <div style="font-size: 13px; font-weight: 700">${esc(n.label)}</div>
                  <div style="font-size: 11px; color: var(--text-muted)">${esc(n.desc)}</div>
                </div>
                ${arrow}
              `;
        })
        .join('')}
        </div>

        <div class="justif-flex anim-rise delay-2">
          ${D.justifications
        .map(function (item, idx) {
          return `
                <button
                  class="rhm-card justif-item"
                  type="button"
                  data-justif-sector="${esc(item.sectorId)}"
                  style="padding: 13px 15px"
                >
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px">
                      <span class="pill pill-blue">${esc(item.area)}</span>
                      <span class="font-mono" style="font-size: 11px; color: var(--text-muted)">0${idx + 1}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--status-red-text); margin-bottom: 6px; line-height: 1.38">
                      <strong>Tensión / Problema:</strong> ${esc(item.tension)}
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.42">
                      <strong style="color: var(--text-primary)">Utilidad:</strong> ${esc(item.utility)}
                    </div>
                  </div>
                  <div class="justif-foot">
                    <span>2 KPIs implementados en este sector</span>
                    <span>Ver detalle →</span>
                  </div>
                </button>
              `;
        })
        .join('')}
        </div>
      </div>
    `;
  }

  function renderSlideStakeholders() {
    const active = D.stakeholders[state.stakeholderIndex] || D.stakeholders[0];
    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise">
          <span class="slide-kicker">06 · Actores del Sistema</span>
          <h2 class="slide-title font-display">Stakeholders: Quién Decide con Cada Señal</h2>
          <p class="slide-subtitle">
            Cinco perfiles clave mapeados al tablero (SRS §5). Seleccioná cada rol para ver qué KPIs monitorea por sector y qué decide.
          </p>
        </div>

        <div class="grid-5 anim-rise delay-1" style="margin-bottom: 12px">
          ${D.stakeholders
        .map(function (st, idx) {
          return `
                <button
                  class="rhm-card stakeholder-card ${idx === state.stakeholderIndex ? 'is-active' : ''}"
                  type="button"
                  data-stakeholder="${idx}"
                  style="padding: 13px"
                >
                  <div>
                    <span class="pill pill-blue" style="margin-bottom: 6px; font-size: 10.5px">${esc(st.level)}</span>
                    <div style="font-size: 13px; font-weight: 700; line-height: 1.25; color: var(--text-primary)">
                      ${esc(st.role)}
                    </div>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted)">Foco: ${esc(st.focus)}</div>
                </button>
              `;
        })
        .join('')}
        </div>

        <div class="rhm-card card-highlight anim-rise delay-2" style="padding: 16px 18px">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px">
            <div>
              <span class="stat-label">${esc(active.level)} · Foco: ${esc(active.focus)}</span>
              <h3 class="font-display" style="margin: 2px 0 0; font-size: 19px">${esc(active.role)}</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px">
              ${(active.kpis || [])
        .map(function (k) {
          return `<span class="pill pill-green font-mono">${esc(k)}</span>`;
        })
        .join('')}
            </div>
          </div>

          <div class="flow-chain" style="align-items: stretch">
            <div class="flow-node" style="flex: 1.55 1 260px">
              <div class="stat-label">1. Qué Monitorea (KPIs por Sector)</div>
              <ul class="stakeholder-kpi-list">
                ${active.monitoredBySector
        .map(function (entry) {
          return `<li><strong>${esc(entry.sector)}:</strong> ${esc(entry.detail)}</li>`;
        })
        .join('')}
              </ul>
            </div>
            <span class="flow-arrow" aria-hidden="true">→</span>
            <div class="flow-node is-accent" style="flex: 1.35 1 240px">
              <div class="stat-label" style="color: var(--accent-blue)">2. Decisión Operativa / Estratégica</div>
              <div style="font-size: 12.5px; margin-top: 5px; color: var(--text-primary); line-height: 1.42">${esc(active.decision)}</div>
            </div>
            <span class="flow-arrow" aria-hidden="true">→</span>
            <div class="flow-node" style="flex: 0.9 1 170px">
              <div class="stat-label">3. Impacto Esperado</div>
              <div style="font-size: 12.5px; font-weight: 700; color: var(--status-green-text); margin-top: 5px; line-height: 1.38">${esc(active.impact)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSlideKpiMap() {
    const rows = [];
    D.sectorsKpis.forEach(function (sec, secIdx) {
      sec.kpis.forEach(function (kpi) {
        rows.push({ secIdx: secIdx, sectorName: sec.sectorName, objetivoId: sec.objetivoId, kpi: kpi });
      });
    });

    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise" style="margin-bottom: 8px">
          <span class="slide-kicker">07 · Matriz Completa</span>
          <h2 class="slide-title font-display">Los 10 KPIs Implementados (Sector, Propósito &amp; Stakeholder)</h2>
          <p class="slide-subtitle" style="max-width: none">
            Equilibrio estricto 1 Leading + 1 Lagging por sector. Hacé clic en cualquier fila para abrir su ficha técnica.
          </p>
        </div>

        <div class="rhm-card anim-rise delay-1" style="padding: 6px 12px; overflow-x: auto">
          <table class="clean-table is-dense">
            <thead>
              <tr>
                <th>Sector / OE</th>
                <th>KPI</th>
                <th>Tipo</th>
                <th>Propósito Central</th>
                <th>Meta SMART</th>
                <th>Stakeholder Principal</th>
                <th>9M / FY26</th>
              </tr>
            </thead>
            <tbody>
              ${rows
        .map(function (r) {
          const isLead = r.kpi.type === 'Leading';
          return `
                    <tr class="is-clickable" data-open-sector="${r.secIdx}" title="Abrir detalle de ${esc(r.sectorName)}">
                      <td style="font-weight: 600; white-space: nowrap">
                        <span class="font-mono" style="color: var(--accent-blue)">${esc(r.objetivoId)}</span>
                        · ${esc(r.sectorName.replace(/^\d+\.\s*/, '').split('(')[0].trim())}
                      </td>
                      <td style="white-space: nowrap">
                        <span class="font-mono" style="font-weight: 700">${esc(r.kpi.code)}</span>
                        ${esc(r.kpi.name)}
                      </td>
                      <td>
                        <span class="pill ${isLead ? 'pill-blue' : 'pill-amber'}" style="font-size: 10px">${esc(r.kpi.type)}</span>
                      </td>
                      <td style="color: var(--text-secondary)">${esc(r.kpi.shortPurpose || r.kpi.purpose)}</td>
                      <td class="font-mono" style="font-weight: 700; white-space: nowrap">${esc(r.kpi.meta)}</td>
                      <td style="font-weight: 500">${esc(r.kpi.stakeholder)}</td>
                      <td>
                        <span class="pill ${pillClassForResult(r.kpi.real9m)} font-mono" style="white-space: nowrap; font-size: 10px">
                          ${esc(r.kpi.real9m.split('(')[0].trim())}
                        </span>
                      </td>
                    </tr>
                  `;
        })
        .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSlideKpiExplorer() {
    const sector = D.sectorsKpis[state.sectorIndex] || D.sectorsKpis[0];
    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px">
            <span class="slide-kicker">05 · Explorador Técnico (${esc(sector.objetivoId)})</span>
            <div style="display: flex; gap: 6px">
              <button class="hud-btn" type="button" data-sector-step="-1" title="Sector anterior (↑)">◀ Sector</button>
              <button class="hud-btn" type="button" data-sector-step="1" title="Siguiente sector (↓)">Sector ▶</button>
            </div>
          </div>
          <h2 class="slide-title font-display">Detalle por Sector y KPI: ${esc(sector.sectorName)}</h2>
          <p class="slide-subtitle">
            <strong>Objetivo:</strong> ${esc(sector.objetivo)}
          </p>
        </div>

        <div class="tab-bar anim-rise delay-1" style="margin-bottom: 11px">
          ${D.sectorsKpis
        .map(function (s, idx) {
          return `
                <button
                  class="tab-btn ${idx === state.sectorIndex ? 'is-active' : ''}"
                  type="button"
                  data-sector="${idx}"
                >
                  ${esc(s.sectorName.split('(')[0].trim())}
                </button>
              `;
        })
        .join('')}
        </div>

        <div class="grid-2 anim-rise delay-2">
          ${sector.kpis
        .map(function (k) {
          const isLead = k.type === 'Leading';
          const isLowGood = k.code === 'KPI-3.2' || k.code === 'KPI-5.2';
          return `
                <div class="rhm-card" style="padding: 14px 16px">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px">
                    <div>
                      <span class="pill ${isLead ? 'pill-blue' : 'pill-amber'} font-mono">
                        ${esc(k.code)} · ${esc(k.type)}
                      </span>
                      <h3 class="font-display" style="margin: 5px 0 0; font-size: 17.5px">${esc(k.name)}</h3>
                    </div>
                    <div class="kpi-spark-wrap">
                      ${renderSparklineSvg(k.series, k.targetValue, isLowGood)}
                      <div style="text-align: right">
                        <span class="pill ${pillClassForResult(k.real9m)} font-mono" style="font-size: 10.5px">
                          ${esc(k.real9m)}
                        </span>
                        <div style="font-size: 9.5px; color: var(--text-muted); margin-top: 2px">Q1 → Q4 2026</div>
                      </div>
                    </div>
                  </div>

                  <div class="kv-row">
                    <span class="kv-key">Propósito</span>
                    <span style="color: var(--text-secondary)">${esc(k.purpose)}</span>
                  </div>
                  <div class="kv-row">
                    <span class="kv-key">Pregunta</span>
                    <span style="font-style: italic; color: var(--text-secondary)">${esc(k.question)}</span>
                  </div>
                  <div class="kv-row">
                    <span class="kv-key">Fórmula</span>
                    <span class="font-mono" style="font-size: 11px">${esc(k.formula)}</span>
                  </div>
                  <div class="kv-row">
                    <span class="kv-key">Meta / Banda</span>
                    <span style="font-size: 11.5px">
                      <strong class="font-mono" style="color: var(--accent-blue)">${esc(k.meta)}</strong>
                      · ${esc(k.thresholds)}
                    </span>
                  </div>
                  <div class="kv-row">
                    <span class="kv-key">Fuente ETL</span>
                    <span style="color: var(--text-muted); font-size: 11.5px">${esc(k.tool)}</span>
                  </div>
                  <div class="kv-row">
                    <span class="kv-key">Protocolo</span>
                    <span style="color: var(--text-primary); font-size: 12px">${esc(k.protocol)}</span>
                  </div>
                </div>
              `;
        })
        .join('')}
        </div>
      </div>
    `;
  }

  function renderSlideDataArchitecture() {
    const arch = D.dataArchitecture;
    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise">
          <span class="slide-kicker">08 · Origen y Justificación de Datos</span>
          <h2 class="slide-title font-display">Arquitectura de Datos y Estrategia de Abastecimiento</h2>
          <p class="slide-subtitle" style="max-width: none">
            ${esc(arch.hybridPrinciple)}
          </p>
        </div>

        <div class="closed-loop-bar anim-rise delay-1" style="margin-bottom: 12px; padding: 10px 15px; flex-wrap: nowrap">
          <div style="font-size: 12.5px; color: var(--text-primary)">
            <strong>Principio Híbrido:</strong>
            <span style="color: var(--text-secondary)">
              Reconcilia la contabilidad real 9M/FY25 con simulación calibrada donde la información fabril es reservada.
            </span>
          </div>
          <span class="pill pill-blue font-mono" style="white-space: nowrap">2 Capas · Trazable</span>
        </div>

        <div class="grid-2 anim-rise delay-2">
          ${arch.layers
        .map(function (layer) {
          return `
                <div class="rhm-card" style="padding: 15px 17px; display: flex; flex-direction: column; gap: 8px">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px">
                    <div>
                      <div class="stat-label">${esc(layer.level)}</div>
                      <h3 class="font-display" style="margin: 3px 0 0; font-size: 18px">${esc(layer.title)}</h3>
                    </div>
                    <span class="pill ${esc(layer.pillClass)}" style="white-space: nowrap">${esc(layer.badge)}</span>
                  </div>

                  <div class="kv-row" style="padding: 6px 0; font-size: 12px">
                    <span class="kv-key">Fuentes</span>
                    <span style="color: var(--text-secondary)">${esc(layer.sources)}</span>
                  </div>
                  <div class="kv-row" style="padding: 6px 0; font-size: 12px">
                    <span class="kv-key">Alcance</span>
                    <span style="color: var(--text-primary)">${esc(layer.scope)}</span>
                  </div>
                  <div class="kv-row" style="padding: 6px 0; font-size: 12px">
                    <span class="kv-key">Justificación</span>
                    <span style="color: var(--text-secondary)">${esc(layer.justification)}</span>
                  </div>
                </div>
              `;
        })
        .join('')}
        </div>
      </div>
    `;
  }

  function renderSlideEtlPipeline() {
    const etl = D.etlPipeline;
    return `
      <div class="slide-inner">
        <div class="slide-header is-compact anim-rise">
          <span class="slide-kicker">09 · Integración en Vivo</span>
          <h2 class="slide-title font-display">Flujo de Integración y Sistemas Empresariales Origen (Pipeline ETL)</h2>
          <p class="slide-subtitle" style="max-width: none">
            Software empresarial, telemetría de planta y documentos oficiales que alimentarían el tablero de forma continua en producción.
          </p>
        </div>

        <div class="flow-chain anim-rise delay-1" style="margin-bottom: 12px">
          ${etl.flowSteps
        .map(function (n, i) {
          const arrow = i < etl.flowSteps.length - 1 ? '<span class="flow-arrow" aria-hidden="true">→</span>' : '';
          return `
                <div class="flow-node ${n.accent ? 'is-accent' : ''}">
                  <div class="font-mono" style="font-size: 10px; font-weight: 700; color: var(--accent-blue)">${n.step}</div>
                  <div style="font-size: 13px; font-weight: 700">${esc(n.label)}</div>
                  <div style="font-size: 11px; color: var(--text-muted)">${esc(n.desc)}</div>
                </div>
                ${arrow}
              `;
        })
        .join('')}
        </div>

        <div class="grid-2 anim-rise delay-2">
          ${etl.systems
        .map(function (sys) {
          return `
                <div class="rhm-card" style="padding: 13px 15px; display: flex; flex-direction: column; gap: 6px">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px">
                    <strong class="font-display" style="font-size: 16px">${esc(sys.name)}</strong>
                    <span class="pill ${esc(sys.pillClass)}" style="font-size: 10.5px">${esc(sys.feeds)}</span>
                  </div>
                  <div class="font-mono" style="font-size: 11px; color: var(--accent-blue)">${esc(sys.modules)}</div>
                  <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4">
                    <strong style="color: var(--text-primary)">Documentos / Registros:</strong> ${esc(sys.docs)}
                  </div>
                </div>
              `;
        })
        .join('')}
        </div>
      </div>
    `;
  }

  function renderSlideClosing() {
    return `
      <div class="slide-inner">
        <div class="rhm-card anim-rise" style="padding: 26px; max-width: 980px; margin: 0 auto">
          <span class="slide-kicker">10 · Cierre Ejecutivo</span>
          <h2 class="slide-title font-display" style="margin-top: 10px">
            Conclusión: Control Operacional para Escalar sin Desvíos
          </h2>
          <p class="slide-subtitle" style="margin-bottom: 16px; max-width: none">
            La guerra en Ucrania disparó un hipercrecimiento inédito (de 1 turno en paz a €78.000M de cartera): el desafío dejó de ser conseguir contratos y pasó a ser escalar plantas sin colapsar.
          </p>

          <div class="grid-3" style="margin-bottom: 18px">
            <div class="rhm-subcard">
              <div class="stat-label">El Problema Inicial</div>
              <div style="font-size: 12.5px; margin-top: 5px; color: var(--text-secondary); line-height: 1.42">
                El salto explosivo de demanda pos-2022 tensionó líneas a 3 turnos, suministro de insumos críticos, certificación de lotes y seguridad laboral.
              </div>
            </div>
            <div class="rhm-subcard">
              <div class="stat-label">Qué Resuelve el Tablero</div>
              <div style="font-size: 12.5px; margin-top: 5px; color: var(--text-secondary); line-height: 1.42">
                Conecta la presión comercial con la capacidad real de planta, destraba entregas OTAN, equilibra stock y anticipa riesgos operativos.
              </div>
            </div>
            <div class="rhm-subcard">
              <div class="stat-label">Utilidad para Rheinmetall</div>
              <div style="font-size: 12.5px; margin-top: 5px; color: var(--text-secondary); line-height: 1.42">
                Brinda control diario con alertas accionables para absorber el hipercrecimiento cumpliendo entregas, margen y seguridad industrial.
              </div>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-color)">
            <div style="font-size: 12.5px; color: var(--text-muted)">
              <strong style="color: var(--text-primary)">${esc(D.meta.authors)}</strong> · ${esc(D.meta.course)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px">
              <button class="tactical-tip-btn" type="button" data-double-salute="true">
                <span>Desfile Final (✈️ + 🪖)</span>
              </button>
              <button class="cta-primary" type="button" data-go-slide="0">
                <span>Volver al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const RENDERERS = [
    renderSlide0Cover,
    renderSlide1Company,
    renderSlide2Defense,
    renderSlide3Context,
    renderSlide4Utility,
    renderSlideKpiExplorer,
    renderSlideStakeholders,
    renderSlideKpiMap,
    renderSlideDataArchitecture,
    renderSlideEtlPipeline,
    renderSlideClosing,
  ];

  function openSectorDetailModal(sectorId) {
    if (!els.sectorDetailModal || !els.sectorDetailBody) return;
    const justif = D.justifications.find(function (j) { return j.sectorId === sectorId; });
    const secIdx = D.sectorsKpis.findIndex(function (s) { return s.sectorId === sectorId; });
    const sector = D.sectorsKpis[secIdx >= 0 ? secIdx : 0];
    if (!sector) return;

    els.sectorDetailBody.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px">
        <div>
          <span class="slide-kicker">KPIs Implementados · Sector</span>
          <h2 class="font-display" style="margin: 6px 0 4px; font-size: 21px">${esc(justif ? justif.area : sector.sectorName)}</h2>
          <p style="margin: 0; font-size: 12.5px; color: var(--text-secondary)">
            ${esc(justif ? justif.utility : sector.objetivo)}
          </p>
        </div>
        <button class="hud-btn" type="button" data-close-detail="true">Cerrar (Esc)</button>
      </div>

      <div class="grid-2" style="margin-bottom: 12px">
        ${sector.kpis
        .map(function (k) {
          const isLead = k.type === 'Leading';
          return `
              <div class="rhm-subcard" style="display: flex; flex-direction: column; gap: 7px">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px">
                  <span class="pill ${isLead ? 'pill-blue' : 'pill-amber'} font-mono" style="font-size: 10.5px">
                    ${esc(k.type)} · ${isLead ? 'Predictivo' : 'Resultado'}
                  </span>
                  <span class="font-mono" style="font-size: 11.5px; font-weight: 700; color: var(--accent-blue)">
                    Meta ${esc(k.meta)}
                  </span>
                </div>
                <h3 class="font-display" style="margin: 0; font-size: 16.5px">${esc(k.name)}</h3>
                <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.42">
                  ${esc(k.purpose)}
                </p>
                <div class="kv-row" style="padding: 5px 0; font-size: 11.5px">
                  <span class="kv-key">Qué responde</span>
                  <span style="font-style: italic">${esc(k.question)}</span>
                </div>
                <div class="kv-row" style="padding: 5px 0; font-size: 11.5px">
                  <span class="kv-key">Acción</span>
                  <span>${esc(k.protocol)}</span>
                </div>
              </div>
            `;
        })
        .join('')}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <button class="cta-primary" type="button" data-jump-sector="${secIdx >= 0 ? secIdx : 0}">
          <span>Ver evolución en Explorador Técnico →</span>
        </button>
      </div>
    `;

    els.sectorDetailModal.classList.add('is-open');
    els.sectorDetailModal.setAttribute('aria-hidden', 'false');
  }

  function closeSectorDetailModal() {
    if (!els.sectorDetailModal) return;
    els.sectorDetailModal.classList.remove('is-open');
    els.sectorDetailModal.setAttribute('aria-hidden', 'true');
  }

  function renderDots() {
    els.slideDots.innerHTML = SLIDES.map(function (s, idx) {
      return `
        <button
          class="dot-btn ${idx === state.slideIndex ? 'is-active' : ''}"
          type="button"
          data-go-slide="${idx}"
          title="${esc(s.short)}"
          aria-label="Ir a diapositiva ${idx + 1}: ${esc(s.short)}"
        ></button>
      `;
    }).join('');
  }

  function renderOverview() {
    els.overviewGrid.innerHTML = SLIDES.map(function (s, idx) {
      return `
        <button
          class="overview-tile ${idx === state.slideIndex ? 'is-current' : ''}"
          type="button"
          data-map-slide="${idx}"
        >
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span class="font-mono" style="font-size: 11px; color: var(--accent-blue); font-weight: 700">
              ${String(idx + 1).padStart(2, '0')}
            </span>
            <span style="font-size: 10.5px; color: var(--text-muted)">${esc(s.tag)}</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; margin-top: 4px; color: var(--text-primary)">
            ${esc(s.short)}
          </div>
        </button>
      `;
    }).join('');
  }

  function render() {
    closeSectorDetailModal();
    const renderer = RENDERERS[state.slideIndex] || RENDERERS[0];
    els.slideMount.innerHTML = renderer();
    els.slideMount.scrollTop = 0;

    const total = SLIDES.length;
    const pct = ((state.slideIndex + 1) / total) * 100;
    const crawlerLeft = Math.min(97, Math.max(3, pct - 2));

    els.progressFill.style.width = pct.toFixed(1) + '%';
    els.miniTank.style.left = crawlerLeft.toFixed(1) + '%';
    els.slideCounter.textContent = String(state.slideIndex + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');

    els.btnPrev.disabled = state.slideIndex === 0;
    els.btnNext.disabled = state.slideIndex === total - 1;
    els.btnPrev.style.opacity = state.slideIndex === 0 ? '0.45' : '1';
    els.btnNext.style.opacity = state.slideIndex === total - 1 ? '0.45' : '1';

    renderDots();
    renderOverview();

    if (window.history && window.history.replaceState) {
      const themeParam = state.theme === 'dark' ? '&theme=dark' : '';
      window.history.replaceState(null, '', '#slide=' + state.slideIndex + themeParam);
    }
  }

  function goToSlide(idx) {
    const next = Math.max(0, Math.min(SLIDES.length - 1, idx));
    if (next !== state.slideIndex) {
      state.slideIndex = next;
      render();
    }
  }

  function toggleOverview(open) {
    const shouldOpen = typeof open === 'boolean' ? open : !els.overviewModal.classList.contains('is-open');
    els.overviewModal.classList.toggle('is-open', shouldOpen);
    els.overviewModal.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
  }

  function toggleFleet(force) {
    state.fleetVisible = typeof force === 'boolean' ? force : !state.fleetVisible;
    els.tacticalBackdrop.classList.toggle('is-hidden', !state.fleetVisible);
    els.btnFleet.classList.toggle('is-active', state.fleetVisible);
  }

  function applyTheme(nextTheme) {
    state.theme = nextTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    els.themeLabel.textContent = state.theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
    els.btnTheme.classList.toggle('is-active', state.theme === 'dark');
  }

  function toggleTheme() {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
    if (window.history && window.history.replaceState) {
      const themeParam = state.theme === 'dark' ? '&theme=dark' : '';
      window.history.replaceState(null, '', '#slide=' + state.slideIndex + themeParam);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () { });
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () { });
    }
  }

  // Event delegation inside slide viewport
  els.slideMount.addEventListener('click', function (e) {
    const goBtn = e.target.closest('[data-go-slide]');
    if (goBtn) {
      goToSlide(Number(goBtn.getAttribute('data-go-slide')));
      return;
    }

    const eraBtn = e.target.closest('[data-era]');
    if (eraBtn) {
      state.eraIndex = Number(eraBtn.getAttribute('data-era'));
      render();
      return;
    }

    const justifBtn = e.target.closest('[data-justif-sector]');
    if (justifBtn) {
      openSectorDetailModal(justifBtn.getAttribute('data-justif-sector'));
      return;
    }

    const stBtn = e.target.closest('[data-stakeholder]');
    if (stBtn) {
      state.stakeholderIndex = Number(stBtn.getAttribute('data-stakeholder'));
      render();
      return;
    }

    const secBtn = e.target.closest('[data-sector]');
    if (secBtn) {
      state.sectorIndex = Number(secBtn.getAttribute('data-sector'));
      render();
      return;
    }

    const secStep = e.target.closest('[data-sector-step]');
    if (secStep) {
      const delta = Number(secStep.getAttribute('data-sector-step'));
      const len = D.sectorsKpis.length;
      state.sectorIndex = (state.sectorIndex + delta + len) % len;
      render();
      return;
    }

    const openSecRow = e.target.closest('[data-open-sector]');
    if (openSecRow) {
      state.sectorIndex = Number(openSecRow.getAttribute('data-open-sector'));
      goToSlide(slideIndexById('kpi-explorer'));
      return;
    }

    const doubleBtn = e.target.closest('[data-double-salute]');
    if (doubleBtn) {
      fireTankSalute('¡Misión cumplida! Tablero 10/10 calibrado');
      fireArtillerySalvo('¡Salva final 155 mm AQAP-2110!');
      fireJetBoost('¡Pasada final sobre Düsseldorf! ✈️');
      fireBoxerReport('GTK Boxer 8×8 · Desfile completo OK');
      return;
    }

    const fireBtn = e.target.closest('[data-fire-tank]');
    if (fireBtn) {
      fireTankSalute(fireBtn.getAttribute('data-fire-tank'));
      fireArtillerySalvo();
    }
  });

  if (els.sectorDetailModal) {
    els.sectorDetailModal.addEventListener('click', function (e) {
      if (e.target === els.sectorDetailModal || e.target.closest('[data-close-detail]')) {
        closeSectorDetailModal();
        return;
      }
      const jumpBtn = e.target.closest('[data-jump-sector]');
      if (jumpBtn) {
        state.sectorIndex = Number(jumpBtn.getAttribute('data-jump-sector'));
        closeSectorDetailModal();
        goToSlide(slideIndexById('kpi-explorer'));
      }
    });
  }

  els.slideDots.addEventListener('click', function (e) {
    const dot = e.target.closest('[data-go-slide]');
    if (dot) goToSlide(Number(dot.getAttribute('data-go-slide')));
  });

  els.overviewGrid.addEventListener('click', function (e) {
    const tile = e.target.closest('[data-map-slide]');
    if (tile) {
      toggleOverview(false);
      goToSlide(Number(tile.getAttribute('data-map-slide')));
    }
  });

  els.btnPrev.addEventListener('click', function () { goToSlide(state.slideIndex - 1); });
  els.btnNext.addEventListener('click', function () { goToSlide(state.slideIndex + 1); });
  els.btnMap.addEventListener('click', function () { toggleOverview(true); });
  els.btnCloseMap.addEventListener('click', function () { toggleOverview(false); });
  els.btnFleet.addEventListener('click', function () { toggleFleet(); });
  els.btnTheme.addEventListener('click', toggleTheme);
  els.btnFullscreen.addEventListener('click', toggleFullscreen);
  els.tankStage.addEventListener('click', function () { fireTankSalute(); });
  if (els.jetStage) {
    els.jetStage.addEventListener('click', function () { fireJetBoost(); });
  }
  if (els.artilleryStage) {
    els.artilleryStage.addEventListener('click', function () { fireArtillerySalvo(); });
  }
  if (els.boxerStage) {
    els.boxerStage.addEventListener('click', function () { fireBoxerReport(); });
  }

  els.overviewModal.addEventListener('click', function (e) {
    if (e.target === els.overviewModal) toggleOverview(false);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    if (els.sectorDetailModal && els.sectorDetailModal.classList.contains('is-open')) {
      if (e.key === 'Escape') closeSectorDetailModal();
      return;
    }

    if (els.overviewModal.classList.contains('is-open')) {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'm') toggleOverview(false);
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      if (e.target && e.target.tagName === 'BUTTON' && e.key === ' ') return;
      e.preventDefault();
      goToSlide(state.slideIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goToSlide(state.slideIndex - 1);
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && SLIDES[state.slideIndex].id === 'kpi-explorer') {
      e.preventDefault();
      const len = D.sectorsKpis.length;
      state.sectorIndex = (state.sectorIndex + (e.key === 'ArrowDown' ? 1 : -1) + len) % len;
      render();
    } else if (e.key === 'Home') {
      goToSlide(0);
    } else if (e.key === 'End') {
      goToSlide(SLIDES.length - 1);
    } else if (e.key.toLowerCase() === 'm') {
      toggleOverview(true);
    } else if (e.key.toLowerCase() === 'f') {
      toggleFleet();
    } else if (e.key.toLowerCase() === 't') {
      toggleTheme();
    } else if (e.key.toLowerCase() === 'b') {
      fireTankSalute();
      fireArtillerySalvo();
      fireBoxerReport();
    }
  });

  // Touch swipe navigation
  let touchStartX = null;
  document.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (touchStartX == null || !e.changedTouches || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 55) {
      goToSlide(state.slideIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  applyTheme(state.theme);
  render();
})();
