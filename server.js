const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/gold', async (req, res) => {
    let ouncePrice = 0;

    // المصدر الأول: Gold-API
    try {
        const res1 = await axios.get('https://api.gold-api.com/price/XAU', { timeout: 4000 });
        if (res1.data && res1.data.price) {
            ouncePrice = res1.data.price;
        }
    } catch (e) {
        console.log('المصدر الأول لم يستجب، جاري تجربة المصدر الثاني...');
    }

    // المصدر الثاني الاحتياطي
    if (!ouncePrice) {
        try {
            const res2 = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 4000 });
            if (res2.data && res2.data.rates && res2.data.rates.XAU) {
                ouncePrice = 1 / res3.data.rates.XAU;
            }
        } catch (e) {
            console.log('جميع المصادر لم تستجب');
        }
    }

    if (ouncePrice > 0) {
        const gramPrice24 = ouncePrice / 31.1034768; // جرام عيار 24
        return res.json({ success: true, pricePerGram24: gramPrice24 });
    } else {
        return res.status(500).json({ success: false, message: 'تعذر جلب السعر حالياً' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
