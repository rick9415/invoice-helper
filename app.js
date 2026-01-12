/**
 * 發票快速計算器 App 邏輯
 */

// 狀態管理
let invoices = [];
let isWaitingForTax = false; // 目前是否在期待輸入稅額
let tempSales = null;
let sortNewestFirst = false; // 排序方式:true=最新在前,false=最舊在前
let editingIndex = null; // 正在編輯的項目索引

// DOM 元素
const mainInput = document.getElementById('mainInput');
const currentStatus = document.getElementById('currentStatus');
const listItems = document.getElementById('listItems');
const totalSalesEl = document.getElementById('totalSales');
const totalTaxEl = document.getElementById('totalTax');
const grandTotalEl = document.getElementById('grandTotal');
const addBtn = document.getElementById('addBtn');
const sortBtn = document.getElementById('sortBtn');
const sortLabel = document.getElementById('sortLabel');

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
    const itemCountEl = document.getElementById('itemCount');

    // 更新項目計數
    if (itemCountEl) {
        itemCountEl.textContent = `${invoices.length} 筆`;
    }

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

    // 根據排序方式決定顯示順序
    const displayInvoices = sortNewestFirst ? [...invoices].reverse() : [...invoices];

    listItems.innerHTML = displayInvoices.map((invoice, displayIndex) => {
        // 計算原始索引
        const originalIndex = sortNewestFirst ? invoices.length - 1 - displayIndex : displayIndex;
        const isFirst = originalIndex === 0;
        const isLast = originalIndex === invoices.length - 1;

        return `
        <div class="item-card">
            <span class="item-index">#${originalIndex + 1}</span>
            <div class="item-content">
                <div class="item-field">
                    <span class="item-field-label">銷售額</span>
                    <span class="item-field-value">${formatNumber(invoice.sales)}</span>
                </div>
                <div class="item-field">
                    <span class="item-field-label">稅額</span>
                    <span class="item-field-value">${formatNumber(invoice.tax)}</span>
                </div>
                <div class="item-field total">
                    <span class="item-field-label">小計</span>
                    <span class="item-field-value">${formatNumber(invoice.sales + invoice.tax)}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="move-btn" onclick="moveUp(${originalIndex})" title="上移" ${isFirst ? 'disabled' : ''}>
                    <i data-lucide="chevron-up"></i>
                </button>
                <button class="move-btn" onclick="moveDown(${originalIndex})" title="下移" ${isLast ? 'disabled' : ''}>
                    <i data-lucide="chevron-down"></i>
                </button>
                <button class="edit-btn" onclick="editInvoice(${originalIndex})" title="編輯">
                    <i data-lucide="pencil"></i>
                </button>
                <button class="delete-btn" onclick="deleteInvoice(${originalIndex})" title="刪除">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `;
    }).join('');

    initIcons();
}

// 刪除發票
window.deleteInvoice = function (index) {
    if (confirm('確定要刪除這筆資料嗎?')) {
        invoices.splice(index, 1);
        renderList();
        updateSummary();
    }
};

// 編輯發票
window.editInvoice = function (index) {
    const invoice = invoices[index];
    editingIndex = index;

    // 重置為編輯銷售額狀態
    isWaitingForTax = false;
    tempSales = null;

    // 更新 UI - 先輸入銷售額
    mainInput.value = invoice.sales;
    currentStatus.textContent = '● 編輯銷售額';
    currentStatus.style.color = '#fbbf24'; // 黃色表示編輯模式
    mainInput.placeholder = '修改銷售額後按 Enter...';
    mainInput.focus();
    mainInput.select();
};

// 上移項目
window.moveUp = function (index) {
    if (index > 0) {
        const temp = invoices[index];
        invoices[index] = invoices[index - 1];
        invoices[index - 1] = temp;
        renderList();
    }
};

// 下移項目
window.moveDown = function (index) {
    if (index < invoices.length - 1) {
        const temp = invoices[index];
        invoices[index] = invoices[index + 1];
        invoices[index + 1] = temp;
        renderList();
    }
};

// 切換排序
function toggleSort() {
    sortNewestFirst = !sortNewestFirst;
    sortLabel.textContent = sortNewestFirst ? '最新在前' : '最舊在前';
    renderList();
}

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

        // 只有在非編輯模式下才清除 editingIndex
        // 編輯模式下保留 editingIndex,以便稍後更新

        // 更新 UI 狀態
        if (editingIndex !== null) {
            currentStatus.textContent = '● 編輯稅額';
            currentStatus.style.color = '#fbbf24'; // 黃色表示編輯模式
            mainInput.placeholder = '修改稅額後按 Enter...';
        } else {
            currentStatus.textContent = '● 稅額';
            currentStatus.style.color = 'var(--accent-color)';
            mainInput.placeholder = '請輸入稅額...';
        }
        mainInput.value = '';
    } else {
        // 目前輸入的是稅額
        if (editingIndex !== null) {
            // 編輯模式:更新現有項目
            invoices[editingIndex] = {
                sales: tempSales,
                tax: val,
                timestamp: invoices[editingIndex].timestamp
            };
            editingIndex = null;
        } else {
            // 新增模式:加入新項目
            const newInvoice = {
                sales: tempSales,
                tax: val,
                timestamp: Date.now()
            };
            invoices.push(newInvoice);
        }

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
if (sortBtn) {
    sortBtn.addEventListener('click', toggleSort);
}

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
