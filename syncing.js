const fs = require('fs');
const moment = require('moment');
const remote = require('electron').remote;
const Sync = require('./sync');
const Watch = require('./watch');

const localDirInput = document.querySelector('[name=localDir]');
const remoteDirInput = document.querySelector('[name=remoteDir]');
const remoteHostInput = document.querySelector('[name=remoteHost]');
const remoteUserInput = document.querySelector('[name=remoteUser]');

const startButton = document.querySelector('#sync');
const stopButton = document.querySelector('#stopSync');
const retryButton = document.querySelector('#retry');

const loaderNode = document.querySelector('.loader');
const lastSyncNode = document.querySelector('.lastSync');

let watcher = new Watch();
let syncer = null;
let lastSyncTime = null;

/*****************************************/

function startSync() {
    const localDir   = localDirInput.value.trim();
    const remoteDir  = remoteDirInput.value.trim();
    const remoteHost = remoteHostInput.value.trim();
    const remoteUser = remoteUserInput.value.trim();

    if (!localDir || !remoteDir || !remoteHost || !remoteUser) {
        alert('All fields are required');
        return;
    }

    if (/^\/\\w/.test(localDir)) {
        alert('Path to the local dir must be absolute');
        return;
    }

    if (!fs.existsSync(localDir) || !fs.statSync(localDir).isDirectory()) {
        alert(`${localDir} is not a directory`);
        return;
    }

    showStatus('progress');

    if (!syncer) {
        syncer = new Sync(localDir, remoteDir, remoteHost, remoteUser);
    }
    syncer.sync()
        .then(result => showStatus('success'))
        .catch(error => showStatus('error', error));

    watcher.watch(localDir, startSync);
}

function showStatus(type, message) {
    remote.getGlobal('setStatusIcon')(type);
    if (type == 'initial') {
        enableInputs();

        startButton.style.display = 'block';
        stopButton.style.display = 'none';
        retryButton.style.display = 'none';

        loaderNode.style.display = 'none';
        lastSyncNode.style.display = 'none';
    } else if (type == 'progress') {
        disableInputs();

        startButton.style.display = 'none';
        stopButton.style.display = 'block';
        retryButton.style.display = 'none';

        loaderNode.style.display = 'block';
        lastSyncNode.style.display = 'none';
    } else if (type == 'error') {
        enableInputs();

        startButton.style.display = 'none';
        stopButton.style.display = 'none';
        retryButton.style.display = 'block';

        loaderNode.style.display = 'none';
        lastSyncNode.classList.add('error');
        lastSyncNode.innerText = message;
        lastSyncNode.style.display = 'block';
    } else if (type == 'success') {
        disableInputs();

        startButton.style.display = 'none';
        stopButton.style.display = 'block';
        retryButton.style.display = 'none';

        loaderNode.style.display = 'none';
        lastSyncNode.classList.remove('error');
        updateLastSync(moment());
        lastSyncNode.style.display = 'block';
    }
}

function stopSync() {
    watcher.unwatch();
    syncer.abort();
    syncer = null;
    showStatus('initial');
}

function disableInputs() {
    localDirInput.disabled = true;
    remoteDirInput.disabled = true;
    remoteHostInput.disabled = true;
    remoteUserInput.disabled = true;
}

function enableInputs() {
    localDirInput.disabled = false;
    remoteDirInput.disabled = false;
    remoteHostInput.disabled = false;
    remoteUserInput.disabled = false;
}

function saveSettings() {
    localStorage.setItem('localDir', localDirInput.value);
    localStorage.setItem('remoteDir', remoteDirInput.value);
    localStorage.setItem('remoteHost', remoteHostInput.value);
    localStorage.setItem('remoteUser', remoteUserInput.value);
}

function loadSettings() {
    localDirInput.value = localStorage.getItem('localDir') || '';
    remoteDirInput.value = localStorage.getItem('remoteDir') || '';
    remoteHostInput.value = localStorage.getItem('remoteHost') || '';
    remoteUserInput.value = localStorage.getItem('remoteUser') || '';
}

function updateLastSync(time) {
    let message = 'Synced';
    if (time) {
        lastSyncTime = time;
    } else if (lastSyncTime) {
        message += ' ' + lastSyncTime.fromNow();
    }

    if (!lastSyncNode.classList.contains('error')) {
        lastSyncNode.innerHTML = '<span class="icon">✓</span> ' + message;
    }
}

/*****************************************/

loadSettings();

localDirInput.addEventListener('input', saveSettings);
remoteDirInput.addEventListener('input', saveSettings);
remoteHostInput.addEventListener('input', saveSettings);
remoteUserInput.addEventListener('input', saveSettings);

startButton.addEventListener('click', startSync);
stopButton.addEventListener('click', stopSync);
retryButton.addEventListener('click', function() {
    stopSync();
    startSync();
});

setInterval(updateLastSync, 10000);
