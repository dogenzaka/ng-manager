angular
.module('ngManager')
.controller('EndpointCtrl', function( $q, $scope, $rootScope, $schemaForm, $endpointService, $apiService, $errorService, $filter) {

    var max_num = 3;
    $scope.endpoints_org = $endpointService.getAll();
    $scope.endpoints = $scope.endpoints_org.slice(0, max_num);

    $scope.remove = function(index) {
      $endpointService.remove(index);
    };

    $scope.select = function(index) {
      $endpointService.select(index);
      $apiService
      .setup()
      .then(function() {
        location.hash = 'top';
      }, function(err) {
        $errorService.showError(err);
      })
      ;
    };

    var add = function(endpoint) {
      $endpointService.add(endpoint);
    };

    $rootScope.$emit('content.title', {
      section: 'Settings',
      page: 'Endpoints'
    });

    $scope.loadMore = function(){
      if(max_num < $scope.endpoints_org.length){
        max_num++;
        $scope.endpoints = $scope.endpoints_org.slice(0, max_num);
      }
    }

    $scope.import = function($event){
      var file = document.getElementById("importfile").files[0];
      var reader = new FileReader();
      var entities = null;
      reader.readAsText(file, "utf-8");
      reader.onload = function(e){
        try{
          entities = JSON.parse(e.target.result);
        } catch(error) {
          //todo error
        }
        if(entities !== null){
          for(var i = 0; i < entities.length; i++){
            $endpointService.add(entities[i]);
          }
        }
      }
    }

    $scope.export = function($event){

      var filename = "endpoint_" + $filter('date')(new Date(), 'yyyyMMddHHmm') + ".json";
      var content = JSON.stringify($scope.endpoints_org);
      window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
      window.requestFileSystem(TEMPORARY, 1024*1024, function(fileSystem){
        // ファイル新規作成（上書き）
        fileSystem.root.getFile(filename, {create: true, exclusive: false}, function(fileEntry){
          // ファイル書き込み
          fileEntry.createWriter(function(fileWriter){
            var blob = new Blob([ content ], { "type" : "text/plain" });
            fileWriter.write(blob);
            // ファイル書き込み成功イベント
            fileWriter.onwriteend = function(){
              console.log("ファイル書き込み成功");
              var link = document.createElement('a');
              link.href = fileEntry.toURL();
              link.download = filename;
              document.body.appendChild(link); // for Firefox
              link.click();
              document.body.removeChild(link); // for Firefox
            };
            // ファイル書き込み失敗イベント
            fileWriter.onerror = function(e){
              console.err(e);
            };
          });
        }, function(error){
            console.log("error.code=" + error.code);
        });
      });
    }

    // Showing form for adding new schema
    $scope.showForm = function($event) {

      $schemaForm.showDialog({
        title: 'Add the endpoint',
        event: $event,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', maxLength: 100, minLength: 1 },
            url: { type: 'string', maxLength: 100, minLength: 1, format: 'uri', style: 'long' },
          },
          required: ['name','url']
        },
        submit: function(scope) {
          var deferred = $q.defer();
          var entity = scope.entity;
          add(entity);
          deferred.resolve();
          return deferred.promise;
        }
      });

    };

  }
);
