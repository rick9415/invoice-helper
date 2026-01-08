/**
 * 發票快速計算器 App 邏輯
 */

// 狀態管理
let invoices = [];
let isWaitingForTax = false; // 目前是否在期待輸入稅額
let tempSales = null;

// DOM 元素
const mainInput = document.getElementById('mainInput');
const currentStatus = document.getElementById('currentStatus');
const listItems = document.getElementById('listItems');
const totalSalesEl = document.getElementById('totalSales');
const totalTaxEl = document.getElementById('totalTax');
const grandTotalEl = document.getElementById('grandTotal');
const addBtn = document.getElementById('addBtn');

// 初始化圖示
function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// 格式化數字 (加千分位)
function formatNumber(num) {
    return Number(num).toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

// 更新統計數據
function updateSummary() {
    const totals = invoices.reduce((acc, curr) => {
        acc.sales += curr.sales;
        acc.tax += curr.tax;
        return acc;
    }, { sales: 0, tax: 0 });

    totalSalesEl.textContent = formatNumber(totals.sales);
    totalTaxEl.textContent = formatNumber(totals.tax);
    grandTotalEl.textContent = formatNumber(totals.sales + totals.tax);
}

// 渲染清單
function renderList() {
    if (invoices.length === 0) {
        listItems.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calculator"></i>
                <p>尚未輸入任何發票資訊</p>
            </div>
        `;
        initIcons();
        return;
    }

    listItems.innerHTML = invoices.map((invoice, index) => `
        <div class="item-row">
            <span class="item-index">#${index + 1}</span>
            <span class="item-sales">${formatNumber(invoice.sales)}</span>
            <span class="item-tax">${formatNumber(invoice.tax)}</span>
            <span class="item-total">${formatNumber(invoice.sales + invoice.tax)}</span>
            <button class="delete-btn" onclick="deleteInvoice(${index})" title="刪除">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `).reverse().join(''); // 最新的在上面

    initIcons();
}

// 刪除發票
window.deleteInvoice = function (index) {
    invoices.splice(index, 1);
    renderList();
    updateSummary();
};

// 處理輸入核心邏輯
function processValue() {
    const val = parseFloat(mainInput.value);

    if (isNaN(val)) {
        mainInput.value = '';
        mainInput.focus();
        return;
    }

    if (!isWaitingForTax) {
        // 目前輸入的是銷售額
        tempSales = val;
        isWaitingForTax = true;

        // 更新 UI 狀態
        currentStatus.textContent = '● 稅額';
        currentStatus.style.color = 'var(--accent-color)';
        mainInput.placeholder = '請輸入稅額...';
        mainInput.value = '';
    } else {
        // 目前輸入的是稅額
        const newInvoice = {
            sales: tempSales,
            tax: val,
            timestamp: Date.now()
        };

        invoices.push(newInvoice);

        // 重置狀態與 UI
        isWaitingForTax = false;
        tempSales = null;
        currentStatus.textContent = '● 銷售額';
        currentStatus.style.color = 'var(--primary-color)';
        mainInput.placeholder = '請輸入銷售額...';
        mainInput.value = '';

        // 更新畫面
        renderList();
        updateSummary();
    }
    mainInput.focus();
}

// 處理鍵盤輸入
function handleInput(e) {
    if (e.key === 'Enter') {
        processValue();
    }
}

// 事件監聽
mainInput.addEventListener('keydown', handleInput);
addBtn.addEventListener('click', processValue);

// 保持 Focus (在非按鈕點擊時)
document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.parentElement?.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        mainInput.focus();
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    mainInput.focus();
});
