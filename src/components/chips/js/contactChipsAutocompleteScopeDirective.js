angular
    .module('material.components.chips')
    .directive('mdContactChipsAutocompleteScope', MdContactChipsAutocompleteScope);

function MdContactChipsAutocompleteScope ($compile, $mdUtil) {
  return {
    restrict: 'A',
    link:     postLink,
    scope:    false
  };

  function postLink (scope, element, attr) {
    // Grab the autocomplete controller's parent scope and create a new one
    var newScope = scope.$mdAutocompleteCtrl.parent.$new();

    // Watch for changes to our scope's item and copy it to the new scope
    scope.$watch('item', function(item) {
      $mdUtil.nextTick(function() {
        newScope.item = item;
      });
    });

    // TODO: transclude self might make it possible to do this without
    // re-compiling, which is slow.
    $compile(element.contents())(newScope);
  }
}
