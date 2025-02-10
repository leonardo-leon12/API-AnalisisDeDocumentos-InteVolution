let dataSourcesSelector = document.getElementById("dataSources");
let chatExamplesContainer = document.getElementById("chatExamples");

let dataSources = ["Excel"];
let defaultDataSource = "Excel";


let chatExamples = {
    "Excel": {
        "questions": [
            `Quiero que me hagas un resumen de las ventas mes a mes, este resumen dámelo en formato de tabla. Expórtame la tabla completa a excel`,
            `Quiero que me expliques el comportamiento que ha tenido mi organización respecto a las ventas. Hazme un resumen con datos relevantes como, el mes de menor ventas, el de mayor ventas porcentajes de crecimiento año a año, y demás indicadores importantes al respecto como que productos se han vendido mas, que países son los que proporcionan mas ventas, entre otros aspectos que consideres importantes. El resumen lo quiero como texto.`,
            `Quiero que me hagas un grafico de líneas donde me coloques una línea diferente para cada país, en el eje x los años de ventas y en el eje y las ventas totales. además, genérame un resumen del análisis e interpreta los resultados de tal manera que los pueda presentar con la junta directiva de mi empresa.`,
            `Quiero una predicción de 5 meses posteriores, omite el ultimo mes disponible para hacer las predicciones, el resultado muéstramelo en un grafico donde se resalte el resultado de los meses que se predijeron, además muéstrame la tabla con los resultados.`,
            `Quiero que me hagas un resumen respecto a la utilidad generada por cada orden de ventas. A la cantidad de ventas proveniente de la hoja de sales le restamos el costo total del producto que también proviene de la hoja de sales para obtener la utilidad.  
Calcula el porcentaje de utilidad, este porcentaje es la proporción de utilidad respecto al total de ventas.  
Una vez que tengas estos datos calculados, dame los resultados segmentados por los siguientes campos. Para cada campo genérame una tabla con el resumen del resultado y un análisis e interpretación de este. Los campos son.  
1. Por año  
2. Por País
3. Por subcategoría
4. Por categoría 
En la tabla me muestras los indicadores de, total de ventas, total de costos, total de utilidad y el porcentaje de utilidad respecto al total de ventas. Toma en cuenta las relaciones que se te proporcionan en las instrucciones.`,
        ],
    }
};

dataSources.forEach(function(dataSource) {
    let option = document.createElement("option");
    option.text = dataSource;
    dataSourcesSelector.add(option);
    dataSourcesSelector.value = "Excel";
});


let defaultChatQuestions = chatExamples[defaultDataSource].questions;
    for (let index = 0; index < defaultChatQuestions.length; index++) {
        const question = defaultChatQuestions[index];
        //add title to chat question
        let chatQuestionTitle = document.createElement("div");
        chatQuestionTitle.className = "chatQuestionTitle";
        chatQuestionTitle.innerHTML = `Consulta ${index + 1}`;
        chatExamplesContainer.appendChild(chatQuestionTitle);

        //append chat question to chatExamplesContainer
        let chatQuestion = document.createElement("div");
        chatQuestion.className = "chatQuestion";
        chatQuestion.innerHTML = question;
        chatExamplesContainer.appendChild(chatQuestion);

        //add a copy button to chat question
        let copyButton = document.createElement("button");
        copyButton.className = "copyButton";
        copyButton.innerHTML = "Copiar";
        chatQuestion.appendChild(copyButton);
        copyButton.addEventListener("click", function() {
            navigator.clipboard.writeText(question).then(function() {
                copyButton.innerHTML = "Copiado!";
                setTimeout(function() {
                    copyButton.innerHTML = "Copiar";
                }, 2000);
            });
        });
    }
