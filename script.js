const CLOUDFLARE_URL =
"https://cloudflarelab.wincapz20.workers.dev";


let count = 0;

let labels = [];

let values = [];





const ctx = document
.getElementById("trafficChart")
.getContext("2d");



const chart = new Chart(ctx, {


type:"line",


data:{


labels:labels,


datasets:[{

label:"Cloudflare Requests",

data:values,

borderWidth:2

}]


},


options:{


animation:false,

responsive:true


}


});





function random(arr){

return arr[
Math.floor(Math.random()*arr.length)
];

}






async function sendRequest(profile="Normal Traffic"){


let status =
random([

200,
200,
200,
301,
302,
403,
404,
429,
500,
502,
503

]);



await sendToCloudflare(status);



createLog({

profile,

status,

country:
random([
"PH",
"US",
"JP",
"SG"
]),


latency:
Math.floor(
Math.random()*300
)


});



}









async function sendStatus(code){



await sendToCloudflare(code);



createLog({


profile:
"Manual Edge Status Test",


status:code,


country:"PH",


latency:100


});



}









async function sendToCloudflare(status){



try{


await fetch(

`${CLOUDFLARE_URL}/?status=${status}&time=${Date.now()}`,


{

method:"GET",

mode:"no-cors",

cache:"no-store"


}



);



console.log(
"Sent to Cloudflare:",
status
);



}


catch(error){


console.error(
"Cloudflare request failed",
error
);


}





count++;



document
.getElementById("counter")
.innerHTML=count;



updateChart();



}










function createLog(data){



let log =
document.getElementById("log");



let entry =

`

[${new Date()
.toLocaleTimeString()}]


EDGE STATUS:
${data.status}


PROFILE:
${data.profile}


COUNTRY:
${data.country}


LATENCY:
${data.latency}ms


-------------------------

`;



log.innerHTML =
entry + log.innerHTML;


}








function updateChart(){



labels.push(
new Date()
.toLocaleTimeString()
);



values.push(count);




if(labels.length > 20){


labels.shift();


values.shift();


}



chart.update();


}









function normalTraffic(){


sendRequest(
"Normal User"
);


}








function trafficSpike(){



for(let i=0;i<30;i++){


sendRequest(
"Traffic Spike"
);


}


}








function botSimulation(){



for(let i=0;i<20;i++){


sendRequest(
"Bot Traffic"
);


}


}








function wafTest(){


sendStatus(403);


}







function rateLimit(){


sendStatus(429);


}







function errorTest(){


sendStatus(404);


}







function cacheTest(){


sendRequest(
"Cache Test"
);


}







setInterval(()=>{


sendRequest(
"Automatic Traffic"
);


},5000);
