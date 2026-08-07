const TROY_OUNCE_GRAMS = 31.1034768;

// حفظ البيانات في LocalStorage لضمان عدم تغيرها عند الـ Refresh
function saveInputs() {
    const data = {
        usdRate: document.getElementById('usdRate').value,
        g21Amount: document.getElementById('g21Amount').value,
        g24Amount: document.getElementById('g24Amount').value,
        usdSavings: document.getElementById('usdSavings').value,
        sdgSavings: document.getElementById('sdgSavings').value
    };
    localStorage.setItem('goldAppSavedData', JSON.stringify(data));
}

// استرجاع المدخلات المحفوظة عند فتح الصفحة
function loadInputs() {
    const saved = localStorage.getItem('goldAppSavedData');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('usdRate').value = data.usdRate || 2000;
        document.getElementById('g21Amount').value = data.g21Amount || 0;
        document.getElementById('g24Amount').value = data.g24Amount || 0;
        document.getElementById('usdSavings').value = data.usdSavings || 0;
        document.getElementById('sdgSavings').value = data.sdgSavings || 0;
    } else {
        document.getElementById('usdRate').value = 2000;
    }
}

async function fetchGoldPriceUSD() {
    const statusDiv = document.getElementById('status');
    statusDiv.innerText = "جاري تحديث سعر الذهب المباشر...";
    try {
        const response = await fetch('/api/gold');
        const data = await response.json();
        
        if (!data.success) throw new Error(data.message);
        
        statusDiv.innerText = "تم تحديث السعر بنجاح";
        return data.price;
    } catch (error) {
        statusDiv.innerText = "تعذر التحديث المباشر، تحقق من الاتصال";
        return null;
    }
}

async function calculateGoldPrices() {
    saveInputs(); // حفظ القيمة الحالية للمدخلات

    const usdRate = parseFloat(document.getElementById('usdRate').value) || 0;
    const g21Amount = parseFloat(document.getElementById('g21Amount').value) || 0;
    const g24Amount = parseFloat(document.getElementById('g24Amount').value) || 0;
    const usdSavings = parseFloat(document.getElementById('usdSavings').value) || 0;
    const sdgSavings = parseFloat(document.getElementById('sdgSavings').value) || 0;

    if (usdRate <= 0) {
        alert("يرجى إدخال سعر صرف صحيح للدولار");
        return;
    }

    const ouncePriceUSD = await fetchGoldPriceUSD();
    if (!ouncePriceUSD) return;

    // حسابات الجرام المحلي
    const gram24PureUSD = ouncePriceUSD / TROY_OUNCE_GRAMS;
    const gram24_995_Local = (gram24PureUSD * 0.995) * usdRate;
    const gram21_Local = (gram24PureUSD * (21 / 24)) * usdRate;

    // حساب قيم المدخرات بالجنيه
    const valueG21 = g21Amount * gram21_Local;
    const valueG24 = g24Amount * gram24_995_Local;
    const valueUSD = usdSavings * usdRate;
    const valueSDG = sdgSavings;

    const totalSavings = valueG21 + valueG24 + valueUSD + valueSDG;

    // عرض نتائج الأسعار
    document.getElementById('ouncePriceUsd').innerText = `$${ouncePriceUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
    document.getElementById('g24').innerText = `${gram24_995_Local.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;
    document.getElementById('g21').innerText = `${gram21_Local.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    // عرض تفاصيل المحفظة
    document.getElementById('valG21').innerText = `${valueG21.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;
    document.getElementById('valG24').innerText = `${valueG24.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;
    document.getElementById('valUsd').innerText = `${valueUSD.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;
    document.getElementById('valSdg').innerText = `${valueSDG.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;
    
    // الإجمالي النهائي
    document.getElementById('totalSavings').innerText = `${totalSavings.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    document.getElementById('results').style.display = 'block';
}

// إضافة الحفظ التلقائي للفرس أثناء الكتابة
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', saveInputs);
});

window.addEventListener('DOMContentLoaded', () => {
    loadInputs();
    calculateGoldPrices();
});
