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
    let eurUsdRate = 1.08; // سعر افتراضي احتياطي لليورو مقابل الدولار

    // جلب سعر الذهب والعملات
    try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 4000 });
        if (response.data && response.data.rates) {
            if (response.data.rates.XAU) {
                ouncePrice = 1 / response.data.rates.XAU;
            }
            if (response.data.rates.EUR) {
                // تحويل EUR إلى USD يساوي 1 ÷ rate
                eurUsdRate = 1 / response.data.rates.EUR;
            }
        }
    } catch (e) {
        console.log('فشل المصدر الأول، جاري تجربة المصدر الاحتياطي...');
    }

    // مصدر احتياطي للذهب
    if (!ouncePrice) {
        try {
            const res2 = await axios.get('https://api.gold-api.com/price/XAU', { timeout: 4000 });
            if (res2.data && res2.data.price) {
                ouncePrice = res2.data.price;
            }
        } catch (e) {
            ouncePrice = 2400.00; // قيمة افتراضية للذهب
        }
    }

    return res.json({ 
        success: true, 
        ouncePriceUSD: ouncePrice,
        eurUsdRate: eurUsdRate 
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
