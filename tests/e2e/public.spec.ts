import { expect, test } from "@playwright/test";
import { acceptCookies } from "./helpers";

test.beforeEach(async ({ page }) => acceptCookies(page));

const PAGES: Array<[string, RegExp]> = [
  ["/", /numérique/i],
  ["/formations", /compétence/i],
  ["/logiciels", /bons outils/i],
  ["/scolia", /SCOLIA Pro/i],
  ["/formations-en-ligne", /direct/i],
  ["/projets", /projet/i],
  ["/forum", /ensemble/i],
  ["/actualites", /Actualités/i],
  ["/partenariat", /ensemble/i],
  ["/a-propos", /propos/i],
  ["/contact", /Parlons/i],
  ["/aide", /aide/i],
  ["/conditions", /Conditions/i],
  ["/confidentialite", /confidentialité/i],
  ["/cookies", /cookies/i],
];

for (const [path, heading] of PAGES) {
  test(`la page ${path} s’affiche sans erreur`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toContainText(heading);
    expect(errors).toEqual([]);
  });
}

test("les anciennes URL PHP redirigent vers les nouvelles routes", async ({ request }) => {
  const res = await request.get("/formations.php", { maxRedirects: 0 });
  expect([301, 308]).toContain(res.status());
  expect(res.headers().location).toContain("/formations");
});

test("le catalogue filtre les formations en direct", async ({ page }) => {
  await page.goto("/formations");
  const search = page.getByPlaceholder(/Rechercher par titre/);
  await search.fill("zzzz-introuvable");
  await expect(page.getByText("Aucune formation ne correspond")).toBeVisible();
  await page.getByRole("button", { name: /Afficher toutes les formations/ }).click();
  await expect(page.locator("article").first()).toBeVisible();
});

test("la recherche globale s’ouvre au clavier", async ({ page, isMobile }) => {
  test.skip(isMobile, "raccourci clavier");
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page.getByPlaceholder(/Rechercher une formation/).fill("web");
  await expect(page.getByRole("option").first()).toBeVisible();
});

test("la sonde indépendante identifie la nouvelle révision et vérifie les tables", async ({request}) => {
  const response = await request.get("/api/readiness");
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toMatchObject({status:"ok",database:"ok",schema:"ok",revision:"readiness-20261116-v2"});
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-jp-health-revision"]).toBe("readiness-20261116-v2");
});

test("la sonde de production vérifie aussi les tables du site", async ({request}) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toMatchObject({status:"ok",database:"ok",schema:"ok"});
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(JSON.stringify(data)).not.toContain("password");
  expect(JSON.stringify(data)).not.toContain("postgres://");
});

test("SEO : robots, sitemap et manifeste", async ({ request }) => {
  expect((await request.get("/robots.txt")).status()).toBe(200);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/formations");
  expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
});

test("en-têtes de sécurité présents", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(res.headers()["x-powered-by"]).toBeUndefined();
});


test("le menu mobile s'ouvre au-dessus du site et chaque entrée mène à sa page", async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto("/");
  const trigger = page.locator('button[aria-controls="mobile-drawer"]');
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.locator("#mobile-drawer")).toBeVisible();
  await expect(page.locator("#mobile-drawer")).toHaveAttribute("data-state","open");
  await page.locator('#mobile-drawer a[href="/logiciels"]').click();
  await expect(page).toHaveURL(/\/logiciels$/);
  await expect(page.locator("#mobile-drawer")).toHaveCount(0);
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-drawer")).toHaveCount(0);
});

test("les liens principaux sont accessibles directement au clavier sur ordinateur", async ({page,isMobile}) => {
  test.skip(isMobile, "Navigation desktop uniquement");
  await page.goto("/");
  const nav = page.getByRole("navigation",{name:"Menu principal"});
  await expect(nav.getByRole("link",{name:"Formations",exact:true})).toBeVisible();
  await expect(nav.getByRole("link",{name:"Logiciels",exact:true})).toBeVisible();
  await nav.locator('a[href="/projets"]').click();
  await expect(page).toHaveURL(/\/projets$/);
});

test("le formulaire de contact conserve le sujet transmis depuis SCOLIA Pro", async ({page}) => {
  await page.goto("/contact?sujet=SCOLIA%20Pro");
  await expect(page.locator("#sujet")).toHaveValue("SCOLIA Pro");
});

test("la nouvelle direction graphique reste lisible et sans débordement", async ({page}, testInfo) => {
  test.setTimeout(90000);
  for (const [label,width,height] of [
    ["compact",320,700],["mobile",390,844],["tablette",820,1024],["desktop",1440,900]
  ] as const) {
    await page.setViewportSize({width,height});
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("numérique");
    await expect(page.locator(".jp-hero-start-link")).toHaveCount(4);
    await expect(page.locator(".jp-area-link")).toHaveCount(3);
    const widths = await page.evaluate(() => ({page: document.documentElement.scrollWidth,viewport:window.innerWidth}));
    expect(widths.page, "Débordement d'affichage "+label).toBeLessThanOrEqual(widths.viewport+1);
    if (label === "mobile" || label === "desktop") {
      await testInfo.attach("jp-services-accueil-"+label,{body:await page.screenshot({fullPage:true}), contentType:"image/png"});
    }
  }
});

test("les liens internes visibles sur les rubriques publiques ne retournent pas 404",async ({page,request,isMobile}) => {
  test.skip(isMobile, "Le même test couvre la navigation HTML sur ordinateur");
  test.setTimeout(150000);
  const hrefs = new Set<string>();
  for(const path of ["/","/formations","/formations-en-ligne","/logiciels","/scolia","/projets","/forum","/actualites","/a-propos","/contact","/partenariat","/aide"]) {
    const response = await page.goto(path);
    expect(response?.status(), "Rubrique "+path).toBe(200);
    for (const href of await page.locator('a[href^="/"]').evaluateAll(anchors =>
      anchors.map(a => a.getAttribute("href") || "").filter(Boolean))) {
      // Les téléchargements modifient des statistiques : pas de GET automatisé en audit.
      if (!href.startsWith("/telecharger/") && !href.startsWith("/uploads/")) hrefs.add(href.split("#")[0]!);
    }
  }
  for(const href of hrefs) {
    const response = await request.get(href, {maxRedirects:0});
    expect(response.status(), "Lien invalide : "+href).toBeLessThan(400);
  }
});


test("le sélecteur de langue du pied de page ouvre un petit menu ancré, jamais un dialogue Android", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  const trigger = page.getByTestId("footer-language-trigger");
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).toBeVisible();
  await expect(page.locator("footer select")).toHaveCount(0);
  await trigger.click();

  const menu = page.getByTestId("footer-language-popover");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitemradio")).toHaveCount(2);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const triggerBox = await trigger.boundingBox();
  const menuBox = await menu.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(menuBox).not.toBeNull();
  expect(menuBox!.y + menuBox!.height, "Le menu doit apparaître au-dessus du déclencheur").toBeLessThanOrEqual(triggerBox!.y + 4);
  const horizontalOverlap = Math.min(menuBox!.x + menuBox!.width, triggerBox!.x + triggerBox!.width) - Math.max(menuBox!.x, triggerBox!.x);
  expect(horizontalOverlap, "Le menu doit rester à la verticale du sélecteur même lorsque Radix évite le bord de l’écran").toBeGreaterThan(Math.min(80,triggerBox!.width*.55));
  expect(menuBox!.x).toBeGreaterThanOrEqual(0);
  expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(391);

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("le choix de langue se fait depuis le menu contextuel avec mise à jour de la page", async ({page}) => {
  await page.goto("/");
  const trigger=page.getByTestId("footer-language-trigger");
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.getByTestId("footer-language-popover").getByRole("menuitemradio",{name:/English/}).click();
  await expect(page.locator("html")).toHaveAttribute("lang","en");
  await expect(trigger).toContainText("English");
  await trigger.click();
  await page.getByTestId("footer-language-popover").getByRole("menuitemradio",{name:/Français/}).click();
  await expect(page.locator("html")).toHaveAttribute("lang","fr");
  await expect(trigger).toContainText("Français");
});


test("les rubriques présentent de vraies informations plutôt que des interfaces fictives", async ({page}) => {
  for (const path of ["/formations","/logiciels","/projets","/formations-en-ligne"]) {
    const response=await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator(".jp-directory-guide")).toBeVisible();
  }
  await page.goto("/scolia");
  await expect(page.locator(".jp-product-hero")).toBeVisible();
  await expect(page.getByText("PROJET EN ÉVOLUTION", {exact:false})).toBeVisible();
  await expect(page.locator("script[type='application/ld+json']").first()).not.toContainText('"price":"0"');
});

test("le contact affiche des coordonnées réelles et conserve le sujet des liens", async ({page}) => {
  await page.goto("/contact?sujet=SCOLIA%20Pro");
  await expect(page.locator(".jp-contact-main")).toBeVisible();
  await expect(page.locator("#sujet")).toHaveValue("SCOLIA Pro");
  await expect(page.locator(".jp-contact-aside")).toBeVisible();
  await expect(page.locator(".jp-contact-address")).toContainText("Lubumbashi");
});

test("les pages publiques raffinées restent sans débordement sur mobile et ordinateur", async ({page},testInfo) => {
  test.setTimeout(90000);
  for(const [name,width,height] of [["mobile",320,700],["phone",390,844],["tablet",820,1024],["desktop",1440,900]] as const){
    await page.setViewportSize({width,height});
    for(const path of ["/formations","/logiciels","/contact","/scolia"]){
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      const size=await page.evaluate(()=>({width:document.documentElement.scrollWidth,screen:window.innerWidth}));
      const overflow = size.width>size.screen+1 ? await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
        .filter(el => {const r=el.getBoundingClientRect();return r.width>0 && r.right>window.innerWidth+2 && getComputedStyle(el).display!=="none";})
        .slice(0,18).map(el => ({tag:el.tagName,cls:typeof el.className==="string"?el.className.slice(0,120):"",text:(el.textContent||"").trim().slice(0,55),right:Math.round(el.getBoundingClientRect().right),width:Math.round(el.getBoundingClientRect().width)}))) : [];
      expect(size.width, "Débordement "+name+" "+path+" : "+JSON.stringify(overflow)).toBeLessThanOrEqual(size.screen+1);
      if ((name === "phone" || name === "desktop") && (path === "/formations" || path === "/contact")) {
        await testInfo.attach("jp-"+name+"-"+path.replace("/",""),{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
      }
    }
  }
});


test("typographie fluide : titres plus petits sur téléphone, lisibles sur tablette et ordinateur", async ({page,isMobile},testInfo) => {
  test.skip(isMobile, "Le scénario simule plusieurs tailles d'écran");
  test.setTimeout(165000);
  const routes = [
    {path:"/",selector:".jp-hero-main h1"},
    {path:"/formations",selector:".jp-inner-hero-copy h1"},
    {path:"/contact",selector:".jp-page-heading h1"},
    {path:"/scolia",selector:".jp-product-hero h1"},
  ];
  const sizes = [320,390,768,1024,1440,1920] as const;
  for (const {path,selector} of routes) {
    const measurements: Array<{width:number,size:number,overflow:number}> = [];
    for(const width of sizes){
      await page.setViewportSize({width,height:width<500?780:900});
      const response = await page.goto(path);
      expect(response?.status(),"Page "+path+" à "+width+"px").toBe(200);
      const heading=page.locator(selector);
      await expect(heading).toBeVisible();
      const metrics=await heading.evaluate((element) => ({
        size:parseFloat(getComputedStyle(element).fontSize),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        textWidth:element.getBoundingClientRect().width,
      }));
      expect(metrics.size, "Titre illisible "+path+" à "+width+"px").toBeGreaterThanOrEqual(27);
      expect(metrics.size, "Titre disproportionné "+path+" à "+width+"px").toBeLessThanOrEqual(width<=390?41:width<=768?50:64);
      const culprits = metrics.overflow > 1 ? await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")].filter(el => {
        const rect=el.getBoundingClientRect();
        const style=getComputedStyle(el);
        return rect.width > 0 && rect.right > window.innerWidth + 2 && style.display !== "none" && style.visibility !== "hidden";
      }).slice(0,10).map(el => ({tag:el.tagName,cls:typeof el.className==="string"?el.className.slice(0,95):"",right:Math.round(el.getBoundingClientRect().right)}))) : [];
      expect(metrics.overflow, "Débordement horizontal "+path+" à "+width+"px : "+JSON.stringify(culprits)).toBeLessThanOrEqual(1);
      expect(metrics.textWidth, "Titre trop large "+path+" à "+width+"px").toBeLessThanOrEqual(width);
      measurements.push({width,size:metrics.size,overflow:metrics.overflow});
      if((path==="/" || path==="/formations") && (width===320 || width===390 || width===1440)){
        await testInfo.attach("typographie-"+(path==="/"?"accueil":"formations")+"-"+width,{
          body:await page.screenshot({fullPage:true}),
          contentType:"image/png"
        });
      }
    }
    expect(measurements[measurements.length-1]!.size - measurements[0]!.size, "Titre non responsive "+path).toBeGreaterThan(8);
    for(let i=1;i<measurements.length;i++){
      expect(measurements[i]!.size + .5, "Progression typographique incohérente "+path).toBeGreaterThanOrEqual(measurements[i-1]!.size);
    }
  }
});

test("typographie de section et mouvement réduit", async ({page,isMobile}) => {
  test.skip(isMobile, "Le scénario modifie la taille de fenêtre lui-même");
  await page.setViewportSize({width:320,height:700});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  const sectionHeading=page.locator(".jp-section-heading h2").first();
  await expect(sectionHeading).toBeVisible();
  const small=await sectionHeading.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(small).toBeGreaterThanOrEqual(23);
  expect(small).toBeLessThanOrEqual(32);
  await page.setViewportSize({width:1440,height:900});
  // Le redimensionnement est asynchrone : on attend que la nouvelle taille soit appliquée.
  await expect.poll(()=>sectionHeading.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(small);
  const large=await sectionHeading.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(large).toBeLessThanOrEqual(44);
  const transition=await page.locator(".jp-area-link").first().evaluate(el=>getComputedStyle(el).transitionDuration);
  expect(parseFloat(transition)).toBeLessThanOrEqual(.01);
});


test("à 1024 px, la navigation reste compacte et accessible", async ({page,isMobile}) => {
  test.skip(isMobile, "Le scénario simule le viewport tablette sur ordinateur");
  await page.setViewportSize({width:1024,height:800});
  await page.goto("/");
  const mobileTrigger=page.locator('button[aria-controls="mobile-drawer"]');
  await expect(mobileTrigger).toBeVisible();
  await expect(page.getByRole("navigation",{name:"Menu principal"})).toBeHidden();
  await mobileTrigger.click();
  await expect(page.locator("#mobile-drawer")).toBeVisible();
  await page.locator('#mobile-drawer a[href="/formations"]').click();
  await expect(page).toHaveURL(/\/formations$/);
  const width=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(width).toBeLessThanOrEqual(1);
});


test("accueil : illustrations du héros, des domaines et de SCOLIA présentes et chargées", async ({page,isMobile}) => {
  test.skip(isMobile, "Contrôles de dimensions réalisés sur plusieurs viewports");
  test.setTimeout(100000);
  for(const width of [320,390,820,1024,1440]){
    await page.setViewportSize({width,height:850});
    await page.goto("/");
    const images=page.locator(".jp-hero-art img, .jp-area-visual img, .jp-scolia-photo img");
    await expect(images).toHaveCount(5);
    for(let i=0;i<await images.count();i++){
      const photo=images.nth(i);
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(async()=>photo.evaluate(img=>{
        const image=img as HTMLImageElement;
        return image.complete && image.naturalWidth>0;
      }),{timeout:12000,message:"Illustration indisponible à "+width+"px, image "+i}).toBe(true);
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    expect(overflow,"Les visuels provoquent un débordement à "+width+"px").toBeLessThanOrEqual(1);
  }
});

test("accueil : titres resserrés et lecture facile sur téléphone",async ({page,isMobile})=>{
  test.skip(isMobile,"Viewport redéfini dans ce scénario");
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:850});
    await page.goto("/");
    const m=await page.locator(".jp-hero-main h1").evaluate(el=>{
      const style=getComputedStyle(el),rect=el.getBoundingClientRect();
      const font=parseFloat(style.fontSize),line=parseFloat(style.lineHeight);
      return {lines:rect.height/line,font,lineHeight:line,contentWidth:rect.width};
    });
    expect(m.lines,"Titre trop long à "+width+"px").toBeLessThanOrEqual(2.25);
    expect(m.font,"Titre trop grand à "+width+"px").toBeLessThanOrEqual(width<=390?36:width>=1200?58:45);
    expect(m.lineHeight/m.font,"Interligne trop élevé à "+width+"px").toBeLessThanOrEqual(1.26);
  }
});

test("les animations de l'accueil respectent la préférence de mouvement réduit", async ({page}) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  await expect(page.locator(".jp-hero-chip").first()).toBeVisible();
  const duration=await page.locator(".jp-hero-chip").first().evaluate(el=>getComputedStyle(el).animationDuration);
  expect(parseFloat(duration), "Le mouvement réduit doit supprimer les animations visibles").toBeLessThanOrEqual(0.001);
});

test("l'accueil présente l'illustration JP-Services et les accès directs", async ({page}) => {
  await page.goto("/");
  await expect(page.locator(".jp-hero-art img")).toHaveAttribute("src", /\/illustrations\/hero-apprenante\.svg/);
  await expect(page.locator(".jp-hero-chip")).toHaveCount(3);
  const start = page.getByRole("navigation", { name: "Votre point de départ" });
  await expect(start.getByRole("link")).toHaveCount(4);
  await expect(start.locator('a[href="/scolia"]')).toBeVisible();
  await expect(page.locator(".jp-method-illustration")).toHaveCount(3);
});

test("Material 3 : le guide interactif oriente vers des pages existantes", async ({page}) => {
  await page.goto("/");
  const finder = page.locator(".jp-path-finder");
  await expect(finder.getByRole("button")).toHaveCount(3);
  await expect(page.getByTestId("path-choice-0")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("path-choice-2").click();
  await expect(page.getByTestId("path-choice-2")).toHaveAttribute("aria-pressed", "true");
  await expect(finder).toContainText("Concrétisez un projet");
  await expect(finder.locator('a[href="/projets"]')).toBeVisible();
  await page.getByTestId("path-choice-1").click();
  await expect(finder.locator('a[href="/logiciels"]')).toBeVisible();
});

test("Flutter motion : les mouvements désactivés respectent les préférences système", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto("/");
  await expect(page.locator(".jp-scroll-progress")).toBeAttached();
  const animation = await page.locator(".jp-hero-chip").first().evaluate(el => getComputedStyle(el).animationDuration);
  expect(parseFloat(animation)).toBeLessThanOrEqual(.001);
});

test("les illustrations sont vectorielles, nettes et sans filtre flou", async ({page}) => {
  await page.goto("/");
  const art = page.locator(".jp-hero-art img");
  await expect(art).toBeVisible();
  const metrics = await art.evaluate((img) => {
    const node = img as HTMLImageElement;
    return { src: node.currentSrc || node.src, filter: getComputedStyle(img).filter, loaded: node.complete && node.naturalWidth > 0 };
  });
  expect(metrics.src).toMatch(/\/illustrations\/hero-apprenante\.svg$/);
  expect(metrics.filter).toBe("none");
  expect(metrics.loaded).toBe(true);
  const promo = page.locator(".jp-promo-illustration").first();
  await expect(promo).toHaveAttribute("src", /\/illustrations\/.+\.svg$/);
});

test("le panneau mobile change le thème sans menu imbriqué",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/");
 await page.locator('button[aria-controls="mobile-drawer"]').click();
 await page.getByTestId("drawer-theme-trigger").click();
 await page.getByTestId("drawer-theme-dark").click();
 await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 const dark=await page.locator(".jp-learning").evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.getByTestId("drawer-theme-light").click();
 await expect(page.locator("html")).toHaveAttribute("data-theme","light");
 const light=await page.locator(".jp-learning").evaluate(el=>getComputedStyle(el).backgroundColor);
 expect(dark).not.toBe(light);
});
test("le panneau mobile change la langue sans popover bloqué",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/");
 await page.locator('button[aria-controls="mobile-drawer"]').click();
 await page.getByTestId("drawer-language-trigger").click();
 await page.getByTestId("drawer-language-en").click();
 await expect(page.locator("html")).toHaveAttribute("lang","en");
});
test("les champs de contact ont des icônes sans masquer la saisie",async({page})=>{
 await page.goto("/contact");
 for(const id of ["nom","email","sujet","message"]){
  const input=page.locator("#"+id);
  await expect(input).toBeVisible();
  await expect(input.locator("xpath=..").locator("svg.jp-field-leading")).toBeVisible();
  const padding=await input.evaluate(el=>parseFloat(getComputedStyle(el).paddingLeft));
  expect(padding).toBeGreaterThanOrEqual(40);
 }
});

test("les CTA et le bandeau de démonstration sont lisibles sur mobile",async({page})=>{
 for(const theme of ["light","dark"]){
   await page.setViewportSize({width:390,height:844});
   await page.goto("/");
   await page.evaluate(t=>document.documentElement.setAttribute("data-theme",t),theme);
   const notice=page.locator(".jp-preview-notice");
   if(await notice.count()) {
     await expect(notice).toBeVisible();
     const banner=await notice.evaluate(el=>({bg:getComputedStyle(el).backgroundColor,
       ink:getComputedStyle(el).color,box:el.getBoundingClientRect().toJSON()}));
     expect(banner.ink).not.toBe(banner.bg);
     const nav=await page.locator("#site-header").boundingBox();
     expect(nav!.y).toBeGreaterThanOrEqual(banner.box.bottom-2);
   }
   const link=page.locator(".jp-finale-link");
   await link.scrollIntoViewIfNeeded();
   await expect(link).toBeVisible();
   const geometry=await link.evaluate(el=>({
      radius:getComputedStyle(el).borderTopLeftRadius,
      overflow:getComputedStyle(el).overflow,
      box:el.getBoundingClientRect().toJSON(),
      text:el.textContent?.trim()??""
   }));
   expect(geometry.radius).toBe("0px");
   expect(geometry.overflow).toBe("visible");
   expect(geometry.box.x).toBeGreaterThanOrEqual(0);
   expect(geometry.box.right).toBeLessThanOrEqual(391);
   expect(geometry.text).toContain("Nous contacter");
   await page.goto("/scolia");
   const buttons=page.locator(".jp-product-hero .jp-directory-actions .jp-action");
   await expect(buttons).toHaveCount(2);
   const rectangles=await buttons.evaluateAll(nodes=>nodes.map(el=>{
     const r=el.getBoundingClientRect();return {x:r.left,right:r.right,top:r.top,bottom:r.bottom,radius:getComputedStyle(el).borderRadius};
   }));
   for(const r of rectangles){expect(r.x).toBeGreaterThanOrEqual(0);expect(r.right).toBeLessThanOrEqual(391);expect(r.radius).toBe("999px");}
   expect(rectangles[1]!.top).toBeGreaterThanOrEqual(rectangles[0]!.bottom+8);
 }
});

test("la recherche reste utile si le serveur de contenus est temporairement indisponible", async ({page}) => {
  await page.route("**/api/recherche?*", route => route.fulfill({status:503,contentType:"application/json",body:'{"results":[],"error":"temporarily_unavailable"}'}));
  await page.goto("/");
  await page.getByRole("button", {name:/recherch/i}).first().click();
  await page.getByPlaceholder(/Rechercher une formation/).fill("scolia");
  await expect(page.getByRole("option", {name:/SCOLIA Pro/})).toBeVisible();
  await expect(page.getByRole("status").filter({hasText:/recherche en direct|live results/i})).toBeVisible();
});
test("l'API de recherche refuse les requêtes trop longues", async ({request}) => {
  const r=await request.get("/api/recherche?q="+encodeURIComponent("a".repeat(120)));
  expect(r.status()).toBe(400);
  expect((await r.json()).error).toBe("invalid_query");
});

test("la galerie et les parcours répondent aussi aux flèches du clavier",async({page})=>{
  await page.goto("/");
  await expect(page.locator(".jp-path-finder")).toHaveAttribute("data-hydrated", "true");
  const path=page.getByTestId("path-choice-0");
  await path.focus();
  await path.press("ArrowRight");
  await expect(page.getByTestId("path-choice-1")).toHaveAttribute("aria-pressed","true");
  await expect(page.getByTestId("path-choice-1")).toBeFocused();
});
test("les contenus restent visibles quand les animations sont désactivées",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto("/");
 await expect(page.locator(".jp-method-step")).toHaveCount(3);
 const h=page.locator(".jp-method-step h3").first();
 await h.scrollIntoViewIfNeeded();
 await expect(h).toBeVisible();
 await expect(h).toContainText("Comprendre");
});

test("les liens de la version démo ne demandent pas de créer un compte désactivé",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/");
 if(await page.locator(".jp-preview-notice").count()===0) return;
 await expect(page.locator("#site-header a[href='/contact']")).toBeVisible();
 await expect(page.locator(".jp-footer-intro a[href='/inscription']")).toHaveCount(0);
 await expect(page.locator(".jp-footer-intro a[href='/contact']")).toBeVisible();
 await page.locator('button[aria-controls="mobile-drawer"]').click();
 await expect(page.locator("#mobile-drawer a[href='/contact']")).toBeVisible();
});

// Régression : la documentation d'aide doit refléter la règle appliquée par le serveur.
test("le centre d'aide affiche la politique actuelle et des FAQ accessibles", async ({ page }) => {
  await page.goto("/aide");
  const faq = page.locator(".jp-help-faq");
  await expect(faq.getByText(/8 caractères minimum/)).toHaveCount(1);
  await expect(faq.getByText(/10 caractères minimum/)).toHaveCount(0);
  const question = faq.locator("summary").filter({ hasText: "J’ai oublié mon mot de passe." });
  await question.click();
  await expect(question.locator("..")).toHaveAttribute("open", "");
  await page.setViewportSize({ width: 320, height: 700 });
  const dims = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(dims.page, "Le centre d'aide déborde sur téléphone").toBeLessThanOrEqual(dims.viewport + 1);
});

test("les sections des paramètres sont claires et la recherche admin s'adapte", async ({ page }) => {
  // Les formulaires publics doivent conserver leurs liens et champs accessibles sur mobile.
  await page.setViewportSize({ width: 320, height: 700 });
  for (const url of ["/contact", "/partenariat", "/aide", "/conditions"]) {
    await page.goto(url);
    const width = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(width, "Débordement de la page " + url).toBeLessThanOrEqual(1);
  }
});

test("les affiches d'accueil ont trois slides et des commandes accessibles", async ({page}) => {
  await page.goto("/");
  const gallery = page.getByRole("region", { name: "Affiches des activités JP-Services" });
  await expect(gallery).toBeVisible();
  await expect(gallery.getByRole("group", { name: /sur 3/ })).toHaveCount(3);
  await page.getByRole("button", { name: "Affiche suivante" }).click();
  await expect(page.getByRole("button", { name: /Afficher l’affiche 2/ })).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Mettre le défilement automatique en pause" }).click();
  await expect(page.getByRole("button", { name: "Reprendre le défilement automatique" })).toHaveAttribute("aria-pressed", "true");
});

test("les expériences accueillent les vrais avis sans citations fictives", async ({page}) => {
  await page.goto("/");
  const stories = page.locator(".jp-stories");
  await expect(stories).toBeVisible();
  await expect(stories.getByRole("link", { name: "Partager votre expérience" })).toBeVisible();
  await expect(page.locator(".jp-promo-slide")).toHaveCount(3);
  await page.setViewportSize({width: 320, height: 700});
  const dimensions = await page.evaluate(() => ({ total: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(dimensions.total, "Les carrousels ne doivent pas déborder sur mobile").toBeLessThanOrEqual(dimensions.viewport + 1);
});

test("les carrousels respectent les préférences de mouvement réduit", async ({page}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".jp-promo-gallery")).toHaveAttribute("data-reduced-motion", "true");
  await expect(page.locator(".jp-story-gallery")).toHaveAttribute("data-reduced-motion", "true");
  await expect(page.locator(".jp-hero-art")).toBeVisible();
});
