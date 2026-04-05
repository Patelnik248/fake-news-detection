document.addEventListener('DOMContentLoaded', () => {
    const newsText = document.getElementById('news-text');
    const charCount = document.getElementById('current-count');
    const predictBtn = document.getElementById('predict-btn');
    const resultContainer = document.getElementById('result-container');
    const resetBtn = document.getElementById('reset-btn');

    // UI Elements for updates
    const badge = document.getElementById('result-badge');
    const confidenceValue = document.getElementById('confidence-value');
    const confidenceBar = document.getElementById('confidence-bar');
    const resultTypeText = document.getElementById('result-type');
    const resultMessage = document.getElementById('result-message');

    // Update character count
    newsText.addEventListener('input', () => {
        const count = newsText.value.trim().length;
        charCount.textContent = count;
        predictBtn.disabled = count < 10;
        
        // Dynamic character count color
        if (count < 10) {
            charCount.style.color = 'var(--text-muted)';
        } else {
            charCount.style.color = 'var(--accent-color)';
        }
    });

    // Handle Prediction
    predictBtn.addEventListener('click', async () => {
        const text = newsText.value.trim();
        if (text.length < 10) return;

        // Show loading state
        predictBtn.classList.add('loading');
        predictBtn.disabled = true;
        resultContainer.classList.add('hidden');

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (response.ok) {
                displayResult(data);
            } else {
                alert(data.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the server. Is the model trained?');
        } finally {
            predictBtn.classList.remove('loading');
            predictBtn.disabled = false;
        }
    });

    // Reset UI
    resetBtn.addEventListener('click', () => {
        newsText.value = '';
        charCount.textContent = '0';
        charCount.style.color = 'var(--text-muted)';
        predictBtn.disabled = true;
        resultContainer.classList.add('hidden');
        newsText.focus();
    });

    function displayResult(data) {
        const isReal = data.label === 'Real';
        const confidence = (data.confidence * 100).toFixed(1) + '%';

        // Update Badge
        badge.textContent = data.label;
        badge.className = 'badge ' + (isReal ? 'real' : 'fake');

        // Update Confidence
        confidenceValue.textContent = confidence;
        confidenceBar.style.width = '0%'; // Reset first for animation
        setTimeout(() => {
            confidenceBar.style.width = confidence;
            // Color mapping for confidence
            if (isReal) {
                confidenceBar.style.background = 'var(--success)';
            } else {
                confidenceBar.style.background = 'var(--danger)';
            }
        }, 50);

        // Update Message
        resultTypeText.textContent = data.label;
        resultTypeText.style.color = isReal ? 'var(--success)' : 'var(--danger)';
        resultMessage.innerHTML = `This article shows high indicators of being <strong id="result-type" style="color: ${isReal ? 'var(--success)' : 'var(--danger)'}">${data.label}</strong> news based on our ML analysis.`;

        // Reveal Result
        resultContainer.classList.remove('hidden');
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
});
