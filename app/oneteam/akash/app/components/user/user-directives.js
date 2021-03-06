/**
 * oep.user.directives - Directives for the user components
 *
 * Defines oepUniqId.
 *
 */
(function() {
  'use strict';

  angular.module('oep.user.directives', ['oep.user.services', 'oep.debounce.services']).

  /**
   * oepUniqId - Validator for input associated to a ngModel checking
   * there's no OEP user an id identical to the ngModel value.
   *
   */
  directive('oepUniqId', ['oepDebounce', 'oepUsersApi', '$q',

    function(debounce, userApi, $q) {

      return {
        require: 'ngModel',
        link: function(s, e, a, ctrl) {
          var lastQuery = $q.when(true),
            delayedChecker = debounce(function(value) {
              if (!value) {
                ctrl.$setValidity('oepUniqId', true);
                return;
              }

              lastQuery = lastQuery.then(function(){
                return userApi.getById(value).then(function() {
                  ctrl.$setValidity('oepUniqId', false);
                  return true;
                }).catch(function(){
                  ctrl.$setValidity('oepUniqId', true);
                  return true;
                });
              });
            }, 1000),
            checker = function(value) {
              delayedChecker(value);
              return value;
            };

          ctrl.$parsers.push(checker);
          ctrl.$formatters.push(checker);
        }
      };
    }
  ]).

  /**
   * It will reset the error message after ant edit of model
   */
  directive('oepResetErrors', [function() {
    return {
      require: 'ngModel',
      link: function(s, e, attr, ctrl) {
        var errorIds = attr.oepResetErrors.split(','),
          lastValue;

        ctrl.$parsers.unshift(function(viewValue) {
          if (lastValue === viewValue) {
            return viewValue;
          } else {
            lastValue = viewValue;
          }

          for (var i = 0; i < errorIds.length; i++) {
            ctrl.$setValidity(errorIds[i], true);
          }

          return viewValue;
        });
      }
    };
  }])

  ;

})();
