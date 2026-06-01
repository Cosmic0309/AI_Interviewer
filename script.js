const API_ENDPOINT = 'http://127.0.0.1:5000/upload';


let questions = [];
let currentIndex = 0;
let allResponses = [];

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const uploadSuccess = document.getElementById('uploadSuccess');
const uploadError = document.getElementById('uploadError');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// File Upload Functionality
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

// Retry Button
retryBtn.addEventListener('click', () => {
    resetUploadArea();
});

// File Validation
function validateFile(file) {
    const maxSize = 10 * 1024 * 1024;
    const allowedType = 'application/pdf';

    if (file.type !== allowedType) {
        return { valid: false, message: 'Please upload a PDF file.' };
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
        return {
            valid: false,
            message: 'Only PDF files are allowed.'
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            message: 'File size must be less than 10MB.'
        };
    }

    return { valid: true };
}

// Handle File Upload
function handleFileUpload(file) {
    const validation = validateFile(file);

    if (!validation.valid) {
        showError(validation.message);
        return;
    }

    // Hide upload area and show progress
    uploadArea.style.display = 'none';
    uploadProgress.style.display = 'block';

    // Simulate upload (replace with actual API call)
    uploadFileToServer(file);
}

// Upload File to Server
function uploadFileToServer(file) {
    const formData = new FormData();
    formData.append('resume', file);

    // Option 1: Using XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            updateProgress(percentComplete);
        }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);

                console.log(response);

                questions = response.questions;
                currentIndex = 0;

                showSuccess(questions[0]);;

            } catch (error) {
                showError('Invalid response from server.');
            }
        } else {
            showError('Upload failed. Please try again.');
        }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
        showError('Network error. Please check your connection.');
    });

    xhr.addEventListener('abort', () => {
        showError('Upload cancelled.');
    });

    // Send request
    xhr.open('POST', API_ENDPOINT);
    xhr.send(formData);

}

// Update Progress Bar
function updateProgress(percent) {
    progressFill.style.width = percent + '%';
    progressText.textContent = `Uploading... ${Math.round(percent)}%`;
}

// Show Success Message
function showSuccess(questions) {

    currentQuestion = questions;

    uploadProgress.style.display = 'none';
    uploadSuccess.style.display = 'block';

    document.getElementById('questionsContainer').style.display = 'block';
    document.getElementById('questionsOutput').textContent = questions;
}

// Show Error Message
function showError(message) {
    uploadArea.style.display = 'none';
    uploadProgress.style.display = 'none';
    uploadError.style.display = 'block';
    errorMessage.textContent = message;
}

// Reset Upload Area
function resetUploadArea() {
    uploadArea.style.display = 'block';
    uploadProgress.style.display = 'none';
    uploadSuccess.style.display = 'none';
    uploadError.style.display = 'none';
    fileInput.value = '';
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading... 0%';
}

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        header.style.boxShadow = 'none';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});



document
    .getElementById("submitAnswer")
    .addEventListener("click", async () => {

        const answer =
            document.getElementById("answerBox").value;

        const response = await fetch(
            "http://127.0.0.1:5000/evaluate_answer",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: questions[currentIndex],
                    answer: answer
                })
            }
        );

        const data = await response.json();

        document.getElementById("feedback").innerText =
            data.evaluation;

        currentIndex++;
        allResponses.push({
            question: questions[currentIndex],
            answer: answer
        });
        if (currentIndex < questions.length) {

            setTimeout(() => {

                document.getElementById("questionsOutput")
                    .innerText = questions[currentIndex];

                document.getElementById("answerBox").value = "";

            }, 2000);

        } else{const finalResponse = await fetch(
            "http://127.0.0.1:5000/final_evaluation",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    responses: allResponses
                })
            }
        );

        const result = await finalResponse.json();

        document.getElementById("questionsOutput")
            .innerText = result.result;
    }
    });