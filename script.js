let count = 0;


let chartData = [];


let labels = [];



const ctx = document
.getElementById("trafficChart")
.getContext("2d");



let chart = new Chart(ctx, {


type:"line",


data:{


labels:labels,


datasets:[{


label:"Requests / sec",


data:chartData,


borderWidth:2


}]


},


options:{


animation:false,


responsive:true


}


});





const countries=[

"US",
"PH",
"JP",
"DE",
"SG",
"GB",
"CA"

];


const browsers=[

"Chrome",
"Safari",
"Firefox",
"Edge"

];



const statuses=[

200,200,200,
201,
202,
301,
302,
403,
404,
410,
429,
499,
500,
502,
503

];





function random(arr){

return arr[Math.floor(Math.random()*arr.length)];

}




function sendRequest(profile="Normal"){


let status=random(statuses);



let request={


profile,

status,


country:random(countries),


browser:random(browsers),


latency:Math.floor(Math.random()*300),


cache:Math.random()>0.5?"HIT":"MISS"


};



count++;


document.getElementById("counter").innerHTML=count;



addLog(request);


updateChart();



}





function sendStatus(code){


count++;


document.getElementById("counter").innerHTML=count;


addLog({

profile:"Manual Test",

status:code,

country:"PH",

browser:"Chrome",

latency:120,

cache:"MISS"


});


updateChart();


}







function normalTraffic(){

sendRequest("Normal User");


}




function trafficSpike(){


for(let i=0;i<20;i++){

sendRequest("Traffic Spike");

}


}




function botSimulation(){


for(let i=0;i<15;i++){

sendRequest("Bot Traffic");

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


sendRequest("Cache Test");


}





function addLog(data){


let log=document.getElementById("log");


let line=


`[${new Date().toLocaleTimeString()}]

${data.profile}

STATUS:${data.status}

${data.country}

${data.browser}

${data.latency}ms

CACHE:${data.cache}`;



log.innerHTML=line+"<br><br>"+log.innerHTML;



}






function updateChart(){


labels.push(new Date().toLocaleTimeString());


chartData.push(count);



if(labels.length>20){

labels.shift();

chartData.shift();


}



chart.update();


}





setInterval(()=>{


sendRequest("Auto Traffic");


},3000);
