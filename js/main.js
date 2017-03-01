var app = angular.module('CPSCDatabase', []);

app.factory('dataFactory', ['$http',
    function($http) {
        return {
            getJobs: function () {
                var promise = $http.get('/api/jobs.php')
                .then(function(response) {
                    return response.data;
                }, function (error) {
                    //Error
                    console.log("Error getting all jobs.")
                })
            return promise;
            }
        }
    }
]);

app.controller('controller', ['$scope', 'dataFactory',
    function getJobs($scope, dataFactory) {
        
        $scope.jobs = undefined;
        
        dataFactory.getJobs().then(function(data)
        {
            $scope.jobs = data;
        });
    }
]);