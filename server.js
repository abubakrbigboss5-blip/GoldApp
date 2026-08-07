const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// التأكد من الوصول لمجلد public بغض النظر عن طريقة التشغيل
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/gold', async (req, res) => {
    // المصدر الأول: Binance API
    try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', {
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const price = parseFloat(response.data.price);
        if (price && !isNaN(price)) {
            return res.json({ success: true, price: price });
        }
    } catch (binanceError) {
        console.log('Binance API failed, trying fallback source...');
    }

    // المصدر الاحتياطي الثاني: Gold Price Alternative API
    try {
        const fallbackResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd', {
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const fallbackPrice = fallbackResponse.data['pax-gold']?.usd;
        if (fallbackPrice) {
            return res.json({ success: true, price: fallbackPrice });
        }
    } catch (fallbackError) {
        console.error('All APIs failed to fetch gold price.');
    }

    return res.status(500).json({ success: false, message: 'تعذر جلب سعر الذهب حالياً' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
