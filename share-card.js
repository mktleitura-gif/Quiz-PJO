(function () {
  'use strict';

  const WIDTH = 1080;
  const HEIGHT = 1920;
  // Conservative intersection of the article's pixel and percentage guides:
  // top 15%, left 85px, right 180px, bottom 700px on a 1080 × 1920 canvas.
  const SAFE = { left: 85, right: 900, top: 288, bottom: 1220 };

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Não foi possível carregar ${source}`));
      image.src = source;
    });
  }

  // Two source banners include a white presentation canvas around the artwork.
  // These bounds isolate the actual illustration before any proportional crop.
  const artworkBounds = {
    hebe: [203, 0, 536, 1672],
    tyche: [239, 0, 546, 1536],
  };

  function coverArtwork(ctx, image, god, x, y, width, height) {
    const [left, top, artWidth, artHeight] = artworkBounds[god] || [0, 0, image.width, image.height];
    const targetRatio = width / height;
    let sourceWidth = artWidth;
    let sourceHeight = artHeight;
    if (sourceWidth / sourceHeight > targetRatio) sourceWidth = sourceHeight * targetRatio;
    else sourceHeight = sourceWidth / targetRatio;
    const sourceX = left + (artWidth - sourceWidth) / 2;
    const sourceY = top + (artHeight - sourceHeight) / 2;
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  async function create(god, result, colors) {
    await Promise.all([
      document.fonts.load('72px Marcellus'),
      document.fonts.load('600 30px "Source Serif 4"'),
      document.fonts.load('700 24px "Source Sans 3"'),
    ]);
    const [banner, logo] = await Promise.all([
      loadImage(`assets/banners/${god}.webp`),
      loadImage('assets/logo-leitura-branco.png'),
    ]);
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('O navegador não conseguiu criar o cartão.');

    // One continuous illustration fills the card; no inset image or second frame.
    coverArtwork(ctx, banner, god, 0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#071b2f2b';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const topShade = ctx.createLinearGradient(0, 0, 0, 700);
    topShade.addColorStop(0, '#071b2fc2');
    topShade.addColorStop(1, '#071b2f00');
    ctx.fillStyle = topShade;
    ctx.fillRect(0, 0, WIDTH, 700);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 5;
    ctx.strokeRect(36, 36, WIDTH - 72, HEIGHT - 72);
    ctx.lineWidth = 2;
    ctx.strokeRect(53, 53, WIDTH - 106, HEIGHT - 106);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#071b2fe0';
    roundRect(ctx, 287, 278, 506, 65, 8);
    ctx.fill();
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = colors.accent;
    ctx.font = '700 31px "Source Sans 3", sans-serif';
    ctx.fillText('REIVINDICAÇÃO IDENTIFICADA', WIDTH / 2, 320, SAFE.right - SAFE.left);

    const shade = ctx.createLinearGradient(0, 735, 0, 1580);
    shade.addColorStop(0, '#071b2f00');
    shade.addColorStop(0.38, '#071b2fe8');
    shade.addColorStop(1, '#071b2fff');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 735, WIDTH, HEIGHT - 735);

    ctx.fillStyle = '#fff8e9';
    ctx.font = '116px Marcellus, Georgia, serif';
    ctx.fillText(result.god.toUpperCase(), WIDTH / 2, 928, 720);
    ctx.fillStyle = colors.accent;
    ctx.font = '700 49px "Source Sans 3", sans-serif';
    ctx.fillText(`CHALÉ ${result.cabin}`, WIDTH / 2, 1008, 720);

    ctx.fillStyle = '#fff8e9';
    ctx.font = '600 39px "Source Serif 4", Georgia, serif';
    ctx.fillText('Qual é o seu chalé? Faça o teste.', WIDTH / 2, 1072, 720);

    const logoWidth = 310;
    const logoHeight = logoWidth * logo.height / logo.width;
    ctx.globalAlpha = 1;
    ctx.drawImage(logo, (WIDTH - logoWidth) / 2, 1110, logoWidth, logoHeight);
    ctx.globalAlpha = 1;

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível salvar o cartão.')), 'image/jpeg', 0.9);
    });
  }

  window.QuizShareCard = { create, width: WIDTH, height: HEIGHT };
})();
