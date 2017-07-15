$(document).ready(function() {
	 $(window).resize(function() {
	        snapRender()
	    });
	 $(window).load(function() {
		 snapRender()
		});
 	    var socket = io.connect('tcp.csgogold.ru:2020', {
        secure: true
    });
    socket
		.on('newPoints_1', function(data){
			data = JSON.parse(data);
			$('#red').prepend(data.html);
		})
		.on('newPoints_2', function(data){
			data = JSON.parse(data);
			$('#black').prepend(data.html);
		})
		.on('newPoints_0', function(data){
			data = JSON.parse(data);
			$('#green').prepend(data.html);
		})
		socket.on('timer', function (time) {
	        seconds = lpad(time - Math.floor(time / 60) * 60, 2);
	        var e = 20;
	        seconds -= 60 * Math.floor(seconds / 60), 1 == seconds.toString().length && (seconds = "0" + seconds.toString());
	        var i = 100 - (parseFloat(parseFloat(e) - parseFloat(seconds)) / parseFloat(e) * 100);
	        $("#timer_seconds_double").text(seconds), $("#progress_double").css({
	            width: i + "%",
	            transition: "1.3s ease"
	        })
	    })
		.on('AcceptingBets', function(allbets){
			$('#progress_double').css('width','0%');
			$("#timer_seconds_double").text('00');
			lockbets();

		})
		.on('slider', function(data){
			 roll_sound();
        	spin(data.win_num, data.wobble);
        	})
		.on('newGame', function(data){
			$('#progress_double').css('width','100%');
			addHist(data.win_num,data.win_color,data.game.id-1);
			$('red_total').text('0');
			$('green_total').text('0');
			$('black_total').text('0');
			$('#red').html('');
			$('#green').html('');
			$('#black').html('');
			$('#game-double-id').text(data.game.id);
			timerStatus = true;
            ngtimerStatus = true;
            updateBalance();
            unlockbets()
		})
		 .on('UpdateBank', function (data) {
		   $('green_total').text(data.bank_0);
		   $('red_total').text(data.bank_1);
		   $('black_total').text(data.bank_2);
		   console.log("bank update");
		})	
});

function addTicket_double(id, btn){  
			var points = $('#bet-value-double').val();
      $.post('/addTicket_double',{id:id,points:Math.round(points)}, function(data){
            updateBalance();
			 
          $.notify(data.text, {
                   className:   data.type
                });
				
				 if (data.type == 'success') { 
				  bet_sound();
				};
				
				 if (data.type == 'error') { 
				 error_sound();
				 };
				
        });
    }
function clearss_d(){
    $('#bet-value-double').val(0);
}
function one_d(){
    bet = 0;
    if ($('#bet-value-double').val()) bet = $('#bet-value-double').val();
    $('#bet-value-double').val(parseFloat(bet)+5);
}
function onet_d(){
    bet = 0;
    if ($('#bet-value-double').val()) bet = $('#bet-value-double').val();
    $('#bet-value-double').val(parseFloat(bet)+10);
}
function oneh_d(){
    bet = 0;
    if ($('#bet-value-double').val()) bet = $('#bet-value-double').val();
    $('#bet-value-double').val(parseFloat(bet)+50);
}
function oneh_dd(){
    bet = 0;
    if ($('#bet-value-double').val()) bet = $('#bet-value-double').val();
    $('#bet-value-double').val(parseFloat(bet)+100);
}
function half_d(){
    bet = 0;
    if ($('#bet-value-double').val()) bet = $('#bet-value-double').val();
    value = bet/2;
    $('#bet-value-double').val(value);
}
function double_d(){
    bet = 0;
    if ($('#bet-value-double').val()) bet = $('#bet-value-double').val();
    value = bet*2;
    $('#bet-value-double').val(value);
}
function max_d(){
    balance = $('.update_balance').text();
    $('#bet-value-double').val(balance);
}
function addHist(roll,rollcost,rollid){
	if(rollcost == 1){
		$("#past").prepend("<div data-rollid='"+rollid+"' class='ball red '>"+roll+"</div>");
	} else if(rollcost == 2){
		$("#past").prepend("<div data-rollid='"+rollid+"' class='ball black '>"+roll+"</div>");
	} else {
		$("#past").prepend("<div data-rollid='"+rollid+"' class='ball green'>"+roll+"</div>");
	}
	
	 tone_sound();
}

var CASEW = $("#case").width();;
var snapX = 0;
var R = 0.999;
var S = 0.01;
var tf = 0;
var vi = 0;
var animStart = 0;
var isMoving = false;
var LOGR = Math.log(R);

function snapRender(t, e) {
		
		CASEW = $("#case").width();
		
	    if (!isMoving) {
		    
	        if (t == undefined) view(snapX);
	        else {
		        
	            for (var a = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8], n = 0, i = 0; i < a.length; i++) {
		            
	                if (t == a[i]) {
		                
	                    n = i;
	                    
	                    break;
	                    
	                }
	                
	            }
	            
	            var s = 32;
	            var o =- 32;
	            var l = Math.floor(e * (s - o + 1) + o);
	            var c = 70 * n + 36 + l;
	            
	            c += 5250;
	            
	            snapX = c;
	                
	            view(snapX);
	                
	        }
	        
		}
		
	}
	function spin(m, w) {
		
	    var e = m;
	    
	    for (var a = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8], n = 0, i = 0; i < a.length; i++) {
		    
	        if (e == a[i]) {
		        
	            n = i;
	            break;
	            
	        }
	        
		}
	   
	    var s = 32;
	    var o =- 32;
	    var l = Math.floor(w * (s - o + 1) + o);
	    var c = 70 * n + 36 + l;
	    
	    c += 5250;
	    
	    animStart = (new Date).getTime();
	    
	    vi = getVi(c);
	    tf = getTf(vi);
	    
	    isMoving = true;
	    
	    render();
	    
	}
function d_mod(t, e) {
		
	    return t * (Math.pow(R, e) - 1) / LOGR;
	    
	}
	function getTf(t) {
		
	    return (Math.log(S) - Math.log(t)) / LOGR;
	    
	}
	function getVi(t) {
		
	    return S - t * LOGR;
	    
	}
	function v(t, e) {
		
	    return t * Math.pow(R, e);
	    
	}
	
	function render() {
		
	    var t = (new Date).getTime() - animStart;
	    
	    if(t > tf) t = tf;

	    var e = d_mod(vi, t);
	    
	    view(e);
	    
	    if(tf > t) requestAnimationFrame(render);
	    else {
		    
		    snapX = e;
		    
		    isMoving = false;
		    
	    }
	    
	}
function view(t) {
		
	    t =- ((t + 1050 - CASEW / 2) % 1050);
	    
	    $("#case").css("background-position", t + "px 0px");
	    
	}
function lockbets(){
	$('#red-button').attr('onclick','javascript:void(0)');
	$('#green-button').attr('onclick','javascript:void(0)');
	$('#black-button').attr('onclick','javascript:void(0)');
	betsLocked = true;
}

function unlockbets(){
	$('#red-button').attr('onclick','addTicket_double(1, this)');
	$('#green-button').attr('onclick','addTicket_double(0, this)');
	$('#black-button').attr('onclick','addTicket_double(2, this)');
	betsLocked = false;
}