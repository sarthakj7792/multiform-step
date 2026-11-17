// Application State
const state = {
  currentStep: 1,
  name: '',
  email: '',
  phone: '',
  plan: 'Arcade',
  yearly: false,
  addons: []
};

const plans = {
  Arcade: { monthly: 9, yearly: 90 },
  Advanced: { monthly: 12, yearly: 120 },
  Pro: { monthly: 15, yearly: 150 }
};

const addons = {
  'Online Services': { monthly: 1, yearly: 10, title: 'Online service' },
  'Larger Storage': { monthly: 2, yearly: 20, title: 'Larger storage' },
  'Customizable Profile': { monthly: 2, yearly: 20, title: 'Customizable profile' }
};

// DOM Elements
const pages = document.querySelectorAll('.form-step');
const indicators = document.querySelectorAll('.step-indicator');
const nextButton = document.getElementById('next-button');
const backButton = document.getElementById('back-button');
const navBar = document.getElementById('navigation-bar');
const billingToggle = document.getElementById('billing-toggle');

const nameInput = document.querySelector('input[name="userName"]');
const emailInput = document.querySelector('input[name="email"]');
const phoneInput = document.querySelector('input[name="phone"]');

const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const phoneError = document.getElementById('phone-error');
const planError = document.getElementById('plan-error');

function getPrice(item) {
  return state.yearly ? item.yearly : item.monthly;
}

function formatPrice(price) {
  return `$${price}/${state.yearly ? 'yr' : 'mo'}`;
}

// Show Step
function showStep(step) {
  state.currentStep = step;

  pages.forEach(page => {
    const isActive = Number(page.dataset.page) === step;
    page.classList.toggle('active', isActive);
  });

  indicators.forEach(indicator => {
    const stepNum = Number(indicator.dataset.step);
    // When step is 5 (Thank you), Step 4 remains highlighted
    const isActive = (step <= 4 && stepNum === step) || (step === 5 && stepNum === 4);
    indicator.classList.toggle('active', isActive);
    const numEl = indicator.querySelector('.step-number');
    if (numEl) {
      numEl.classList.toggle('active', isActive);
    }
  });

  if (step === 5) {
    if (navBar) navBar.style.display = 'none';
  } else {
    if (navBar) navBar.style.display = 'flex';
    backButton.hidden = (step === 1);
    nextButton.hidden = false;
    nextButton.textContent = (step === 4) ? 'Confirm' : 'Next Step';
    nextButton.classList.toggle('confirm', step === 4);
  }

  if (step === 4) {
    renderSummary();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validation Step 1
function validatePersonalInfo() {
  state.name = nameInput.value.trim();
  state.email = emailInput.value.trim();
  state.phone = phoneInput.value.trim();

  let valid = true;

  // Name validation
  nameInput.classList.remove('invalid');
  nameError.textContent = '';
  if (!state.name) {
    nameInput.classList.add('invalid');
    nameError.textContent = 'Enter your name';
    valid = false;
  }

  // Email validation
  emailInput.classList.remove('invalid');
  emailError.textContent = '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!state.email) {
    emailInput.classList.add('invalid');
    emailError.textContent = 'Enter email';
    valid = false;
  } else if (!emailRegex.test(state.email) || !emailInput.checkValidity()) {
    emailInput.classList.add('invalid');
    emailError.textContent = 'Please enter a valid email address';
    valid = false;
  }

  // Phone validation
  phoneInput.classList.remove('invalid');
  phoneError.textContent = '';
  if (!state.phone) {
    phoneInput.classList.add('invalid');
    phoneError.textContent = 'Enter your mobile number';
    valid = false;
  }

  return valid;
}

// Plan Selection
function selectPlan(planName) {
  state.plan = planName;

  document.querySelectorAll('.plan_card').forEach(card => {
    const isSelected = card.dataset.plan === planName;
    card.classList.toggle('selected', isSelected);
    card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  });

  if (planError) {
    planError.textContent = '';
  }
}

// Update Plan and Add-on Prices
function updatePlanPrices() {
  document.querySelectorAll('.plan_card').forEach(card => {
    const planKey = card.dataset.plan;
    const plan = plans[planKey];
    if (plan) {
      const priceEl = card.querySelector('.plan-price');
      if (priceEl) priceEl.textContent = formatPrice(getPrice(plan));

      const benefitEl = card.querySelector('.yearly-benefit');
      if (benefitEl) benefitEl.classList.toggle('visible', state.yearly);
    }
  });

  document.querySelectorAll('.billing-label').forEach(label => {
    label.classList.remove('active');
  });

  const activeBillingLabel = document.querySelector(
    state.yearly ? '.yearly-label' : '.monthly-label'
  );
  if (activeBillingLabel) activeBillingLabel.classList.add('active');

  if (billingToggle) {
    billingToggle.setAttribute('aria-checked', String(state.yearly));
    billingToggle.classList.toggle('yearly', state.yearly);
  }

  document.querySelectorAll('.addon_card').forEach(card => {
    const priceEl = card.querySelector('.addon-price');
    if (priceEl) {
      const monthlyPrice = priceEl.dataset.monthly;
      const yearlyPrice = priceEl.dataset.yearly;
      const amount = state.yearly ? yearlyPrice : monthlyPrice;
      priceEl.textContent = `+$${amount}/${state.yearly ? 'yr' : 'mo'}`;
    }
  });
}

// Update Add-ons State
function updateAddonState() {
  const checkedBoxes = document.querySelectorAll('input[name="addons"]:checked');
  state.addons = Array.from(checkedBoxes).map(input => input.value);

  document.querySelectorAll('.addon_card').forEach(card => {
    const checkbox = card.querySelector('input[name="addons"]');
    if (checkbox) {
      card.classList.toggle('selected', checkbox.checked);
    }
  });
}

// Render Summary
function renderSummary() {
  const plan = plans[state.plan] || { monthly: 0, yearly: 0 };
  const planPrice = getPrice(plan);

  const planNameEl = document.getElementById('summary-plan-name');
  if (planNameEl) {
    planNameEl.textContent = `${state.plan} (${state.yearly ? 'Yearly' : 'Monthly'})`;
  }

  const planPriceEl = document.getElementById('summary-plan-price');
  if (planPriceEl) {
    planPriceEl.textContent = formatPrice(planPrice);
  }

  const summaryAddons = document.getElementById('summary-addons');
  if (summaryAddons) {
    summaryAddons.innerHTML = '';
    let total = planPrice;

    state.addons.forEach(addonKey => {
      const addon = addons[addonKey];
      if (addon) {
        const addonPrice = getPrice(addon);
        total += addonPrice;

        const row = document.createElement('div');
        row.className = 'summary-addon-row';

        const label = document.createElement('span');
        label.textContent = addon.title || addonKey;

        const price = document.createElement('strong');
        price.textContent = `+$${addonPrice}/${state.yearly ? 'yr' : 'mo'}`;

        row.appendChild(label);
        row.appendChild(price);
        summaryAddons.appendChild(row);
      }
    });

    const totalLabel = document.getElementById('total-label');
    if (totalLabel) {
      totalLabel.textContent = `Total (per ${state.yearly ? 'year' : 'month'})`;
    }

    const totalPriceEl = document.getElementById('summary-total-price');
    if (totalPriceEl) {
      totalPriceEl.textContent = `+$${total}/${state.yearly ? 'yr' : 'mo'}`;
    }
  }
}

// Event Listeners

// Plan Cards
document.querySelectorAll('.plan_card').forEach(card => {
  card.addEventListener('click', () => selectPlan(card.dataset.plan));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectPlan(card.dataset.plan);
    }
  });
});

// Addon Cards
document.querySelectorAll('.addon_card').forEach(card => {
  card.addEventListener('change', () => {
    updateAddonState();
  });
});

// Billing period switch
if (billingToggle) {
  billingToggle.addEventListener('click', () => {
    state.yearly = !state.yearly;
    updatePlanPrices();
    if (state.currentStep === 4) {
      renderSummary();
    }
  });
}

// Change plan link from summary
const changePlanBtn = document.getElementById('change-plan');
if (changePlanBtn) {
  changePlanBtn.addEventListener('click', () => {
    showStep(2);
  });
}

// Next button
nextButton.addEventListener('click', () => {
  if (state.currentStep === 1) {
    if (!validatePersonalInfo()) return;
    showStep(2);
    return;
  }

  if (state.currentStep === 2) {
    const selected = document.querySelector('.plan_card.selected');
    if (!selected) {
      if (planError) planError.textContent = 'Please select a plan';
      return;
    }
    showStep(3);
    return;
  }

  if (state.currentStep === 3) {
    updateAddonState();
    showStep(4);
    return;
  }

  if (state.currentStep === 4) {
    showStep(5);
  }
});

// Back button
backButton.addEventListener('click', () => {
  if (state.currentStep > 1) {
    showStep(state.currentStep - 1);
  }
});

// Clear validation errors on user input
[nameInput, emailInput, phoneInput].forEach(input => {
  if (input) {
    input.addEventListener('input', () => {
      input.classList.remove('invalid');
      const errEl = document.getElementById(`${input.name === 'userName' ? 'name' : input.name}-error`);
      if (errEl) errEl.textContent = '';
    });
  }
});

// Initial Setup
selectPlan(state.plan);
updatePlanPrices();
updateAddonState();
showStep(1);
