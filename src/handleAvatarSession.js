import { avatarConfig } from "./avatarConfig.js";

// Global variables
let sessionInfo = null;
let room = null;
let mediaStream = null;
let webSocket = null;
let sessionToken = null;

// DOM Elements
const mediaElement = document.getElementById("mediaElement");
const avatarID = document.getElementById("avatarID");
const voiceID = document.getElementById("voiceID");
const kbID = document.getElementById("kbID");
const taskInput = document.getElementById("taskInput");
const password = document.getElementById("password");
const startBtn = document.getElementById("startBtn");
const closeBtn = document.getElementById("closeBtn");
const talkBtn = document.getElementById("talkBtn");
const startVoiceBtn = document.getElementById("start-btn");
const stopVoiceBtn = document.getElementById("stop-btn");
let context = [];

// Event Listeners

//Start on Click
startBtn.addEventListener("click", async () => {
    //Add loading spinner
    startBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...`;
    startBtn.classList.add("disabled-button");
    await createNewSession();
    await startStreamingSession();
    startBtn.innerHTML = "Conectar Avatar";
    startVoiceBtn.classList.remove("disabled-button");
    stopVoiceBtn.classList.remove("disabled-button");
    clearBtn.classList.remove("disabled-button");
});

//Close on Click
closeBtn.addEventListener("click", closeSession);

//Chat on Click
talkBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (text) {
        sendText(text, "talk");
        taskInput.value = "";
    }
});

//Handle password input
password.addEventListener("input", () => {
    if (password.value === avatarConfig.password) {
        startBtn.classList.remove("disabled-button");
        closeBtn.classList.remove("disabled-button");
        return;
    }
    startBtn.classList.add("disabled-button");
    closeBtn.classList.add("disabled-button");
});

//Add taskInput event listener for enter send message
taskInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        talkBtn.click();
    }
});

//on click video open fullscreen
mediaElement.addEventListener("click", () => {
    mediaElement.requestFullscreen();
});

if (password.value !== avatarConfig.password) {
    startBtn.classList.add("disabled-button");
    closeBtn.classList.add("disabled-button");
}

//Load Selects
window.onload = function () {
    loadSelects();
};

function loadSelects() {
    const avatarSelect = document.getElementById("avatarID");
    const voiceSelect = document.getElementById("voiceID");

    avatarConfig.avatarList.forEach((avatar) => {
        const option = document.createElement("option");
        option.text = avatar.name;
        option.value = avatar.avatarId;
        avatarSelect.add(option);
    });

    avatarConfig.voiceList.forEach((voice) => {
        const option = document.createElement("option");
        option.text = voice.name;
        option.value = voice.voiceId;
        voiceSelect.add(option);
    });

    avatarConfig.KbList.forEach((kb) => {
        const option = document.createElement("option");
        option.text = kb.name;
        option.value = kb.kbId;
        kbID.add(option);
    });
}

// Get session token
async function getSessionToken() {
    const response = await fetch(
        `${avatarConfig.serverUrl}/v1/streaming.create_token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": avatarConfig.apiKey,
            },
        }
    );

    const data = await response.json();
    sessionToken = data.data.token;
}

// Connect WebSocket
async function connectWebSocket(sessionId) {
    const params = new URLSearchParams({
        session_id: sessionId,
        session_token: sessionToken,
        silence_response: false,
        opening_text: "hola, ¿en qué puedo ayudarte?",
        stt_language: "es",
    });

    const wsUrl = `wss://${
        new URL(avatarConfig.serverUrl).hostname
    }/v1/ws/streaming.chat?${params}`;

    webSocket = new WebSocket(wsUrl);

    // Handle WebSocket events
    webSocket.addEventListener("message", (event) => {
        const eventData = JSON.parse(event.data);
    });
}

async function handleOpenAIService(text, context) {
    let contextObj = {
        role: "user",
        content: [
            {
                type: "text",
                text: text,
            },
        ],
    };

    let assistantResponseObj = {
        role: "assistant",
        content: [
            {
                type: "text",
                text: "¡Hola! Soy Juan Valdez, cliente del Banco BBVA. ¿Cómo estás? ¿En qué puedo ayudarte hoy? 😊",
            },
        ],
    };

    context.push(contextObj);
    let modelInstructions = JSON.stringify({
        messages: [
            {
                role: "system",
                content: [
                    {
                        type: "text",
                        text: "**PERSONA:**  \n\nCada vez que respondas a la entrada del usuario, debes adoptar la siguiente personalidad:  \n\n____  \n\nJuan Valdez es un cliente del Banco BBVA. Su rol es interactuar de manera dinámica, asumiendo diferentes personalidades según la conversación: formal, directa, indiferente o amigable. Habla español neutro y siempre responde como cliente, no como agente o representante del banco.  \n\nSu número de cliente es 123, y solo proporcionará esta información al inicio de la sesión en caso de que el banco no la haya solicitado como tercera interacción.  \n____  \n\n**BASE DE CONOCIMIENTO:**  \n\nCada vez que respondas a la entrada del usuario, proporciona respuestas basadas en el conocimiento siguiente.  \nSiempre prioriza esta información al responder a los usuarios:  \n\nJuan Valdez interactúa exclusivamente como cliente del Banco BBVA, formulando preguntas solo sobre temas bancarios y basando sus respuestas en la información que un cliente típico tendría. Siempre responde desde la perspectiva de un cliente o prospecto. Puede generar preguntas comunes que un cliente podría tener dentro de un contexto bancario.  \n\nNo debe discutir temas no relacionados con la banca, escalar conversaciones ni recopilar datos personales de los usuarios.  \n\n**INSTRUCCIONES:**  \n\nDebes seguir las siguientes instrucciones al responder a los usuarios:  \n\n- **Tono Adaptativo:** Juan ajusta su personalidad según la interacción (formal, directa, indiferente o amigable).  \n- **Idioma:** Se comunica exclusivamente en español neutro.  \n- **Flujo de Conversación:** Juan nunca iniciará una conversación antes de que alguien diga algo primero. Genera preguntas y dudas siempre como si fuera un cliente bancario.  \n- **Identificación del Cliente:** Solo al inicio de la sesión, en caso de que el agente no le haya solicitado su nombre, Juan Valdez y su número de cliente (123456), deberá mencionarlo y preguntar por qué no se ha solicitado esta información, pero solo en caso de que no se haya pedido al principio sin mencionarlo.  \n- **Límites:** No debe actuar como representante del banco, proporcionar información oficial ni responder preguntas no relacionadas con la banca.",
                    },
                ],
            },
            context,
        ],

        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 800,
    });
}

// Create new session
async function createNewSession() {
    if (!sessionToken) {
        await getSessionToken();
    }

    const response = await fetch(`${avatarConfig.serverUrl}/v1/streaming.new`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
            quality: "high", //"medium"
            knowledge_base_id: kbID.value,
            avatar_id: avatarID.value,
            voice: {
                voice_id: voiceID.value,
                rate: 1,
                emotion: "Friendly", //Excited, Serious, Friendly, Soothing, Broadcaster
            },
            version: "v2",
            video_encoding: "H264", //"VP8"
            disable_idle_timeout: false, //By default session has a 2 minute idle timeout, setting to true disables it
        }),
    });

    const data = await response.json();
    sessionInfo = data.data;

    // Create LiveKit Room
    room = new LivekitClient.Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
            resolution: LivekitClient.VideoPresets.h720.resolution,
        },
    });

    // Handle room events
    room.on(LivekitClient.RoomEvent.DataReceived, (message) => {
        const data = new TextDecoder().decode(message);
    });

    // Handle media streams
    mediaStream = new MediaStream();
    room.on(LivekitClient.RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === "video" || track.kind === "audio") {
            mediaStream.addTrack(track.mediaStreamTrack);
            if (
                mediaStream.getVideoTracks().length > 0 &&
                mediaStream.getAudioTracks().length > 0
            ) {
                mediaElement.srcObject = mediaStream;
            }
        }
    });

    // Handle media stream removal
    room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track) => {
        const mediaTrack = track.mediaStreamTrack;
        if (mediaTrack) {
            mediaStream.removeTrack(mediaTrack);
        }
    });

    // Handle room connection state changes
    room.on(LivekitClient.RoomEvent.Disconnected, (reason) => {});

    await room.prepareConnection(sessionInfo.url, sessionInfo.access_token);

    // Connect WebSocket after room preparation
    await connectWebSocket(sessionInfo.session_id);
}

// Start streaming session
async function startStreamingSession() {
    const startResponse = await fetch(
        `${avatarConfig.serverUrl}/v1/streaming.start`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify({
                session_id: sessionInfo.session_id,
            }),
        }
    );

    // Connect to LiveKit room
    await room.connect(sessionInfo.url, sessionInfo.access_token);

    document.querySelector("#startBtn").disabled = true;
}

// Send text to avatar
async function sendText(text, taskType = "talk") {
    if (!sessionInfo) {
        return;
    }

    //let openAIResponse = await handleOpenAIService(text, context);

    const response = await fetch(
        `${avatarConfig.serverUrl}/v1/streaming.task`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify({
                session_id: sessionInfo.session_id,
                text: text,
                task_type: taskType,
            }),
        }
    );
}

// Close session
async function closeSession() {
    if (!sessionInfo) {
        return;
    }

    const response = await fetch(
        `${avatarConfig.serverUrl}/v1/streaming.stop`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify({
                session_id: sessionInfo.session_id,
            }),
        }
    );

    // Close WebSocket
    if (webSocket) {
        webSocket.close();
    }
    // Disconnect from LiveKit room
    if (room) {
        room.disconnect();
    }

    mediaElement.srcObject = null;
    sessionInfo = null;
    room = null;
    mediaStream = null;
    sessionToken = null;
    startBtn.classList.remove("disabled-button");
}

//-------- TEXT TO SPEECH --------
// Global variables for audio visualization and speech recognition
let audioContext,
    analyser,
    dataArray,
    bufferLength,
    source,
    animationId,
    mediaStreamSpeech;
let finalTranscript = "";
let recognitionActive = false;
const canvas = document.getElementById("waveform");
const canvasCtx = canvas.getContext("2d");
const transcriptElement = document.getElementById("transcript");
const clearBtn = document.getElementById("clear-btn");
let recognition;

if (!sessionInfo) {
    startVoiceBtn.classList.add("disabled-button");
    stopVoiceBtn.classList.add("disabled-button");
    clearBtn.classList.add("disabled-button");
}

// Clear the transcript
clearBtn.addEventListener("click", () => {
    finalTranscript = "";
    transcriptElement.value = "";
});

// Setup Speech Recognition API
try {
    window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
        throw new Error("SpeechRecognition API not supported.");
    }
    recognition = new window.SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-ES"; // Change as needed

    recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript;
            }
        }
        transcriptElement.value = finalTranscript + interimTranscript;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        recognitionActive = false;
    };
} catch (error) {
    // If SpeechRecognition is not supported, disable buttons and show the alert
    document.getElementById("start-btn").disabled = true;
    document.getElementById("stop-btn").disabled = true;
    document.getElementById("browser-alert").style.display = "block";
}

// Start voice recognition and visualization
document.getElementById("start-btn").addEventListener("click", async () => {
    if (!recognitionActive) {
        finalTranscript = "";
        transcriptElement.value = "";
        recognition.start();
        recognitionActive = true;
    }
    document.getElementById("start-btn").disabled = true;
    document.getElementById("stop-btn").disabled = false;
    await startVisualizer();
});

// Stop voice recognition and visualization
document.getElementById("stop-btn").addEventListener("click", () => {
    if (recognitionActive) {
        recognition.stop();
        recognitionActive = false;
    }
    document.getElementById("start-btn").disabled = false;
    document.getElementById("stop-btn").disabled = true;
    stopVisualizer();

    // Send the final transcript to the avatar
    sendText(transcriptElement.value, "talk");
    finalTranscript = "";
    transcriptElement.value = "";
});

// Start the audio visualizer (access microphone, connect analyser, and draw waveform)
async function startVisualizer() {
    try {
        mediaStreamSpeech = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        bufferLength = analyser.fftSize;
        dataArray = new Uint8Array(bufferLength);
        source = audioContext.createMediaStreamSource(mediaStreamSpeech);
        source.connect(analyser);
        drawWaveform();
    } catch (err) {
        console.log("err", err);
    }
}

// Stop the visualizer and clean up resources
function stopVisualizer() {
    if (animationId) cancelAnimationFrame(animationId);
    if (source) source.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext) audioContext.close();
    if (mediaStreamSpeech)
        mediaStreamSpeech.getTracks().forEach((track) => track.stop());
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw the waveform on the canvas
function drawWaveform() {
    animationId = requestAnimationFrame(drawWaveform);
    analyser.getByteTimeDomainData(dataArray);
    canvasCtx.fillStyle = "#f5f5f5";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "#007bff";
    canvasCtx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}
