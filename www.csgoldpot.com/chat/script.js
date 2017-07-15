 {
		$(document).on('click', '.closech', function() {
				$('.closech').addClass('hidden');
				$('.closechs').removeClass('hidden');
				$('.hjgf').removeClass('hidden');
				first=true;
		});
		$(document).on('click', '.closechs', function() {
			
				$('.closech').removeClass('hidden');
				$('.closechs').addClass('hidden');
				$('.hjgf').addClass('hidden');
					
				
   		})	 
}