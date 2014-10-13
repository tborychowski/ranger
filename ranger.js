(function () {
	'use strict';

	var
	_scope = null,
	_addEvent = function (element, ev, cb, scope) {
		scope = scope || cb;
		element.scope = scope;
		if (element.addEventListener) return element.addEventListener(ev, cb, false);
		return element.attachEvent('on' + ev, cb);
	},

	_removeEvent = function (element, ev, cb) {
		if (element.addEventListener) return element.removeEventListener(ev, cb, false);
		return element.detachEvent('on' + ev, cb);
	},


	/**
	 * Ranger-Slider component
	 */
	Ranger = function (config) {
		if (!(this instanceof Ranger)) return new Ranger(config);
		if (!config || config.tagName !== 'INPUT') {
			return console.error('Target must be an input element');
		}
		if (config.isConverted) this.destroy.call(config.scope);

		this.input = config;
		this.config = {};

		this.input.isConverted = true;
		this.input.scope = this;

		this.min = parseFloat(this.input.min) || 0;
		this.max = parseFloat(this.input.max) || 100;
		this.value = parseFloat(this.input.value) || 0;
		this.value = Math.max(this.min, Math.min(this.max, this.value));

		this.config.onSlide = function () {};
		this.config.onSlideStart = function () {};
		this.config.onSlideEnd = function () {};

		return this.init();
	};

	Ranger.prototype.slide = function (callback) { this.config.onSlide = callback; return this; };
	Ranger.prototype.slideStart = function (callback) { this.config.onSlideStart = callback; return this; };
	Ranger.prototype.slideEnd = function (callback) { this.config.onSlideEnd = callback; return this; };


	Ranger.prototype.init = function () {
		this.el = document.createElement('DIV');
		this.el.className = 'ranger';

		this.knob = document.createElement('A');
		this.knob.href = '#';
		this.knob.className = 'ranger-knob';

		this.el.appendChild(this.knob);

		this.input.parentNode.insertBefore(this.el, this.input);
		this.el.appendChild(this.input);
		this.config.display = this.input.style.display;
		this.input.style.display = 'none';

		this.maxX = this.el.offsetWidth - this.knob.offsetWidth;
		this.knob.style.left = this.valToPx(this.value) + 'px';

		_addEvent(this.knob, 'click', function (e) { if (e.preventDefault) e.preventDefault(); });
		_addEvent(this.el, 'mousedown', this.barMouseDown, this);
		_addEvent(this.knob, 'mousedown', this.onMouseDown, this);
		_addEvent(this.knob, 'keydown', this.onKeyDown, this);

		_addEvent(this.el, 'mousewheel', this.onMouseWheel, this);
		_addEvent(this.el, 'DOMMouseScroll', this.onMouseWheel, this);

		return this;
	};

	/**
	 * Calculate value based on px move
	 */
	Ranger.prototype.pxToVal = function (px) {
		this.value = this.min + Math.round((this.max - this.min) * px / this.maxX);
		return this.value;
	};

	/**
	 * Calculate px offset (initial) based on value
	 */
	Ranger.prototype.valToPx = function (val) {
		return Math.round(this.maxX * (val - this.min) / (this.max - this.min));
	};


	/**
	 * Move knob left/right
	 * @param   {number}  dist  -1/1 to move left/right
	 */
	Ranger.prototype.move = function (dist) {
		var x = this.knob.offsetLeft || 0;
		if (dist === 1) x += 10;
		else if (dist === -1) x -= 10;
		else if (dist === 0) x = 0;
		else if (dist === 100) x = this.maxX;
		x = Math.max(0, Math.min(this.maxX, x));
		this.knob.style.left = x + 'px';
		this.input.value = this.value = this.pxToVal.call(this, x);
		this.config.onSlide.call(this, this.value, x);
	};

	Ranger.prototype.onKeyDown = function (e) {
		var self = this.scope;
		// if (!self) self = e.srcElement.scope;
		if (e.keyCode === 37) self.move.call(self, -1);			// left
		else if (e.keyCode === 39) self.move.call(self, 1);		// right
		else if (e.keyCode === 36) self.move.call(self, 0);		// home
		else if (e.keyCode === 35) self.move.call(self, 100);	// end
	};

	Ranger.prototype.onMouseDown = function (e) {
		if (!this.scope) return;
		var self = _scope = this.scope;
		if (self.dragging) return;
		self.dragging = true;
		self.x0 = e.clientX - self.knob.offsetLeft || 0;
		self.maxX = self.el.offsetWidth - self.knob.offsetWidth;
		_addEvent(document, 'mousemove', self.onMouseMove, self);
		_addEvent(document, 'mouseup', self.onMouseUp, self);
		self.config.onSlideStart.call(self, self.value);
		self.knob.focus();
		if (e.preventDefault) e.preventDefault();
		else e.returnValue = false;
	};

	Ranger.prototype.onMouseUp = function (e) {
		var self = _scope;
		_removeEvent(document, 'mousemove', self.onMouseMove);
		_removeEvent(document, 'mouseup', self.onMouseUp);
		self.input.value = self.value;
		self.dragging = false;
		self.config.onSlideEnd.call(self, self.value);
		e.returnValue = false;
		_scope = null;
	};

	Ranger.prototype.onMouseMove = function (e) {
		var self = _scope, x;
		x = Math.max(0, Math.min(self.maxX, e.clientX - self.x0));
		if (!self.dragging) return;
		self.knob.style.left = x + 'px';
		self.value = self.pxToVal.call(self, x);
		self.config.onSlide.call(self, self.value, x);
		e.returnValue = false;
	};


	Ranger.prototype.barMouseDown = function (e) {
		var self = this.scope, knobW, x;
		if (!self) self = e.srcElement.scope;
		knobW = self.knob.offsetWidth;
		x = e.clientX - (self.el.offsetLeft || 0) - knobW / 2 + 2;
		self.maxX = self.el.offsetWidth - knobW;
		x = Math.max(0, Math.min(self.maxX, x));
		self.knob.style.left = x + 'px';
		self.input.value = self.value = self.pxToVal.call(self, x);
		self.config.onSlide.call(self, self.value, x);
		self.onMouseDown.call(self.knob, e);
	};

	Ranger.prototype.onMouseWheel = function (e) {
		var self = this.scope, delta;
		if (!self) self = e.srcElement.scope;
		e = window.event || e;
		delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		self.move.call(self, delta);
		if (e.preventDefault) e.preventDefault();
		return false;
	};




	Ranger.prototype.destroy = function () {
		this.el.parentNode.insertBefore(this.input, this.el);
		this.el.parentNode.removeChild(this.el);
		this.input.style.display = this.config.display;
		this.input.isConverted = false;
		return this;
	};



	window.Ranger = Ranger;

}());
