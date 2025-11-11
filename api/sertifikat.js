const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// KONFIGURASI FONT DAN WARNA BARU
const FONT_FILE_NAME = 'GreatVibes-Regular.ttf';
const BASE_IMAGE_PATH = path.join(process.cwd(), 'base_image.png');
const FONT_PATH = path.join(process.cwd(), 'public', FONT_FILE_NAME); 

// Warna teks: Cokelat Tua/Sepia (Meniru tinta vintage)
const TEXT_COLOR = '#462d19'; 

// --- Fungsi untuk Membuat SVG Overlay ---
function createSvgOverlay(suami, istri) {
    // ESTIMASI KOORDINAT TEKS
    // Koordinat X, Y yang disesuaikan untuk Great Vibes agar posisinya tepat di sertifikat.
    // X, Y dihitung dari sudut kiri atas (0,0) dari overlay SVG.
    const POS = {
        // Bagian Nama Utama (Biasanya di tengah sertifikat, font lebih besar)
        // Koordinat disesuaikan agar tulisan Great Vibes yang besar berada di garis yang tepat.
        NAMA_SUAMI: { x: 420, y: 395, size: '55px' }, 
        NAMA_ISTRI: { x: 770, y: 395, size: '55px' }, 

        // Bagian Pengakuan/Vows (Beberapa baris di bawah nama utama, font sedikit lebih kecil)
        PENGAKUAN_SUAMI: { x: 230, y: 565, size: '40px' }, 
        PENGAKUAN_ISTRI: { x: 450, y: 565, size: '40px' }, 
    };
    
    // Memastikan font kustom Anda sudah dimuat
    const fontFace = fs.existsSync(FONT_PATH) 
        ? `@font-face { font-family: 'GreatVibes'; src: url('file://${FONT_PATH}'); }`
        : '';
        
    // Asumsi: Ukuran SVG Overlay harus sama besar atau lebih besar dari area gambar yang dimanipulasi. 
    // Saya asumsikan gambar dasar memiliki area konten sekitar 800x1100 px.
    return `
<svg width="1000" height="1200" xmlns="http://www.w3.org/2000/svg">
    <style>
        ${fontFace}
        .text { 
            fill: ${TEXT_COLOR}; 
            font-family: 'GreatVibes', cursive; /* Gunakan GreatVibes sebagai font utama */
            text-anchor: middle; /* Untuk centering horizontal, memudahkan penempatan */
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
    // 1. Ambil Nama dari Query Parameter (GET)
    const { suami, istri } = req.query;

    if (!suami || !istri) {
        return res.status(400).send({ 
            error: "Silakan masukkan nama suami dan istri. Contoh: /api/sertifikat?suami=Budi&istri=Dewi" 
        });
    }

    try {
        // 2. Buat SVG Overlay
        const svgOverlay = createSvgOverlay(suami, istri);

        // 3. Gabungkan Gambar Dasar dan SVG dengan Sharp
        const finalImageBuffer = await sharp(BASE_IMAGE_PATH)
            .composite([{
                input: Buffer.from(svgOverlay),
                blend: 'over'
            }])
            .png() // Ubah hasil akhir menjadi format PNG
            .toBuffer(); // Mengirimkan hasil sebagai Buffer

        // 4. Kirim Hasil (Buffer)
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

// Vercel Serverless Function export
module.exports = app;
