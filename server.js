const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// مسار جلب السعر مع تحسين معالجة الأخطاء
app.get('/api/gold', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const ouncePrice = response.data['pax-gold'].usd;
        // تحويل أونصة الذهب لجرام عيار 24 (الأونصة = 31.1034768 جرام)
        const gramPrice24 = ouncePrice / 31.1034768;
        
        res.json({ success: true, pricePerGram24: gramPrice24 });
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ success: false, message: 'تعذر جلب السعر المباشر' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
