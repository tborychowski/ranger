Ranger
======

Pure JS range-slider (horizontal).

### Features:
- no dependencies
- focusable & keyboard support (left+right, home+end)
- mousewheel support
- callbacks (slideStart, slide, slideEnd)
- works in modern browsers (>=IE11)


### Sample usage:
```javascript
var slider1 = new Ranger(document.getElementById('range1'));
slider1.slide(function (val) {
	console.log('value: ' + val)
});
```

###License
*MIT*