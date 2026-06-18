const API = "https://cloudflarelab-api.wincapz20.workers.dev/";

let counter = 0;

const ctx = document
.getElementById("trafficChart")
.getContext("2d");

const chart = new Chart(ctx,{
    type:"line",
    data:{
        labels:[],
        datasets:[{
            label:"Requests",
            data:[],
            borderWidth:3,
            tension:.3
        }]
    },
    options:{
        responsive:true,
        plugins:{
            legend:{
                labels:{
                    color:"white"
                }
            }
        },
        scales:{
            x:{
                ticks:{color:"white"}
            },
            y:{
                ticks:{color:"white"}
            }
        }
    }
});

function updateChart(value){
    const time =
    new Date().toLocaleTimeString();

    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(value);

    if(chart.data.labels.length > 20){
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

function addLog(message,type="success"){
    const log =
    document.getElementById("log");

    log.innerHTML =
    `<div class="log-item ${type}">
    ${new Date().toLocaleTimeString()}
    - ${message}
    </div>` + log.innerHTML;
}

async function sendRequest(profile="normal",count=1){

    try{

        const res = await fetch(API,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                profile,
                count
            })
        });

        const data = await res.json();

        counter += count;

        document.getElementById(
            "counter"
        ).innerText = counter;

        updateChart(counter);

        addLog(
            `${profile} (${count}) requests`
        );

        console.log(data);

    }catch(err){

        addLog(
            "Worker request failed",
            "error"
        );

        console.error(err);

    }
}

function normalTraffic(){
    sendRequest("normal",10);
}

function trafficSpike(){
    sendRequest("traffic_spike",100);
}

function botSimulation(){
    sendRequest("bot",500);
}

function wafTest(){
    sendRequest("waf_test",20);
}

function rateLimit(){
    sendRequest("rate_limit",100);
}

function loginAttack(){
    sendRequest("login_attack",200);
}

function errorTest(){
    sendRequest("404_test",50);
}

function cacheTest(){
    sendRequest("cache_test",50);
}

function sendStatus(code){
    sendRequest(`status_${code}`,1);
}
