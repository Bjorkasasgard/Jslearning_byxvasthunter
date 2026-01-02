document.addEventListener('DOMContentLoaded', function () {
  const wizard = document.getElementById('applyWizard');
  if (!wizard) return;

  const steps = Array.from(wizard.querySelectorAll('.step'));
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const stepLabel = document.getElementById('stepLabel');
  const stepName = document.getElementById('stepName');
  const stepProgress = document.getElementById('stepProgress');
  const alertBox = document.getElementById('applyAlert');

  const jobId = Number(wizard.dataset.jobId);
  const stepTitles = ['Profile location', 'Cover letter', 'Questions'];
  let currentStep = 0;

  function showAlert(message, variant = 'info') {
    if (!alertBox) return;
    const colors = {
      info: 'border-slate-300 bg-slate-50 text-slate-700',
      success: 'border-green-200 bg-green-50 text-green-800',
      error: 'border-red-200 bg-red-50 text-red-700',
    };
    alertBox.className = `text-xs rounded-lg border px-3 py-2 ${colors[variant] || colors.info}`;
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
  }

  function clearAlert() {
    if (!alertBox) return;
    alertBox.classList.add('hidden');
    alertBox.textContent = '';
  }

  function updateStepUI(idx) {
    steps.forEach((step, i) => {
      step.classList.toggle('hidden', i !== idx);
    });
    prevBtn.classList.toggle('hidden', idx === 0);
    nextBtn.textContent = idx === steps.length - 1 ? 'Submit application' : 'Continue';
    stepLabel.textContent = `Step ${idx + 1} of ${steps.length}`;
    if (stepName) stepName.textContent = stepTitles[idx] || '';
    if (stepProgress) {
      const percent = ((idx + 1) / steps.length) * 100;
      stepProgress.style.width = `${percent}%`;
    }
  }

  function validateStep(idx) {
    if (idx === 0) {
      const location = document.getElementById('userLocation');
      if (!location || !location.value.trim()) {
        showAlert('Please provide your location.', 'error');
        return false;
      }
    }
    if (idx === 1) {
      const resumeLink = document.getElementById('resumeLink');
      if (!resumeLink || !resumeLink.value.trim()) {
        showAlert('Please provide a resume link.', 'error');
        return false;
      }
    }
    if (idx === 2) {
      const requiredAnswers = wizard.querySelectorAll('.question-answer[required]');
      for (const ta of requiredAnswers) {
        if (!ta.value.trim()) {
          showAlert('Please answer all required questions.', 'error');
          return false;
        }
      }
    }
    clearAlert();
    return true;
  }

  async function submitApplication() {
    const locationInput = document.getElementById('userLocation');
    const coverLetterInput = document.getElementById('coverLetter');
    const resumeLinkInput = document.getElementById('resumeLink');
    const questionTextareas = Array.from(wizard.querySelectorAll('.question-answer'));

    const locationText = locationInput ? locationInput.value.trim() : '';
    const baseCover = coverLetterInput ? coverLetterInput.value.trim() : '';
    const resumeLink = resumeLinkInput ? resumeLinkInput.value.trim() : '';

    const coverParts = [];
    if (baseCover) coverParts.push(baseCover);
    if (locationText) coverParts.push(`Location: ${locationText}`);
    if (resumeLink) coverParts.push(`Resume: ${resumeLink}`);
    const coverLetter = coverParts.join('\n\n');

    const payload = {
      coverLetter,
      answers: questionTextareas.map((ta) => ta.value.trim()),
      resumeLink,
    };

    async function getCsrfToken() {
      try {
        const res = await fetch('/api/csrf', { credentials: 'same-origin' });
        const data = await res.json();
        return data?.csrfToken || '';
      } catch (_) {
        return '';
      }
    }

    nextBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.textContent = 'Submitting...';

    try {
      const csrf = await getCsrfToken();
      const res = await fetch(`/api/vacancies/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'x-csrf-token': csrf } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Failed to submit application (status ${res.status})`;
        let bodyText = '';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await res.json();
            if (data && data.message) message = data.message;
            bodyText = JSON.stringify(data);
          } else {
            bodyText = await res.text();
            if (bodyText) message = bodyText;
          }
        } catch (e) {
        }
        if (res.status === 401) message = 'Please log in before applying.';
        console.error('[applyWizard] submit failed', { status: res.status, message, bodyText });
        throw new Error(message);
      }

      showAlert('Application submitted successfully.', 'success');
      wizard.reset();
      currentStep = 0;
      updateStepUI(currentStep);
    } catch (err) {
      showAlert(err.message || 'Submission failed. Please try again.', 'error');
    } finally {
      nextBtn.disabled = false;
      prevBtn.disabled = false;
      nextBtn.textContent = 'Submit application';
    }
  }

  updateStepUI(currentStep);

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      updateStepUI(currentStep);
    } else {
      submitApplication();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep -= 1;
      updateStepUI(currentStep);
    }
  });
});
