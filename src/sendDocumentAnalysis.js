const $form = document.querySelector("#form");
const $result = document.querySelector("#result");
const $loader = document.querySelector("#loader");
const $tableResult = document.querySelector("#table-result");
const $error = document.querySelector("#error");
const $tableHeaders = document.querySelector("#table-headers");
const $documentType = document.querySelector("#documentType");
const selectElement = document.getElementById("resultType");
const tableContainer = document.querySelector(".table");
const jsonResultContainer = document.querySelector(".json-result-container");

function renderResult(result) {
    document.getElementById("result").innerHTML = JSON.stringify(result, null, 2);
    const dataTableRow = document.createElement("tr");
    if (typeof result === "object") {
        const keys = Object.keys(result);
        for (let i = 0; i < keys.length; i++) {
            const data = keys[i];
            const documentData = result[data];
            const tdValue = document.createElement("td");
            tdValue.textContent = documentData;
            tdValue.id = data;
            dataTableRow.appendChild(tdValue);
            $tableResult.appendChild(dataTableRow);
            let tableHeaderData = translateDocumentAtributes(data);
            createTableHeader(tableHeaderData);
        }
    }
}

window.onload = function () {
    $form.querySelector("#file").value = "";
    $result.innerHTML = "";
    $tableResult.innerHTML = "";
    $tableHeaders.innerHTML = "";
    $documentType.innerHTML = "";
    $error.setAttribute("hidden", "");
    $loader.setAttribute("hidden", "");
    selectElement.value = "table";
    tableContainer.style.display = "block";
    jsonResultContainer.style.display = "none";
};

function createTableHeader(tableHeaderData) {
    const dataTableHeader = document.createElement("th");
    dataTableHeader.textContent = tableHeaderData;
    $tableHeaders.appendChild(dataTableHeader);
}

function translateDocumentAtributes(data) {
    switch (data) {
        case "nombreCompleto":
            return "Nombre completo";
        case "nombre":
            return "Nombre";
        case "apellidoPaterno":
            return "Apellido paterno";
        case "apellidoMaterno":
            return "Apellido materno";
        case "claveElector":
            return "Clave de elector";
        case "fechaNacimiento":
            return "Fecha de nacimiento";
        case "sexo":
            return "Sexo";
        case "estadoResidencia":
            return "Estado de residencia";
        case "direccionResidencia":
            return "Dirección de residencia";
        case "municipioResidencia":
            return "Municipio de residencia";
        case "fechaEmisionDocumento":
            return "Fecha de emisión del documento";
        case "fechaExpiracionDocumento":
            return "Fecha de expiración del documento";
        case "curp":
            return "CURP";
        case "seccion":
            return "Sección";
        case "fechaRegistro":
            return "Fecha de registro";
        case "numeroCIC":
            return "Número CIC";
        case "numeroOCR":
            return "Número OCR";
        case "numeroFUAR":
            return "Número FUAR";
        case "nacionalidad":
            return "Nacionalidad";
        case "numeroDocumento":
            return "Número de documento";
        case "paisExpedicion":
            return "País de expedición";
        case "numeroEmision":
            return "Número de emisión";
        case "periodoFacturado":
            return "Período facturado";
        case "númeroDeServicio":
            return "Número de servicio";
        case "númeroDeTeléfono":
            return "Número de teléfono";
        case "domicilioDeServicio":
            return "Domicilio de servicio";
        case "identificacionDeDocumento":
            return "Identificación de documento";
        case "identificacionDeContenido":
            return "Identificación de contenido";
        default:
            return "Atributo no reconocido";
    }
}

// Add event listener for the 'change' event
selectElement.addEventListener("change", () => handleSelectChange(selectElement.value));

function handleSelectChange(targetValue) {
    // Check the current value of the select element
    if (targetValue === "table") {
        // Show the table container and hide the JSON result container
        tableContainer.style.display = "block";
        jsonResultContainer.style.display = "none";
    } else if (targetValue === "JSON") {
        // Hide the table container and show the JSON result container
        tableContainer.style.display = "none";
        jsonResultContainer.style.display = "block";
    }
}

async function sendDocumentAnalysis(event) {
    event.preventDefault();

    try {
        const formData = new FormData(event.currentTarget);
        $loader.removeAttribute("hidden");
        $error.setAttribute("hidden", "");
        $tableResult.innerHTML = "";
        $tableHeaders.innerHTML = "";
        $result.innerHTML = "";
        selectElement.value = "table";

        let axiosObj = {
            url: "https://intevolution-functionapp-documentanalysis.azurewebsites.net/api/DocumentAnalysis?code=Uq0uqJgSRKYf3KWnIsX6qcJjbkHze_qgtRZUtsAQZsDvAzFu7qUNaA==",
            method: "POST",
            timeout: 3000000, //5 minutos
            headers: {
                Authorization: "c0vcx34u5yuqpg5ek24nx9iynicapdyh",
            },
            data: formData,
        };
        let res = await axios(axiosObj);
        let responseCode = res?.data?.code ? parseInt(res.data.code) : 99; //Si no hay un código de respuesta lo mandamos al default
        $loader.setAttribute("hidden", "");

        if (responseCode !== 0) {
            selectElement.value = "JSON";
            handleSelectChange("JSON");
        }
        switch (responseCode) {
            case 0:
                let documentContent = res.data.document;
                let documentType = res.data.documentType;
                $documentType.textContent = documentType;
                selectElement.value = "table";
                handleSelectChange("table");

                renderResult(documentContent);
                return documentContent;
            case 1:
                renderResult(
                    "Lo siento, pero el documento que enviaste no es un documento oficial."
                );
                break;
            case 2:
                renderResult(
                    "¡Ups! El tipo de contenido es incorrecto. Solo se aceptan formatos png, jpg, jpeg y pdf."
                );
                break;
            case 3:
                renderResult("No se ha enviado ningún documento. Por favor, carga un documento.");
                break;
            case 4:
                renderResult("¡Ups! El tipo de contenido es incorrecto.");
                break;
            case 5:
                renderResult("¡Ups! El formato de la solicitud es incorrecto.");
                break;
            case 6:
                renderResult("Lo siento, pero la solicitud no está autorizada.");
                break;
            case 7:
                renderResult(
                    "¡Ups! Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde."
                );
                break;
            case 8:
                renderResult("El documento que enviaste es ilegible.");
                break;
            case 9:
                renderResult("El documento que enviaste tiene áreas muy brillantes.");
                break;
            case 10:
                renderResult("¡Ups! El documento que enviaste no es un documento oficial.");
                break;
            case 11:
                renderResult("El documento tiene poca iluminación.");
                break;
            case 12:
                renderResult("El documento que enviaste tiene áreas oscuras.");
                break;
            case 13:
                renderResult("El documento que enviaste no está centrado.");
                break;
            case 14:
                renderResult("El documento que enviaste no debe estar incompleto o recortado.");
                break;
            case 15:
                renderResult(
                    "El fondo del documento debe estar claro y no debe interferir con el contenido."
                );
                break;
            case 16:
                renderResult("El ángulo del documento que enviaste no permite ver el contenido.");
                break;
            case 17:
                renderResult("El documento que enviaste tiene daños.");
                break;
            case 18:
                renderResult("El documento que enviaste es demasiado grande.");
                break;
            case 19:
                renderResult("El documento que enviaste no es una credencial válida.");
                break;
            case 20:
                renderResult("No se pudo obtener la fecha de vencimiento.");
                break;
            case 21:
                renderResult(
                    "No se pudo obtener los datos. Por favor, intenta de nuevo con una imagen diferente."
                );
                break;
            default:
                renderResult(
                    "¡Ups! Ocurrió un error en la solicitud. Por favor, inténtalo de nuevo más tarde."
                );
                break;
        }
    } catch (error) {
        console.log("error :>> ", error);
        $loader.setAttribute("hidden", "");
        $error.removeAttribute("hidden");
        renderResult("Ocurrió un error al analizar cargar la imagen, intentelo más tarde");
    }
}

$form.addEventListener("submit", sendDocumentAnalysis);
