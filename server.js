const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;

// 1. خدمة الملفات الثابتة من مجلد public والمجلد الرئيسي معاً
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// 2. توجيه الصفحة الرئيسية لضمان قراءة index.html
app.get('/', (req, res) => {
    const publicIndex = path.join(__dirname, 'public', 'index.html');
    const rootIndex = path.join(__dirname, 'index.html');

    if (fs.existsSync(publicIndex)) {
        res.sendFile(publicIndex);
    } else if (fs.existsSync(rootIndex)) {
        res.sendFile(rootIndex);
    } else {
        res.status(404).send('لم يتم العثور على ملف index.html');
    }
});

// 3. API جلب أسعار الذهب واليورو
app.get('/api/gold', async (req, res) => {
    let ouncePrice = 0;
    let eurUsdRate = 1.08; // قيمة افتراضية احتياطية لسعر صرف EUR/USD

    // المصدر الأول: Open Exchange Rates (لجلب الذهب واليورو معاً)
    try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 5000 });
        if (response.data && response.data.rates) {
            if (response.data.rates.XAU) {
                ouncePrice = 1 / response.data.rates.XAU;
            }
            if (response.data.rates.EUR) {
                eurUsdRate = 1 / response.data.rates.EUR;
            }
        }
    } catch (err) {
        console.error('ER-API error:', err.message);
    }

    // المصدر الثاني للذهب (في حال عدم الاستجابة من المصدر الأول): CoinGecko Pax Gold
    if (!ouncePrice) {
        try {
            const cgRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd', {
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            ouncePrice = cgRes.data?.['pax-gold']?.usd;
        } catch (err) {
            console.error('CoinGecko fallback error:', err.message);
        }
    }

    // المصدر الثالث للذهب (احتياطي أخيرة): Yahoo Finance
    if (!ouncePrice) {
        try {
            const yahooRes = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/GC=F', {
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            ouncePrice = yahooRes.data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        } catch (err) {
            console.error('Yahoo fallback error:', err.message);
        }
    }

    // إرسال البيانات متوافقة مع مفاتيح app.js
    if (ouncePrice) {
        return res.json({
            success: true,
            price: ouncePrice,             // للتوافق مع الأكواد القديمة
            ouncePriceUSD: ouncePrice,     // لـ app.js الجديد
            eurUsdRate: eurUsdRate         // معامل تحويل اليورو للدولار
        });
    }

    return res.status(500).json({ success: false, message: 'تعذر جلب سعر الذهب والعملات' });
});

// 4. تشغيل الخادم على 0.0.0.0 لدعم Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
