document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.btn');

    let currentInput = '';
    let shouldResetDisplay = false;

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
                    const expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
                    const result = eval(expression);
                    
                    if (isNaN(result) || !isFinite(result)) {
                        throw new Error('Invalid calculation');
                    }
                    
                    currentInput = result.toString();
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

    // Initialize display
    updateDisplay('', false);
});