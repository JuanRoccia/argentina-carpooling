function decrementPassengers(btn) {
    const input = btn.parentElement.querySelector('input[type="number"]');
    const currentValue = parseInt(input.value);
    if (currentValue > parseInt(input.min)) {
        input.value = currentValue - 1;
        updatePassengerText(input);
    }
}

function incrementPassengers(btn) {
    const input = btn.parentElement.querySelector('input[type="number"]');
    const currentValue = parseInt(input.value);
    if (currentValue < parseInt(input.max)) {
        input.value = currentValue + 1;
        updatePassengerText(input);
    }
}

function updatePassengerText(input) {
    const value = parseInt(input.value);
    const label = input.parentElement.nextElementSibling;
    if (label && label.classList.contains('passenger-count')) {
        label.textContent = `${value} passenger${value > 1 ? 's' : ''}`;
    }
}
