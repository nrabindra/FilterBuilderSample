angular.module('abandonedItemApp', [])
  .controller('ItemController', ($scope, $http)=> {


      $http.get('/getAbandonedProducts').then((resp)=>{
      	$scope.list = resp.data;
      	for (var i = 0; i < $scope.list.length; i++) {
      			$scope.list[i].showCustomers = false;
      		}
      });

      $scope.getCustomers = (index, ids)=>{
      	$http.post('/getCustomers', {ids: ids}).then((resp)=>{
      		$scope.list[index].customers = resp.data;
      		$scope.list[index].showCustomers = true;
      		
      	});
      }

      $scope.hideCustomers = (index)=>{
      		$scope.list[index].showCustomers = false;
      }

  });
