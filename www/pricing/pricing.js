/* exported openMenu */
var pricingMenu = document.getElementById('pricingMenu');

function openMenu() {
  pricingMenu.toggle();
  pricingMenu.classList.add('menuShadow');
}

pricingMenu.addEventListener('postclose', function () {
  console.log('menu closed');
  pricingMenu.classList.remove('menuShadow');
});