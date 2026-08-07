const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// خدمة الملفات الثابتة من المجلد الرئيسي
app.use(express.static(__dirname));

// التوجيه للصفحة الرئيسية عند فتح الرابط
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/gold', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        res.json({ success: true, price: response.data['pax-gold'].usd });
    } catch (error) {
        res.status(500).json({ success: false, message: 'فشل جلب سعر الذهب' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
