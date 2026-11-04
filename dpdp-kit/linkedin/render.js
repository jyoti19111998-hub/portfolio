const { chromium } = require('playwright');
(async () => {
  const dir = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto('file://' + dir + '/carousel.html');
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: dir + '/DPDP_Kit_LinkedIn_Carousel.pdf', width: '1080px', height: '1350px', printBackground: true });
  const slides = await p.$$('section.slide');
  for (let i = 0; i < slides.length; i++) await slides[i].screenshot({ path: `${dir}/slide-${i + 1}.png` });
  await b.close();
})();
