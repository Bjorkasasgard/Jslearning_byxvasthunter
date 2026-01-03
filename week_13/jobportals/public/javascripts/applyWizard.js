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
  const existingBox = document.getElementById('existingApplication');
  const viewAppBtn = document.getElementById('viewApplicationBtn');

  const jobId = Number(wizard.dataset.jobId);
  const defaultResume = wizard.dataset.defaultResume || '';
  const stepTitles = ['Profile location', 'Documents', 'Questions'];
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
      clearAlert();
      return true;
    }
    if (idx === 1) {
      const coverFile = document.getElementById('coverLetterFile');
      const coverEditor = document.getElementById('coverLetterEditor');
      const resumeFile = document.getElementById('resumeFile');
      const hasCoverPdf = coverFile?.files?.length;
      const coverText = (coverEditor?.textContent || '').trim();
      const hasCoverText = !!coverText;
      const hasResume = (resumeFile?.files?.length || defaultResume);

      if (!hasCoverText && !hasCoverPdf) {
        showAlert('Please write a cover letter or attach a PDF.', 'error');
        return false;
      }

      if (!hasResume) {
        showAlert('Please upload a resume (PDF) or set one in your profile.', 'error');
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
    const coverLetterFile = document.getElementById('coverLetterFile');
    const coverLetterEditor = document.getElementById('coverLetterEditor');
    const resumeFile = document.getElementById('resumeFile');
    const questionTextareas = Array.from(wizard.querySelectorAll('.question-answer'));

    const formData = new FormData();
    formData.append('location', locationInput ? locationInput.value.trim() : '');
    if (coverLetterEditor) {
      // Send sanitized HTML will happen server-side.
      formData.append('coverLetter', (coverLetterEditor.innerHTML || '').trim());
    }
    questionTextareas.forEach((ta) => formData.append('answers', ta.value.trim()));
    if (coverLetterFile?.files?.[0]) formData.append('coverLetterFile', coverLetterFile.files[0]);
    if (resumeFile?.files?.[0]) formData.append('resumeFile', resumeFile.files[0]);

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
          ...(csrf ? { 'x-csrf-token': csrf } : {}),
        },
        credentials: 'include',
        body: formData,
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
      const editor = document.getElementById('coverLetterEditor');
      if (editor) editor.innerHTML = '';
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

  async function loadExistingApplication() {
    try {
      const res = await fetch(`/api/member/applications/by-job/${jobId}`, { credentials: 'include' });
      if (!res.ok) return;
      const app = await res.json();
      if (!app) return;

      if (existingBox) {
        const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '';
        const coverLink = app.coverLetterFile
          ? `<a href="${app.coverLetterFile}" target="_blank" class="text-indigo-600 underline">Cover letter (PDF)</a>`
          : (app.coverLetter ? 'Cover letter submitted' : 'Cover letter not found');
        const resumeLink = app.resumeLink ? `<a href="${app.resumeLink}" target="_blank" class="text-indigo-600 underline">Resume</a>` : 'Resume not found';
        existingBox.innerHTML = `You applied on ${appliedDate}. ${coverLink} · ${resumeLink}`;
        existingBox.classList.remove('hidden');
      }

      if (viewAppBtn && (app.coverLetterFile || app.resumeLink)) {
        viewAppBtn.classList.remove('hidden');
        viewAppBtn.addEventListener('click', () => {
          if (app.coverLetterFile) window.open(app.coverLetterFile, '_blank');
          if (app.resumeLink) window.open(app.resumeLink, '_blank');
        });
      }
    } catch (err) {
      // silent fail
    }
  }

  updateStepUI(currentStep);
  loadExistingApplication();

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
