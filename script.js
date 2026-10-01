const API_URL = '/api';

// DOM Elements
const queueList = document.getElementById('queueList');
const queueCount = document.getElementById('queueCount');
const currentPatientDiv = document.getElementById('currentPatient');
const addPatientForm = document.getElementById('addPatientForm');
const btnCallNext = document.getElementById('btnCallNext');
const toast = document.getElementById('toast');

// Fetch and render the queue
async function loadQueue() {
    try {
        const response = await fetch(`${API_URL}/queue`);
        const queue = await response.json();
        renderQueue(queue);
    } catch (error) {
        showToast('Error loading queue', 'error');
    }
}

// Render the queue in UI
function renderQueue(queue) {
    queueCount.textContent = `${queue.length} patient${queue.length !== 1 ? 's' : ''} waiting`;
    
    if (queue.length === 0) {
        queueList.innerHTML = `<li class="text-center text-gray-500 italic mt-10">Queue is currently empty.</li>`;
        return;
    }

    queueList.innerHTML = '';
    queue.forEach((patient, index) => {
        const li = document.createElement('li');
        // The first element is the head of the queue
        const isFirst = index === 0;
        
        li.className = `p-4 rounded-lg border shadow-sm flex items-center justify-between ${isFirst ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`;
        
        li.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="flex-shrink-0 bg-${isFirst ? 'purple' : 'gray'}-100 rounded-full w-12 h-12 flex items-center justify-center font-bold text-${isFirst ? 'purple' : 'gray'}-700 border ${isFirst ? 'border-purple-300' : 'border-gray-300'}">
                    #${patient.id}
                </div>
                <div>
                    <p class="text-lg font-bold text-gray-800">${patient.name}</p>
                    <p class="text-sm text-gray-500">${patient.issue}</p>
                </div>
            </div>
            <div class="text-right flex flex-col items-end">
                <div>
                    <span class="text-xs text-gray-400">Added at</span>
                    <span class="text-sm font-medium text-gray-600 ml-1">${patient.timeAdded}</span>
                </div>
                ${isFirst ? '<span class="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full mt-2 inline-block font-semibold">Next in line</span>' : ''}
            </div>
        `;
        queueList.appendChild(li);
    });
}

// Add a new patient (Enqueue)
addPatientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('patientName').value;
    const issue = document.getElementById('medicalIssue').value;
    
    try {
        const response = await fetch(`${API_URL}/enqueue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, issue })
        });
        
        if (response.ok) {
            const newPatient = await response.json();
            showToast(`Patient ${newPatient.name} added to the queue.`);
            addPatientForm.reset();
            loadQueue();
        }
    } catch (error) {
        showToast('Error adding patient', 'error');
    }
});

// Call next patient (Dequeue)
btnCallNext.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/dequeue`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const data = await response.json();
            updateCurrentPatient(data.patient);
            showToast(`${data.patient.name} has been called!`);
            loadQueue();
        } else if (response.status === 404) {
            showToast('No patients in the queue!', 'error');
            updateCurrentPatient(null);
        }
    } catch (error) {
        showToast('Error calling patient', 'error');
    }
});

// Update the current patient display
function updateCurrentPatient(patient) {
    if (!patient) {
        currentPatientDiv.innerHTML = `<p class="text-gray-500 italic">No patient is currently being seen.</p>`;
        currentPatientDiv.className = "bg-gray-50 p-4 rounded border text-center mb-4 min-h-[100px] flex flex-col justify-center transition-all duration-300";
        return;
    }

    currentPatientDiv.className = "bg-green-50 p-4 rounded border border-green-300 text-center mb-4 min-h-[100px] flex flex-col justify-center shadow-inner animate-pulse transition-all duration-300";
    
    // Remove pulse after 1.5 seconds
    setTimeout(() => {
        currentPatientDiv.classList.remove('animate-pulse');
    }, 1500);

    currentPatientDiv.innerHTML = `
        <span class="text-green-800 text-xs font-bold uppercase tracking-wider mb-2 block">Now Seeing</span>
        <h3 class="text-2xl font-bold text-gray-900 mb-1">#${patient.id} - ${patient.name}</h3>
        <p class="text-green-700 font-medium">${patient.issue}</p>
    `;
}

// Toast notification function
let toastTimeout;
function showToast(message, type = 'success') {
    toast.textContent = message;
    
    // Reset classes
    toast.className = 'fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg transition-all duration-300 z-50 transform';
    
    if (type === 'error') {
        toast.classList.add('bg-red-600', 'text-white');
    } else {
        toast.classList.add('bg-gray-800', 'text-white');
    }
    
    // Show toast
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    // Hide toast after 3 seconds
    toastTimeout = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Initial load
loadQueue();
