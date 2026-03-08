/**
 * 總額快速計算器 Logic
 */

let entries = [];
let lastDeleteAction = null; // Undo 復原用

// DOM 元素
const mainInput = document.getElementById('mainInput');
const listItems = document.getElementById('listItems');
const grandTotalEl = document.getElementById('grandTotal');
const addBtn = document.getElementById('addBtn');
const undoBtn = document.getElementById('undoBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

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

    const displayEntries = [...entries].reverse();

    listItems.innerHTML = displayEntries.map((entry, displayIndex) => {
        const originalIndex = entries.length - 1 - displayIndex;
        return `
        <div class="item-row total-mode">
            <span class="item-index">#${originalIndex + 1}</span>
            <span class="item-sales">${formatNumber(entry.amount)}</span>
            <button class="delete-btn" onclick="deleteEntry(${originalIndex})" title="刪除">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `;
    }).join('');

    initIcons();
}

function updateUndoButton() {
    if (!undoBtn) return;
    undoBtn.disabled = !lastDeleteAction;
}

function undoLastDelete() {
    if (!lastDeleteAction) return;

    if (lastDeleteAction.type === 'delete') {
        entries.splice(lastDeleteAction.index, 0, lastDeleteAction.entry);
    } else if (lastDeleteAction.type === 'clear') {
        entries = [...lastDeleteAction.entries];
    }

    lastDeleteAction = null;
    renderList();
    updateSummary();
    updateUndoButton();
    mainInput.focus();
}

// 刪除項目
window.deleteEntry = function (index) {
    const deleted = entries[index];
    lastDeleteAction = { type: 'delete', entry: deleted, index };
    entries.splice(index, 1);
    renderList();
    updateSummary();
    updateUndoButton();
};

// 全部清除
function clearAllEntries() {
    if (entries.length === 0) return;

    lastDeleteAction = { type: 'clear', entries: [...entries] };
    entries = [];
    mainInput.value = '';
    renderList();
    updateSummary();
    updateUndoButton();
    mainInput.focus();
}

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
if (undoBtn) {
    undoBtn.addEventListener('click', undoLastDelete);
}
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllEntries);
}

// 保持 Focus
document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.parentElement?.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        mainInput.focus();
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    updateUndoButton();
    mainInput.focus();
});
