// Get references to DOM elements
const dataSourcesSelector = document.getElementById("dataSources");
const modelDescription = document.getElementById("modelDescription");
const chatExamplesContainer = document.getElementById("chatExamples");
const downloadButton = document.getElementById("downloadButton");
const loadingDataSources = document.getElementById("loadingDataSources");

// Define available data sources and set the default
const dataSources = [
    "Retail",
    "Hospital",
    "Logistics",
    "Government",
    "Construction",
];
let defaultDataSource = "";

// Define chat examples for each data source
const chatExamples = {
    Retail: {
        questions: [
            `Quiero que me hagas un resumen de las ventas mes a mes, este resumen dámelo en formato de tabla. Expórtame la tabla completa a excel`,
            `Quiero que me hagas un gráfico de líneas donde me coloques una línea diferente para cada país, en el eje x los años de ventas y en el eje y las ventas totales. Además, genérame un resumen del análisis e interpreta los resultados de tal manera que los pueda presentar con la junta directiva de mi empresa.`,
            `Quiero que me expliques el comportamiento que ha tenido mi organización respecto a las ventas. Hazme un resumen con datos relevantes como, el mes de menor ventas, el de mayor ventas, porcentajes de crecimiento año a año, y demás indicadores importantes al respecto como qué productos se han vendido más, qué países son los que proporcionan más ventas, entre otros aspectos que consideres importantes. El resumen lo quiero como texto.`,
            `Quiero una predicción de 5 meses posteriores, omite el último mes disponible para hacer las predicciones, el resultado muéstramelo en un gráfico donde se resalte el resultado de los meses que se predijeron, además muéstrame la tabla con los resultados.`,
            `Quiero que me hagas un resumen respecto a la utilidad generada por cada orden de ventas. A la cantidad de ventas proveniente de la hoja de sales le restamos el costo total del producto que también proviene de la hoja de sales para obtener la utilidad.
    Calcula el porcentaje de utilidad, este porcentaje es la proporción de utilidad respecto al total de ventas.
    Una vez que tengas estos datos calculados, dame los resultados segmentados por los siguientes campos. Para cada campo genérame una tabla con el resumen del resultado y un análisis e interpretación de este. Los campos son:
    1. Por año
    2. Por País
    3. Por subcategoría
    4. Por categoría
    En la tabla me muestras los indicadores de: total de ventas, total de costos, total de utilidad y el porcentaje de utilidad respecto al total de ventas. Toma en cuenta las relaciones que se te proporcionan en las instrucciones.`,
        ],
        link: "https://intevolutionassista859e.blob.core.windows.net/demo-files/Contoso - Retail.zip",
        description:
            "Datos de una empresa de retail para analizar ventas, clientes e ingresos.",
    },
    Hospital: {
        questions: [
            `Tengo que analizar aspectos demográficos de los pacientes que ingresan al hospital, para ello es importante conocer la proporción de hombres y mujeres que ingresan, de que tipo de vivienda provienen y la edad máxima, mínima y la edad promedio de los pacientes que ingresan.
    Estos datos proporciónamelos como un análisis en texto, con gráficos y tablas.`,
            `Quiero conocer la relación que existe entre el tipo de admisión respecto a la salida del hospital, particularmente si existe una relación entre si el tipo de ingreso tiene que ver con que el paciente fallezca en el hospital.
    De igual manera conocer esta misma relación pero respecto a cuantos días los pacientes duran en terapia intensiva.
    Estos datos los quiero en un análisis en texto que lo pueda presentar al director del hospital.`,
            `Para cada uno de los tipos de salida que puede tener un paciente, me gustaría conocer la edad promedio de estos. Dado que es importante determinar si los pacientes que tienen una alta voluntaria son aquellos cuya edad es menor.`,
            `Quiero hacer un análisis de las enfermedades degenerativas que un paciente puede tener, por lo tanto quiero un resumen general de cuantos pacientes fuman, ingieren alcohol, tienen problemas de presión arterial o padecen de diabetes y la proporción que estos pacientes representan respecto a los que ingresan. Además, para cada una de las enfermedades quiero lo siguiente.
    Promedio de edad.
    Promedio de días que pasan en el hospital.
    Cual es la probabilidad de pasar más tiempo en terapia intensiva si se tiene la enfermedad.
    La probabilidad de fallecer si se tiene la enfermedad.`,
            `Quiero que tomes en cuenta las variables de edad, tipo vivienda, tipo de admisión, duración en días, duración en terapia intensiva, si fuma, ingieren alcohol, tienen problemas de presión arterial o padecen de diabetes para generarme un modelo de Machine Learning para calcular el tipo de salida que pueda llegar a tener un paciente que ingresa dada ciertas características.
    Esto será de utilidad para darle una mayor atención a aquellos pacientes cuya probabilidad de fallecer es mayor.
    Además muéstrame un análisis de correlaciones entre las variables de entrada respecto a la variable a predecir, me gustaría saber cuales influyen más en un resultado positivo.
    Quiero que me des un análisis muy detallado de los resultados que encontraste, incluye gráficos y tablas`,
        ],
        link: "https://intevolutionassista859e.blob.core.windows.net/demo-files/hospital.csv",
        description:
            "Datos de un hospital para analizar pacientes, tratamientos y costos.",
    },
    Logistics: {
        questions: [
            `Quiero que me hagas un resumen relacionado a las entregas respecto a la cantidad facturada en cada una de ellas.
    Quiero saber que tipo de servicio tiene mas entregas y que tipo de servicio factura más.
    De igual manera para el tipo de entrega.
    `,
            `Quiero conocer la tendencia de las entregas a lo largo del tiempo, esta información la quiero en formato de tabla y en un gráfico de líneas. Como eje X toma el mes del envío de la entrega y como eje y la cantidad de entregas que se hicieron en ese mes.
    Además, en una tabla colócame la misma información pero adicional quiero que me calcules el porcentaje de aumento o diminución de la cantidad de entregas respecto al mes anterior.
    Quiero gráficos, tablas y un análisis en texto detallado del resultado obtenido.
    `,
            `Ahora necesito analizar los clientes. Dame el Top 5 en una tabla mostrándome el nombre del cliente y su tipo de membresía, este análisis lo quiero en las siguientes variables.
    1. Clientes que más facturan
    2. Clientes cuya facturación aún está en estatus como pendiente de pago.
    3. Cantidad de clientes donde el estatus de entrega aún sea como pendiente de entrega.`,
            `Quiero hacer un análisis respecto al tiempo de entrega, este tiempo es el cálculo de días entre la fecha de entrega y la fecha de envío. Quiero saber que relación existe entre este tipo de entrega respecto a el tipo de servicio, el tipo de entrega y el contenido de la entrega.`,
            `Se me ha pedido realizar un análisis de la cantidad facturada en los meses en los que ha operado la empresa, no contando el mes de febrero del 2025, dado que no cuento con los datos completos. No tomes en cuenta aquellas facturas donde su estatus de pago sea pendiente de pago. Quiero que me generes un gráfico de líneas mostrando mes a mes este resultado y una proyección de facturación para los siguientes 4 meses. Adicional un gráfico de líneas donde se muestre mes a mes esa cantidad facturada pero resaltando el modo de pago, otro resaltando el tipo de entrega, y uno mas donde se observe por el tipo de membresía de los clientes.`,
        ],
        link: "https://intevolutionassista859e.blob.core.windows.net/demo-files/Logística.zip",
        description:
            "Datos de una empresa de logística para inspeccionar tiempos y tipos de entrega.",
    },
    Government: {
        questions: [
            `Quiero conocer la relación que existe entre el monto aprobado, el modificado y el ejercido. De estos tres indicadores me gustaría saber lo siguiente:
    1. Cual es la cantidad total para cada uno de estos tres montos
    2. Si existe una diferencia positiva o negativa entre lo aprobado y lo modificado.
    3. Que proporción del presupuesto modificado realmente fue ejercido`,
            `Hazme un resumen del presupuesto aprobado, el modificado y el ejercido para cada una de las características de gobierno general, para ello ocupo la siguiente información:
    1. Que gobierno tuvo el mayor presupuesto modificado.
    2. Que gobierno ejerció la mayor cantidad de presupuesto modificado.
    3. Que porcentaje del monto general del presupuesto modificado le correspondió a cada gobierno.
    4. Un gráfico de pastel con este porcentaje`,
            `De acuerdo a la finalidad a la que se otorgó el presupuesto. Quiero que me des un resumen detallado de cada una de ellas en la que involucre la función y subfunción de cada una de las finalidades. Quiero conocer a detalle cual de estas tienen un mayor presupuesto asignado, ejercido y el porcentaje en proporción del total ejercido respecto a lo modificado.`,
            `De acuerdo al sector al que se le asigna el presupuesto quiero que me generes lo siguiente:
    1. Un diagrama de barras para la cantidad del presupuesto aprobado por sector, que se resalten en un color llamativo el top 3 de estos de mayor presupuesto aprobado y el resto de sectores un color tenue, ordena las barras de manera ascendente de acuerdo con la cantidad aprobada.
    2. Un taba donde se muestre por sector la cantidad aprobada, la modificada y la ejercida. Diferencia entre lo modificado y aprobado y porcentaje de ejercido respecto a lo modificado. La tabla ordénamela por los sectores cuya cantidad modificada sea mayor.`,
            `Dame un resumen general de la información que tienes disponible, dame lo que consideres relevante respecto al presupuesto y como es asignado respecto  los diferentes rubros a los que se le otorga, toma al menos cinco categorías y para cada una de ellas puedes darme tu análisis, incluye gráficos y tablas cuando sea necesario explicar los datos de manera visual para una mayor comprensión`,
        ],
        link: "https://intevolutionassista859e.blob.core.windows.net/demo-files/egresos.csv",
        description:
            "Egresos de la Ciudad de México en 2022 para examinar como se deroga el presupuesto.",
    },
    Construction: {
        questions: [
            `Quiero analizar los niveles de riesgo que tienen los proyectos, para ello, para cada tipo de proyecto (comercial y residencial) necesito un resumen general donde pueda observar en cada gráfico circular la proporción que le corresponde a cada uno de ellos. Además, por estado y en una tabla conocer cuantos proyectos corresponden a cada tipo de riesgo.`,
            `Quiero obtener la distribución del presupuesto promedio por estado y tipo de proyecto. Presentar los resultados en una tabla pivote y visualizar la distribución con un gráfico de cajas y bigotes (boxplot). Dame un análisis general por cada estado, proyecto con mayor presupuesto, proyecto con menor presupuesto, medias, promedios, ext.`,
            `Mi objetivo es comparar la duración promedio de los proyectos finalizados según el estado en el que se realizaron y si cuentan o no con certificaciones de sostenibilidad. El resultado se debe de presentar en una tabla y un gráfico de barras.`,
            `Necesito analizar la mano de obra a la que se asigna cada proyecto, por lo que es necesario conocer si la distribución de esta está relacionada con el tamaño del proyecto. Para el tamaño nos basaremos en el presupuesto asignado, por lo tanto genérame un gráfico de dispersión donde se pinte la mano de obra y el presupuesto y poder observar si existe una correlación entre estas dos variables. Quiero que me proporciones tus conclusiones`,
            `Quiero que me hagas un resumen por estado de los proyectos que se han asignado. Quiero conocer lo siguiente: 
- Promedio de duración de los proyectos en días
- Total de presupuesto
- Total de mano de obra contratada
- Cantidad de proyectos
- Cantidad de proyectos con riesgo Alto
- Promedio de plusvalía
- Porcentaje de proyectos con riesgo al respecto al total de proyectos
Los resultados los necesito exportar en una tabla de excel.`,
        ],
        link: "https://intevolutionassista859e.blob.core.windows.net/demo-files/proyectos_constructora.csv",
        description:
            "Información de proyectos de construcción para su gestión y seguimiento",
    },
};

/**
 * Populates the data source dropdown.
 */
function populateDataSources(assistantName) {
    dataSources.forEach((dataSource) => {
        const option = document.createElement("option");
        option.value = dataSource;
        option.textContent = dataSource;
        dataSourcesSelector.appendChild(option);
    });
    dataSourcesSelector.value = assistantName;
}

async function getAsstantName() {
    try {
        let res = await axios({
            method: "POST",
            url: "https://agentia-analyticstudio-demo.azurewebsites.net/api/Assistants?type=getAsstantName",
            data: {},
        });
        return res.data.data.assistantName;
    } catch (error) {
        console.error("Error", error);
        Swal.fire({
            title: "Error!",
            text: "Hubo un error al obtener el nombre del asistente",
            icon: "error",
        });
    }
}

/**
 * Renders chat questions in the #chatExamples container.
 * @param {Array} questions - Array of prompt strings.
 */
function renderChatQuestions(questions) {
    chatExamplesContainer.innerHTML = "";
    questions.forEach((question, index) => {
        // Create and append the prompt title
        const titleDiv = document.createElement("div");
        titleDiv.className = "chatQuestionTitle";
        titleDiv.textContent = `Prompt ${index + 1}`;
        chatExamplesContainer.appendChild(titleDiv);

        // Create and append the question container
        const questionDiv = document.createElement("div");
        questionDiv.className = "chatQuestion";
        questionDiv.textContent = question;
        chatExamplesContainer.appendChild(questionDiv);

        // Create and append the copy button
        const copyButton = document.createElement("button");
        copyButton.className = "copyButton";
        copyButton.textContent = "Copiar";
        questionDiv.appendChild(copyButton);

        // Add copy-to-clipboard functionality
        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(question).then(() => {
                copyButton.textContent = "Copiado!";
                setTimeout(() => {
                    copyButton.textContent = "Copiar";
                }, 2000);
            });
        });
    });
}

/**
 * Updates the model description based on the selected data source.
 * @param {string} dataSource - The current data source.
 */
function updateModelDescription(dataSource) {
    modelDescription.innerHTML = chatExamples[dataSource].description;
}

/**
 * Renders a dummy CSV table with filtering and sorting in the #tableExamples container.
 */
function renderCSVTable() {
    const tableContainer = document.getElementById("tableExamples");

    // Dummy CSV data: first row are headers
    const data = [
        ["ID", "Name", "Age", "Country"],
        [1, "Alice", 25, "USA"],
        [2, "Bob", 30, "UK"],
        [3, "Charlie", 22, "Canada"],
        [4, "Diana", 28, "Australia"],
    ];

    // Create filter input
    const filterDiv = document.createElement("div");
    filterDiv.className = "mb-2";
    const filterInput = document.createElement("input");
    filterInput.type = "text";
    filterInput.className = "form-control";
    filterInput.placeholder = "Filtrar tabla...";
    filterDiv.appendChild(filterInput);

    // Create table element with Bootstrap classes
    const table = document.createElement("table");
    table.className = "table table-bordered table-striped";

    // Create table head and body elements
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Populate header row
    const headerRow = document.createElement("tr");
    data[0].forEach((headerText, index) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        th.style.cursor = "pointer";
        // Attach sorting functionality on header click
        th.addEventListener("click", () => sortTable(table, index));
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Populate table body rows
    data.slice(1).forEach((rowData) => {
        const row = document.createElement("tr");
        rowData.forEach((cellData) => {
            const td = document.createElement("td");
            td.textContent = cellData;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    // Clear any previous content and add filter and table
    tableContainer.innerHTML = "";
    tableContainer.appendChild(filterDiv);
    tableContainer.appendChild(table);

    // Add filter functionality: hide rows that don't match filter input
    filterInput.addEventListener("input", function () {
        const filter = filterInput.value.toLowerCase();
        Array.from(tbody.rows).forEach((row) => {
            const rowText = Array.from(row.cells)
                .map((cell) => cell.textContent.toLowerCase())
                .join(" ");
            row.style.display = rowText.indexOf(filter) > -1 ? "" : "none";
        });
    });
}

/**
 * Sorts the table rows based on the given column index.
 * @param {HTMLTableElement} table - The table to sort.
 * @param {number} columnIndex - The index of the column to sort by.
 */
function sortTable(table, columnIndex) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    // Toggle sort order: ascending if not already sorted ascending
    const currentSort = table.getAttribute("data-sort-" + columnIndex);
    const ascending = currentSort !== "asc";

    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        // Compare as numbers if possible; otherwise, as strings
        const numA = parseFloat(cellA);
        const numB = parseFloat(cellB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return ascending ? numA - numB : numB - numA;
        }
        return ascending
            ? cellA.localeCompare(cellB)
            : cellB.localeCompare(cellA);
    });

    // Append the sorted rows back to the tbody
    rows.forEach((row) => tbody.appendChild(row));

    // Store the current sort state for this column
    table.setAttribute("data-sort-" + columnIndex, ascending ? "asc" : "desc");
}

/**
 * Initializes the page by populating the dropdown,
 * setting the model description, and rendering chat examples and CSV table.
 */
async function init() {
    let assistantName = await getAsstantName();
    populateDataSources(assistantName);
    updateModelDescription(assistantName);
    renderChatQuestions(chatExamples[assistantName].questions);
    //renderCSVTable(); // Render dummy CSV table for "Datos" tab
}

// Change data source event
dataSourcesSelector.addEventListener("change", async (event) => {
    const targetValue = event.target.value;
    loadingDataSources.style.display = "block";
    await handleAssistantName(targetValue);
    loadingDataSources.style.display = "none";
});

async function handleAssistantName(targetValue) {
    try {
        let data = {
            assistantName: targetValue,
        };

        let res = await axios({
            method: "POST",
            url: "https://agentia-analyticstudio-demo.azurewebsites.net/api/Assistants?type=handleAssistantName",
            data: data,
        });

        let resCode = res.data.code;
        switch (resCode) {
            case "00":
                updateModelDescription(targetValue);
                renderChatQuestions(chatExamples[targetValue].questions);
                refreshIframe();
                break;

            default:
                Swal.fire({
                    title: "Error!",
                    text: res.data.message,
                    icon: "error",
                });
                break;
        }
    } catch (error) {
        console.error("Error", error);
        Swal.fire({
            title: "Error!",
            text: "Hubo un error al obtener el cambiar la vertical del asistente",
            icon: "error",
        });
    }
}

function refreshIframe() {
    const iframe = document.getElementById("webchatIframe");
    iframe.src = iframe.src;
}

// Download button event: open the file link in a new tab
downloadButton.addEventListener("click", () => {
    const selectedDataSource = dataSourcesSelector.value;
    const link = chatExamples[selectedDataSource].link;
    if (link) {
        window.open(link, "_blank");
    }
});

// Initialize once the DOM content is loaded
document.addEventListener("DOMContentLoaded", init);
