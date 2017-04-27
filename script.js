"use strict";

var setParentHeightByChild = {
	// Defaults to first child element of parent if no $child passed in
	init: function($parent, $child){
		setParentHeightByChild.setHeight( $parent, $child );
		$( window ).resize(function() {
			setParentHeightByChild.setHeight( $parent, $child );
		});
	},

	getChildHeight: function( $child ) {
		return new Promise(function(resolve, reject){
			if ($child.prop("tagName") !== "IMG") {
				resolve($child.css("height"));
			} else {
				var poll = setInterval(function() {
					if ($child[0].naturalHeight) {
						clearInterval(poll);
						resolve($child[0].naturalHeight);
					}
				}, 10);
			}
		});
	},

	setHeight: function( $parent, $child ) {
		// Select first child element of parent if no child is passed in
		if (!$child) {
			$child = $parent.children().first();
		}
		setParentHeightByChild.getChildHeight( $child )
			.then(function(childHeight) {
				// console.log("container height now " + childHeight);
				$parent.css("height", childHeight);
			});	
	}
}

var perspectiveContainer = {

	defaults: {
		//Selector of the containers children that should perspective shift
		layerSelector: ".layer",
		// The max amt the layer can perspectiveShift as a fraction of the layer's width
			// Can be a float or an array of floats for each layer
		maxMovementFraction: .2, 
		// Whether the layers should move in the same direction as the mouse, or inverted
		followMouse: false,
		//Options: "tilt", "closeMost", "farMost", or an array
			// If array, movement amounts for each layer on scale of 10 to -10 (- numbers follow mouse, + move against)
		movementType: "tilt", 
		// Zero-based index of layer that won't move ( only valid with "tilt" movementType)
		tiltPivot: 2, 
		//A float from 0-10 for the movement amount of the top layer (only valid with "tilt" movementType)
		frontMaxMove: 10,
		//A float from 0-10 for the movement amount of the backmost layer (only valid with "tilt" movementType)
		backMaxMove: 10,
	},

	init: function( $container, settings ) {
			perspectiveContainer.config = $.extend({}, perspectiveContainer.defaults, settings);
			perspectiveContainer.setup( $container );
	},

	setup: function( $container ) {
		if (!perspectiveContainer.mobilecheck()) {
			perspectiveContainer.saveOriginalPositions( $container );

			var movementAmts = perspectiveContainer.calculateMovementAmts( $container );
			perspectiveContainer.setAllShiftAmts( movementAmts );

			$container.off( "mousemove.perspectiveMove" );
			$container.on( "mousemove.perspectivemove", perspectiveContainer.perspectiveMove );
		}
	},

	adjustSettings: function( $container, settings ) {
		perspectiveContainer.config = $.extend(perspectiveContainer.config, settings);
		perspectiveContainer.setup( $container );
	},

	mobilecheck: function() {
	  var check = false;
	  (function(a) {
	  	if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {
	  		check = true;
	  	}
	  })(window.navigator.userAgent || window.navigator.vendor || window.opera);
	  return check;
	},


	fib: function(n) {
		if (!Number.isInteger(n)) throw new TypeError("n must be an integer");
		if (n < 0) throw new RangeError("n must be >= 0");
		if (n < 2) return n;
		return perspectiveContainer.fib(n - 1) + perspectiveContainer.fib(n - 2);
	},

	// Note: layers in a perspective container should be positioned absolutely, with position attributes in percentages
	saveOriginalPositions: function( $container) {
		$container.hide();
		var $layers = $container.find(perspectiveContainer.config.layerSelector);
		$layers.each(function() {
			var $layer = $(this);
			if (!$layer.data("origPositions")) {
				var origPositions = {};
				origPositions.left = $layer.css("left");
				origPositions.top = $layer.css("top");
				origPositions.right = $layer.css("right");
				origPositions.bottom = $layer.css("bottom");
				$layer.data("origPositions", origPositions);
			}
		});
		$container.show();

	},

	calculateMovementAmts: function ( $container ) {
		var movementType = perspectiveContainer.config.movementType;
		if (Array.isArray(movementType)) return movementType;

		var numLayers = $container.find(perspectiveContainer.config.layerSelector).length;
		var movementAmts = [];
		var fibBreakpoint = 10;
		var adjust;
		if (movementType === "tilt") {
			var pivot = perspectiveContainer.config.tiltPivot;
			if (!Number.isInteger(pivot)) throw new TypeError("tiltPivot must be an integer");
			if (Math.abs(pivot) >= numLayers) throw new RangeError("tiltPivot value is not a layer index");
			pivot = pivot < 0 ? numLayers + pivot : pivot;
			var lesserInterval = perspectiveContainer.config.frontMaxMove / pivot;
			var greaterInterval = perspectiveContainer.config.backMaxMove / (numLayers - pivot - 1);
		} else if (numLayers < fibBreakpoint) {
			adjust = 10 / Math.pow(2, numLayers - 1);
		} else {
			adjust = 10 / perspectiveContainer.fib(numLayers + 1);
		}
		for (let i = 0; i < numLayers; i++) {
			if (movementType === "tilt") {
				let interval = i < pivot + 1 ? lesserInterval : greaterInterval;
				movementAmts[i] = interval * (pivot - i);
			} else if (movementType === "farMost") {
				if (i === 0) {
					movementAmts[i] = 0;
				} else {
					movementAmts[i] = numLayers < fibBreakpoint ? 
						Math.pow(2, i) * adjust : 
						perspectiveContainer.fib(i + 1) * adjust;
				}
			} else {
				movementAmts[i] = numLayers < fibBreakpoint ?
					Math.pow(2, numLayers - i - 1) * adjust :
					perspectiveContainer.fib(numLayers - i + 1) * adjust;
			}
			if (perspectiveContainer.config.followMouse) movementAmts[i] = -movementAmts[i];
		}
		return movementAmts;
	},

	setAllShiftAmts: function ( movementAmts ) {
		var $layers = $( perspectiveContainer.config.layerSelector );
		perspectiveContainer.setShiftAmts( $layers, movementAmts );
	},

	setShiftAmts: function ( $elems, movementAmts ) {
		$elems.each( function( index ) {
			var movementAmt = parseFloat(movementAmts[index], 10) || 0;
			$( this ).data( "perspectiveShift", movementAmt );
		});
	},

	perspectiveMove: function ( event ) {
		var mouseXPercent = event.pageX / window.innerWidth - .5;
		$( this ).find( perspectiveContainer.config.layerSelector ).each(function(){
			var $layer = $( this );
			var moveFactor = $layer.data("perspectiveShift") || 0;
			var origPositions = $layer.data("origPositions");
			var xToChange = origPositions.left !== "auto" ? "left" : "right";
			var origXStr = xToChange === "left" ? origPositions.left : origPositions.right;
			var origXVal = parseFloat(origXStr) || 0;
			var newX = xToChange === "left" ? 
				origXVal - moveFactor * mouseXPercent :
				origXVal + moveFactor * mouseXPercent;
			$layer.css(xToChange, newX + "%");
		});
	}
}

$( document ).ready( function() {

	var $persCont = $(".perspectiveContainer");

	setParentHeightByChild.init( $persCont, $persCont.find("img") );
	perspectiveContainer.init( $persCont );

	$( ".mv-style-btn" ).click( function() {
		$( ".mv-style-btn" ).removeClass("active");
		$( this ).addClass("active");
	})
	
	$( "#sameWithBtn" ).click( function() {
		perspectiveContainer.adjustSettings( $persCont, {followMouse: true, movementType: "closeMost"});
	});

	$( "#sameAgainstBtn" ).click( function() {
		perspectiveContainer.adjustSettings( $persCont, {followMouse: false, movementType: "closeMost"});
	});

	$( "#tiltAgainstBtn" ).click( function() {
		perspectiveContainer.adjustSettings( $persCont, {followMouse: false, movementType: "tilt"});
	});

	$( "#tiltWithBtn" ).click( function() {
		perspectiveContainer.adjustSettings( $persCont, {followMouse: true, movementType: "tilt"});
	});

	$( "#sameReversedBtn" ).click( function() {
		perspectiveContainer.adjustSettings( $persCont, {followMouse: false, movementType: "farMost"});
	});

}); 