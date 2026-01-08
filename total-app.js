/**
 * 總額快速計算器 Logic
 */

let entries = [];

// DOM 元素
const mainInput = document.getElementById('mainInput');
const listItems = document.getElementById('listItems');
const grandTotalEl = document.getElementById('grandTotal');
const addBtn = document.getElementById('addBtn');

// 初始化圖示
function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// 格式化數字
function formatNumber(num) {
    return Number(num).toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

// 更新統計數據
function updateSummary() {
    const total = entries.reduce((acc, curr) => acc + curr.amount, 0);
    grandTotalEl.textContent = formatNumber(total);
}

// 渲染清單
function renderList() {
    if (entries.length === 0) {
        listItems.innerHTML = `
            <div class="empty-state">
                <i data-lucide="calculator"></i>
                <p>尚未輸入任何金額</p>
            </div>
        `;
        initIcons();
        return;
    }

    listItems.innerHTML = entries.map((entry, index) => `
        <div class="item-row total-mode">
            <span class="item-index">#${index + 1}</span>
            <span class="item-sales">${formatNumber(entry.amount)}</span>
            <button class="delete-btn" onclick="deleteEntry(${index})" title="刪除">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `).reverse().join('');

    initIcons();
}

// 刪除項目
window.deleteEntry = function (index) {
    entries.splice(index, 1);
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

    const newEntry = {
        amount: val,
        timestamp: Date.now()
    };

    entries.push(newEntry);

    mainInput.value = '';
    renderList();
    updateSummary();
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

// 保持 Focus
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
