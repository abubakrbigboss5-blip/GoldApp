const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/gold', async (req, res) => {
    try {
        // مصدر مباشر ومفتوح لسعر الأونصة بالدولار (GoldPrice.org)
        const response = await axios.get('https://data-asg.goldprice.org/dbWRzs/chart/XAU/USD', {
            timeout: 7000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://goldprice.org/'
            }
        });

        // استخراج سعر أونصة الذهب الحالي
        const items = response.data?.items;
        if (items && items.length > 0) {
            const ouncePrice = items[0].xauPrice;
            console.log(`Gold price fetched successfully: $${ouncePrice}`);
            return res.json({ success: true, price: ouncePrice });
        }

        throw new Error('بيانات السعر غير متوفرة في استجابة API');
    } catch (error) {
        console.error('Error fetching gold price:', error.message);
        return res.status(500).json({ success: false, message: 'تعذر جلب سعر الذهب حالياً' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
