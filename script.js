document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.btn');

    let currentInput = '';

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent;
            const buttonType = button.classList;

            if (buttonType.contains('btn-number')) {
                currentInput += buttonText;
                display.value = currentInput;
            } else if (buttonType.contains('btn-operator')) {
                currentInput += ` ${buttonText} `;
                display.value = currentInput;
            } else if (buttonType.contains('btn-clear')) {
                currentInput = '';
                display.value = '';
            } else if (buttonType.contains('btn-equal')) {
                try {
                    // WARNING: Using eval() is generally unsafe for untrusted input. 
                    // For a simple calculator, it's a common quick-fix for learning/demonstration.
                    // Replace 'x' and '÷' with standard operators for eval.
                    const expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
                    currentInput = eval(expression).toString();
                    display.value = currentInput;
                } catch (error) {
                    display.value = 'Error';
                    currentInput = '';
                }
            }
        });
    });
});