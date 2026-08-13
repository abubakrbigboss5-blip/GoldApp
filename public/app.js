const TROY_OUNCE_GRAMS = 31.1034768;

// حفظ البيانات في LocalStorage لضمان عدم تغيرها عند الـ Refresh
function saveInputs() {
    const data = {
        usdRate: document.getElementById('usdRate')?.value,
        g21Amount: document.getElementById('g21Amount')?.value,
        g24Amount: document.getElementById('g24Amount')?.value,
        usdSavings: document.getElementById('usdSavings')?.value,
        eurSavings: document.getElementById('eurSavings')?.value,
        sdgSavings: document.getElementById('sdgSavings')?.value
    };
    localStorage.setItem('goldAppSavedData', JSON.stringify(data));
}

// استرجاع المدخلات المحفوظة عند فتح الصفحة
function loadInputs() {
    const saved = localStorage.getItem('goldAppSavedData');
    if (saved) {
        const data = JSON.parse(saved);
        if (document.getElementById('usdRate')) document.getElementById('usdRate').value = data.usdRate || 2000;
        if (document.getElementById('g21Amount')) document.getElementById('g21Amount').value = data.g21Amount || 0;
        if (document.getElementById('g24Amount')) document.getElementById('g24Amount').value = data.g24Amount || 0;
        if (document.getElementById('usdSavings')) document.getElementById('usdSavings').value = data.usdSavings || 0;
        if (document.getElementById('eurSavings')) document.getElementById('eurSavings').value = data.eurSavings || 0;
        if (document.getElementById('sdgSavings')) document.getElementById('sdgSavings').value = data.sdgSavings || 0;
    } else {
        if (document.getElementById('usdRate')) document.getElementById('usdRate').value = 2000;
    }
}

async function fetchMarketData() {
    const statusDiv = document.getElementById('status');
    if (statusDiv) statusDiv.innerText = "جاري تحديث الأسعار المباشرة...";
    try {
        const response = await fetch('/api/gold');
        const data = await response.json();
        
        if (!data.success) throw new Error(data.message || 'خطأ في جلب البيانات');
        
        if (statusDiv) statusDiv.innerText = "تم تحديث الأسعار بنجاح";
        return {
            ouncePriceUSD: data.ouncePriceUSD || data.price,
            eurUsdRate: data.eurUsdRate || 1.08
        };
    } catch (error) {
        if (statusDiv) statusDiv.innerText = "تعذر التحديث المباشر، تحقق من الاتصال";
        return null;
    }
}

async function calculateGoldPrices() {
    saveInputs(); // حفظ القيمة الحالية للمدخلات

    const usdRate = parseFloat(document.getElementById('usdRate')?.value) || 0;
    const g21Amount = parseFloat(document.getElementById('g21Amount')?.value) || 0;
    const g24Amount = parseFloat(document.getElementById('g24Amount')?.value) || 0;
    const usdSavings = parseFloat(document.getElementById('usdSavings')?.value) || 0;
    const eurSavings = parseFloat(document.getElementById('eurSavings')?.value) || 0;
    const sdgSavings = parseFloat(document.getElementById('sdgSavings')?.value) || 0;

    if (usdRate <= 0) {
        alert("يرجى إدخال سعر صرف صحيح للدولار");
        return;
    }

    const marketData = await fetchMarketData();
    if (!marketData || !marketData.ouncePriceUSD) return;

    const { ouncePriceUSD, eurUsdRate } = marketData;

    // حسابات الجرام المحلي
    const gram24PureUSD = ouncePriceUSD / TROY_OUNCE_GRAMS;
    const gram24_995_Local = (gram24PureUSD * 0.995) * usdRate;
    const gram21_Local = (gram24PureUSD * (21 / 24)) * usdRate;

    // حساب قيم المدخرات بالجنيه
    const valueG21 = g21Amount * gram21_Local;
    const valueG24 = g24Amount * gram24_995_Local;
    const valueUSD = usdSavings * usdRate;
    const valueEUR = (eurSavings * eurUsdRate) * usdRate; // تحويل اليورو إلى دولار ثم إلى جنيه
    const valueSDG = sdgSavings;

    const totalSavings = valueG21 + valueG24 + valueUSD + valueEUR + valueSDG;

    // عرض نتائج الأسعار
    const elOunce = document.getElementById('ouncePriceUsd');
    if (elOunce) elOunce.innerText = `$${ouncePriceUSD.toLocaleString(undefined, {maximumFractionDigits: 2})}`;

    const elEurUsd = document.getElementById('eurUsdRate');
    if (elEurUsd) elEurUsd.innerText = `$${eurUsdRate.toLocaleString(undefined, {maximumFractionDigits: 3})}`;

    const elG24 = document.getElementById('g24');
    if (elG24) elG24.innerText = `${gram24_995_Local.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    const elG21 = document.getElementById('g21');
    if (elG21) elG21.innerText = `${gram21_Local.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    // عرض تفاصيل المحفظة
    const elValG21 = document.getElementById('valG21');
    if (elValG21) elValG21.innerText = `${valueG21.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    const elValG24 = document.getElementById('valG24');
    if (elValG24) elValG24.innerText = `${valueG24.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    const elValUsd = document.getElementById('valUsd');
    if (elValUsd) elValUsd.innerText = `${valueUSD.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    const elValEur = document.getElementById('valEur');
    if (elValEur) elValEur.innerText = `${valueEUR.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    const elValSdg = document.getElementById('valSdg');
    if (elValSdg) elValSdg.innerText = `${valueSDG.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    // الإجمالي النهائي
    const elTotal = document.getElementById('totalSavings');
    if (elTotal) elTotal.innerText = `${totalSavings.toLocaleString(undefined, {maximumFractionDigits: 0})} SDG`;

    const elResults = document.getElementById('results');
    if (elResults) elResults.style.display = 'block';
}

// إضافة الحفظ التلقائي أثناء الكتابة في أي حقل
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') {
        saveInputs();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    loadInputs();
    calculateGoldPrices();
});
