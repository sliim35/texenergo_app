/**
 * Created by Egor Lobanov on 17.01.16.
 */
(function(){
    /**
     * Build notification service for module
     */
    angular.module('services.notifications', [])
        .service('notificationServiceBuilder', ['CableApi', 'funcFactory', function(CableApi, funcFactory){

            this.build = function(serviceModule, name, actions, mixins){

                return new function(){

                    this.subscribe = function(params, scopeObject){

                        var s = scopeObject;// property of controller scope, that waiting for changes

                        var m = {
                            rejected: function(){
                                funcFactory.showNotification('Канал получения уведомлений', 'Не удалось установить соединение!');
                            },
                            received: function(data) {
                                syncChanges(data, s);
                                // window.gon.user.id !== data.user_id && syncChanges(data, s);
                            }
                        };
                        if(typeof mixins === 'object' && mixins) m = angular.extend(m, mixins);

                        return CableApi.subscribe(params, m);
                    };

                    function syncChanges(data, scopeObject){
                        console.log("syncChanges data", data);
                        console.log("syncChanges scopeObject", scopeObject);
                        actions[data.action] && actions[data.action](scopeObject, data);
                    }

                };
            };

            this.getIndexByProperty = function(list, item, prop){
                var ind = -1;
                for(var i=list.length; i--;){
                    if(list[i][prop] === item[prop]){
                        ind = i;
                        break;
                    }
                }
                return ind;
            };
        }]);
}());