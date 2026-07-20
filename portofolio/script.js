// ============================================
// 1. NAVIGASI
// ============================================
const buttons = document.querySelectorAll(".navbar button");
const pages = document.querySelectorAll(".page");

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        pages.forEach((page) => page.classList.add("hidden"));

        const target = button.dataset.page;
        const page = document.querySelector(`.${target}`);

        if (page) {
            page.classList.remove("hidden");
            page.animate(
                [
                    { opacity: 0, transform: "translateY(20px)" },
                    { opacity: 1, transform: "translateY(0)" },
                ],
                { duration: 450, easing: "ease" }
            );
        }
    });
});

// ============================================
// 2. RESUME - ACCORDION
// ============================================
const accordionTrigger = document.getElementById('accordionTrigger');
const accordionContent = document.getElementById('accordionContent');
const chevronIcon = document.getElementById('chevronIcon');
let isOpen = false;
let animationInProgress = false;

function animateProgressBars() {
    const fills = document.querySelectorAll('.progress-fill');
    fills.forEach((fill) => {
        const target = parseFloat(fill.dataset.target) || 0;
        fill.style.width = '0%';
        setTimeout(() => {
            fill.style.width = target + '%';
        }, 300);
    });
}

function animateTimelineItems() {
    const items = document.querySelectorAll('.timeline-item');
    items.forEach((item, index) => {
        item.classList.remove('visible');
        setTimeout(() => {
            item.classList.add('visible');
        }, 150 * index);
    });
}

function openAccordion() {
    if (animationInProgress) return;
    isOpen = true;
    animationInProgress = true;
    accordionContent.classList.add('open');
    if (chevronIcon) chevronIcon.classList.add('open');

    setTimeout(() => {
        animateProgressBars();
        animateTimelineItems();
    }, 600);

    setTimeout(() => { animationInProgress = false; }, 700);
}

function closeAccordion() {
    if (animationInProgress) return;
    isOpen = false;
    animationInProgress = true;
    accordionContent.classList.remove('open');
    if (chevronIcon) chevronIcon.classList.remove('open');

    document.querySelectorAll('.timeline-item').forEach(item => {
        item.classList.remove('visible');
    });
    document.querySelectorAll('.progress-fill').forEach(fill => {
        fill.style.width = '0%';
    });

    setTimeout(() => { animationInProgress = false; }, 600);
}

if (accordionTrigger) {
    accordionTrigger.addEventListener('click', () => {
        if (isOpen) {
            closeAccordion();
        } else {
            openAccordion();
        }
    });
} else {
    console.warn('⚠️ Elemen accordionTrigger tidak ditemukan!');
}

// ============================================
// 3. CONTACT - PREMIUM INTERACTIONS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const contactSection = document.getElementById('contact-section');
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnLoader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;
    const successCard = document.getElementById('successCard');

    if (!form || !submitBtn) {
        console.warn('⚠️ Form atau tombol tidak ditemukan!');
        return;
    }


    // --- RESET FORM ---
    function resetContactForm() {
        form.reset();
        form.style.display = 'block';
        form.style.opacity = '1';
        form.style.transform = 'scale(1)';
        if (successCard) {
            successCard.style.display = 'none';
            successCard.classList.remove('show');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
        document.querySelectorAll('.input-group.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.input-group input, .input-group textarea').forEach(el => {
            el.value = '';
        });
    }

    // Observer untuk reset saat contact di-hide
    const contactObserver = new MutationObserver(() => {
        if (contactSection && contactSection.classList.contains('hidden')) {
            resetContactForm();
        }
    });
    if (contactSection) {
        contactObserver.observe(contactSection, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // --- VALIDASI FORM ---
    function validateField(input) {
        const group = input.closest('.input-group');
        let valid = true;

        if (input.id === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) valid = false;
        } else {
            if (input.value.trim() === '') valid = false;
        }

        if (!valid) {
            group.classList.add('error');
        } else {
            group.classList.remove('error');
        }
        return valid;
    }

    // Real-time validation
    document.querySelectorAll('.input-group input, .input-group textarea').forEach(el => {
        el.addEventListener('blur', () => validateField(el));
        el.addEventListener('input', () => {
            const group = el.closest('.input-group');
            if (group.classList.contains('error')) {
                if (el.id === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(el.value.trim())) group.classList.remove('error');
                } else {
                    if (el.value.trim() !== '') group.classList.remove('error');
                }
            }
        });
    });

    // --- SUBMIT (Web3Forms) ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validasi semua field
        let allValid = true;
        const inputs = form.querySelectorAll('.input-group input, .input-group textarea');
        inputs.forEach(input => {
            if (!validateField(input)) allValid = false;
        });

        if (!allValid) {
            const firstError = form.querySelector('.input-group.error input, .input-group.error textarea');
            if (firstError) firstError.focus();
            return;
        }

        // --- Tampilkan loading ---
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-flex';
        submitBtn.style.opacity = '0.8';

        // --- Siapkan data ---
        const formData = new FormData(form);
        const data = {
            access_key: 'c8010882-6f25-4801-b61d-af3d06cb8700',
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject') || 'Pesan dari Portfolio',
            message: formData.get('message')
        };

        // --- Kirim ke Web3Forms ---
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(async (response) => {
            const json = await response.json();
            if (response.status === 200) {
                // --- SUCCESS ---
                form.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                form.style.opacity = '0';
                form.style.transform = 'scale(0.92)';

                setTimeout(() => {
                    form.style.display = 'none';
                    if (successCard) {
                        successCard.style.display = 'block';
                        requestAnimationFrame(() => {
                            successCard.classList.add('show');
                        });
                    }
                    submitBtn.disabled = false;
                    if (btnText) btnText.style.display = 'inline';
                    if (btnLoader) btnLoader.style.display = 'none';
                    submitBtn.style.opacity = '1';
                }, 400);
            } else {
                alert(`Pesan gagal dikirim: ${json.message || 'Terjadi kesalahan, coba lagi.'}`);
                submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
                submitBtn.style.opacity = '1';
            }
        })
        .catch((error) => {
            console.error(error);
            alert('Pesan gagal dikirim. Periksa koneksi internet kamu.');
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
            submitBtn.style.opacity = '1';
        });
    });

    // --- RIPPLE EFFECT ---
    submitBtn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

console.log('✅ Portfolio Fadlan siap digunakan!');