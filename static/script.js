var app = angular.module('app',[]);

var SC;
app.controller('main', function($scope, $parse) {
	SC = $scope;
	var stopThat = false;
	var mod2 = true;

	$scope.pleaseTryDelete = function(user){
		for(var i in $scope.users)
			if($scope.users[i].wantDelete)
				return $scope.users[i].wantDelete = false;
		user.wantDelete = !user.wantDelete;
	}
	$scope.safeCall = function(){
		if($scope.noDelete())
			$scope.call();
	}
	$scope.delUser = function(user){
		(user=$scope.users[$scope.users.indexOf(user)]).disabled = true;
		user.wantDelete = false;
		$.ajax({
		        type: "GET",
		        url: '/doNotCall/'+user.name,
		        async: false,
		        cache: false
		    }).responseText;
	}
	$scope.noDelete = function(){
		for(var i in $scope.users)
			if($scope.users[i].wantDelete){
				$scope.users[i].wantDelete = false;
				return false;
			}
		return true;
	}

	$scope.safeApply = function(fn) {
	  var phase = this.$root.$$phase;
	  if(phase == '$apply' || phase == '$digest') {
	    if(fn && (typeof(fn) === 'function')) {
	      fn();
	    }
	  } else {
	    this.$apply(fn);
	  }
	};

	function refreshDisp(){
		mod2 = !mod2;
		for(var i in $scope.users){
			if($scope.users[i].state=='asking'){
				$scope.users[i].state = 'asking-red';
			}else if($scope.users[i].state=='asking-red'){
				$scope.users[i].state = 'asking';
			}
		}
		if(mod2){
			var r = $.ajax({type: "GET", url: '/check', async: false, cache: false}).responseText;
		    if(r+""==r)
		    	r = JSON.parse(r);
		    for(var i in r)
		    	$scope.users[+r[i]].state = 'ok';
		}
		$scope.safeApply();
		if(!stopThat)
			setTimeout(refreshDisp, 800);
	}

	$scope.call = function(){
		$scope.calling = 'calling';
		$.ajax({
		        type: "GET",
		        url: '/performCall',
		        async: false,
		        cache: false
		    }).responseText;
		for(var i in $scope.users)
			$scope.users[i].state = 'asking-red';
	}
	setTimeout(refreshDisp, 1500);
});