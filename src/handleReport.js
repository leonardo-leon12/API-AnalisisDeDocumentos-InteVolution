const { useEffect, useState } = React;

const btnRefreshReport = document.getElementById("btnRefreshReport");

const HandleReport = () => {
    const [loadingReport, setLoadingReport] = useState(false);

    useEffect(() => {
        btnRefreshReport.addEventListener("click", refreshPowerBiReport);

        return () => {
            btnRefreshReport.removeEventListener("click", refreshPowerBiReport);
        };
    }, []);

    const refreshPowerBiReport = async () => {
        setLoadingReport(true);
        let res = await axios({
            method: "POST",
            url: "https://intevolution-functionapp-conversationsdemo.azurewebsites.net/api/ConversationAnalysis?code=Wn0fRQc9zB4TGBQeL5iPX9lNSs7GeSG0ZsArGicTsURRAzFulmXolQ==&type=RefreshReport",
            body: {},
        });

        let resCode = res.data.code;
        let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await sleep(5000);
        switch (resCode) {
            case "00":
                Swal.fire({
                    icon: "success",
                    title: "Reporte actualizado correctamente",
                    text: "El reporte se ha actualizado correctamente",
                });
                break;

            default:
                Swal.fire({
                    icon: "error",
                    title: "Error al actualizar el reporte",
                    text: "Solo de puede actualizar el reporte 8 veces cada 24 horas, por favor intente más tarde.",
                });
                break;
        }
        setLoadingReport(false);
    };

    return (
        <div class="container">
            {loadingReport ? (
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            ) : (
                <iframe
                    class="audio-report-iframe"
                    id="report-iframe"
                    allowFullScreen="true"
                    src="https://app.powerbi.com/view?r=eyJrIjoiNzgxZTM0N2EtMTNjOC00MGQ4LTg5MzQtNDdkYjk2MTViYTNmIiwidCI6IjQ0ZTM0MTMyLTAzNjMtNGZmMi05NjRmLTZkNzgyOWQwYWU5OSIsImMiOjR9&pageName=ReportSection571d3d06800d56828301"
                ></iframe>
            )}
        </div>
    );
};

// Render the component
ReactDOM.render(<HandleReport />, document.getElementById("powerbiReport"));
