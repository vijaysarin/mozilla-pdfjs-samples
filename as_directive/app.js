angular.module('app', ['pdfjsViewer']);

angular.module('app').controller('AppCtrl', function($scope) {
    $scope.pdf = {
        src: 'Sample2.pdf',
    };

    $scope.$watch('scale', function() {
      
    });

    $scope.onInit = function() {
      
    };

    $scope.onPageLoad = function(page) {
      
    };
});