
let count = 0;



function addLog(message){


document.getElementById("log").innerHTML =
message;



}



function increase(){


count++;


document.getElementById("counter").innerHTML=count;


}



// Normal traffic

function normalTraffic(){


fetch("/")


increase();


addLog(

"Normal user request generated"

);


}




// Traffic spike

function trafficSpike(){


addLog(

"Sending traffic spike..."

);



for(let i=0;i<200;i++){


fetch("/traffic-test");


increase();


}


}



// Bot simulation

function botSimulation(){


fetch("/bot-test",{


headers:{


"User-Agent":"Cloudflare-Lab-Bot"


}


});



increase();


addLog(

"Bot-like User-Agent sent"

);



}




// WAF Test


function wafTest(){


fetch("/admin-panel");


increase();


addLog(

"WAF test request: /admin-panel"

);


}




// Rate Limit Test


function rateLimit(){



addLog(

"Testing rate limit..."

);



for(let i=0;i<500;i++){


fetch("/rate-test");


increase();


}


}




// Fake login attack


function loginAttack(){



fetch("/login",{


method:"POST",


body:JSON.stringify({


username:"admin",


password:"test"


})


});



increase();



addLog(

"Fake login request generated"

);


}
