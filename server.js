const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/gold', async (req, res) => {
    try {
        // نقطة نهاية جلب سعر Pax Gold عبر مصادر متعددة مرادفة
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/pax-gold', {
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const price = response.data?.market_data?.current_price?.usd;

        if (price) {
            return res.json({ success: true, price: price });
        }
        throw new Error('Invalid payload');
    } catch (error) {
        // Fallback إلى API المفتوح الخاص بـ Yahoo Finance
        try {
            const yahooRes = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/GC=F', {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const price = yahooRes.data?.chart?.result[0]?.meta?.regularMarketPrice;
            if (price) {
                return res.json({ success: true, price: price });
            }
        } catch (err) {
            console.error('Yahoo fallback error:', err.message);
        }

        return res.status(500).json({ success: false, message: 'تعذر جلب سعر الذهب' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
