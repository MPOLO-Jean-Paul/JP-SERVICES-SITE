/**
 * Affiche publicitaire SCOLIA Pro (A4 300 ppp + PDF, et format réseaux sociaux 1080 × 1350).
 * Prérequis dans ce dossier : qr.svg (QR vers https://jp-services.org/scolia) et geist.woff2.
 * Usage : node scripts/affiches/scolia-pro.cjs public/brand/affiches
 */
/* eslint-disable @typescript-eslint/no-require-imports -- script Node autonome (CommonJS) */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const S = __dirname; // qr.svg et geist.woff2 sont lus depuis ce dossier
const read = (p) => fs.readFileSync(p, 'utf8');
const logo = read('/home/user/JP-SERVICES-SITE/public/brand/jp-services-symbole.svg').replace('<title>JP-Services</title>', '');
const scolia = read('/home/user/JP-SERVICES-SITE/public/illustrations/scolia-gestion.svg');
const qr = read(S + '/qr.svg');
const font = fs.readFileSync(S + '/geist.woff2').toString('base64');
const WA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.3 5.3 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3c.2-.6.2-1.1.2-1.3l-.6-.3z"/></svg>';
const ic = {
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/></svg>',
  cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 10v4M18 10v4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6M9 11h6"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
};
const features = [
  ['users', 'blue', 'Apprenants et inscriptions', 'Dossiers, classes, présences et suivi de chaque élève.'],
  ['cash', 'red', 'Caisse et recouvrement', 'Encaissements, reçus numérotés et suivi des frais impayés.'],
  ['book', 'violet', 'Notes et bulletins', 'Évaluations, bulletins et cartes d’examen en quelques clics.'],
  ['chart', 'mint', 'Personnel, paie et rapports', 'Gestion du personnel, salaires et tableaux de bord.'],
];
const perks = ['Fonctionne hors ligne', 'Plusieurs postes en réseau', 'Sauvegardes sécurisées', 'Formation de votre équipe'];
const tones = { blue: ['#2f5bff', '#eaf0ff'], red: ['#ff4d3d', '#ffedea'], violet: ['#7b4dff', '#f1edff'], mint: ['#13916a', '#e6f7f0'] };

const css = (w, h) => `
@font-face { font-family: Geist; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${w}px; height: ${h}px; }
body { font-family: Geist, Inter, 'Segoe UI', Arial, sans-serif; color: #0b0d1a; background: #fff; -webkit-font-smoothing: antialiased; }
.poster { position: relative; width: ${w}px; height: ${h}px; overflow: hidden; display: flex; flex-direction: column; background: #f6f7fb; }
.top { position: relative; flex: 0 0 auto; padding: 36px 54px 0; color: #fff; background: radial-gradient(120% 90% at 85% 0%, #24408f 0%, #13255a 38%, #0b1935 75%); overflow: hidden; }
.top::before, .top::after { content: ""; position: absolute; border-radius: 999px; border: 1px solid rgba(181,200,255,.16); }
.top::before { width: 620px; height: 620px; right: -220px; top: -260px; }
.top::after { width: 420px; height: 420px; right: -120px; top: -160px; }
.brand { position: relative; display: flex; align-items: center; justify-content: space-between; }
.brand-logo { display: flex; align-items: center; gap: 12px; }
.brand-logo .mark { width: 54px; height: 54px; padding: 8px; border-radius: 16px; background: #fff; }
.brand-logo .mark svg { width: 100%; height: 100%; }
.brand-logo span { font-size: 14px; font-weight: 600; color: rgba(255,255,255,.75); letter-spacing: .01em; line-height: 1.3; }
.brand-logo b { display: block; color: #fff; font-size: 15px; font-weight: 700; }
.pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); font-size: 13px; font-weight: 600; color: #dbe4ff; }
.pill i { width: 8px; height: 8px; border-radius: 999px; background: #4ade80; box-shadow: 0 0 0 4px rgba(74,222,128,.18); }
.kicker { position: relative; margin-top: 24px; color: #9fb6ff; font-size: 17px; font-weight: 650; letter-spacing: .02em; }
h1 { position: relative; margin-top: 4px; font-size: 80px; line-height: .95; font-weight: 750; letter-spacing: -.055em; }
h1 em { font-style: normal; background: linear-gradient(90deg, #ff6b5d, #9a7bff 45%, #6f8fff); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lead { position: relative; margin-top: 12px; max-width: 580px; font-size: 19px; line-height: 1.45; color: rgba(255,255,255,.82); }
.visual { position: relative; display: flex; align-items: center; justify-content: center; height: 222px; margin: 22px 0 0; padding: 16px 16px 0; border-radius: 28px 28px 0 0; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-bottom: 0; overflow: hidden; }
.visual svg { display: block; height: 100%; width: auto; max-width: 100%; border-radius: 20px 20px 0 0; }
.body { padding: 20px 54px 0; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.features { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.feature { display: flex; gap: 12px; align-items: flex-start; padding: 13px 14px; border-radius: 18px; background: #fff; border: 1px solid #e6e8f0; }
.feature .ico { flex: 0 0 auto; width: 40px; height: 40px; border-radius: 13px; display: grid; place-items: center; }
.feature .ico svg { width: 22px; height: 22px; }
.feature b { display: block; font-size: 16px; font-weight: 700; letter-spacing: -.01em; }
.feature p { margin-top: 2px; font-size: 12.5px; line-height: 1.45; color: #4a4f63; }
.perks { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
.perks span { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px 7px 8px; border-radius: 999px; background: #eaf0ff; color: #1f2d6b; font-size: 13.5px; white-space: nowrap; font-weight: 600; }
.perks span i { width: 18px; height: 18px; border-radius: 999px; background: #2f5bff; color: #fff; display: grid; place-items: center; }
.perks span i svg { width: 12px; height: 12px; }
.cta { margin-top: auto; margin-bottom: 0; }
.cta-title { margin-top: 16px; font-size: 23px; font-weight: 750; letter-spacing: -.03em; }
.cta-title em { font-style: normal; color: #2f5bff; }
.contact { margin-top: 10px; display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: stretch; padding: 16px; border-radius: 24px; background: #0b1935; color: #fff; }
.lines { display: grid; gap: 8px; align-content: center; }
.line { display: flex; align-items: center; gap: 14px; }
.line .ci { flex: 0 0 auto; width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; }
.line .ci svg { width: 21px; height: 21px; }
.line small { display: block; font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,.6); }
.line strong { display: block; font-size: 20px; font-weight: 700; letter-spacing: -.01em; }
.wa .ci { background: #25d366; color: #fff; } .ml .ci { background: #2f5bff; color: #fff; } .web .ci { background: #fff; color: #0b1935; }
.qr { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 18px; background: #fff; color: #0b0d1a; }
.qr svg { width: 112px; height: 112px; display: block; }
.qr span { font-size: 12px; font-weight: 700; text-align: center; line-height: 1.25; }
.foot { margin: 10px 0 18px; display: flex; justify-content: space-between; font-size: 13px; color: #5b6072; font-weight: 550; }
.foot b { color: #0b0d1a; }
`;

const html = (w, h, variant) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css(w, h)}${variant === 'social' ? `
h1 { font-size: 76px; } .top { padding: 32px 50px 0; } .kicker { margin-top: 20px; } .lead { font-size: 18px; } .visual { margin-top: 18px; height: 262px; } .body { padding: 16px 50px 0; } .feature p { display: none; } .feature { align-items: center; padding: 11px 12px; } .perks { margin-top: 10px; } .cta-title { margin-top: 12px; font-size: 21px; } .foot { margin: 8px 0 14px; }
` : ''}</style></head><body>
<div class="poster">
  <section class="top">
    <div class="brand">
      <div class="brand-logo"><span class="mark">${logo}</span><span>Un logiciel<b>JP-Services</b></span></div>
      <span class="pill"><i></i>Démonstration sur demande</span>
    </div>
    <p class="kicker">Logiciel de gestion scolaire</p>
    <h1>SCOLIA <em>Pro</em></h1>
    <p class="lead">Toute la gestion de votre établissement dans un seul logiciel&nbsp;: simple, fiable et pensé pour les écoles de la RDC.</p>
    <div class="visual">${scolia}</div>
  </section>
  <section class="body">
    <div class="features">${features.map(([i, t, title, text]) => `<div class="feature"><span class="ico" style="background:${tones[t][1]};color:${tones[t][0]}">${ic[i]}</span><div><b>${title}</b><p>${text}</p></div></div>`).join('')}</div>
    <div class="perks">${perks.map((p) => `<span><i>${ic.check}</i>${p}</span>`).join('')}</div>
    <div class="cta">
      <p class="cta-title">Demandez votre <em>démonstration</em> dès aujourd’hui.</p>
      <div class="contact">
        <div class="lines">
          <div class="line wa"><span class="ci">${WA}</span><div><small>WhatsApp</small><strong>+243 860 951 131</strong></div></div>
          <div class="line ml"><span class="ci">${ic.mail}</span><div><small>E-mail</small><strong>contact@jp-services.org</strong></div></div>
          <div class="line web"><span class="ci">${ic.globe}</span><div><small>Site web</small><strong>jp-services.org/scolia</strong></div></div>
        </div>
        <div class="qr">${qr}<span>Scannez pour<br>découvrir SCOLIA Pro</span></div>
      </div>
      <p class="foot"><span><b>JP-Services</b> · Lubumbashi, RDC</span><span>Ensemble pour une jeunesse rénovée</span></p>
    </div>
  </section>
</div></body></html>`;

(async () => {
  const out = process.argv[2];
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  // A4 portrait : 794 × 1123 px CSS (96 ppp) → PNG 300 ppp et PDF vectoriel
  const a4 = html(794, 1123, 'a4');
  fs.writeFileSync(path.join(out, 'affiche-scolia-pro-a4.html'), a4);
  let p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 3.125 });
  await p.setContent(a4, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(out, 'affiche-scolia-pro-a4.png') });
  console.log('débordement A4', await p.evaluate(() => { const b = document.querySelector('.body'); return b.scrollHeight - b.clientHeight; }));
  await p.pdf({ path: path.join(out, 'affiche-scolia-pro-a4.pdf'), width: '210mm', height: '297mm', printBackground: true, pageRanges: '1' });
  // Réseaux sociaux (WhatsApp, Facebook, Instagram) : 1080 × 1350
  const soc = html(864, 1080, 'social');
  p = await b.newPage({ viewport: { width: 864, height: 1080 }, deviceScaleFactor: 1.25 });
  await p.setContent(soc, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(out, 'affiche-scolia-pro-reseaux.png') });
  // Vérification : rien ne déborde
  console.log('débordement réseaux', await p.evaluate(() => { const b = document.querySelector('.body'); return b.scrollHeight - b.clientHeight; }));
  await b.close();
})();
