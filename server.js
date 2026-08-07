const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/gold', async (req, res) => {
    try {
        // جلب سعر PAXG (الذهب) مقابل الدولار من Binance API
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const price = parseFloat(response.data.price);
        
        if (!price || isNaN(price)) {
            throw new Error('سعر غير صالح');
        }

        res.json({ success: true, price: price });
    } catch (error) {
        console.error('Error fetching gold price:', error.message);
        res.status(500).json({ success: false, message: 'فشل جلب سعر الذهب' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
