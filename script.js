// --- SETTINGS ---

let focusDuration = 25 * 60
let breakDuration = 5 * 60

// --- STATE ---

let secondsLeft = focusDuration
let isRunning = false
let isFocusMode = true
let timerInterval = null

// --- DOM ELEMENTS ---

const timerDisplay = document.getElementById("timer-display")
const modeIndicator = document.getElementById("mode-indicator")
const btnStart = document.getElementById("btn-start")
const btnPause = document.getElementById("btn-pause")
const btnReset = document.getElementById("btn-reset")
const focusMinInput = document.getElementById("focus-minutes")
const focusSecInput = document.getElementById("focus-seconds")
const breakMinInput = document.getElementById("break-minutes")
const breakSecInput = document.getElementById("break-seconds")
const historyList = document.getElementById("history-list")

// --- FORMAT TIME ---

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60)
    let secs = seconds % 60
    return String(minutes).padStart(2, "0") + ':' + String(secs).padStart(2, '0')
}

// --- UPDATE DISPLAY ---

function updateDisplay(){
    timerDisplay.textContent = formatTime(secondsLeft)
    modeIndicator.textContent = isFocusMode ? 'Focus' : 'Break'
}

// --- TICK ---

function tick(){
    if (secondsLeft > 0){
        secondsLeft--
        updateDisplay()
    } else {
        clearInterval(timerInterval)
        isRunning = false
        playSound()
        if (isFocusMode){
            saveSession()
        }
        isFocusMode = !isFocusMode
        secondsLeft = isFocusMode ? focusDuration : breakDuration
        updateDisplay()
        startTimer()
    }
}

// --- START TIMER ---

function startTimer(){
    if (isRunning) return
    isRunning = true
    timerInterval = setInterval(tick, 1000)
}

// --- PAUSE TIMER ---

function pauseTimer(){
    clearInterval(timerInterval)
    isRunning = false
}

// --- RESET TIMER ---

function resettimer(){
    clearInterval(timerInterval)
    isRunning = false
    isFocusMode = true
    secondsLeft = focusDuration
    updateDisplay()
}

// --- BUTTON EVENTS ---

btnStart.addEventListener('click', startTimer)
btnPause.addEventListener('click', pauseTimer)
btnReset.addEventListener('click', resettimer)

// --- PLAY SOUND ---

function playSound(){
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    gainNode.gain.setValueAtTime(1, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1)

    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 1)
}

// --- SAVE SESSION ---

function saveSession(){
    const now = new Date()
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    // const duration = isFocusMode ? focusDuration : focusDuration
    const session = `✓ ${formatTime(focusDuration)} focus — ${timeString}`

    const today = now.toDateString()
    let sessions = JSON.parse(localStorage.getItem(today) || '[]')
    sessions.push(session)
    localStorage.setItem(today, JSON.stringify(sessions))
    renderHistory()
}

//  Render history on page load

function renderHistory(){
    const today = new Date().toDateString()
    const sessions = JSON.parse(localStorage.getItem(today) || '[]')
    historyList.innerHTML = ''
    sessions.forEach(session => {
        const li = document.createElement('li')
        li.textContent = session
        historyList.appendChild(li)
    })

}

// --- SETTINGS CHANGE ---

function updateDurations(){
    const fMin = parseInt(focusMinInput.value) || 0
    const fSec = parseInt(focusSecInput.value) || 0
    const bMin = parseInt(breakMinInput.value) || 0
    const bSec = parseInt(breakSecInput.value) || 0
    focusDuration = fMin * 60 + fSec
    breakDuration = bMin * 60 + bSec
    if (!isRunning){
        secondsLeft = isFocusMode ? focusDuration : breakDuration
        updateDisplay()
    }
}

focusMinInput.addEventListener('change', updateDurations)
focusSecInput.addEventListener('change', updateDurations)
breakMinInput.addEventListener('change', updateDurations)
breakSecInput.addEventListener('change', updateDurations)


// --- init ---

updateDisplay()
renderHistory()