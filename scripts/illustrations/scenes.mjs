import { P, shade, limb, head, bust, plant, svg } from "./lib.mjs";

// 1. Apprendre où que vous soyez : assis en tailleur, ordinateur sur les genoux.
function apprendre() {
  const skin = P.skin[1];
  const b = [];
  b.push(`<circle cx="200" cy="200" r="190" fill="${P.lilac}"/>`);
  b.push(`<ellipse cx="200" cy="336" rx="130" ry="14" fill="${P.violet}" opacity=".10"/>`);
  b.push(plant(318, 300, 0.9));
  // jambes croisées
  b.push(limb([[128, 318], [204, 300]], 44, P.navy));
  b.push(limb([[272, 318], [196, 300]], 44, shade(P.navy, 0.12)));
  b.push(`<ellipse cx="118" cy="326" rx="20" ry="11" fill="${shade(skin, -0.1)}"/><ellipse cx="282" cy="326" rx="20" ry="11" fill="${shade(skin, -0.1)}"/>`);
  // torse (sweat violet)
  b.push(`<path d="M146 300 V214 q0 -34 34 -34 h40 q34 0 34 34 V300z" fill="${P.violet}"/>`);
  b.push(`<path d="M176 180 h48 l-6 18 q-18 10 -36 0z" fill="${shade(P.violet, -0.18)}"/>`);
  b.push(`<rect x="191" y="160" width="18" height="26" rx="6" fill="${shade(skin, -0.12)}"/>`);
  b.push(head({ x: 200, y: 136, r: 30, skin, hair: 'afro' }));
  // bras vers le clavier
  b.push(limb([[156, 208], [150, 258], [184, 280]], 24, shade(P.violet, -0.08)));
  b.push(limb([[244, 208], [250, 258], [216, 280]], 24, shade(P.violet, -0.08)));
  // ordinateur (dos de l'écran)
  b.push(`<rect x="138" y="232" width="124" height="80" rx="8" fill="${P.grey}"/><rect x="138" y="232" width="124" height="80" rx="8" fill="none" stroke="${P.greyDark}" stroke-width="2"/>`);
  b.push(`<rect x="191" y="263" width="6" height="16" rx="3" fill="${P.red}"/><rect x="199" y="257" width="6" height="22" rx="3" fill="${P.violet}"/><circle cx="210" cy="258" r="3" fill="${P.blue}"/>`);
  b.push(`<rect x="126" y="310" width="148" height="10" rx="5" fill="${P.greyDark}"/>`);
  // bulle de message
  b.push(`<g transform="translate(70 92)"><rect width="78" height="46" rx="14" fill="${P.white}"/><path d="M18 46 l-4 14 l16 -14z" fill="${P.white}"/><rect x="14" y="14" width="50" height="6" rx="3" fill="${P.violet}" opacity=".5"/><rect x="14" y="26" width="32" height="6" rx="3" fill="${P.violet}" opacity=".25"/></g>`);
  b.push(`<g transform="translate(276 104)"><circle r="20" fill="${P.amber}"/><path d="M-8 0 l5 6 l11 -12" fill="none" stroke="${P.white}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  return svg(400, 400, b.join(''));
}

// Avatars : bustes dans un cercle.
function avatar(i) {
  const confs = [
    { skin: P.skin[0], hair: 'short', shirt: P.blue, bg: P.sky },
    { skin: P.skin[2], hair: 'bun', shirt: P.red, bg: P.blush },
    { skin: P.skin[1], hair: 'braids', shirt: P.violet, bg: P.lilac },
    { skin: P.skin[3], hair: 'fade', shirt: P.amber, bg: P.cream },
    { skin: P.skin[1], hair: 'afro', shirt: P.mint, bg: '#E6F7F0' },
    { skin: P.skin[0], hair: 'bun', shirt: P.navy, bg: P.sky },
  ];
  const c = confs[i % confs.length];
  const body = `<defs><clipPath id="c${i}"><circle cx="100" cy="100" r="100"/></clipPath></defs><circle cx="100" cy="100" r="100" fill="${c.bg}"/><g clip-path="url(#c${i})">${bust({ x: 100, y: 146, w: 172, h: 80, skin: c.skin, shirt: c.shirt, hair: c.hair, r: 42 })}</g>`;
  return svg(200, 200, body);
}



const desk = (x1, x2, y, c = P.navy) => `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="12" rx="6" fill="${c}"/><rect x="${x1 + 16}" y="${y + 10}" width="10" height="${360 - y}" rx="4" fill="${shade(c, 0.15)}"/><rect x="${x2 - 26}" y="${y + 10}" width="10" height="${360 - y}" rx="4" fill="${shade(c, 0.15)}"/>`;
const laptopBack = (x, y, w = 96, h = 64) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${P.grey}" stroke="${P.greyDark}" stroke-width="2"/><g transform="translate(${x + w / 2 - 8} ${y + h / 2 - 10})"><rect width="5" height="13" y="7" rx="2.5" fill="${P.red}"/><rect x="7" width="5" height="20" rx="2.5" fill="${P.violet}"/><circle cx="16" cy="2" r="2.6" fill="${P.blue}"/></g>`;
const mug = (x, y, c = P.red) => `<g transform="translate(${x} ${y})"><rect width="26" height="30" rx="6" fill="${c}"/><path d="M26 8 q12 0 12 9 q0 9 -12 9" fill="none" stroke="${c}" stroke-width="5"/></g>`;

// 2. Un formateur à vos côtés : appel vidéo depuis le bureau.
function formateur() {
  const skin = P.skin[2];
  const b = [`<circle cx="200" cy="200" r="190" fill="${P.sky}"/>`, `<ellipse cx="200" cy="362" rx="140" ry="12" fill="${P.blue}" opacity=".10"/>`];
  b.push(plant(334, 318, 0.85, P.mint, P.mintLight, P.violet));
  // personne derrière le bureau
  b.push(bust({ x: 158, y: 198, w: 118, h: 70, skin, shirt: P.amber, hair: 'braids', r: 28 }));
  b.push(limb([[112, 232], [118, 262], [170, 262]], 20, shade(P.amber, -0.1)));
  b.push(desk(70, 330, 262));
  b.push(laptopBack(168, 200, 92, 62));
  b.push(mug(96, 232, P.red));
  // fenêtre de visioconférence avec le formateur
  b.push(`<g transform="translate(228 58)"><rect width="128" height="110" rx="14" fill="${P.white}" stroke="${P.grey}" stroke-width="2"/>
    <defs><clipPath id="vw"><rect x="8" y="8" width="112" height="72" rx="9"/></clipPath></defs>
    <rect x="8" y="8" width="112" height="72" rx="9" fill="${P.lilac}"/>
    <g clip-path="url(#vw)">${bust({ x: 64, y: 70, w: 70, h: 30, skin: P.skin[0], shirt: P.blue, hair: 'short', r: 17 })}</g>
    <circle cx="44" cy="94" r="7" fill="${P.red}"/><circle cx="64" cy="94" r="7" fill="${P.grey}"/><circle cx="84" cy="94" r="7" fill="${P.grey}"/>
    <circle cx="22" cy="20" r="4" fill="${P.red}"/></g>`);
  b.push(`<path d="M246 176 q-20 20 -10 34" fill="none" stroke="${P.blue}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`);
  return svg(400, 400, b.join(''));
}

// Personnage debout de face.
function standing({ x, top, skin, shirt, pants, hair, armL, armR, shoes = P.ink }) {
  const s = [];
  const hip = top + 150;
  s.push(limb([[x - 14, hip], [x - 16, top + 236]], 22, pants));
  s.push(limb([[x + 14, hip], [x + 16, top + 236]], 22, shade(pants, 0.12)));
  s.push(`<ellipse cx="${x - 22}" cy="${top + 244}" rx="17" ry="8" fill="${shoes}"/><ellipse cx="${x + 22}" cy="${top + 244}" rx="17" ry="8" fill="${shoes}"/>`);
  if (armL) s.push(limb(armL, 18, shade(shirt, -0.08)));
  s.push(`<path d="M${x - 36} ${hip + 6} V${top + 86} q0 -22 22 -22 h28 q22 0 22 22 V${hip + 6}z" fill="${shirt}"/>`);
  s.push(`<path d="M${x + 16} ${top + 64} q20 0 20 22 V${hip + 6} h-14z" fill="${shade(shirt, -0.1)}"/>`);
  if (armR) s.push(limb(armR, 18, shade(shirt, -0.08)));
  s.push(`<rect x="${x - 8}" y="${top + 50}" width="16" height="18" rx="5" fill="${shade(skin, -0.12)}"/>`);
  s.push(head({ x, y: top + 30, r: 24, skin, hair }));
  return s.join('');
}
const hand = (x, y, skin) => `<circle cx="${x}" cy="${y}" r="9" fill="${skin}"/>`;

// 3. Un projet concret à la clé : deux personnes devant un tableau de projet.
function projet() {
  const b = [`<circle cx="200" cy="200" r="190" fill="${P.blush}"/>`, `<ellipse cx="200" cy="358" rx="140" ry="12" fill="${P.red}" opacity=".10"/>`];
  // tableau
  b.push(`<g transform="translate(112 56)"><rect width="176" height="128" rx="12" fill="${P.white}" stroke="${P.grey}" stroke-width="2"/>
    ${[0, 1, 2].map(c => `<rect x="${12 + c * 56}" y="14" width="40" height="6" rx="3" fill="${P.greyDark}"/>` + [0, 1, 2].slice(0, 3 - (c === 2 ? 1 : 0)).map(r => `<rect x="${10 + c * 56}" y="${30 + r * 30}" width="44" height="22" rx="5" fill="${[P.red, P.violet, P.blue][c]}" opacity="${0.25 + r * 0.25}"/>`).join('')).join('')}
</g>`);
  b.push(`<rect x="196" y="184" width="8" height="40" fill="${P.greyDark}"/>`);
  // à gauche : montre le tableau
  b.push(standing({ x: 118, top: 110, skin: P.skin[1], shirt: P.violet, pants: P.navy, hair: 'fade', armL: [[96, 184], [84, 230]], armR: [[140, 184], [166, 150], [176, 128]] }));
  b.push(hand(84, 234, P.skin[1]) + hand(178, 124, P.skin[1]));
  // à droite : tient une tablette
  b.push(standing({ x: 282, top: 114, skin: P.skin[3], shirt: P.red, pants: shade(P.navy, 0.2), hair: 'bun', armL: [[260, 188], [256, 226], [276, 228]], armR: [[304, 188], [308, 226], [290, 228]] }));
  b.push(`<rect x="262" y="210" width="40" height="30" rx="5" fill="${P.navy}"/><rect x="266" y="214" width="32" height="22" rx="3" fill="${P.sky}"/>`);
  b.push(hand(270, 230, P.skin[3]) + hand(296, 230, P.skin[3]));
  return svg(400, 400, b.join(''));
}

// 4. Héros : apprenante à sa table, marches de la marque en arrière-plan.
function hero() {
  const skin = P.skin[1];
  const b = [];
  // marches (motif du logo), estompées vers le bas
  b.push(`<defs><linearGradient id="hf" x1="0" y1="0" x2="0" y2="1"><stop offset=".62" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="hm"><rect width="600" height="520" fill="url(#hf)"/></mask></defs>`);
  b.push(`<g mask="url(#hm)"><rect x="96" y="250" width="88" height="300" rx="44" fill="${P.red}"/><rect x="208" y="140" width="88" height="410" rx="44" fill="${P.violet}"/><rect x="320" y="30" width="88" height="520" rx="44" fill="${P.blue}"/></g>`);
  b.push(`<circle cx="462" cy="70" r="36" fill="${P.blue}"/>`);
  // personnage
  b.push(bust({ x: 300, y: 300, w: 190, h: 120, skin, shirt: P.amber, hair: 'bun', r: 46 }));
  b.push(limb([[220, 350], [226, 404], [300, 410]], 30, shade(P.amber, -0.1)));
  b.push(limb([[380, 350], [374, 404], [330, 410]], 30, shade(P.amber, -0.12)));
  // table et ordinateur
  b.push(`<rect x="120" y="412" width="400" height="16" rx="8" fill="${P.navy}"/><rect x="180" y="426" width="12" height="94" rx="5" fill="${shade(P.navy, 0.15)}"/><rect x="448" y="426" width="12" height="94" rx="5" fill="${shade(P.navy, 0.15)}"/>`);
  b.push(laptopBack(236, 316, 140, 96));
  b.push(mug(150, 374, P.blue));
  b.push(plant(500, 412, 1.05, P.mint, P.mintLight, P.red));
  return svg(600, 520, b.join(''));
}

// Vignettes des domaines (objets, sans personnage) 300×220.
function domFormation() {
  return svg(300, 220, `<rect width="300" height="220" rx="24" fill="${P.lilac}"/>
    <rect x="58" y="44" width="184" height="118" rx="12" fill="${P.navy}"/><rect x="68" y="54" width="164" height="88" rx="6" fill="${P.violet}"/>
    <circle cx="150" cy="98" r="22" fill="#fff" opacity=".95"/><path d="M144 88 v20 l17 -10z" fill="${P.violet}"/>
    <rect x="68" y="148" width="164" height="5" rx="2.5" fill="#ffffff" opacity=".25"/><rect x="68" y="148" width="96" height="5" rx="2.5" fill="${P.amber}"/>
    <rect x="132" y="162" width="36" height="16" fill="${P.navy}"/><rect x="104" y="176" width="92" height="8" rx="4" fill="${P.navy}"/>
    <g transform="translate(206 26) rotate(12)"><path d="M0 18 L34 4 L68 18 L34 32z" fill="${P.ink}"/><path d="M14 24 v14 q20 12 40 0 v-14 l-20 8z" fill="${P.ink}"/><path d="M62 20 v20" stroke="${P.amber}" stroke-width="3"/><circle cx="62" cy="42" r="4" fill="${P.amber}"/></g>`);
}
function domLogiciels() {
  return svg(300, 220, `<rect width="300" height="220" rx="24" fill="${P.sky}"/>
    <g transform="translate(40 40)"><rect width="170" height="118" rx="12" fill="#fff" stroke="${P.grey}" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="${P.red}"/><circle cx="30" cy="16" r="4" fill="${P.amber}"/><circle cx="44" cy="16" r="4" fill="${P.mint}"/>
      <rect x="12" y="32" width="44" height="74" rx="6" fill="${P.sky}"/><rect x="66" y="32" width="92" height="10" rx="5" fill="${P.grey}"/><rect x="66" y="50" width="70" height="10" rx="5" fill="${P.grey}"/><rect x="66" y="74" width="92" height="32" rx="6" fill="${P.blue}" opacity=".85"/></g>
    <g transform="translate(150 86)"><rect width="110" height="84" rx="12" fill="${P.navy}"/><rect x="12" y="16" width="40" height="6" rx="3" fill="${P.violet}"/><rect x="12" y="30" width="70" height="6" rx="3" fill="#fff" opacity=".35"/><rect x="22" y="44" width="56" height="6" rx="3" fill="${P.amber}" opacity=".9"/><rect x="12" y="58" width="44" height="6" rx="3" fill="#fff" opacity=".35"/></g>
    <g transform="translate(236 40)"><circle r="20" fill="${P.blue}"/><path d="M0 -9 v14 M-7 0 l7 7 l7 -7" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`);
}
function domProjets() {
  return svg(300, 220, `<rect width="300" height="220" rx="24" fill="${P.blush}"/>
    <g transform="translate(46 34)"><rect width="208" height="140" rx="12" fill="#fff" stroke="${P.grey}" stroke-width="2"/>
    ${[0, 1, 2].map(c => `<rect x="${14 + c * 66}" y="14" width="30" height="6" rx="3" fill="${P.greyDark}"/>` + [0, 1].map(r => `<rect x="${12 + c * 66}" y="${30 + r * 36}" width="52" height="28" rx="6" fill="${[P.red, P.violet, P.blue][c]}" opacity="${0.3 + r * 0.35}"/>`).join('')).join('')}
    <rect x="12" y="104" width="184" height="6" rx="3" fill="${P.grey}"/><rect x="12" y="104" width="120" height="6" rx="3" fill="${P.mint}"/></g>
    <g transform="translate(232 160)"><circle r="22" fill="${P.mint}"/><path d="M-9 0 l6 7 l12 -14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g transform="translate(36 150) rotate(-35)"><rect width="70" height="12" rx="3" fill="${P.amber}"/><path d="M70 0 l14 6 l-14 6z" fill="${P.cream}"/><rect x="-10" width="12" height="12" rx="3" fill="${P.red}"/></g>`);
}

// SCOLIA Pro : secrétariat scolaire — école, reçu et tableau de bord.
function scolia() {
  const b = [`<rect width="560" height="340" rx="28" fill="${P.sky}"/>`];
  // école
  b.push(`<g transform="translate(40 92)"><path d="M0 70 L110 14 L220 70z" fill="${P.violet}"/><rect x="14" y="70" width="192" height="150" fill="#fff" stroke="${P.grey}" stroke-width="2"/>
    ${[0, 1, 2].map(i => `<rect x="${32 + i * 56}" y="92" width="40" height="34" rx="5" fill="${P.sky}"/><rect x="${32 + i * 56}" y="140" width="40" height="34" rx="5" fill="${P.sky}"/>`).join('')}
    <rect x="92" y="176" width="36" height="44" rx="6" fill="${P.navy}"/><circle cx="110" cy="46" r="13" fill="#fff"/><path d="M110 38 v8 l6 4" stroke="${P.violet}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="0" y="218" width="220" height="10" rx="5" fill="${P.navy}"/></g>`);
  // tableau de bord
  b.push(`<g transform="translate(286 54)"><rect width="234" height="176" rx="16" fill="#fff" stroke="${P.grey}" stroke-width="2"/>
    <rect x="16" y="16" width="64" height="44" rx="8" fill="${P.lilac}"/><rect x="88" y="16" width="64" height="44" rx="8" fill="${P.blush}"/><rect x="160" y="16" width="58" height="44" rx="8" fill="#E6F7F0"/>
    <rect x="26" y="28" width="30" height="6" rx="3" fill="${P.violet}"/><rect x="26" y="42" width="40" height="8" rx="4" fill="${P.navy}"/>
    <rect x="98" y="28" width="30" height="6" rx="3" fill="${P.red}"/><rect x="98" y="42" width="40" height="8" rx="4" fill="${P.navy}"/>
    <rect x="170" y="28" width="30" height="6" rx="3" fill="${P.mint}"/><rect x="170" y="42" width="34" height="8" rx="4" fill="${P.navy}"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${22 + i * 34}" y="${150 - (30 + i * 12)}" width="20" height="${30 + i * 12}" rx="6" fill="${i === 5 ? P.blue : P.sky}"/>`).join('')}
    <rect x="16" y="154" width="202" height="4" rx="2" fill="${P.grey}"/></g>`);
  // reçu
  b.push(`<g transform="translate(250 196) rotate(-6)"><path d="M0 0 h110 v116 l-11 -7 l-11 7 l-11 -7 l-11 7 l-11 -7 l-11 7 l-11 -7 l-11 7 l-11 -7 l-11 7z" fill="#fff" stroke="${P.grey}" stroke-width="2"/>
    <rect x="14" y="16" width="56" height="7" rx="3.5" fill="${P.navy}"/><rect x="14" y="34" width="82" height="5" rx="2.5" fill="${P.grey}"/><rect x="14" y="46" width="70" height="5" rx="2.5" fill="${P.grey}"/><rect x="14" y="58" width="82" height="5" rx="2.5" fill="${P.grey}"/>
    <rect x="14" y="78" width="40" height="9" rx="4.5" fill="${P.violet}"/><circle cx="84" cy="84" r="12" fill="${P.mint}"/><path d="M79 84 l4 4 l7 -8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  b.push(plant(500, 300, 0.7, P.mint, P.mintLight, P.red));
  return svg(560, 340, b.join(''));
}
export { apprendre, avatar, formateur, projet, hero, domFormation, domLogiciels, domProjets, scolia };
