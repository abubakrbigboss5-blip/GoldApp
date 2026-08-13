let ouncePriceUSD = 0;
let eurUsdRate = 0;

async function fetchGoldPrice() {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.innerText = 'جاري جلب أسعار الذهب والعملات...';
        statusEl.style.color = '#7f8c8d';
    }

    try {
        const res = await fetch('/api/gold');
        const data = await res.json();

        if (data.success && data.ouncePriceUSD) {
            ouncePriceUSD = data.ouncePriceUSD;
            eurUsdRate = data.eurUsdRate || 1.08;

            if (statusEl) {
                statusEl.innerText = `تم تحديث الأسعار (1€ = $${eurUsdRate.toFixed(3)})`;
                statusEl.style.color = '#27ae60';
            }
        } else {
            throw new Error('فشل جلب البيانات');
        }
    } catch (err) {
        if (statusEl) {
            statusEl.innerText = 'تعذر جلب السعر المباشر، يرجى إدخال البيانات والتجربة';
            statusEl.style.color = '#e74c3c';
        }
    }
}

function calculateGoldPrices() {
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 0;
    const g21Amount = parseFloat(document.getElementById('g21Amount').value) || 0;
    const g24Amount = parseFloat(document.getElementById('g24Amount').value) || 0;
    const usdSavings = parseFloat(document.getElementById('usdSavings').value) || 0;
    const eurSavings = parseFloat(document.getElementById('eurSavings').value) || 0;
    const sdgSavings = parseFloat(document.getElementById('sdgSavings').value) || 0;

    if (usdRate <= 0) {
        alert('يرجى إدخال سعر صرف الدولار (SDG)');
        return;
    }

    if (ouncePriceUSD <= 0) {
        alert('لم يتم جلب الأسعار المباشرة بعد، يرجى الانتظار أو التحديث');
        return;
    }

    // 1. حساب أسعار الجرام بالدولار والجنيه
    const gram24USD = ouncePriceUSD / 31.1034768;
    const gram24_995_USD = gram24USD * 0.995;
    const gram21USD = gram24USD * (21 / 24);

    const gram24SDG = gram24_995_USD * usdRate;
    const gram21SDG = gram21USD * usdRate;

    // 2. تحويل اليورو إلى دولار ومن ثم إلى جنيه سوداني
    // قيمة اليورو بالدولار = كمية اليورو × سعر صرف EUR/USD
    const eurInUSD = eurSavings * eurUsdRate;
    const valEurSDG = eurInUSD * usdRate;

    // 3. حساب باقي الأصول بالجنيه
    const valG21 = g21Amount * gram21SDG;
    const valG24 = g24Amount * gram24SDG;
    const valUsd = usdSavings * usdRate;
    const valSdg = sdgSavings;

    const grandTotal = valG21 + valG24 + valUsd + valEurSDG + valSdg;

    // عرض النشرة والأسعار
    document.getElementById('ouncePriceUsd').innerText = `$${ouncePriceUSD.toFixed(2)}`;
    document.getElementById('eurUsdRate').innerText = `$${eurUsdRate.toFixed(3)}`;
    document.getElementById('g24').innerText = `${Math.round(gram24SDG).toLocaleString()} SDG`;
    document.getElementById('g21').innerText = `${Math.round(gram21SDG).toLocaleString()} SDG`;

    // عرض تفاصيل قيم الأصول
    document.getElementById('valG21').innerText = `${Math.round(valG21).toLocaleString()} SDG`;
    document.getElementById('valG24').innerText = `${Math.round(valG24).toLocaleString()} SDG`;
    document.getElementById('valUsd').innerText = `${Math.round(valUsd).toLocaleString()} SDG`;
    document.getElementById('valEur').innerText = `${Math.round(valEurSDG).toLocaleString()} SDG`;
    document.getElementById('valSdg').innerText = `${Math.round(valSdg).toLocaleString()} SDG`;

    document.getElementById('totalSavings').innerText = `${Math.round(grandTotal).toLocaleString()} SDG`;

    document.getElementById('results').style.display = 'block';
}

window.addEventListener('DOMContentLoaded', fetchGoldPrice);
