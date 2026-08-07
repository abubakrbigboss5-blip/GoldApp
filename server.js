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
    try {
        // جلب سعر الذهب المباشر (PAXG/USDT) من Binance API
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
        const ouncePrice = parseFloat(response.data.price);
        
        // تحويل أونصة الذهب لجرام عيار 24 (1 أونصة = 31.1034768 جرام)
        const gramPrice24 = ouncePrice / 31.1034768;

        res.json({ 
            success: true, 
            price: gramPrice24,
            pricePerGram24: gramPrice24 
        });
    } catch (error) {
        console.error('API Fetch Error:', error.message);
        res.status(500).json({ success: false, message: 'تعذر جلب السعر المباشر' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
