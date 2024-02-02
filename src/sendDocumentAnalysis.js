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
const serviceType = document.querySelector("#serviceType");

const APIColumns = [
    { key: "nombreCompleto", value: "Nombre completo" },
    { key: "nombre", value: "Nombre" },
    { key: "apellidoPaterno", value: "Apellido paterno" },
    { key: "apellidoMaterno", value: "Apellido materno" },
    { key: "claveElector", value: "Clave de elector" },
    { key: "fechaNacimiento", value: "Fecha de nacimiento" },
    { key: "sexo", value: "Sexo" },
    { key: "estadoResidencia", value: "Estado de residencia" },
    { key: "direccionResidencia", value: "Dirección de residencia" },
    { key: "municipioResidencia", value: "Municipio de residencia" },
    { key: "fechaEmisionDocumento", value: "Fecha de emisión del documento" },
    { key: "fechaExpiracionDocumento", value: "Fecha de expiración del documento" },
    { key: "curp", value: "CURP" },
    { key: "seccion", value: "Sección" },
    { key: "fechaRegistro", value: "Fecha de registro" },
    { key: "numeroCIC", value: "Número CIC" },
    { key: "numeroOCR", value: "Número OCR" },
    { key: "numeroFUAR", value: "Número FUAR" },
    { key: "nacionalidad", value: "Nacionalidad" },
    { key: "numeroDocumento", value: "Número de documento" },
    { key: "paisExpedicion", value: "País de expedición" },
    { key: "numeroEmision", value: "Número de emisión" },
    { key: "periodoFacturado", value: "Período facturado" },
    { key: "númeroDeServicio", value: "Número de servicio" },
    { key: "númeroDeTeléfono", value: "Número de teléfono" },
    { key: "domicilioDeServicio", value: "Domicilio de servicio" },
    { key: "identificacionDeDocumento", value: "Identificación de documento" },
    { key: "identificacionDeContenido", value: "Identificación de contenido" },
    { key: "confiabilidad_letra", value: "Confiabilidad letra" },
    { key: "confiabilidad_numero", value: "Confiabilidad número" },
    { key: "deteccion_letra", value: "Detección letra" },
    { key: "deteccion_numero", value: "Detección número" },
];

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
    const translatedColumn = APIColumns.find((item) => item.key === data)?.value || "";
    return translatedColumn;
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
    const formData = new FormData(event.currentTarget);
    const file = formData.get("image"); // replace 'file' with the name of the form field for the file

    const reader = new FileReader();
    var base64String = null;

    if (file) {
        reader.readAsDataURL(file);
    }

    $loader.removeAttribute("hidden");
    $error.setAttribute("hidden", "");
    $tableResult.innerHTML = "";
    $tableHeaders.innerHTML = "";
    $result.innerHTML = "";
    selectElement.value = "table";
    var responseCode;
    try {
        switch (true) {
            case serviceType.value === "document":
                let axiosObj = {
                    url: "https://intevolution-functionapp-documentanalysis.azurewebsites.net/api/DocumentAnalysis?code=Uq0uqJgSRKYf3KWnIsX6qcJjbkHze_qgtRZUtsAQZsDvAzFu7qUNaA==",
                    method: "POST",
                    timeout: 3000000, //5 minutos
                    headers: {
                        Authorization: "6xd5k51tfbdqzxubtd60bxxbmfp5tw02",
                    },
                    data: formData,
                };
                let res = await axios(axiosObj);
                responseCode = res?.data?.code ? parseInt(res.data.code) : 99; //Si no hay un código de respuesta lo mandamos al default
                $loader.setAttribute("hidden", "");

                if (responseCode !== 0) {
                    selectElement.value = "JSON";
                    handleSelectChange("JSON");
                }
                switch (responseCode) {
                    case 0:
                        let documentContent = null;
                        let documentType = null;
                        if (serviceType.value === "document") {
                            documentContent = res.data.document;
                            documentType = res.data.documentType;
                            $documentType.textContent = documentType;
                        }

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
                        renderResult(
                            "No se ha enviado ningún documento. Por favor, carga un documento."
                        );
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
                        renderResult(
                            "El documento que enviaste no debe estar incompleto o recortado."
                        );
                        break;
                    case 15:
                        renderResult(
                            "El fondo del documento debe estar claro y no debe interferir con el contenido."
                        );
                        break;
                    case 16:
                        renderResult(
                            "El ángulo del documento que enviaste no permite ver el contenido."
                        );
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
                break;
            case serviceType.value === "writtenNumber":
                reader.onloadend = async function () {
                    base64String = reader.result;
                    $loader.setAttribute("hidden", "");
                    let data = {
                        imagen_base64: base64String.split(",")[1],
                    };
                    let axiosObjNumber = {
                        url: "https://intevolution-appfunction-apida.azurewebsites.net/api/readWrittenNumbers?code=27ZUFEp0dQQXNDP5Izo7dHDLgBnU-o7CmQV50XLoUUgDAzFuC8Tt5g==",
                        method: "POST",
                        timeout: 3000000, //5 minutos
                        headers: {
                            "Content-Type": "application/octet-stream",
                            Authorization: "6xd5k51tfbdqzxubtd60bxxbmfp5tw02",
                        },
                        data: file,
                        //data: data,
                    };
                    let resNumber = await axios(axiosObjNumber);
                    responseCode = responseCode = resNumber?.data?.response?.code
                        ? parseInt(resNumber.data.response?.code)
                        : 99; //Si no hay un código de respuesta lo mandamos al default

                    switch (responseCode) {
                        case 0:
                            let documentContent = null;
                            let documentType = null;
                            if (serviceType.value === "writtenNumber") {
                                documentContent = resNumber.data.response.data.datos[0];
                                documentType = "Número escrito";
                                $documentType.textContent = documentType;
                            }
                            selectElement.value = "table";
                            handleSelectChange("table");

                            renderResult(documentContent);
                            break;

                        default:
                            renderResult(
                                "¡Ups! Ocurrió un error en la solicitud. Por favor, inténtalo de nuevo más tarde."
                            );
                            break;
                    }
                };
                break;

            default:
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
