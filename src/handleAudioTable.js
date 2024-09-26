const { useEffect, useState, useRef } = React;

const btnProcessAudio = document.getElementById("btnProcessAudio");
const loadingModal = document.getElementById("loadingModal");
const btnDeleteProcess = document.getElementById("btnDeleteProcess");
const processingStatusContainer = document.getElementById("processingStatus");

const deletionCompleteIcon = document.getElementById("deletionCompleteIcon");
const inProgressIcon = document.getElementById("InProgressIcon");
const completedIcon = document.getElementById("CompletedIcon");
const StatusErrorIcon = document.getElementById("StatusErrorIcon");

const getStatusTranslation = (status) => {
    switch (status) {
        case "deletionComplete":
            return "Ningun audio procesado.";
        case "Completed":
            return "Completado";
        case "In Progress":
            return "En progreso...";
        case "needsDelete":
            return "Uno o más audios procesados";
        default:
            return "Error al obtener el estado de procesamiento.";
    }
};
// React component to render the list
const CreateAudioTable = () => {
    const [audioList, setAudioList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAudio, setSelectedAudio] = useState([]);
    const [audioURLObjectList, setAudioURLObjectList] = useState([]); // [audioURLObject1, audioURLObject2, ...
    let selectedAudioRef = useRef([]);

    const refreshFunction = () => {
        getConversations();
        getProcessingStatus("");
        selectedAudioRef.current = [];
        setSelectedAudio([]);
        btnProcessAudio.classList.add("disabled-button");
    };

    //handleEvents
    useEffect(() => {
        const btnRefreshAudio = document.getElementById("btnRefreshAudio");
        refreshFunction();
        btnRefreshAudio.addEventListener("click", refreshFunction);
        btnDeleteProcess.addEventListener("click", clearProcessedAudios);
        btnProcessAudio.addEventListener("click", sendProcessAudio);

        return () => {
            // Clean up the event listener when the component unmounts
            btnRefreshAudio.removeEventListener("click", handleClick);
            btnDeleteProcess.removeEventListener("click", clearProcessedAudios);
            btnProcessAudio.removeEventListener("click", sendProcessAudio);

            //clear the audioURLObjectList
            for (let index = 0; index < audioURLObjectList.length; index++) {
                const audioURL = audioURLObjectList[index];
                URL.revokeObjectURL(audioURL);
            }
        };
    }, []); // Empty dependency array to run this effect only once on mount

    async function sendProcessAudio() {
        let selectedAudio = selectedAudioRef.current;
        if (selectedAudio.length === 0) return;
        //show loading modal
        loadingModal.classList.remove("d-none");
        let data = {
            conversations: selectedAudio,
        };
        let res = await axios({
            method: "POST",
            url: "https://intevolution-functionapp-conversationsdemo.azurewebsites.net/api/ConversationAnalysis?code=Wn0fRQc9zB4TGBQeL5iPX9lNSs7GeSG0ZsArGicTsURRAzFulmXolQ==&type=ProcessConversation",
            data: data,
        });
        //hide loading modal
        loadingModal.classList.add("d-none");

        let resCode = res.data.code;
        switch (resCode) {
            case "00": //show success modal
                Swal.fire({
                    title: "Audios mandados la cola de procesado!",
                    text: "El audio ha sido mandado a procesar correctamente.",
                    icon: "success",
                });
                let processingId = res.data.processingId;
                getProcessingStatus(processingId);
                btnDeleteProcess.classList.remove("disabled-button");
                selectedAudioRef.current = [];
                setSelectedAudio([]);
                break;

            default:
                Swal.fire({
                    title: "Error!",
                    text: "Ha ocurrido un error al procesar el audio.",
                    icon: "error",
                });
                break;
        }
    }

    const clearProcessedAudios = async () => {
        //Ask confirmation
        let askConfirm = await Swal.fire({
            title: "¿Estás seguro de que deseas eliminar el procesamiento?",
            showDenyButton: true,
            confirmButtonText: "Si",
            denyButtonText: `No`,
            confirmButtonColor: "#27315d",
            denyButtonColor: "#27315d",
        });
        //Cancelamos el guardado de cambios
        if (askConfirm.isDenied || askConfirm.isDismissed) {
            return;
        }

        setLoading(true);
        let res = await axios({
            method: "GET",
            url: "https://intevolution-functionapp-conversationsdemo.azurewebsites.net/api/ConversationAnalysis?code=Wn0fRQc9zB4TGBQeL5iPX9lNSs7GeSG0ZsArGicTsURRAzFulmXolQ==&type=RemoveConversation",
        });
        setLoading(false);
        switch (res.data.code) {
            case "00":
                Swal.fire({
                    title: "Audios en cola de eliminación!",
                    text: "Le ha mandado a eliminar los audios procesados correctamente.",
                    icon: "success",
                });
                let processingId = res.data.processingId;
                getProcessingStatus(processingId);
                break;

            default:
                Swal.fire({
                    title: "Error!",
                    text: "Ha ocurrido un error al eliminar los audios procesados.",
                    icon: "error",
                });
                break;
        }
    };

    const LazyLoadAudios = async (audioURList) => {
        let audioURLObjectList = [];
        for (let index = 0; index < audioURList.length; index++) {
            const audioURL = audioURList[index];
            if (!audioURL) {
                audioURLObjectList[index] = null;
                continue;
            }

            try {
                let res = await axios({
                    method: "GET",
                    url: audioURL,
                    responseType: "blob", // or 'blob'
                });
                let audioBlob = res.data;
                let audioURLObject = URL.createObjectURL(audioBlob);
                audioURLObjectList[index] = audioURLObject;
            } catch (error) {
                console.error(`Error loading audio from ${audioURL}:`, error);
                audioURLObjectList[index] = null;
            }
        }
        return audioURLObjectList;
    };

    const getConversations = async () => {
        try {
            setLoading(true);
            let res = await axios({
                method: "GET",
                url: "https://intevolution-functionapp-conversationsdemo.azurewebsites.net/api/ConversationAnalysis?code=Wn0fRQc9zB4TGBQeL5iPX9lNSs7GeSG0ZsArGicTsURRAzFulmXolQ==&type=ListConversations",
            });
            let ListConversations = res.data.response.conversations
                .filter((audio) => audio.url)
                .sort((a, b) => {
                    return a.processed - b.processed;
                });
            let audioURList = ListConversations.map((audio) => audio.url);
            let audioURLObjectList = await LazyLoadAudios(audioURList);
            setAudioURLObjectList(audioURLObjectList);
            setAudioList(ListConversations);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            Swal.fire({
                title: "Error!",
                text: "Ha ocurrido un error al obtener las conversaciones.",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const getProcessingStatus = async (processingId) => {
        processingId = processingId || "";
        let data = {
            processingId: processingId,
        };
        let res = await axios({
            method: "POST",
            url: "https://intevolution-functionapp-conversationsdemo.azurewebsites.net/api/ConversationAnalysis?code=Wn0fRQc9zB4TGBQeL5iPX9lNSs7GeSG0ZsArGicTsURRAzFulmXolQ==&type=Status",
            data: JSON.stringify(data, null, 2),
        });
        let status = res.data.status;
        processingStatusContainer.innerHTML = getStatusTranslation(status);

        switch (status) {
            case "deletionComplete":
                deletionCompleteIcon.classList.remove("d-none");
                inProgressIcon.classList.add("d-none");
                completedIcon.classList.add("d-none");
                StatusErrorIcon.classList.add("d-none");
                break;
            case "Completed":
                deletionCompleteIcon.classList.add("d-none");
                inProgressIcon.classList.add("d-none");
                completedIcon.classList.remove("d-none");
                StatusErrorIcon.classList.add("d-none");
                break;
            case "In Progress":
                deletionCompleteIcon.classList.add("d-none");
                inProgressIcon.classList.remove("d-none");
                completedIcon.classList.add("d-none");
                StatusErrorIcon.classList.add("d-none");
                break;
            case "needsDelete":
                deletionCompleteIcon.classList.add("d-none");
                inProgressIcon.classList.add("d-none");
                completedIcon.classList.remove("d-none");
                StatusErrorIcon.classList.add("d-none");
                break;

            default:
                deletionCompleteIcon.classList.add("d-none");
                inProgressIcon.classList.add("d-none");
                completedIcon.classList.add("d-none");
                StatusErrorIcon.classList.remove("d-none");
                break;
        }

        //call the function again if the status is in progress
        if (status === "In Progress") {
            setTimeout(() => {
                getProcessingStatus(processingId);
                btnDeleteProcess.classList.add("disabled-button");
                btnProcessAudio.classList.add("disabled-button");
            }, 2000);
        }

        if (status === "Completed") {
            getConversations();
            getProcessingStatus("");
            btnDeleteProcess.classList.remove("disabled-button");
            btnProcessAudio.classList.remove("disabled-button");
        }

        if (status === "deletionComplete") {
            btnDeleteProcess.classList.add("disabled-button");
        }
    };

    const selectAudio = (e) => {
        let selectedAudioCopy = [...selectedAudio];

        if (e.target.checked) {
            selectedAudioCopy.push(e.target.value);
            selectedAudioRef.current = selectedAudioCopy;
            setSelectedAudio(selectedAudioCopy);
            if (selectedAudioCopy.length > 0) {
                btnProcessAudio.classList.remove("disabled-button");
            }
            return;
        }
        //delete audio from selectedAudio
        selectedAudioCopy = selectedAudioCopy.filter((audio) => audio !== e.target.value);
        selectedAudioRef.current = selectedAudioCopy;
        setSelectedAudio(selectedAudioCopy);
        if (selectedAudioCopy.length === 0) {
            btnProcessAudio.classList.add("disabled-button");
        }
    };

    return (
        <div className="col-12 d-flex justify-content-center align-items-center m-2">
            {loading ? (
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            ) : (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Seleccionar</th>
                            <th>ID de la conversación</th>
                            <th>Escuchar audio</th>
                            <th>Descargar audio </th>
                            <th>Procesado</th>
                            <th>Transcripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audioList.map((audio, index) => (
                            <tr
                                class={
                                    selectedAudio.includes(audio.conversation_id)
                                        ? "table-primary"
                                        : ""
                                }
                                key={index}
                            >
                                <td>{index + 1}</td>
                                <td>
                                    {audio.processed ? (
                                        "-"
                                    ) : (
                                        <input
                                            type="checkbox"
                                            id={audio.conversation_id}
                                            name={audio.conversation_id}
                                            value={audio.conversation_id}
                                            onChange={selectAudio}
                                        />
                                    )}
                                </td>
                                <td>{audio.conversation_id}</td>
                                <td>
                                    {audioURLObjectList[index] ? (
                                        <audio controls>
                                            <source
                                                src={audioURLObjectList[index]}
                                                type="audio/mpeg"
                                            />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td class="text-center">
                                    {audio.url ? (
                                        <a target="_blank" href={audio.url} download>
                                            <span class="material-symbols-outlined full-width">
                                                download
                                            </span>
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td>
                                    {audio.processed === undefined ? (
                                        "-"
                                    ) : audio.processed ? (
                                        <span
                                            class="material-symbols-outlined check-circle"
                                            title="Procesado correctamente"
                                        >
                                            check_circle
                                        </span>
                                    ) : (
                                        <span
                                            class="material-symbols-outlined"
                                            title="Falta procesar"
                                        >
                                            do_not_disturb_on
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        class="refresh-button"
                                        type="button"
                                        data-toggle="collapse"
                                        data-target={`#trasncription-${index}`}
                                        aria-expanded="false"
                                        aria-controls="collapseExample"
                                    >
                                        Mostrar Transcripción
                                    </button>
                                    <div class="collapse" id={`trasncription-${index}`}>
                                        <div class="card card-body">{audio.transcription}</div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

// Render the component
ReactDOM.render(<CreateAudioTable />, document.getElementById("root"));
