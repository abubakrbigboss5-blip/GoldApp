const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// خدمة الملفات الثابتة من المجلد الرئيسي
app.use(express.static(__dirname));

// التوجيه للصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API جلب سعر الذهب المباشر
app.get('/api/gold', async (req, res) => {
    try {
        // جلب سعر أونصة الذهب بالدولار من Binance API (PAXG/USDT)
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', {
            timeout: 5000
        });
        
        const ouncePrice = parseFloat(response.data.price);
        // تحويل الأونصة إلى جرام عيار 24 (الأونصة = 31.1034768 جرام)
        const gramPrice24 = ouncePrice / 31.1034768;

        res.json({ 
            success: true, 
            pricePerGram24: gramPrice24 
        });
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'تعذر جلب السعر المباشر' 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
