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
        // استخدام API أكثر استقرارًا لأسعار العملات والمعادن (ExchangeRate-API)
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/XAU');
        
        // 1 أونصة = 31.1034768 جرام
        const pricePerOunceUSD = 1 / response.data.rates.USD;
        const gramPrice24 = pricePerOunceUSD / 31.1034768;

        res.json({ 
            success: true, 
            price: gramPrice24, // للتوافق مع الكود القديم
            pricePerGram24: gramPrice24 
        });
    } catch (error) {
        console.error('API Fetch Error:', error.message);
        res.status(500).json({ success: false, message: 'فشل جلب سعر الذهب' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
