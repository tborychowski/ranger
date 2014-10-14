angular.module('app').directive('ranger', function () {
	'use strict';

	return {
		restrict: 'EA',
		scope: {
			min: '=',
			max: '=',
			value: '='
		},
		replace: true,
		template: '<div class="ranger">' +
					'<a href="#" class="ranger-knob" style="left: 0;"></a>' +
					'<input type="range" max="{{max}}" min="{{min}}" value="{{value}}" style="display: none;">' +
				'</div>',

		link: function (scope, elem, attrs) {
			/**
			 * Apply locally calculated value to the UI
			 * @param {number} x   offset in px
			 */
			function setValue (x) {
				x = Math.max(0, Math.min(maxX, x));
				knob[0].style.left = x + 'px';
				scope.value = pxToVal(x);
				input[0].value = scope.value;
				scope.$apply();
			}

			/**
			 * Update ranger on (external) value change
			 * @param {number} val  value
			 */
			function update (val) {
				var x = Math.max(0, Math.min(maxX, valToPx(val)));
				knob[0].style.left = x + 'px';
				scope.value = val;
				input[0].value = scope.value;
			}

			/**
			 * Move knob left/right
			 * @param   {number}  dist  -1/1 to move left/right
			 */
 			function moveKnob (dist) {
				var x = knob[0].offsetLeft || 0;
				if (dist === 'right') x += 10;
				else if (dist === 'left') x -= 10;
				else if (dist === 'home') x = 0;
				else if (dist === 'end') x = maxX;
				else x = parseInt(dist, 10) || 0;
				setValue(x);
			}

			function onKeyDown (e) {
				if (e.keyCode === 37) moveKnob('left');
				else if (e.keyCode === 39) moveKnob('right');
				else if (e.keyCode === 36) moveKnob('home');
				else if (e.keyCode === 35) moveKnob('end');
			}

			function onMouseDown (e) {
				if (dragging) return;
				dragging = true;
				scope.x0 = e.clientX - knob[0].offsetLeft || 0;
				maxX = el[0].offsetWidth - knob[0].offsetWidth;

				angular.element(document).on('mousemove', onMouseMove);
				angular.element(document).on('mouseup', onMouseUp);

				knob[0].focus();
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
			}

			function onMouseUp (e) {
				angular.element(document).off('mousemove', onMouseMove);
				angular.element(document).off('mouseup', onMouseUp);
				dragging = false;
				e.returnValue = false;
			}

			function onMouseMove (e) {
				if (!dragging) return;
				setValue(e.clientX - scope.x0);
				e.returnValue = false;
			}

			function barMouseDown (e) {
				var knobW = knob[0].offsetWidth,
					x = e.clientX - (el[0].offsetLeft || 0) - knobW / 2 + 2;
				maxX = el[0].offsetWidth - knobW;
				setValue(x);
				onMouseDown.call(knob, e);
			}

			function onMouseWheel (e) {
				e = window.event || e;
				var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
				moveKnob(delta > 0 ? 'right' : delta < 0 ? 'left' : 0);
				if (e.preventDefault) e.preventDefault();
				return false;
			}

			/**
			 * Calculate value based on px move
			 */
			function pxToVal (px) { return scope.min + Math.round((scope.max - scope.min) * px / maxX); }

			/**
			 * Calculate px offset (initial) based on value
			 */
			function valToPx (val) { return Math.round(maxX * (val - scope.min) / (scope.max - scope.min)); }


			var
				el = elem,
				knob = elem.find('a'),
				input = elem.find('input'),
				dragging = false,
				maxX = el[0].offsetWidth - knob[0].offsetWidth;

			knob.on('click', function (e) { if (e.preventDefault) e.preventDefault(); });
			el.on('mousedown', barMouseDown);
			knob.on('mousedown', onMouseDown);
			knob.on('keydown', onKeyDown);

			el.on('mousewheel', onMouseWheel);
			el.on('DOMMouseScroll', onMouseWheel);

			scope.$watch('value', update);
		}
	};
});
