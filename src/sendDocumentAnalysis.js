const $form = document.querySelector("#form");
const $result = document.querySelector("#result");
const $loader = document.querySelector("#loader");
const $tableResult = document.querySelector("#table-result");
const $error = document.querySelector("#error");
const $tableHeaders = document.querySelector("#table-headers");

function renderResult(result) {
    console.log("renderResult :>> ", result);
    document.getElementById("result").innerHTML = JSON.stringify(result, null, 2);
    const dataTableRow = document.createElement("tr");
    if (typeof result === "object") {
        const keys = Object.keys(result);
        for (let i = 0; i < keys.length; i++) {
            const data = keys[i];
            console.log("data :>> ", data);
            const documentData = result[data];
            console.log("documentData :>> ", documentData);
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

async function sendDocumentAnalysis(event) {
    event.preventDefault();

    try {
        const formData = new FormData(event.currentTarget);
        $loader.removeAttribute("hidden");
        $error.setAttribute("hidden", "");
        $tableResult.innerHTML = "";
        $tableHeaders.innerHTML = "";

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
        console.log("res :>> ", res);
        let responseCode = res?.data?.code ? parseInt(res.data.code) : 99; //Si no hay un código de respuesta lo mandamos al default
        $loader.setAttribute("hidden", "");
        switch (responseCode) {
            case 0:
                let documentContent = res.data.document;
                renderResult(documentContent);
                return documentContent;
            case 1:
                renderResult("El documento enviado no es un documento oficial");
                break;
            case 2:
                renderResult(
                    "El tipo de contenido es incorrecto, solo se admiten los formatos png, jpg, jpeg y pdf"
                );
                break;
            case 3:
                renderResult("No se ha enviado ningún documento");
                break;
            case 4:
                renderResult("El tipo de contenido es incorrecto");
                break;
            case 5:
                renderResult("El formato de petición es incorrecto");
                break;
            case 6:
                renderResult("La petición no está autorizada");
                break;
            case 7:
                renderResult("Ocurrió un error inesperado, inténtelo más tarde");
                break;
            case 8:
                renderResult("El documento enviado es ilegible");
                break;
            case 9:
                renderResult("El documento enviado presenta zonas muy brillantes");
                break;
            case 10:
                renderResult("El documento enviado no es oficial");
                break;
            case 11:
                renderResult("El documento tiene poca iluminación");
                break;
            case 12:
                renderResult("El documento enviado presenta zonas oscuras");
                break;
            case 13:
                renderResult("El documento enviado no se encuentra centrado");
                break;
            case 14:
                renderResult("El documento enviado no debe estar incompleto o recortado");
                break;
            case 15:
                renderResult(
                    "El fondo del documento debe ser claro y no debe interferir con el contenido"
                );
                break;
            case 16:
                renderResult("El ángulo del documento enviado no permite visualizar el contenido");
                break;
            case 17:
                renderResult("El documento enviado presenta daños");
                break;
            case 18:
                renderResult("El documento enviado es demasiado grande");
                break;
            case 19:
                renderResult("El documento enviado no es una credencial vigente");
                break;
            case 20:
                renderResult("No se logró obtener la fecha de vigencia");
                break;
            case 21:
                renderResult(
                    "No se lograron obtener los datos. Por favor, inténtalo nuevamente con una imagen diferente"
                );
                break;
            default:
                renderResult("Ocurrió un error en la petición, inténtelo más tarde");
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
