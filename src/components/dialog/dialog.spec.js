describe('$mdDialog', function() {
  var runAnimation;

  beforeEach(module('material.components.dialog'));
  beforeEach(inject(function spyOnMdEffects($$q, $animate) {

    spyOn($animate, 'leave').and.callFake(function(element) {
      element.remove();
      return $$q.when();
    });
    spyOn($animate, 'enter').and.callFake(function(element, parent) {
      parent.append(element);
      return $$q.when();
    });
  }));
  beforeEach(inject(function($rootScope, $timeout, $$rAF, $animate) {

    runAnimation = function() {
      $timeout.flush(); // flush to start animations
      $$rAF.flush();    // flush animations
      $animate.triggerCallbacks();
      $timeout.flush(); // flush responses after animation completions
    }
  }));

  describe('#alert()', function() {
    hasConfigurationMethods('alert', [
      'title', 'content', 'ariaLabel',
      'ok', 'targetEvent', 'theme'
    ]);

    it('shows a basic confirm dialog without content', inject(function($animate, $rootScope, $mdDialog) {
          var parent = angular.element('<div>');
          var resolved = false;

          $mdDialog.show(
            $mdDialog
              .confirm()
              .parent(parent)
              .title('')
              .ok('Next')
              .cancel("Back")
          ).then(function() {
              resolved = true;
            });

          $rootScope.$apply();
          runAnimation();

          var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
          var mdDialog = mdContainer.find('md-dialog');
          var mdContent = mdDialog.find('md-dialog-content');
          var title = mdContent.find('h2');
          var content = mdContent.find('p');
          var buttons = parent.find('md-button');

          expect(title.text()).toBe('');
          expect(content.text()).toBe('');

          buttons.eq(0).triggerHandler('click');

          $rootScope.$apply();
          runAnimation();

          expect(resolved).toBe(true);
        }));

    it('shows a basic alert dialog', inject(function($animate, $rootScope, $mdDialog, $mdConstant) {
      var parent = angular.element('<div>');
      var resolved = false;

      $mdDialog.show(
        $mdDialog
          .alert()
          .parent(parent)
          .title('Title')
          .content('Hello world')
          .theme('some-theme')
          .ok('Next')
      ).then(function() {
          resolved = true;
        });

      $rootScope.$apply();
      runAnimation();

      var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
      var mdDialog = mdContainer.find('md-dialog');
      var mdContent = mdDialog.find('md-dialog-content');
      var title = mdContent.find('h2');
      var content = mdContent.find('p');
      var buttons = parent.find('md-button');
      var theme = mdDialog.attr('md-theme');

      expect(title.text()).toBe('Title');
      expect(content.text()).toBe('Hello world');
      expect(buttons.length).toBe(1);
      expect(buttons.eq(0).text()).toBe('Next');
      expect(theme).toBe('some-theme');
      expect(mdDialog.attr('role')).toBe('alertdialog');

      buttons.eq(0).triggerHandler('click');

      $rootScope.$apply();
      runAnimation();

      expect(resolved).toBe(true);
    }));

    it('should focus `md-dialog-content` on open', inject(function($mdDialog, $rootScope, $document) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0" md-autofocus>' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent
        })
      );

      runAnimation(parent.find('md-dialog'));

      expect($document.activeElement).toBe(parent[0].querySelector('md-dialog-content'));
    }));

    it('should remove `md-dialog-container` on click and remove', inject(function($mdDialog, $rootScope, $timeout) {
      jasmine.mockElementFocus(this);
      var container, parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0">' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent,
          clickOutsideToClose: true
        })
      );

      runAnimation(parent.find('md-dialog'));

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      container.triggerHandler({
        type: 'click',
        target: container[0]
      });

      runAnimation(parent.find('md-dialog'));

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(0);
    }));

    it('should remove `md-dialog-container` on scope.$destroy()', inject(function($mdDialog, $rootScope, $timeout) {
      var container, parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template: '' +
            '<md-dialog>' +
            '  <md-dialog-content tabIndex="0">' +
            '    <p>Muppets are the best</p>' +
            '  </md-dialog-content>' +
            '</md-dialog>',
          parent: parent
        })
      );

      runAnimation(parent.find('md-dialog'));
        $rootScope.$destroy();
      container = angular.element(parent[0].querySelector('.md-dialog-container'));

      expect(container.length).toBe(0);
    }));

  });

  describe('#confirm()', function() {
    hasConfigurationMethods('confirm', [
      'title', 'content', 'ariaLabel',
      'ok', 'cancel', 'targetEvent', 'theme'
    ]);

    it('shows a basic confirm dialog with simple text content', inject(function($rootScope, $mdDialog, $animate) {
      var parent = angular.element('<div>');
      var rejected = false;
      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent
        })
          .title('Title')
          .content('Hello world')
          .ok('Next')
          .cancel('Forget it')
      ).catch(function() {
          rejected = true;
        });

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var dialog = parent.find('md-dialog');
      var title = parent.find('h2');
      var content = parent.find('p');
      var buttons = parent.find('md-button');

      expect(dialog.attr('role')).toBe('dialog');
      expect(title.text()).toBe('Title');
      expect(content.text()).toBe('Hello world');
      expect(buttons.length).toBe(2);
      expect(buttons.eq(0).text()).toBe('Next');
      expect(buttons.eq(1).text()).toBe('Forget it');

      buttons.eq(1).triggerHandler('click');
      runAnimation();

      expect(parent.find('h2').length).toBe(0);
      expect(rejected).toBe(true);
    }));

    it('shows a basic confirm dialog with HTML content', inject(function($rootScope, $mdDialog, $animate) {
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent,
          ok: 'Next',
          cancel: 'Back',
          title: 'Which Way ',
          content: '<div class="mine">Choose</div>'
        })
      );

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var content = angular.element(container[0].querySelector('.mine'));

      expect(content.text()).toBe('Choose');
    }));

    it('shows a basic confirm dialog with HTML content using custom types', inject(function($rootScope, $mdDialog, $animate) {
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent,
          ok: 'Next',
          cancel: 'Back',
          title: 'Which Way ',
          content: '<my-content class="mine">Choose</my-content>'
        })
      );

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var content = angular.element(container[0].querySelector('.mine'));

      expect(content.text()).toBe('Choose');
    }));

    it('should focus `md-button.dialog-close` on open', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '' +
        '<md-dialog>' +
        '  <div class="md-actions">' +
        '    <button class="dialog-close">Close</button>' +
        '  </div>' +
        '</md-dialog>',
        parent: parent
      });
      runAnimation();

      expect($document.activeElement).toBe(parent[0].querySelector('.dialog-close'));
    }));

    it('should remove `md-dialog-container` after click outside', inject(function($mdDialog, $rootScope, $timeout) {
      jasmine.mockElementFocus(this);
      var container, parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0">' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent,
          clickOutsideToClose: true,
          ok: 'OK',
          cancel: 'CANCEL'
        })
      );
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(0);
    }));

    it('should remove `md-dialog-container` after ESCAPE key', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);
      var container, parent = angular.element('<div>');
      var response;

      $mdDialog.show(
        $mdDialog.confirm({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0">' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent,
          clickOutsideToClose: true,
          escapeToClose: true,
          ok: 'OK',
          cancel: 'CANCEL'
        })
      ).catch(function(reason) {
          response = reason;
        });
      runAnimation();

      parent.triggerHandler({
        type: 'keyup',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(0);
      expect(response).toBe(false);
    }));
  });

  describe('#build()', function() {
    it('should support onComplete callbacks within `show()`', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');
      var ready = false;

      $mdDialog.show({
        template: template,
        parent: parent,
        onComplete: function(scope, element, options) {
          expect(arguments.length).toEqual(3);
          ready = true;
        }
      });
      $rootScope.$apply();
      expect(ready).toBe(false);

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(1);
      expect(ready).toBe(true);
    }));

    it('should support onRemoving callbacks when `hide()` starts', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');
      var closing = false;

      $mdDialog.show({
        template: template,
        parent: parent,
        escapeToClose: true,
        onRemoving: function(scope, element) {
          expect(arguments.length).toEqual(2);
          closing = true;
        }
      });
      $rootScope.$apply();
      expect(closing).toBe(false);

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();

      parent.triggerHandler({
        type: 'keyup',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $timeout.flush();

      expect(closing).toBe(true);
    }));

    it('should support specifying a parent using a string selector', inject(function($mdDialog, $rootScope, $document) {
      var body = angular.element($document[0].querySelector("body"));
      var nodes = angular.element(''+
            '<div class="wrapper">' +
            '  <md-content> </md-content>' +
            '  <div id="owner">' +
            '  </div>' +
            '</div>'
      );

      body.append( nodes );
      $mdDialog.show({
        template: '<md-dialog>Hello</md-dialog>',
        parent: "#owner",
      });
      $rootScope.$apply();
      runAnimation();

      var owner = angular.element(body[0].querySelector('#owner'));
      var container = angular.element(body[0].querySelector('.md-dialog-container'));

      expect(container[0].parentNode === owner[0]).toBe(true);
      nodes.remove();
    }));

    it('should not wrap content with existing md-dialog', inject(function($mdDialog, $rootScope) {

      var template = '<md-dialog><div id="rawContent">Hello</div></md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      $rootScope.$apply();

      var container = parent[0].querySelectorAll('md-dialog');
      expect(container.length).toBe(1);
    }));

    it('should wrap raw content with md-dialog', inject(function($mdDialog, $rootScope) {

      var template = '<div id="rawContent">Hello</div>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      $rootScope.$apply();

      var container = parent[0].querySelectorAll('md-dialog');
      expect(container.length).toBe(1);
    }));

    it('should append dialog within a md-dialog-container', inject(function($mdDialog, $rootScope) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      $rootScope.$apply();

      var container = parent[0].querySelectorAll('.md-dialog-container');
      expect(container.length).toBe(1);
    }));

    it('should escapeToClose == true', inject(function($mdDialog, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog></md-dialog>',
        parent: parent,
        escapeToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();

      expect(parent.find('md-dialog').length).toBe(1);

      parent.triggerHandler({
        type: 'keyup',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $timeout.flush();
      runAnimation();

      expect(parent.find('md-dialog').length).toBe(0);
    }));

    it('should escapeToClose == false', inject(function($mdDialog, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        escapeToClose: false
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();
      expect(parent.find('md-dialog').length).toBe(1);

      $rootElement.triggerHandler({type: 'keyup', keyCode: $mdConstant.KEY_CODE.ESCAPE});
      runAnimation();

      expect(parent.find('md-dialog').length).toBe(1);
    }));

    it('should clickOutsideToClose == true', inject(function($mdDialog, $rootScope, $timeout, $animate, $mdConstant) {

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();
      expect(parent.find('md-dialog').length).toBe(1);

      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      runAnimation();

      expect(parent.find('md-dialog').length).toBe(0);
    }));

    it('should clickOutsideToClose == false', inject(function($mdDialog, $rootScope, $timeout, $animate) {

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        clickOutsideToClose: false
      });

      $rootScope.$apply();
      expect(parent.find('md-dialog').length).toBe(1);

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));

      container.triggerHandler({
        type: 'click',
        target: container[0]
      });

      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog').length).toBe(1);
    }));

    it('should disableParentScroll == true', inject(function($mdDialog, $animate, $rootScope, $mdUtil) {
      spyOn($mdUtil, 'disableScrollAround');
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        disableParentScroll: true
      });
      runAnimation();
      expect($mdUtil.disableScrollAround).toHaveBeenCalled();
    }));

    it('should hasBackdrop == true', inject(function($mdDialog, $animate, $rootScope) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        hasBackdrop: true
      });

      runAnimation();
      expect(parent.find('md-dialog').length).toBe(1);
      expect(parent.find('md-backdrop').length).toBe(1);
    }));

    it('should hasBackdrop == false', inject(function($mdDialog, $rootScope) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        hasBackdrop: false
      });

      $rootScope.$apply();
      expect(parent[0].querySelectorAll('md-dialog').length).toBe(1);
      expect(parent[0].querySelectorAll('md-backdrop').length).toBe(0);
    }));

    it('should focusOnOpen == true', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);
      var parent = angular.element('<div>');
      $mdDialog.show({
        focusOnOpen: true,
        parent: parent,
        template: '<md-dialog>' +
        '<div class="md-actions">' +
        '<button id="a">A</md-button>' +
        '<button id="focus-target">B</md-button>' +
        '</div>' +
        '</md-dialog>'
      });

      $rootScope.$apply();
      runAnimation();

      expect($document.activeElement).toBe(parent[0].querySelector('#focus-target'));
    }));

    it('should focusOnOpen == false', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');
      $mdDialog.show({
        focusOnOpen: false,
        parent: parent,
        template: '<md-dialog>' +
        '<div class="md-actions">' +
        '<button id="a">A</md-button>' +
        '<button id="focus-target">B</md-button>' +
        '</div>' +
        '</md-dialog>',
      });

      $rootScope.$apply();
      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();

      expect($document.activeElement).toBe(undefined);
    }));

    xit('should expand from and shrink to targetEvent element', inject(function($mdDialog, $rootScope, $timeout, $mdConstant, $$rAF) {
      // Create a targetEvent parameter pointing to a fake element with a
      // defined bounding rectangle.
      var fakeEvent = {
        target: {
          getBoundingClientRect: function() {
            return {top: 100, left: 200, bottom: 140, right: 280, height: 40, width: 80};
          }
        }
      };
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        targetEvent: fakeEvent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var dialog = parent.find('md-dialog');

      $$rAF.flush();

      // The dialog's bounding rectangle is always zero size and position in
      // these tests, so the target of the CSS transform should be the midpoint
      // of the targetEvent element's bounding rect.
      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');

      // Clear the animation CSS so we can be sure it gets reset.
      dialog.css($mdConstant.CSS.TRANSFORM, '');

      // When the dialog is closed (here by an outside click), the animation
      // should shrink to the same point it expanded from.
      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      runAnimation();

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');
    }));

    xit('should shrink to updated targetEvent element location', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
      // Create a targetEvent parameter pointing to a fake element with a
      // defined bounding rectangle.
      var fakeEvent = {
        target: {
          getBoundingClientRect: function() {
            return {top: 100, left: 200, bottom: 140, right: 280, height: 40, width: 80};
          }
        }
      };

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        targetEvent: fakeEvent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var dialog = parent.find('md-dialog');

      triggerTransitionEnd(dialog, false);

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');

      // Simulate the event target element moving on the page. When the dialog
      // is closed, it should animate to the new midpoint.
      fakeEvent.target.getBoundingClientRect = function() {
        return {top: 300, left: 400, bottom: 360, right: 500, height: 60, width: 100};
      };
      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      $timeout.flush();

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(450px, 330px, 0px) scale(0.5, 0.5)');
    }));

    xit('should shrink to original targetEvent element location if element is hidden', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
      // Create a targetEvent parameter pointing to a fake element with a
      // defined bounding rectangle.
      var fakeEvent = {
        target: {
          getBoundingClientRect: function() {
            return {top: 100, left: 200, bottom: 140, right: 280, height: 40, width: 80};
          }
        }
      };

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        targetEvent: fakeEvent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var dialog = parent.find('md-dialog');

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');

      triggerTransitionEnd(dialog, false);

      // Clear the animation CSS so we can be sure it gets reset.
      dialog.css($mdConstant.CSS.TRANSFORM, '');

      // Simulate the event target element being hidden, which would cause
      // getBoundingClientRect() to return a rect with zero position and size.
      // When the dialog is closed, the animation should shrink to the point
      // it originally expanded from.
      fakeEvent.target.getBoundingClientRect = function() {
        return {top: 0, left: 0, bottom: 0, right: 0, height: 0, width: 0};
      };
      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      $timeout.flush();

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');
    }));

    it('should focus the last `md-button` in md-actions open if no `.dialog-close`', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>' +
        '<div class="md-actions">' +
        '<button id="a">A</md-button>' +
        '<button id="focus-target">B</md-button>' +
        '</div>' +
        '</md-dialog>',
        parent: parent
      });

      runAnimation();

      expect($document.activeElement).toBe(parent[0].querySelector('#focus-target'));
    }));

    it('should only allow one open at a time', inject(function($mdDialog, $rootScope, $animate) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog class="one">',
        parent: parent
      });
      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(1);
      expect(parent[0].querySelectorAll('md-dialog.two').length).toBe(0);

      $mdDialog.show({
        template: '<md-dialog class="two">',
        parent: parent
      });
      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(0);
      expect(parent[0].querySelectorAll('md-dialog.two').length).toBe(1);
    }));

    it('should have the dialog role', inject(function($mdDialog, $rootScope) {
      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      $rootScope.$apply();

      var dialog = angular.element(parent[0].querySelectorAll('md-dialog'));
      expect(dialog.attr('role')).toBe('dialog');
    }));

    it('should create an ARIA label if one is missing', inject(function($mdDialog, $rootScope, $$rAF) {
      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });
      runAnimation();

      var dialog = angular.element(parent[0].querySelector('md-dialog'));
      expect(dialog.attr('aria-label')).toEqual(dialog.text());
    }));

    it('should not modify an existing ARIA label', inject(function($mdDialog, $rootScope) {
      var template = '<md-dialog aria-label="Some Other Thing">Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      runAnimation();

      var dialog = angular.element(parent[0].querySelector('md-dialog'));
      expect(dialog.attr('aria-label')).not.toEqual(dialog.text());
      expect(dialog.attr('aria-label')).toEqual('Some Other Thing');
    }));

    it('should add an ARIA label if supplied through chaining', inject(function($mdDialog, $rootScope, $animate) {
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          parent: parent
        })
          .ariaLabel('label')
      );

      runAnimation();

      var dialog = angular.element(parent[0].querySelector('md-dialog'));
      expect(dialog.attr('aria-label')).toEqual('label');
    }));

    it('should apply aria-hidden to siblings', inject(function($mdDialog, $rootScope, $timeout) {

      var template = '<md-dialog aria-label="Some Other Thing">Hello</md-dialog>';
      var parent = angular.element('<div>');
      parent.append('<div class="sibling"></div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      runAnimation();

      var dialog = angular.element(parent.find('md-dialog'));
      expect(dialog.attr('aria-hidden')).toBe(undefined);
      expect(dialog.parent().attr('aria-hidden')).toBe(undefined);

      var sibling = angular.element(parent[0].querySelector('.sibling'));
      expect(sibling.attr('aria-hidden')).toBe('true');
    }));
  });

  function hasConfigurationMethods(preset, methods) {
    angular.forEach(methods, function(method) {
      return it('supports config method #' + method, inject(function($mdDialog) {
        var dialog = $mdDialog[preset]();
        expect(typeof dialog[method]).toBe('function');
        expect(dialog[method]()).toEqual(dialog);
      }));
    });
  }

  /**
   * Verifies that an element has the expected CSS for its transform property.
   * Works by creating a new element, setting the expected CSS on that
   * element, and comparing to the element being tested. This convoluted
   * approach is needed because if jQuery is installed it can rewrite
   * 'translate3d' values to equivalent 'matrix' values, for example turning
   * 'translate3d(240px, 120px, 0px) scale(0.5, 0.5)' into
   * 'matrix(0.5, 0, 0, 0.5, 240, 120)'.
   */
  var verifyTransformCss = function(element, transformAttr, expectedCss) {
    var testDiv = angular.element('<div>');
    testDiv.css(transformAttr, expectedCss);
    expect(element.css(transformAttr)).toBe(testDiv.css(transformAttr));
  };

});

describe('$mdDialog with custom interpolation symbols', function() {
  beforeEach(module('material.components.dialog'));

  beforeEach(module(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
  }));

  it('displays #alert() correctly', inject(function($mdDialog, $rootScope) {
    var parent = angular.element('<div>');
    var dialog = $mdDialog.
      alert({parent: parent}).
      ariaLabel('test alert').
      title('Title').
      content('Hello, world !').
      ok('OK');

    $mdDialog.show(dialog);
    $rootScope.$digest();

    var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
    var mdDialog = mdContainer.find('md-dialog');
    var mdContent = mdDialog.find('md-dialog-content');
    var title = mdContent.find('h2');
    var content = mdContent.find('p');
    var mdActions = angular.element(mdDialog[0].querySelector('.md-actions'));
    var buttons = mdActions.find('md-button');

    expect(mdDialog.attr('aria-label')).toBe('test alert');
    expect(title.text()).toBe('Title');
    expect(content.text()).toBe('Hello, world !');
    expect(buttons.eq(0).text()).toBe('OK');
  }));

  it('displays #confirm() correctly', inject(function($mdDialog, $rootScope) {
    var parent = angular.element('<div>');
    var dialog = $mdDialog.
      confirm({parent: parent}).
      ariaLabel('test alert').
      title('Title').
      content('Hello, world !').
      cancel('CANCEL').
      ok('OK');

    $mdDialog.show(dialog);
    $rootScope.$digest();

    var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
    var mdDialog = mdContainer.find('md-dialog');
    var mdContent = mdDialog.find('md-dialog-content');
    var title = mdContent.find('h2');
    var content = mdContent.find('p');
    var mdActions = angular.element(mdDialog[0].querySelector('.md-actions'));
    var buttons = mdActions.find('md-button');

    expect(mdDialog.attr('aria-label')).toBe('test alert');
    expect(title.text()).toBe('Title');
    expect(content.text()).toBe('Hello, world !');
    expect(buttons.eq(0).text()).toBe('CANCEL');
    expect(buttons.eq(1).text()).toBe('OK');
  }));
});

