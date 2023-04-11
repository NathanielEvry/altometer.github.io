var konamiKeys = [];
var konamiCode = '38,38,40,40,37,39,37,39,66,65';

document.addEventListener('keydown', function(e) {
  konamiKeys.push(e.keyCode);
  if (konamiKeys.toString().indexOf(konamiCode) >= 0) {
    document.body.classList.add('upside-down');
    konamiKeys = [];
  }
});