/*globals navi */
/* exported openMenu goToTermsOfUse */
var menu = document.getElementById('menu');

function openMenu() {
  menu.open();
  menu.classList.add('menuShadow');
}

menu.addEventListener('postclose', function () {
  console.log('menu closed');
  menu.classList.remove('menuShadow');
});

function goToTermsOfUse() {
  return navi.bringPageTop('../terms', { animation: 'none' });
}