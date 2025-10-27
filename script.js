document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.btn');

    let currentInput = '';
    let shouldResetDisplay = false;
    let calculationHistory = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
    let savedCalculations = JSON.parse(localStorage.getItem('savedCalculations')) || [];

    // Panel elements
    const historyPanel = document.getElementById('historyPanel');
    const savePanel = document.getElementById('savePanel');
    const loadPanel = document.getElementById('loadPanel');
    const overlay = document.getElementById('overlay');

    // Control buttons
    const historyBtn = document.getElementById('historyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');

    // Close buttons
    const closeHistory = document.getElementById('closeHistory');
    const closeSave = document.getElementById('closeSave');
    const closeLoad = document.getElementById('closeLoad');

    // Save panel elements
    const saveNameInput = document.getElementById('saveNameInput');
    const savePreview = document.getElementById('savePreview');
    const cancelSave = document.getElementById('cancelSave');
    const confirmSave = document.getElementById('confirmSave');

    // Clear buttons
    const clearHistory = document.getElementById('clearHistory');
    const clearSaved = document.getElementById('clearSaved');

    // Add smooth typing animation to display
    function updateDisplay(value, animate = true) {
        if (animate) {
            display.style.transform = 'scale(1.02)';
            setTimeout(() => {
                display.style.transform = 'scale(1)';
            }, 150);
        }
        display.value = value || '0';
    }

    // Add button press animation
    function animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    // Format numbers with commas for better readability
    function formatNumber(num) {
        if (num.includes('.')) {
            const [integer, decimal] = num.split('.');
            return parseInt(integer).toLocaleString() + '.' + decimal;
        }
        return parseInt(num).toLocaleString();
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            animateButton(button);
            
            const buttonText = button.textContent;
            const buttonType = button.classList;

            if (buttonType.contains('btn-number')) {
                if (shouldResetDisplay) {
                    currentInput = '';
                    shouldResetDisplay = false;
                }
                
                if (buttonText === '.' && currentInput.includes('.')) {
                    return; // Prevent multiple decimal points
                }
                
                currentInput += buttonText;
                updateDisplay(currentInput);
            } else if (buttonType.contains('btn-operator')) {
                if (currentInput === '') return;
                
                // Replace last operator if user clicks another operator
                if (['+', '-', '*', '/'].some(op => currentInput.trim().endsWith(op))) {
                    currentInput = currentInput.trim().slice(0, -1) + buttonText;
                } else {
                    currentInput += ` ${buttonText} `;
                }
                updateDisplay(currentInput);
                shouldResetDisplay = false;
            } else if (buttonType.contains('btn-clear')) {
                currentInput = '';
                updateDisplay('', false);
                
                // Add clear animation
                display.style.background = 'rgba(255, 71, 87, 0.2)';
                setTimeout(() => {
                    display.style.background = 'rgba(0, 0, 0, 0.2)';
                }, 200);
            } else if (buttonType.contains('btn-equal')) {
                if (currentInput === '') return;
                
                try {
                    const originalExpression = currentInput;
                    const expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
                    const result = eval(expression);
                    
                    if (isNaN(result) || !isFinite(result)) {
                        throw new Error('Invalid calculation');
                    }
                    
                    const resultString = result.toString();
                    
                    // Add to history
                    addToHistory(originalExpression, resultString);
                    
                    currentInput = resultString;
                    updateDisplay(formatNumber(currentInput));
                    shouldResetDisplay = true;
                    
                    // Add success animation
                    display.style.background = 'rgba(95, 39, 205, 0.3)';
                    setTimeout(() => {
                        display.style.background = 'rgba(0, 0, 0, 0.2)';
                    }, 300);
                } catch (error) {
                    updateDisplay('Error');
                    currentInput = '';
                    shouldResetDisplay = true;
                    
                    // Add error animation
                    display.style.background = 'rgba(255, 71, 87, 0.3)';
                    display.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        display.style.background = 'rgba(0, 0, 0, 0.2)';
                        display.style.animation = '';
                    }, 500);
                }
            }
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        
        if ('0123456789.'.includes(key)) {
            const numberBtn = Array.from(buttons).find(btn => 
                btn.textContent === key && btn.classList.contains('btn-number')
            );
            if (numberBtn) numberBtn.click();
        } else if ('+-*/'.includes(key)) {
            const operatorBtn = Array.from(buttons).find(btn => 
                btn.textContent === key && btn.classList.contains('btn-operator')
            );
            if (operatorBtn) operatorBtn.click();
        } else if (key === 'Enter' || key === '=') {
            const equalBtn = document.querySelector('.btn-equal');
            if (equalBtn) equalBtn.click();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            const clearBtn = document.querySelector('.btn-clear');
            if (clearBtn) clearBtn.click();
        }
    });

    // History and Save Functions
    function addToHistory(expression, result) {
        const historyItem = {
            id: Date.now(),
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleString()
        };
        
        calculationHistory.unshift(historyItem);
        
        // Keep only last 50 calculations
        if (calculationHistory.length > 50) {
            calculationHistory = calculationHistory.slice(0, 50);
        }
        
        localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    }

    function saveCalculation(name, expression, result) {
        const savedItem = {
            id: Date.now(),
            name: name.trim(),
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleString()
        };
        
        savedCalculations.unshift(savedItem);
        localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
    }

    function deleteCalculation(id) {
        savedCalculations = savedCalculations.filter(item => item.id !== id);
        localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
        renderSavedCalculations();
    }

    function clearAllHistory() {
        calculationHistory = [];
        localStorage.removeItem('calculatorHistory');
        renderHistory();
    }

    function clearAllSaved() {
        savedCalculations = [];
        localStorage.removeItem('savedCalculations');
        renderSavedCalculations();
    }

    // Panel Management
    function openPanel(panel) {
        overlay.classList.add('active');
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePanel(panel) {
        overlay.classList.remove('active');
        panel.classList.remove('active');
        document.body.style.overflow = '';
    }

    function closeAllPanels() {
        closePanel(historyPanel);
        closePanel(savePanel);
        closePanel(loadPanel);
    }

    // Render Functions
    function renderHistory() {
        const historyContent = document.getElementById('historyContent');
        
        if (calculationHistory.length === 0) {
            historyContent.innerHTML = '<p class="empty-message">No calculations yet</p>';
            return;
        }

        historyContent.innerHTML = calculationHistory.map(item => `
            <div class="history-item" data-expression="${item.expression}" data-result="${item.result}">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');

        // Add click listeners to history items
        historyContent.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const expression = item.dataset.expression;
                const result = item.dataset.result;
                currentInput = result;
                updateDisplay(result);
                closeAllPanels();
            });
        });
    }

    function renderSavedCalculations() {
        const loadContent = document.getElementById('loadContent');
        
        if (savedCalculations.length === 0) {
            loadContent.innerHTML = '<p class="empty-message">No saved calculations</p>';
            return;
        }

        loadContent.innerHTML = savedCalculations.map(item => `
            <div class="saved-item" data-expression="${item.expression}" data-result="${item.result}">
                <button class="delete-saved" data-id="${item.id}">×</button>
                <div class="saved-name">${item.name}</div>
                <div class="saved-expression">${item.expression}</div>
                <div class="saved-result">= ${item.result}</div>
                <div class="saved-time">${item.timestamp}</div>
            </div>
        `).join('');

        // Add click listeners to saved items
        loadContent.querySelectorAll('.saved-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-saved')) {
                    e.stopPropagation();
                    const id = parseInt(e.target.dataset.id);
                    deleteCalculation(id);
                    return;
                }
                
                const expression = item.dataset.expression;
                const result = item.dataset.result;
                currentInput = result;
                updateDisplay(result);
                closeAllPanels();
            });
        });
    }

    // Event Listeners
    historyBtn.addEventListener('click', () => {
        renderHistory();
        openPanel(historyPanel);
    });

    saveBtn.addEventListener('click', () => {
        if (currentInput && currentInput !== 'Error') {
            savePreview.textContent = `${currentInput}`;
            saveNameInput.value = '';
            openPanel(savePanel);
            setTimeout(() => saveNameInput.focus(), 300);
        }
    });

    loadBtn.addEventListener('click', () => {
        renderSavedCalculations();
        openPanel(loadPanel);
    });

    // Close button listeners
    closeHistory.addEventListener('click', () => closePanel(historyPanel));
    closeSave.addEventListener('click', () => closePanel(savePanel));
    closeLoad.addEventListener('click', () => closePanel(loadPanel));

    // Overlay click to close
    overlay.addEventListener('click', closeAllPanels);

    // Save panel listeners
    cancelSave.addEventListener('click', () => closePanel(savePanel));
    
    confirmSave.addEventListener('click', () => {
        const name = saveNameInput.value.trim();
        if (name && currentInput && currentInput !== 'Error') {
            saveCalculation(name, currentInput, currentInput);
            closePanel(savePanel);
            
            // Show success feedback
            display.style.background = 'rgba(95, 39, 205, 0.3)';
            setTimeout(() => {
                display.style.background = 'rgba(0, 0, 0, 0.2)';
            }, 300);
        }
    });

    saveNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmSave.click();
        }
    });

    // Clear button listeners
    clearHistory.addEventListener('click', () => {
        if (confirm('Clear all calculation history?')) {
            clearAllHistory();
        }
    });

    clearSaved.addEventListener('click', () => {
        if (confirm('Clear all saved calculations?')) {
            clearAllSaved();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'h':
                    e.preventDefault();
                    historyBtn.click();
                    break;
                case 's':
                    e.preventDefault();
                    saveBtn.click();
                    break;
                case 'o':
                    e.preventDefault();
                    loadBtn.click();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            closeAllPanels();
        }
    });

    // Initialize display
    updateDisplay('', false);
});