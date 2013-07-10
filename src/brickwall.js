/**
 * Display picture gallery like a brick wall, smarter.
 * It allows you to set the focus point of your picture, this point will always be displayed.
 * 
 * @author Pierre CLÉMENT <pierrecle@gmail.com>
 * @version 1.0.0 
 * @licence LGPL V3
 */
;(function($, window, document, undefined) {

	/**
	 * Get an int value of an attribute.
	 * @return int|false
	 */
	function getIntAttr(attr) {
		var $this = this;
		return $this.attr(attr) ? parseInt($this.attr(attr)) : false;
	}

	/**
	 * Get the image from an element or image itself.
	 */
	function getImage() {
		var $this = $(this);
		return $this.is('img') ? $this : $this.find('img');
	}

	/**
	 * Get the width of an image, from its attribute.
	 */
	function getImageWidth() {
		var $this = getImage.apply(this);
		return getIntAttr.apply($this, ["width"]);
	}

	/**
	 * Get the height of an image, from its attribute.
	 */
	function getImageHeight() {
		var $this = getImage.apply(this);
		return getIntAttr.apply($this, ["height"]);
	}

	/**
	 * Apply CSS rules to the grid.
	 */
	function applyGridCss() {
		var $this = this;
		$this.elts.css({"display": "block", "float": "left", "margin": $this.settings.margin, "overflow": "hidden"});
	}

	/**
	 * Defines object's attributes:
	 *    - elts: DOM Elements of the elements wrapper (li)
	 *    - imgs: DOM Elements, the images
	 * 	  - for each image set the focus-x and focus-y attributes
	 */
	function setAttributes() {
        var $this = this;
    	$this.elts = $this.find('> *');
    	$this.imgs = $this.elts.find('img');

    	var focusPointsX = $this.settings.focusPoints.x;
    	var focusPointsY = $this.settings.focusPoints.y;
    	var i = 0;
    	while (i < $this.imgs.length) {
    		var $img = $($this.imgs[i]);
    		var focusY = getIntAttr.apply($img, ["focus-y"]);
    		var focusX = getIntAttr.apply($img, ["focus-x"]);

	       	if(!(focusY && focusY < focusPointsY && focusY > 0)) {
	        	focusY = Math.floor(focusPointsY/2);
	    	}
	        if(!(focusX && focusX < focusPointsX && focusX > 0)) {
	            focusX = Math.floor(focusPointsX/2);
	        }
	        $img.attr({"focus-x": focusX, "focus-y": focusY});
	        i++;
    	}
	}

	/**
	 * Compute the wall lines
	 */
	function computeLines() {
		var $this = this;

		$this.lines = [{width: 0, elements: []}];
		var curLine = 0;
		$this.elts.each(function(i, element){
			var imgWidth = getImageWidth.apply($(element));
			var totalImgWidth = imgWidth + $this.settings.margin*2;
			// don"t add new line if img width <= 70% remaining space
			if(imgWidth < $this.linesWidth && $this.lines[curLine].width+totalImgWidth*0.7 <= $this.linesWidth) {
				$this.lines[curLine].width += totalImgWidth;
			}
			else {
				curLine ++;
				$this.lines.push({width: totalImgWidth, elements: []});
			}
			$this.lines[curLine].elements.push(element);
		});
	}

	/**
	 * Compute the height of each line.
	 */
	function computeLinesHeight() {
        var $this = this;
        var nbLines = $this.lines.length;

        $this.linesHeight = [];
		var i = 0;
		while(i < nbLines) {
			if($this.settings.lineHeight.max && $this.settings.lineHeight.min && $this.settings.lineHeight.max == $this.settings.lineHeight.min) {
				$this.linesHeight.push($this.settings.lineHeight.min);
			}
			else {
				var elts = $this.lines[i].elements;
				var nbImgs = elts.length;
				var min = Math.max(getImageHeight.apply(elts[0]), $this.settings.lineHeight.max);
				var j = 1;
				while(j < nbImgs) {
					min = Math.min(getImageHeight.apply(elts[j]), min);
		        	j++;
				}
				$this.linesHeight.push(Math.max(min, $this.settings.lineHeight.min));
				i++;
			}
		}
	}

	/**
	 * Set the height of the elements
	 */
	function setElementsHeight() {
		var $this = this;
		var i = 0;
		while (i < $this.lines.length) {
			$($this.lines[i].elements).height($this.linesHeight[i]);
			i++;
		}
	}

	/**
	 * Defines objects lines attribute, the lines of the grid.
	 * Also define the available width and the height of a line.
	 */
	function setWallLines() {
		var $this = this;

		$this.linesWidth = $this.innerWidth();

		// Compute lines
		computeLines.apply($this);

		// Compute lines height
		computeLinesHeight.apply($this);

		// Set elements height
		setElementsHeight.apply($this);

		// Compute missing length
		var i = 0;
		while(i < $this.lines.length) {
			$this.lines[i].missing = $this.linesWidth - $this.lines[i].width;
			i++;
		}
		$this.lines[$this.lines.length - 1].missing = $this.settings.resizeLast ? $this.lines[$this.lines.length - 1].missing : 0;
	}

	/**
	 * Update the grid.
	 */
	function update() {
	    var $this = this;
		setWallLines.apply($this);

	    $this.imgs.attr("style", "opacity: "+$this.imgs.css("opacity"));

		$this.imgs.height($this.lineHeight);
		for(var i = 0; i < $this.lines.length; i++) {
			var line = $this.lines[i];
			var height = $this.linesHeight[i];
			for(var j = 0; j < line.elements.length; j++) {
				resize.apply($this, [$this.lines[i].elements[j], line, height]);
			}
		}
	}

	/**
	 * @param Object elt The element in the line.
	 * @param Array line The line of the element in the grid.
	 * @param int lineHeight The height of the line of the element in the grid.
	 */
	function resize(elt, line, lineHeight) {
		var $this = this;
		var $elt = $(elt);
		var $img = getImage.apply(elt);
		var initWidth = getImageWidth.apply($img);
		var initHeight = getImageHeight.apply($img);
		var focusY = getIntAttr.apply($img, ["focus-y"]);
        var focusX = getIntAttr.apply($img, ["focus-x"]);
        var focusPointsY = $this.settings.focusPoints.y;
        var focusPointsX = $this.settings.focusPoints.x;

		// Resize the image
		var ratioWidth = 1;
		var finalWidth = initWidth + line.missing*((initWidth+$this.settings.margin*2)/line.width);
		// Image larger than line
		if(line.missing < 0) {
			ratioWidth = initWidth / finalWidth;
		}
		else {
			ratioWidth = finalWidth / initWidth;
		}
		// Firefox round pixels and can cause undesired line-breaks, so, let's floor
		$elt.width(Math.floor(finalWidth));
		var ratio = Math.max(ratioWidth, lineHeight/initHeight);
		$img.width(initWidth*ratio).height(initHeight*ratio);

		// Focus point
		var marginTop = (initHeight*ratio) - lineHeight;
		var marginLeft = (initWidth*ratio) - finalWidth;

		marginTop = - (marginTop * focusY/focusPointsY);
		marginLeft = - (marginLeft * focusX/focusPointsX);
		$img.css({"margin-top": marginTop, "margin-left": marginLeft});
	}

	/**
	 * Function to call for window resize event
	 */
	function onWindowResize() {
		var $this = this;

		update.apply($this);
	}

    var methods = {
        init: function(options) {
            return this.each(function() {
                var $this = $(this);
                $this.settings = $.extend(true, {}, $.fn.brickwall.defaultSettings, options || {});
                $this.settings.focusPoints.x = Math.max($this.settings.focusPoints.x, 1);
                $this.settings.focusPoints.y = Math.max($this.settings.focusPoints.y, 1);
                $this.data("brickwallSettings", $this.settings);

	        	setAttributes.apply($this);

	        	$this.imgs.attr("style", "opacity: 0");
        		$this.imgs.on('load', function() {
        			$(this).animate({"opacity": 1}, $this.settings.fadeInTime);
	        	});

				applyGridCss.apply($this);
				update.apply($this);

				if($this.settings.updateOnWindowResize) {
					$(window).resize(function(){ onWindowResize.apply($this) });
				}
            });
        },
        update: function() {
            return this.each(function() {
            	var $this = $(this);
            	$this.settings = $this.data("brickwallSettings");

            	setAttributes.apply($this);
				applyGridCss.apply($this);
                update.apply($this);
            });
        }
    };

    $.fn.brickwall = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.brickWall');
        }
    };

    $.fn.brickwall.defaultSettings = {
    	'focusPoints': {'x': 5, 'y': 5},
        'fadeInTime': 350,
        'updateOnWindowResize': true,
        'lineHeight': {'min': false, 'max': 550},
        'margin': 3,
        'resizeLast': true
    };
})(jQuery, window, document);