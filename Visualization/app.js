var app = angular.module('wifiApp', ["ngRoute","highcharts-ng"],function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
 
  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */ 
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      
    for(name in obj) {
      value = obj[name];
        
      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
    return query.length ? query.substr(0, query.length - 1) : query;
  };
 
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
});

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {

      templateUrl:'templates/home.html'
  }).
  when('/overview', {
    controller:overviewCtr,
    templateUrl:'templates/overview.html'
  }).
  when('/mapview', {
    controller:mapviewCtr,
    templateUrl:'templates/mapview.html'
  }).
  when('/detail/:id', {
    controller:detailCtr,
    templateUrl:'templates/detail.html'
  }).
  when('/similar', {
      controller:similarCtr,
      templateUrl:'templates/similar.html'
  }).
  when('/score', {
      controller:scoreCtr,
      templateUrl:'templates/score.html'
  }).
  otherwise({redirectTo: '/'});
}]);

app.filter('flowMB',function(){

    return function(item){
        if(!item)
            return false;
        return (item/1048576).toFixed(2)+" MB";
    }
});

app.filter('flowGB',function(){
    return function(item){
        if(!item)
          return false;
        return (item/1073741824).toFixed(1)+" GB";  
    }
}); 

app.filter('flowTB',function(){

    return function(item){     
     if(!item)
          return false;   
     return (item/1099511627776).toFixed(2)+" TB"; 
    }
});  

app.filter('unixTime',function(){
    return function(item){     
     if(!item)
          return "";   
     return Highcharts.dateFormat('%Y-%m-%d %H:%M:%S',item*1000); 
    }
});     
