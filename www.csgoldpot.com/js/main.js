var circle,bets=100500,endtime=2147485546,ms=1000;
var audioElement = document.createElement('audio');
audioElement.setAttribute('src', 'audio.mp3');
var audioElement2 = document.createElement('audio');
audioElement2.setAttribute('src', 'msg.mp3');
var audioElement3 = document.createElement('audio');
audioElement3.setAttribute('src', 'open.wav');
audioElement3.volume=0.10;
var audioElement4 = document.createElement('audio');
audioElement4.setAttribute('src', 'item.mp3');
var muteSound=0;


function checkMute()
{
if (getCookie("muteSound")=="1")
{
	muteSoundDo(1);
	$("#muteSound").text('unmute sound');
	muteSound=1;
}
}


function muteSoundClick()
{
if (muteSound == 1){
	$("#muteSound").html('<img src="img/unmute.png" style=\"width: 35px; height: 30px; border: 1px solid #FFD600;\"></img>');
	muteSound = 0;
}else{
	$("#muteSound").html('<img src="img/mute.png" style=\"width: 35px; height: 30px; border: 1px solid #FFD600;\"></img>');
	muteSound = 1;
}	
setCookie("muteSound",muteSound,1); 	
muteSoundDo(muteSound);					
}

function muteSoundDo(mute)
{
audioElement.muted=mute;
audioElement2.muted=mute;
audioElement3.muted=mute;
audioElement4.muted=mute;		
}

var ls=0;
var timerinterval;

function getPlayers(){
	$.ajax({
		type: "GET",
		url: "playersonline.php",
		success: function(msg){
			$('#playersonline').html(msg+'');
		}
	});
}

function getVisitors(){
	$.ajax({
		type: "GET",
		url: "visitors.php",
		success: function(msg){
			$('#visitors').html(msg+'');
		}
	});
}

window.onload = function onLoad() {
	circle = new ProgressBar.Circle('#prograsd', {
		color: '#FFFF66',
		strokeWidth: 15,
		easing: 'easeInOut',
		trailColor: "#FFD600"
	});
	circle.animate(1);
	setInterval(updatetimer,30);
	setInterval('chat.update()', 2000);
	setInterval(getPlayers,15000);
	setInterval(getVisitors,40000);
	$.ajax({
		type: "GET",
		url: "currentgame.php",
		success: function(msg){
			$(".lot_current_game_id").text(msg);
		}
	});
	$.ajax({
		type: "GET",
		url: "currentchance.php",
		success: function(msg){
			$("#mychance").text(msg);
		}
	});
	$.ajax({
		type: "GET",
		url: "hashid.php",
		success: function(msg){
			$("#currenthash").text(msg);
		}
	});
	$.ajax({
		type: "GET",
		url: "currentitems.php",
		success: function(msg){
			if(msg > 150) msg = 150;
			circle.animate(msg/150);
			$('.progressbar__label').text(msg+'/150');
		}
	});
	$.ajax({
		type: "GET",
		url: "currentbank.php",
		success: function(msg){
			$('#bank').text(msg+'');
		}
	});
	$.ajax({
		type: "GET",
		url: "timeleft.php",
		success: function(msg) {
			endtime = parseInt(msg)+Math.round(new Date().getTime()/1000.0);
		}
	});
};

function alert2(txt,typet) {
	var n = noty({
		layout: 'bottomRight',
		text: txt,
		type: typet,
		timeout: 10000
	});
	audioElement.play();
}

function updatetimer() {
	var timeleft = endtime-Math.round(new Date().getTime()/1000.0);
	if(timeleft > 150) timeleft = 150;
	var d = new Date();
    var n = 99-Math.round(d.getMilliseconds()/10);
	if(timeleft == 150) n = 0;
	if(n < 0) n = 0;
	if(timeleft <= 0) n = 0;
	if(timeleft < 0) timeleft = 0;
	if(n < 10) $('#timeleft').text(timeleft+'.0'+n);
	else $('#timeleft').text(timeleft+'.'+n);
}

var socket = new WebSocket("ws://217.182.76.96:8001");
socket.onmessage = function(event) {
	var oj = JSON.parse(event.data);
	if(oj.type == 'newitem') {
		$.ajax({
			type: "GET",
			url: "items.php",
			success: function(msg){
				$('.rounditems').html(msg);
			}
		});
	} else if(oj.type == 'nowyitem') {
		$.ajax({
			type: "GET",
			url: "itemy.php",
			success: function(msg){
				$('.itemywjackpocie').html(msg);
			}
		});
	} else if(oj.type == 'currentitems') {
		$.ajax({
			type: "GET",
			url: "currentitems.php",
			success: function(msg){
				circle.animate((msg)/150);
				$('.progressbar__label').text((msg)+'/150');
			}
		});
	} else if(oj.type == 'currentbank') {
		$.ajax({
			type: "GET",
			url: "currentbank.php",
			success: function(msg){
				$('#bank').text(msg+'');
			}
		});
	} else if(oj.type == 'endtime') {
		if(oj.time == 'max') {
			endtime=2147485546;
		} else {
			endtime=oj.time+Math.round(new Date().getTime()/1000.0);
		}
	} else if(oj.type == 'currentgame') {
		$.ajax({
			type: "GET",
			url: "currentgame.php",
			success: function(msg){
				$(".lot_current_game_id").text(msg);
			}
		});
		$.ajax({
			type: "GET",
			url: "items.php",
			success: function(msg){
				$(".rounditems").html(msg);
			}
		});
	} else if(oj.type == 'rolltime') {
		$.ajax({
			type: "GET",
			url: "loadr.php",
			success: function(msg){
				$('.rounditems').before(msg);
			}
		});
	} else if(oj.type == 'chancechange') {
		$.ajax({
			type: "GET",
			url: "currentchance.php",
			success: function(msg){
				$("#mychance").text(msg);
			}
		});
	}
		else if(oj.type == 'currenthash') {
		$.ajax({
			type: "GET",
			url: "hashid.php",
			success: function(msg){
				$("#currenthash").text(msg);
			}
		});
	}
		else if(oj.type == 'notify') {
			$.ajax({
			type: "GET",
			url: "items.php",
			success: function(msg){
			$(".rounditems").html(msg);
			}
		});
		}
}