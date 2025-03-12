// Get references to DOM elements
const dataSourcesSelector = document.getElementById("dataSources");
const modelDescription = document.getElementById("modelDescription");
const chatExamplesContainer = document.getElementById("chatExamples");
const downloadButton = document.getElementById("downloadButton");

// Define available data sources and set the default
const dataSources = ["Retail"];
const defaultDataSource = "Retail";

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
        link: "https://intevolutionassista859e.blob.core.windows.net/demo-files/Curso DAX SEG (1)(1).xlsx",
        description:
            "Datos de una empresa de retail para analizar ventas, clientes e ingresos.",
    },
};

/**
 * Populates the data source dropdown.
 */
function populateDataSources() {
    dataSources.forEach((dataSource) => {
        const option = document.createElement("option");
        option.value = dataSource;
        option.textContent = dataSource;
        dataSourcesSelector.appendChild(option);
    });
    dataSourcesSelector.value = defaultDataSource;
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
function init() {
    populateDataSources();
    updateModelDescription(defaultDataSource);
    renderChatQuestions(chatExamples[defaultDataSource].questions);
    //renderCSVTable(); // Render dummy CSV table for "Datos" tab
}

// Change data source event
dataSourcesSelector.addEventListener("change", () => {
    const selectedDataSource = dataSourcesSelector.value;
    renderChatQuestions(chatExamples[selectedDataSource].questions);
    updateModelDescription(selectedDataSource);
});

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
