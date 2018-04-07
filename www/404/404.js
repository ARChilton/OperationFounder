/* exported openMenu */
var menu = document.getElementById('menu');

function openMenu() {
  menu.open();
  menu.classList.add('menuShadow');
}

menu.addEventListener('postclose', function () {
  console.log('menu closed');
  menu.classList.remove('menuShadow');
});