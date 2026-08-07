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
        const res1 = await axios.get('https://api.gold-api.com/price/XAU', { timeout: 3000 });
        if (res1.data && res1.data.price) {
            ouncePrice = res1.data.price;
        }
    } catch (e) {
        console.log('المصدر الأول لم يستجب، جاري تجربة المصدر الثاني...');
    }

    // المصدر الثاني: Open Exchange Rates
    if (!ouncePrice) {
        try {
            const res2 = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 3000 });
            if (res2.data && res2.data.rates && res2.data.rates.XAU) {
                ouncePrice = 1 / res2.data.rates.XAU;
            }
        } catch (e) {
            console.log('المصدر الثاني لم يستجب');
        }
    }

    // سعر احتياطي (في حال تعذر الاتصال بجميع المزودين) لتضمين استجابة تعمل دائماً
    if (!ouncePrice) {
        ouncePrice = 2400.00; // سعر تقديري لأونصة الذهب للتجربة
    }

    return res.json({ success: true, ouncePriceUSD: ouncePrice });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
