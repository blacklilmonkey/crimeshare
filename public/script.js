const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filesList = document.getElementById('uploadedFiles');
const loading = document.getElementById('loading');

// File size formatter
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Upload area click
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

// Handle file upload
async function handleFiles(files) {
    for (let file of files) {
        await uploadFile(file);
    }
}

// Upload file to server
async function uploadFile(file) {
    loading.classList.remove('hidden');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayFile(file, data);
        } else {
            alert('Upload failed: ' + data.error);
        }
    } catch (error) {
        alert('Error uploading file: ' + error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

// Display uploaded file
function displayFile(file, data) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const shareUrl = window.location.origin + data.downloadUrl;
    
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatBytes(file.size)}</div>
        </div>
        <div class="link-section">
            <div class="link-input-group">
                <input type="text" value="${shareUrl}" readonly id="link-${data.shareCode}">
                <button onclick="copyLink('${data.shareCode}')">Copy</button>
            </div>
            <button class="delete-btn" onclick="deleteFile('${data.shareCode}')">Delete</button>
        </div>
    `;
    
    filesList.appendChild(fileItem);
}

// Copy link to clipboard
function copyLink(code) {
    const input = document.getElementById(`link-${code}`);
    input.select();
    document.execCommand('copy');
    
    // Show temporary success feedback
    const button = input.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.background = '#10b981';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

// Delete file
async function deleteFile(code) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    try {
        const response = await fetch(`/delete?id=${code}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Remove file item from DOM
            event.target.closest('.file-item').remove();
        } else {
            alert('Failed to delete file: ' + data.error);
        }
    } catch (error) {
        alert('Error deleting file: ' + error.message);
    }
}

