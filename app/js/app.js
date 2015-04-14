angular.module('app', ['cfp.hotkeys'])
    .controller('MainController', ['$scope', '$http', '$cacheFactory', 'hotkeys', function($scope, $http, $cacheFactory, hotkeys) {


        /*==========  Interactivity  ==========*/

        $scope.aside = false;
        $scope.peek = false;




        /*==========  Love & Scorn functions  ==========*/

        $scope.cache = $cacheFactory('cacheId');
        $scope.$watch('matches', function(newValue, oldValue) {
            $scope.cache.put('matches', JSON.stringify(newValue));
            console.log($scope.cache.get('matches'));
        }, true);

        $scope.matches = $scope.cache.get('matches') === undefined ? [] : JSON.parse($scope.cache.get('matches'));
        
        $scope.love = function() {
            var rec = {
                'header' : $scope.header.active,
                'body'   : $scope.body.active
            };
            $scope.matches.push(rec);
        }

        $scope.scorn = function(i) {
            $scope.matches.splice(i, 1);
        }
            


        /*==========  Variants  ==========*/
        $scope.hv = {
            'string' : 'regular',
            'weight' : 'regular',
            'style' : 'regular'
        };
        $scope.bv = {
            'string' : 'regular',
            'weight' : 'regular',
            'style' : 'regular'
        };

        var seperateVariant = function(v) {
            var s = {
                    'w' : '400',
                    's'  : 'regular'
                };

            if(v.charAt(1) == '0') {
                s.w = v.substring(0,3);
                s.s = v.charAt(3) == 'i' ? 'italic' : 'regular';
            }
            else {
                s.s = v == 'italic' ? 'italic' : 'regular';
            }
            return s;
        }
        
        $scope.setHeaderVariant = function(v) {
            var s = seperateVariant(v);
            $scope.hv.string = v;
            $scope.hv.style = s.s;
            $scope.hv.weight = s.w;
        }

        $scope.setBodyVariant = function(v) {
            var s = seperateVariant(v);
            $scope.bv.string = v;
            $scope.bv.style = s.s;
            $scope.bv.weight = s.w;
        }



        /*==========  History, Undo, Redo  ==========*/

        $scope.history = [];
        $scope.historyIndex = 0;
        
        function record() {
            var rec = {
                'header' : $scope.header.active,
                'body'   : $scope.body.active
            };
            var lastIndex = $scope.history.length - 1;

            // if we're at an undo point, clear all the elements after this point
            if($scope.historyIndex < lastIndex) {

                var n = lastIndex - $scope.historyIndex; // how many items to splice
                var l = $scope.historyIndex - lastIndex; // where to start the splicing
                $scope.history.splice(l, n);

            }
            $scope.history.push(rec);
            $scope.historyIndex = lastIndex;
        }

        $scope.undo = function() {
            if($scope.historyIndex > 0) {

                $scope.historyIndex = $scope.historyIndex - 1;
                //$scope.history.splice(-1,1);

                $scope.header.active = $scope.history[$scope.historyIndex].header;
                $scope.body.active = $scope.history[$scope.historyIndex].body;
            }
        }
        $scope.redo = function() {
            if($scope.historyIndex < $scope.history.length - 1) {

                $scope.historyIndex = $scope.historyIndex + 1;

                $scope.header.active = $scope.history[$scope.historyIndex].header;
                $scope.body.active = $scope.history[$scope.historyIndex].body;
            }
        }



        /*==========  Font Loading  ==========*/  

        $scope.fonts = {};
        $scope.body = {};
        $scope.header = {};

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }   

        $scope.newHeader = function() {
        	$scope.header.active = $scope.header.next;
            $scope.header.next = getRandomInt(1, $scope.fonts.items.length);

            var f = $scope.fonts.items[$scope.header.next];
            var fams = [];

            for (var i = f.variants.length - 1; i >= 0; i--) {
                fams.push(f.family + ':' + f.variants[i])
            };

            WebFont.load({
                google: { 
                    families: fams
                 } 
             });
        }

        $scope.newBody = function() {
            $scope.body.active = $scope.body.next;
            $scope.body.next = getRandomInt(1, $scope.fonts.items.length);

            var f = $scope.fonts.items[$scope.body.next];
            var fams = [];

            for (var i = f.variants.length - 1; i >= 0; i--) {
                fams.push(f.family + ':' + f.variants[i])
            };
            
            WebFont.load({
                google: { 
                    families: fams
                 } 
             });
        }

        $scope.randomize = function() {
            $scope.newBody();
            $scope.newHeader();
        }

        $http.get('js/fonts.json')
            .success(function(data) {

                $scope.history = [];
                $scope.fonts = data;
                $scope.header.next = getRandomInt(1, $scope.fonts.items.length);
                $scope.body.next = getRandomInt(1, $scope.fonts.items.length);
                $scope.randomize();
                record();

            });

        /*==========  Hotkeys  ==========*/
        
        hotkeys.add({
            combo: 'space',
            description: 'Randomize the fonts',
            callback: function() {
              $scope.randomize();
              record();
            }
          });

        hotkeys.add({
            combo: 'up',
            description: 'Randomize the header',
            callback: function() {
              $scope.newHeader();
              record();
            }
          });

        hotkeys.add({
            combo: 'down',
            description: 'Randomize the body',
            callback: function() {
              $scope.newBody();
              record();
            }
          });

        hotkeys.add({
            combo: 'left',
            description: 'Undo',
            callback: function() {
              $scope.undo();
            }
          });

        hotkeys.add({
            combo: 'right',
            description: 'Redo',
            callback: function() {
              $scope.redo();
            }
          });

    }])