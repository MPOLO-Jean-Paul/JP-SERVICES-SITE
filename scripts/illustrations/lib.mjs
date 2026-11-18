// Bibliothèque de dessin des illustrations JP-Services (personnages plats, palette de la marque).
const P = {
  red: '#FF4D3D', violet: '#7B4DFF', blue: '#2F5BFF', amber: '#FFB547', mint: '#1FA87A', mintLight: '#7FD8B4',
  navy: '#1E2340', ink: '#0B0D1A', cream: '#FFF6EA', lilac: '#F1EDFF', sky: '#EAF0FF', blush: '#FFEDEA',
  grey: '#E6E8F0', greyDark: '#B9BDCC', white: '#FFFFFF',
  skin: ['#5A3423', '#7A4A30', '#9A633F', '#C08457'], hair: '#1A1220',
};
const shade = (hex, f) => { // f<0 assombrit, f>0 éclaircit
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
const limb = (pts, w, c) => `<path d="M${pts.map(p => p.join(' ')).join(' L')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const curve = (d, w, c) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Tête de face : visage, oreilles, cheveux selon le style, traits discrets.
function head({ x, y, r = 30, skin, hair = 'afro', hairColor = P.hair, face = true, turn = 0 }) {
  const s = [];
  const back = {
    afro: `<circle cx="${x}" cy="${y - r * 0.28}" r="${r * 1.32}" fill="${hairColor}"/>`,
    bun: `<circle cx="${x}" cy="${y - r * 1.25}" r="${r * 0.5}" fill="${hairColor}"/>`,
    braids: `<path d="M${x - r * 1.05} ${y - r * 0.3} C${x - r * 1.25} ${y + r * 0.8} ${x - r * 1.2} ${y + r * 1.8} ${x - r * 0.95} ${y + r * 2.3} L${x - r * 0.45} ${y + r * 2.3} C${x - r * 0.7} ${y + r * 1.5} ${x - r * 0.7} ${y + r * 0.6} ${x - r * 0.55} ${y - r * 0.2}z M${x + r * 1.05} ${y - r * 0.3} C${x + r * 1.25} ${y + r * 0.8} ${x + r * 1.2} ${y + r * 1.8} ${x + r * 0.95} ${y + r * 2.3} L${x + r * 0.45} ${y + r * 2.3} C${x + r * 0.7} ${y + r * 1.5} ${x + r * 0.7} ${y + r * 0.6} ${x + r * 0.55} ${y - r * 0.2}z" fill="${hairColor}"/>`,
    short: '', fade: '',
  }[hair] ?? '';
  s.push(back);
  s.push(`<circle cx="${x - r * 0.98}" cy="${y + r * 0.12}" r="${r * 0.2}" fill="${shade(skin, -0.12)}"/><circle cx="${x + r * 0.98}" cy="${y + r * 0.12}" r="${r * 0.2}" fill="${shade(skin, -0.12)}"/>`);
  s.push(`<ellipse cx="${x}" cy="${y}" rx="${r * 0.95}" ry="${r * 1.05}" fill="${skin}"/>`);
  const top = {
    afro: `<path d="M${x - r * 1.05} ${y - r * 0.05} q-${r * 0.1} -${r * 1.15} ${r * 1.05} -${r * 1.2} q${r * 1.15} ${r * 0.05} ${r * 1.05} ${r * 1.2} q-${r * 0.2} -${r * 0.55} -${r * 0.55} -${r * 0.62} q-${r * 0.5} ${r * 0.18} -${r * 1.0} -${r * 0.05} q-${r * 0.35} ${r * 0.1} -${r * 0.55} ${r * 0.67}z" fill="${hairColor}"/>`,
    bun: `<path d="M${x - r * 0.98} ${y - r * 0.05} q0 -${r * 1.12} ${r * 0.98} -${r * 1.12} q${r * 0.98} 0 ${r * 0.98} ${r * 1.12} q-${r * 0.35} -${r * 0.55} -${r * 0.98} -${r * 0.62} q-${r * 0.63} ${r * 0.07} -${r * 0.98} ${r * 0.62}z" fill="${hairColor}"/>`,
    braids: `<path d="M${x - r * 1.0} ${y + r * 0.05} q0 -${r * 1.2} ${r} -${r * 1.2} q${r} 0 ${r} ${r * 1.2} q-${r * 0.3} -${r * 0.7} -${r} -${r * 0.75} q-${r * 0.7} ${r * 0.05} -${r} ${r * 0.75}z" fill="${hairColor}"/>`,
    short: `<path d="M${x - r * 0.95} ${y - r * 0.15} q${r * 0.05} -${r * 0.95} ${r * 0.95} -${r * 0.95} q${r * 0.9} 0 ${r * 0.95} ${r * 0.95} q-${r * 0.45} -${r * 0.45} -${r * 0.95} -${r * 0.45} q-${r * 0.5} 0 -${r * 0.95} ${r * 0.45}z" fill="${hairColor}"/>`,
    fade: `<path d="M${x - r * 0.95} ${y - r * 0.25} q${r * 0.1} -${r * 0.82} ${r * 0.95} -${r * 0.82} q${r * 0.85} 0 ${r * 0.95} ${r * 0.82} q-${r * 0.5} -${r * 0.3} -${r * 0.95} -${r * 0.3} q-${r * 0.45} 0 -${r * 0.95} ${r * 0.3}z" fill="${hairColor}"/>`,
  }[hair];
  s.push(top);
  if (face) {
    const ex = r * 0.34, ey = y + r * 0.08, dx = turn * r * 0.15;
    s.push(`<circle cx="${x - ex + dx}" cy="${ey}" r="${r * 0.075}" fill="${P.hair}" opacity=".85"/><circle cx="${x + ex + dx}" cy="${ey}" r="${r * 0.075}" fill="${P.hair}" opacity=".85"/>`);
    s.push(`<path d="M${x - r * 0.26 + dx} ${y + r * 0.42} q${r * 0.26} ${r * 0.24} ${r * 0.52} 0" fill="none" stroke="${shade(skin, -0.45)}" stroke-width="${r * 0.08}" stroke-linecap="round"/>`);
    s.push(`<ellipse cx="${x - r * 0.55 + dx}" cy="${y + r * 0.34}" rx="${r * 0.14}" ry="${r * 0.08}" fill="${P.red}" opacity=".18"/><ellipse cx="${x + r * 0.55 + dx}" cy="${y + r * 0.34}" rx="${r * 0.14}" ry="${r * 0.08}" fill="${P.red}" opacity=".18"/>`);
  }
  return s.join('');
}

// Buste (torse + cou + tête) de face, épaules arrondies.
function bust({ x, y, w = 120, h = 110, skin, shirt, collar, hair, hairColor, r = 30, face = true, pattern }) {
  const s = [];
  s.push(`<rect x="${x - r * 0.3}" y="${y - r * 0.3}" width="${r * 0.6}" height="${r * 0.6}" rx="${r * 0.2}" fill="${shade(skin, -0.12)}"/>`);
  s.push(`<path d="M${x - w / 2} ${y + h} V${y + w * 0.24} q0 -${w * 0.24} ${w * 0.26} -${w * 0.24} h${w * 0.48} q${w * 0.26} 0 ${w * 0.26} ${w * 0.24} V${y + h}z" fill="${shirt}"/>`);
  s.push(`<path d="M${x + w * 0.22} ${y} h${w * 0.02} q${w * 0.26} 0 ${w * 0.26} ${w * 0.24} V${y + h} h-${w * 0.2}z" fill="${shade(shirt, -0.1)}"/>`);
  if (pattern) s.push(pattern);
  if (collar) s.push(`<path d="M${x - r * 0.45} ${y} l${r * 0.45} ${r * 0.55} l${r * 0.45} -${r * 0.55}" fill="${collar}"/>`);
  else s.push(`<path d="M${x - r * 0.42} ${y} q${r * 0.42} ${r * 0.5} ${r * 0.84} 0z" fill="${shade(skin, -0.12)}"/>`);
  s.push(head({ x, y: y - r * 1.15, r, skin, hair, hairColor, face }));
  return s.join('');
}

const plant = (x, y, s = 1, c1 = P.mint, c2 = P.mintLight, pot = P.red) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 0 C-30 -20 -34 -62 -6 -86 C2 -56 4 -30 0 0z" fill="${c1}"/>
  <path d="M0 0 C26 -14 40 -50 22 -80 C8 -58 2 -30 0 0z" fill="${c2}"/>
  <path d="M0 0 C-14 -26 -46 -30 -60 -14 C-40 -6 -20 0 0 0z" fill="${c2}"/>
  <path d="M-22 0 h44 l-6 38 q-1 6 -7 6 h-18 q-6 0 -7 -6z" fill="${pot}"/></g>`;

const svg = (w, h, body, bg = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg}${body}</svg>`;
export { P, shade, limb, curve, head, bust, plant, svg };
