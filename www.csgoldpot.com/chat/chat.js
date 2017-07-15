/* 
Created by: Kenrick Beckett

Name: Chat Engine
*/

var instanse = false;
var state;
var mes;
var file;

var first=true;

function Chat () {
    this.update = updateChat;
    this.send = sendChat;
	this.getState = getStateOfChat;

}

//gets the state of the chat
function getStateOfChat(){
	if(!instanse){
		 instanse = true;
		 $.ajax({
			   type: "POST",
			   url: "process.php",
			   data: {  
			   			'function': 'getState'
						},
			   dataType: "json",
			
			   success: function(data){
				   state = data.state;
				   instanse = false;
			   },
			});
	}	 
}



//Updates the chat
function updateChat(){
	 if(!instanse){
		 instanse = true;
	     $.ajax({
			   type: "POST",
			   url: "process.php",
			   data: {  
			   			'function': 'update',
						'state': state
						},
			   dataType: "json",
			   success: function(data){
				   
				   var bottom=false;
				   
				 if ((document.getElementById('chat-area').scrollHeight - document.getElementById('chat-area').scrollTop) < 400)
				   bottom=true;
				   if(data.text){
						for (var i = 0; i < data.text.length; i++) {
                            $('#chat-area').append($("<div style='border-bottom: dotted 1px black;display: flex;'>"+ data.text[i] +"</div>"));
                        }
						if(muteSound == 0) audioElement2.play();						
				   }
				   if (bottom || first)
				   {
				   document.getElementById('chat-area').scrollTop = document.getElementById('chat-area').scrollHeight;
				   first=false;
				   }
				   instanse = false;
				   state = data.state;
			   },
			});
	 }
	 else {
		 setTimeout(updateChat, 1500);
	 }
}

var lastMsg=0;

//send the message
function sendChat(message)
{       
    updateChat();

     $.ajax({
		   type: "POST",
		   url: "process.php",
		   data: {  
		   			'function': 'send',
					'message': message
				 },
		   dataType: "json",
		   success: function(data){
			   updateChat();
			   	lastMsg=(Date.now()/1000);
		   },
		});
}


 var chat =  new Chat();
 $(function() {
 
   chat.getState(); 
   
   $("#sendie").keydown(function(event) {  
    var key = event.which;  

    if (key >= 33) {
      
     var maxLength = $(this).attr("maxlength");  
     var length = this.value.length;  
     if (length >= maxLength) {  
      event.preventDefault();  
     }  
     }  
                                                  });
   $('#sendie').keyup(function(e) { 
        
     if (e.keyCode == 13) {

	

	 
     
    var text = $(this).val();
    var maxLength = $(this).attr("maxlength");  
    var length = text.length; 
     
	 	if ((Date.now()/1000)-lastMsg < 5)
	{
	$('#chat-area').append($("<div style='border-bottom: dotted 1px black;display: flex;'><font color=red>Only 1 msg per 5 second allowed</font></div>"));
		var shortenedString = text.substr(0,(text.length -1));
		$(this).val(shortenedString);
		return;
	}
	 
	 
    if (length <= maxLength + 1) { 
     
     chat.send(text); 
     $(this).val("");
     
    } else {
    
     $(this).val(text.substring(0, maxLength));
    } 
     }
   });
  
 });
