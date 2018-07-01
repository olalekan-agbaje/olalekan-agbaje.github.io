/*
This file contains angularjs v1 javascript code to asks for a permission to read users current location by the browser,
and then uses the http://openweathermap.org/current public API to fetch the weather for that location and displays it.
If the user denies to share the location, a little input form for entering postcode or country is shown,
and the weather based on that location is displayed
 */
(function() {
    'use strict';

    angular.module('weatherApp',[])
        // Get current location.
        .factory('$geolocation', function($q) {
            this.get = function() {
                var deferred = $q.defer();

                // Call Geolocation API.
                navigator.geolocation.getCurrentPosition(
                    function(result) {
                        // Call successful.
                        deferred.resolve(result);
                    },
                    function(error) {
                        // Something went wrong. Set array of error messages
                        var errorMessages = [
                            "Sorry, Your browser denied the request for Geolocation.",
                            "Sorry, Location information is unavailable.",
                            "Sorry, The request to get user location took too long and timed out.",
                            "Sorry, An unknown error occurred."
                        ];
                        deferred.reject(error);
                    },{
                        timeout:5000 //stop searching for position after 5 seconds
                    }
                );
                // Return a promise.
                return deferred.promise;
            };
            return this;
        })

        // Weather Service to communicate with OpenWeatherMap API.
        .factory('$weather', function($q, $http) {
            this.apiKey = '20d5975a307c88f89e58d0541ce81bb6';
            //prepare the base api url containing, metric and appid
            this.API_ROOT = 'http://api.openweathermap.org/data/2.5/weather?callback=JSON_CALLBACK&units=metric&appid='+this.apiKey;

            // function to get weather by city name or post code
            this.byPostOrCountry = function(query) {
                var deferred = $q.defer();

                // Call the API using JSONP and pass the search criteria (query) to the q parameter of the API.
                    $http.jsonp(this.API_ROOT + '&q=' + encodeURI(query)).then(
                    function(response) {
                        var statusCode = parseInt(response.data.cod);

                        if (statusCode === 200) {
                            // Call successful.
                            deferred.resolve(response.data);
                        }
                        else {
                            // Something went wrong. Probably the city doesn't exist.
                            deferred.reject(response.data.message);
                        }
                    },
                    function(error) {
                        // Unable to connect to API.
                        deferred.reject(error);
                    }
                );
                // Return a promise.
                return deferred.promise;
            };

            // function to get weather by city name or post code
            this.byLocation = function(coords) {
                var deferred = $q.defer();

                // Call the API using JSONP and pass the latitude and longitude to the API
                $http.jsonp(this.API_ROOT + '&lat=' + coords.latitude + '&lon=' + coords.longitude).then(
                    function(response) {
                        var statusCode = parseInt(response.data.cod);

                        if (statusCode === 200) {
                            deferred.resolve(response.data);
                        }
                        else {
                            deferred.reject(response.data.message);
                        }
                    },
                    function(error) {
                        deferred.reject(error);
                    }
                );
                return deferred.promise;
            };

            return this;
        })
        .controller('WeatherController', function($scope, $window, $geolocation, $weather) {
            // Update current weather.
            $scope.updateCurrentWeather = function() {
                $geolocation.get().then(
                    function(position) {
                        $weather.byLocation(position.coords).then(
                            function(weather) {
                                //assign the various sections of the return data for easier referencing
                                $scope.resultFound = true;
                                $scope.currentWeather = weather;
                                $scope.weather = weather.weather[0];
                                $scope.other = weather.main;
                                $scope.wind = weather.wind;
                                $scope.clouds = weather.clouds;
                                $scope.country= weather.sys;
                                $scope.locationName = weather.name;
                                $scope.getDate = weather.dt;
                                $scope.latlong = weather.coord;
                            },
                            function(error){
                                alert('Sorry, we are unable to get weather by geolocation. Please refresh your browser.');
                            }
                        );
                    }
                );
            };
            // Update local weather when app starts or page refresh.
            $scope.updateCurrentWeather();
        })
        //manually provide the post code or country name
        .controller('manualInput',function($scope,$weather){
            $scope.manualSearch = function() {
                $weather.byPostOrCountry($scope.searchCriteria).then(
                    function(weather){
                        //assign the various sections of the return data for easier referencing
                        $scope.resultFound = true;
                        $scope.currentWeather = weather;
                        $scope.weather = weather.weather[0];
                        $scope.other = weather.main;
                        $scope.wind = weather.wind;
                        $scope.clouds = weather.clouds;
                        $scope.country= weather.sys;
                        $scope.locationName = weather.name;
                        $scope.getDate = weather.dt;
                        $scope.latlong = weather.coord;
                    },
                    function(error){
                        alert('Sorry, we are unable to get weather by city name or postcode. Please check your input and try again.');
                    }
                );
            }
        })
})();