const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const FONT_FILE_NAME = 'GreatVibes-Regular.ttf';
const BASE_IMAGE_PATH = path.join(process.cwd(), 'base_image.png');
const FONT_PATH = path.join(process.cwd(), 'public', FONT_FILE_NAME); 
const TEXT_COLOR = '#462d19'; 

// **PENTING: Ganti nilai ini dengan dimensi sebenarnya dari base_image.png Anda**
const IMG_WIDTH = 840;  // Contoh: Lebar gambar dasar
const IMG_HEIGHT = 1200; // Contoh: Tinggi gambar dasar

function createSvgOverlay(suami, istri) {
    // Koordinat x, y harus disesuaikan jika IMG_WIDTH/IMG_HEIGHT diubah
    const POS = {
        // Koordinat disesuaikan dengan dimensi baru SVG
        NAMA_SUAMI: { x: 420, y: 395, size: '55px' }, 
        NAMA_ISTRI: { x: 770, y: 395, size: '55px' }, 
        PENGAKUAN_SUAMI: { x: 230, y: 565, size: '40px' }, 
        PENGAKUAN_ISTRI: { x: 450, y: 565, size: '40px' }, 
    };
    
    const fontFace = fs.existsSync(FONT_PATH) 
        ? `@font-face { font-family: 'GreatVibes'; src: url('file://${FONT_PATH}'); }`
        : '';
        
    return `
<svg width="${IMG_WIDTH}" height="${IMG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <style>
        ${fontFace}
        .text { 
            fill: ${TEXT_COLOR}; 
            font-family: 'GreatVibes', cursive; 
            text-anchor: middle; 
        }
    </style>
    
    <text x="${POS.NAMA_SUAMI.x}" y="${POS.NAMA_SUAMI.y}" font-size="${POS.NAMA_SUAMI.size}" class="text">${suami}</text>
    <text x="${POS.NAMA_ISTRI.x}" y="${POS.NAMA_ISTRI.y}" font-size="${POS.NAMA_ISTRI.size}" class="text">${istri}</text>
    <text x="${POS.PENGAKUAN_SUAMI.x}" y="${POS.PENGAKUAN_SUAMI.y}" font-size="${POS.PENGAKUAN_SUAMI.size}" class="text">${suami}</text>
    <text x="${POS.PENGAKUAN_ISTRI.x}" y="${POS.PENGAKUAN_ISTRI.y}" font-size="${POS.PENGAKUAN_ISTRI.size}" class="text">${istri}</text>
</svg>
    `;
}


app.get('/api/sertifikat', async (req, res) => {
    const { suami, istri } = req.query;

    if (!suami || !istri) {
        return res.status(400).send({ 
            error: "Silakan masukkan nama suami dan istri. Contoh: /api/sertifikat?suami=Budi&istri=Dewi" 
        });
    }

    try {
        const svgOverlay = createSvgOverlay(suami, istri);

        const finalImageBuffer = await sharp(BASE_IMAGE_PATH)
            .composite([{
                input: Buffer.from(svgOverlay),
                blend: 'over'
            }])
            .png()
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="sertifikat_${suami}_dan_${istri}.png"`);
        res.send(finalImageBuffer);

    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).send({ 
            error: 'Gagal membuat sertifikat.',
            details: error.message 
        });
    }
});

module.exports = app;
