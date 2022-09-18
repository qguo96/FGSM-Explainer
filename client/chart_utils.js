import {Chart} from "chart.js";

export function createAccCharts(modelName, modelData) {
    let ctx;
    if(modelName == 'VGG16') {
        ctx = document.getElementById('robustAnalyzerVGG16').getElementsByTagName('canvas');
    } else if(modelName == 'VGG19'){
        ctx = document.getElementById('robustAnalyzerVGG19').getElementsByTagName('canvas');
    }
    let chartCreated = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Natural Acc.", "Robust Acc."],
            datasets: [
                {
                    //label: "Population (millions)",
                    backgroundColor: ["#db7093", "#db7093"],
                    data: modelData,
                    borderWidth: 0.5,
                    barPercentage: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            scales: {
                xAxis: {
                    grid: {
                        borderColor: "grey",
                        borderWidth: "5"
                    },
                    ticks: {
                        color: "white",
                        font: {
                            size: 15
                        }
                    }
                },
                yAxis: {
                    grid: {
                        borderColor: "grey",
                        borderWidth: "5"
                    },
                    ticks: {
                        color: "white",
                        font: {
                            size: 15
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    color: "white",
                    display: true,
                    text: modelName
                }
            }
        }
    });
    return chartCreated;
}

/**
 * update accuracy bar
 * @param accChart: chart variable
 * @param dataValue: new robust accuracy
 */
export function updateChart(accChart, dataValue) {
    accChart.data.datasets[0].data[1] = dataValue;
    accChart.update();
}
