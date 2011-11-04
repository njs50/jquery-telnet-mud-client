(function( $ ){

	var methods = {

		init: function( options ) {

			return this.each(function(){

				var $this = $(this);

				var data = $this.data('telnet');

				// If the plugin hasn't been initialized yet (initial setup/defaults)
				if ( ! data ) {
					
					data = {
						port: 23,
						host: window.location.hostname.replace(/www\./i,''),
					}
					
					data.output = $('<pre />')
					    .addClass('fg')
						.addClass('bg')					
						.addClass('telnet')
					;
					
					data.input = $('<input type="text" />')
						.addClass('inText')
						.bind('keypress.telnet', methods.inKey)						
					;
					
					data.target = $this;
					
					// setup
					$this.append(data.output)
						.append(data.input)
						.addClass('telnetContainer')
						.bind('add_line.telnet', methods.add_line)
						.bind('append_line.telnet', methods.append_line)
						.bind('log.telnet', methods.log)
						.bind('reset.telnet', methods.reset)						
					;
					
					$(window).unbind('resize.telnet').bind('resize.telnet',methods.resize_evt);
					
					var flashvars = {
						container_id: $this.attr('id')
					};
					var params = {
						menu: "false",
						allowScriptAccess: "always",
						wmode: "transparent"
					};
					var attributes = {
						id: "haxe",
						name: "telnetSWF"
					};

					swfobject.embedSWF("telnetBridge.swf", "swfHolder", "0", "0", "11.0.0","expressInstall.swf", flashvars, params, attributes, function(e){
						data.swf_ref = e.ref;
					});					
					
					$this.data('telnet', data);

					methods.resize.apply(this);
					
					data.input.focus();
					
				} // end of initial setup

				// set any options passed in
				if (options) { $.extend(data, options); }
				
			});
		},		
		
		/* resize all telnets on a window resize event */
		resize_evt: function() {
			$('.telnetContainer').telnet('resize');
		},
		
		resize: function() {
			var data = $(this).data('telnet');
			data.output.outerHeight(data.target.outerHeight() - data.input.outerHeight());
		},
		
		ready: function() {
			var data = $(this).data('telnet');			
			data.swf_ref.connect(data.host,data.port);
		},
		
		destroy: function( ) {

			return this.each(function(){

				var $this = $(this);
				var data = $this.data('telnet');

				// Namespacing FTW
				$this.unbind('.telnet');
				data.output.remove();
				$this.removeData('telnet');

			});

		},
	
		// decode string plus use setTimeout to move flash call into it's own thread (flash external interface blocks otherwise)
		flashBridge: function(event,data) {

			var $this = $(this);
			
			data = data.replace(/%22/g, "\"")
			           .replace(/%5c/g, "\\")
			           .replace(/%26/g, "&")
			           .replace(/%25/g, "%");
				
			// console.log(event + ": " + data);
						
			$this.trigger(event, data);

		},
				
		add_line : function(evt, text) {
			var data = $(this).data('telnet'); 
			data.output.append('\n' + text ); 
			data.output.scrollTop(data.output.prop("scrollHeight"));
		},
				
		append_line : function(evt, text) {
			var data = $(this).data('telnet'); 
			data.output.append( text );					
		},		
					
		reset : function(evt, text) { 
			var data = $(this).data('telnet'); 
			data.output.empty(); 		
		},
		
		log : function(evt, text) {
			if(window.console){
				console.log( text );
			}
		},

		inKey: function(event) {
			if ( event.which == 13 ) {

				event.preventDefault();

				var $this = $(this).parent();
				var data = $this.data('telnet');
								
				data.swf_ref.sendText(data.input.val());	
				data.input.val('');								
				
			}			
		},
		
		sendText : function(text) { 
			var data = $(this).data('telnet');
			data.swf_ref.sendText(text); 			
		}

  };


  $.fn.telnet = function( method ) {  
	if ( methods[method] ) {
	  return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	} else if ( typeof method === 'object' || ! method ) {
	  return methods.init.apply( this, arguments );
	} else {
	  $.error( 'Method ' +  method + ' does not exist on jQuery.telnet' );
	}	  


  };

})( jQuery );