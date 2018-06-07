Ranger
======

Pure JS range-slider (horizontal).
[DEMO](http://htmlpreview.github.io/?https://raw.githubusercontent.com/tborychowski/ranger/master/index.html)

### Features:
- no dependencies
- focusable & keyboard support (left+right, home+end)
- mousewheel support
- callbacks (slideStart, slide, slideEnd)
- works everywhere (even IE5)


### Sample usage:
```javascript
var slider1 = new Ranger(document.getElementById('range1'));
slider1.slide(function (val) {
	console.log('value: ' + val)
});
```
