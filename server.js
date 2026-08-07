const express = require('express');
const axios = require('axios');
const app = express();

// استخدام متغير البيئة الخاص بالمنصة أو المنفذ 3000 للاختبار المحلي
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

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

// ربط الخادم بـ '0.0.0.0' للسماح باستقبال الطلبات الخارجية على Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=================================`);
    console.log(`🚀 تم تحديث وتشغيل الخادم بنجاح!`);
    console.log(`📱 Running on port: ${PORT}`);
    console.log(`=================================\n`);
});
