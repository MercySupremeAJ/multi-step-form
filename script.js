// ============================================
// TECH EQUIPMENT RENTAL BOOKING SYSTEM
// Complete Form Logic & State Management
// ============================================

class RentalBookingForm {
    constructor() {
        // Form elements
        this.form = document.getElementById('booking-form');
        this.steps = document.querySelectorAll('.form-step');
        this.stepIndicators = document.querySelectorAll('.step-indicator');
        this.nextBtn = document.getElementById('next-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.submitBtn = document.getElementById('submit-btn');
        this.progressBar = document.getElementById('progress-bar-fill');
        this.progressText = document.getElementById('progress-text');

        // Equipment pricing data
        this.equipmentPricing = {
            '4K-Camera': 150,
            'drone': 200,
            'lighting-kit': 80,
            'laptop': 120,
            'gimbal': 90,
            'sound-system': 75
        };

        this.durationMultipliers = {
            '1-day': { days: 1, discount: 0 },
            '3-days': { days: 3, discount: 0.15 },
            '1-week': { days: 7, discount: 0.25 },
            '1-month': { days: 30, discount: 0.35 }
        };

        this.servicesPricing = {
            'insurance': { pricePerDay: 25, type: 'per-day' },
            'delivery': { priceFixed: 50, type: 'fixed' },
            'technician': { pricePerDay: 60, type: 'per-day' },
            'backup': { priceFixed: 40, type: 'fixed' }
        };

        // Form state
        this.currentStep = 1;
        this.formData = {
            fullName: '',
            email: '',
            phone: '',
            equipment: '',
            duration: '1-day',
            services: []
        };

        this.errors = {};

        // Initialize
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
    }

    setupEventListeners() {
        // Navigation buttons
        this.nextBtn.addEventListener('click', (e) => this.handleNext(e));
        this.prevBtn.addEventListener('click', () => this.handlePrev());
        this.submitBtn.addEventListener('click', (e) => this.handleSubmit(e));

        // Form inputs
        document.getElementById('fullName').addEventListener('input', (e) => {
            this.formData.fullName = e.target.value;
        });

        document.getElementById('email').addEventListener('input', (e) => {
            this.formData.email = e.target.value;
        });

        document.getElementById('phone').addEventListener('input', (e) => {
            this.formData.phone = e.target.value;
        });

        // Equipment selection
        document.querySelectorAll('input[name="equipment"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.formData.equipment = e.target.value;
                this.clearError('equipment');
            });
        });

        // Duration selection
        document.querySelectorAll('input[name="duration"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.formData.duration = e.target.value;
                this.updateSummary();
            });
        });

        // Services selection
        document.querySelectorAll('input[name="services"]').forEach(input => {
            input.addEventListener('change', () => {
                this.formData.services = Array.from(
                    document.querySelectorAll('input[name="services"]:checked')
                ).map(el => el.value);
                this.updateSummary();
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.body.classList.toggle('theme-dark');
            localStorage.setItem('theme', document.body.classList.contains('theme-dark') ? 'dark' : 'light');
        });

        // Step indicator click
        this.stepIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                const targetStep = index + 1;
                if (targetStep <= this.currentStep) {
                    this.goToStep(targetStep);
                }
            });
        });

        // Restore theme preference
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('theme-dark');
        }
    }

    handleNext(e) {
        e.preventDefault();

        if (this.validateCurrentStep()) {
            this.currentStep++;
            this.updateDisplay();
            this.updateProgress();

            if (this.currentStep === 4) {
                this.updateSummary();
            }
        }
    }

    handlePrev() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateDisplay();
            this.updateProgress();
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validateCurrentStep()) {
            this.showConfirmation();
        }
    }

    goToStep(step) {
        if (step > 0 && step <= this.steps.length) {
            this.currentStep = step;
            this.updateDisplay();
            this.updateProgress();
        }
    }

    validateCurrentStep() {
        this.errors = {};

        switch (this.currentStep) {
            case 1:
                return this.validatePersonalInfo();
            case 2:
                return this.validateEquipment();
            case 3:
                return true; // Step 3 has defaults
            case 4:
                return true;
            default:
                return false;
        }
    }

    validatePersonalInfo() {
        const nameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        let isValid = true;

        // Validate name
        if (!this.formData.fullName.trim()) {
            this.setError('fullName', 'Name is required');
            isValid = false;
        } else if (this.formData.fullName.trim().length < 2) {
            this.setError('fullName', 'Name must be at least 2 characters');
            isValid = false;
        } else {
            this.clearError('fullName');
            nameInput.classList.remove('has-error');
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.formData.email.trim()) {
            this.setError('email', 'Email is required');
            isValid = false;
        } else if (!emailRegex.test(this.formData.email)) {
            this.setError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            this.clearError('email');
            emailInput.classList.remove('has-error');
        }

        // Validate phone
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!this.formData.phone.trim()) {
            this.setError('phone', 'Phone number is required');
            isValid = false;
        } else if (!phoneRegex.test(this.formData.phone)) {
            this.setError('phone', 'Please enter a valid phone number');
            isValid = false;
        } else {
            this.clearError('phone');
            phoneInput.classList.remove('has-error');
        }

        return isValid;
    }

    validateEquipment() {
        if (!this.formData.equipment) {
            this.setError('equipment', 'Please select an equipment to rent');
            return false;
        } else {
            this.clearError('equipment');
            return true;
        }
    }

    setError(fieldName, message) {
        this.errors[fieldName] = message;
        const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        const inputElement = document.getElementById(fieldName);
        if (inputElement) {
            inputElement.classList.add('has-error');
        }
    }

    clearError(fieldName) {
        delete this.errors[fieldName];
        const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }

        const inputElement = document.getElementById(fieldName);
        if (inputElement) {
            inputElement.classList.remove('has-error');
        }
    }

    updateDisplay() {
        // Update form steps
        this.steps.forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('is-active');
                // Focus first input if exists
                const firstInput = step.querySelector('input');
                if (firstInput) setTimeout(() => firstInput.focus(), 100);
            } else {
                step.classList.remove('is-active');
            }
        });

        // Update step indicators
        this.stepIndicators.forEach((indicator, index) => {
            if (index + 1 <= this.currentStep) {
                indicator.classList.add('is-active');
            } else {
                indicator.classList.remove('is-active');
            }
        });

        // Update buttons visibility
        if (this.currentStep === 1) {
            this.prevBtn.style.display = 'none';
            this.nextBtn.style.display = 'block';
            this.submitBtn.style.display = 'none';
        } else if (this.currentStep === this.steps.length) {
            this.prevBtn.style.display = 'block';
            this.nextBtn.style.display = 'none';
            this.submitBtn.style.display = 'block';
        } else {
            this.prevBtn.style.display = 'block';
            this.nextBtn.style.display = 'block';
            this.submitBtn.style.display = 'none';
        }
    }

    updateProgress() {
        const progress = (this.currentStep / this.steps.length) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `Step ${this.currentStep} of ${this.steps.length}`;
    }

    updateSummary() {
        // Update customer info
        document.getElementById('summary-name').textContent = this.formData.fullName || '-';
        document.getElementById('summary-email').textContent = this.formData.email || '-';
        document.getElementById('summary-phone').textContent = this.formData.phone || '-';

        // Get equipment details
        const selectedEquipment = this.formData.equipment;
        const equipmentNames = {
            '4K-Camera': '4K Video Camera',
            'drone': 'Professional Drone',
            'lighting-kit': 'Professional Lighting Kit',
            'laptop': 'High-Performance Laptop',
            'gimbal': '3-Axis Gimbal',
            'sound-system': 'Portable Sound System'
        };

        const equipmentName = equipmentNames[selectedEquipment] || selectedEquipment;
        const dailyRate = this.equipmentPricing[selectedEquipment] || 0;

        document.getElementById('summary-equipment').textContent = equipmentName;
        document.getElementById('summary-daily-rate').textContent = `$${dailyRate}/day`;

        // Duration info
        const durationInfo = this.durationMultipliers[this.formData.duration];
        const durationText = this.formData.duration.replace('-', ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
        document.getElementById('summary-duration').textContent = durationText;

        // Calculate costs
        this.calculateAndDisplayCosts();

        // Update services summary
        this.updateServicesSummary();
    }

    calculateAndDisplayCosts() {
        const selectedEquipment = this.formData.equipment;
        const dailyRate = this.equipmentPricing[selectedEquipment] || 0;
        const durationInfo = this.durationMultipliers[this.formData.duration];
        const days = durationInfo.days;
        const discount = durationInfo.discount;

        // Equipment subtotal with discount
        const equipmentTotal = dailyRate * days;
        const equipmentSubtotal = equipmentTotal * (1 - discount);

        // Services total
        let servicesTotal = 0;
        this.formData.services.forEach(serviceId => {
            const servicePricing = this.servicesPricing[serviceId];
            if (servicePricing.type === 'per-day') {
                servicesTotal += servicePricing.pricePerDay * days;
            } else {
                servicesTotal += servicePricing.priceFixed;
            }
        });

        const totalCost = equipmentSubtotal + servicesTotal;

        // Update display
        document.getElementById('equipment-subtotal').textContent = `$${equipmentSubtotal.toFixed(2)}`;
        document.getElementById('addons-total').textContent = `$${servicesTotal.toFixed(2)}`;
        document.getElementById('total-cost').textContent = `$${totalCost.toFixed(2)}`;

        return { equipmentSubtotal, servicesTotal, totalCost };
    }

    updateServicesSummary() {
        const summarySection = document.getElementById('services-summary-section');
        const summaryList = document.getElementById('services-summary-list');

        if (this.formData.services.length === 0) {
            summarySection.style.display = 'none';
            return;
        }

        summarySection.style.display = 'block';
        summaryList.innerHTML = '';

        const durationInfo = this.durationMultipliers[this.formData.duration];
        const days = durationInfo.days;

        const serviceNames = {
            'insurance': 'Equipment Insurance',
            'delivery': 'Delivery Service',
            'technician': 'Expert Technician',
            'backup': 'Backup Equipment'
        };

        this.formData.services.forEach(serviceId => {
            const serviceName = serviceNames[serviceId];
            const servicePricing = this.servicesPricing[serviceId];
            let priceText = '';

            if (servicePricing.type === 'per-day') {
                const totalPrice = servicePricing.pricePerDay * days;
                priceText = `$${totalPrice.toFixed(2)}`;
            } else {
                priceText = `$${servicePricing.priceFixed.toFixed(2)}`;
            }

            summaryList.innerHTML += `
                <div class="summary-row">
                    <span class="summary-label">• ${serviceName}</span>
                    <span class="summary-value">${priceText}</span>
                </div>
            `;
        });
    }

    showConfirmation() {
        // Hide everything and show confirmation
        this.steps.forEach(step => step.classList.remove('is-active'));
        const currentStep = document.querySelector(`.form-step[data-step="4"]`);
        currentStep.classList.add('is-active');

        const confirmationMsg = document.getElementById('confirmation-message');
        confirmationMsg.style.display = 'block';

        // Scroll to confirmation
        confirmationMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Log form data (in real app, this would send to server)
        console.log('Booking Confirmed!', {
            ...this.formData,
            timestamp: new Date().toISOString()
        });

        // Hide navigation buttons
        this.nextBtn.style.display = 'none';
        this.prevBtn.style.display = 'none';
        this.submitBtn.style.display = 'none';

        // Optional: Show a button to start over
        setTimeout(() => {
            this.addResetButton();
        }, 1000);
    }

    addResetButton() {
        if (!document.getElementById('reset-btn')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'reset-btn';
            resetBtn.className = 'nav-button nav-button--primary';
            resetBtn.textContent = 'Start New Booking';
            resetBtn.style.marginTop = '20px';

            resetBtn.addEventListener('click', () => {
                this.resetForm();
            });

            const navArea = document.querySelector('.form-navigation');
            if (navArea) {
                navArea.appendChild(resetBtn);
            }
        }
    }

    resetForm() {
        // Reset state
        this.currentStep = 1;
        this.formData = {
            fullName: '',
            email: '',
            phone: '',
            equipment: '',
            duration: '1-day',
            services: []
        };
        this.errors = {};

        // Reset form inputs
        this.form.reset();

        // Reset UI
        document.getElementById('confirmation-message').style.display = 'none';
        document.getElementById('reset-btn')?.remove();

        // Go back to step 1
        this.updateDisplay();
        this.updateProgress();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============================================
// Initialize form when DOM is ready
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new RentalBookingForm();
});
