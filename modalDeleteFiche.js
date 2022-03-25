//me permet d'afficher la modal de suppression
var modal = document.getElementById('modal')
modal.addEventListener('show.bs.modal', function (event) {
  var button = event.relatedTarget
  var pokeId = button.getAttribute('data-bs-pokeId') //userId
  var modalForm = modal.querySelector('#modalForm')
  modalForm.action = `/deleteFiche/${pokeId}` //{userId}

})