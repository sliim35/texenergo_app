/**
 * Created by Egor Lobanov on 23.11.15.
 */
(function(){
    angular.module('app.quotation_orders').run(['editableOptions', function(editableOptions) {
        editableOptions.theme = 'bs3';

    }]).controller('EditQuotationOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', '$uibModal', '$parse', function($scope, $state, $stateParams, serverApi, $filter, funcFactory, $uibModal, $parse){
        var sc = $scope;
        sc.data ={
            quotationOrder:{},
            productsList: [],//селект выбора продукта
            selectedProduct: null, //выбранный продукт
            total:0
        };
        sc.visual = {
            title: "Рассчет"//window.gon.index.QuotationOrders.indexTitle
        };
        sc.newElement = {};//данные продукта, который необходимо добавить к заказу
        //config для селекта продуктов
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };

        serverApi.getQuotationOrderDetails($stateParams.id, function(result){
            sc.data.quotationOrder = result.data;
        });

        /**
         * Обновляем информацию по заказу
         */
        sc.saveQuotationOrderInfo = function(){
            var order = sc.data.quotationOrder,
                data = {
                    quotation_order:{
                        title: order.title
                    }
                };
            serverApi.updateQuotationOrder(order.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Заказ '+order.number+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ '+order.number,true);
            });
        };
        
        /**
         * Добавляем новый элемент
         */
        sc.addNewElement = function(e, invalid){
            if(e.type == "click" && !invalid){
                var newElement = sc.newElement;
                var data = {
                    add_element: {
                        description: newElement.description,
                        schema_code: newElement.schema_code,
                        comment: newElement.comment
                    }
                };
                serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                    if(result.status == 200 && !result.data.errors){
                        sc.data.quotationOrder.elements.push(result.data);
                        sc.newElement = {};
                    } else {
                        funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                    }
                });
            }
        };
        
        /**
         * Добавляем новый товар
         */
        sc.addNewProduct = function(product, createElement){
            var p = product;
            if(p){
                var dataForProduct = {
                    add_product: {
                        product_id: (p.id || p._id),
                        quantity: 1
                    }
                }
                
                /**
                 * В случае если вдруг нам каким-то образом уже известен element_id
                **/
                if(p.element_id !== undefined) {
                    dataForProduct.add_product.element_id = p.element_id;
                }
                
                // Сначала создаём новый элемент для связи
                if(createElement) {
                    var data = {
                        add_element: {
                            description: "Для " + p.name,
                            schema_code: "",
                            comment: ""
                        }
                    }
                    serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                        if(result.status == 200 && !result.data.errors){
                            
                            // Link new element to future product
                            dataForProduct.add_product.element_id = result.data.id;
                            
                            sc.data.quotationOrder.elements.push(result.data);
                        } else {
                            funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                        }
                    });
                }
                
                serverApi.updateQuotationOrder(sc.data.quotationOrder.id, dataForProduct, function(result){
                    if(result.status == 200 && !result.data.errors){
                        sc.data.quotationOrder.products.push(result.data);
                    } else {
                        funcFactory.showNotification("Неудача", 'Не удалось добавить строку комплектации');
                    }
                });
                
                sc.data.selectedProduct = null;
            }
        };
        
        /**
         * Добавляем новый товар, но из уже имеющегося элемента.
         * Отличие от обычного в том, что элемент уже есть и новый товар просто к нему привязывается.
         */
        sc.createAndAppendProductToElement = function(element){
            var modalInstance = $uibModal.open({
                templateUrl: 'eqoModal.tmpl.html',
                controller: 'EqoModalInstanceCtrl',
                windowClass: 'eqo-centred-modal',
                resolve:{
                    product: null,
                    config: {
                        title: 'Добавить товар',
                        btnOkText: 'Добавить',
                        btnCancelText: 'Отмена'
                    }
                }
            });

            modalInstance.result.then(function (selectedProduct) {
                selectedProduct.element_id = element.id;
                sc.addNewProduct(selectedProduct);
            });
        };
        
        /**
         * Обновляем элемент
         */
        sc.saveElementChange = function(element){
            data = {
                update_element: {
                    id: element.id,
                    schema_code: element.schema_code,
                    comment: element.comment,
                    description: element.description
                }
            }
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    for(var i=0; i < sc.data.quotationOrder.elements.length; i++) {
                        if (sc.data.quotationOrder.elements[i] == result.data.id) {
                            sc.data.quotationOrder.elements[i] = result.data;
                            funcFactory.showNotification("Удача", "Обновил элемент", true);
                            break;
                        }
                    }
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                }
            });
        };

        /**
         * Обновляем товар
         */
        sc.saveProductChange = function(item){
            data = {
                update_product: {
                    id: item.id,
                    quantity: item.quantity,
                    product_id: item.product_id
                }
            }
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    for(var i=0; i < sc.data.quotationOrder.products.length; i++) {
                        if (sc.data.quotationOrder.products[i] == result.data.id) {
                            sc.data.quotationOrder.products[i] = result.data;
                            funcFactory.showNotification("Удача", "Обновил товар", true);
                            break;
                        }
                    }
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                }
            });
        };

        /**
         * Удаляем элемент
         */
        sc.removeElement = function(item, index){
            data = {
                remove_element: {
                    id: item.id
                }
            }
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    sc.data.quotationOrder.elements.splice(index, 1);
                    funcFactory.showNotification("Удача", "Удалил элемент", true);
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось добавить элемент');
                }
            });
        };

        /**
         * Удаляем товар
         */
        sc.removeProduct = function(item, index){
            data = {
                remove_product: {
                    id: item.id
                }
            }
            serverApi.updateQuotationOrder(sc.data.quotationOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    sc.data.quotationOrder.products.splice(index, 1);
                    
                    /**
                     * Ищем и удаляем связанные элементы
                     */
                    for(var i=0; i<sc.data.quotationOrder.elements.length; i++){
                        console.log(sc.data.quotationOrder.elements[i].description, ('Для '+item.product.name),"");
                        if(sc.data.quotationOrder.elements[i].description===('Для '+item.product.name)) {
                            sc.removeElement(sc.data.quotationOrder.elements[i], i);
                        }
                    }
                    
                    funcFactory.showNotification("Удача", "Удалил товар", true);
                } else {
                    funcFactory.showNotification("Неудача", 'Не удалось удалить товар');
                }
            });
        };

        /**
         * Открываем модальное окно, чтобы заменить товар в Комплектации на другой
         * Opens modal window with ability to change product of Product item.
         * @param p - product
         */
        sc.changeProductModal = function(p){
            var modalInstance = $uibModal.open({
                templateUrl: 'eqoModal.tmpl.html',
                controller: 'EqoModalInstanceCtrl',
                windowClass: 'eqo-centred-modal',
                resolve: {
                    product : p.product,
                    config: {}
                }
            });

            modalInstance.result.then(function (selectedProduct) {
                sc.saveProductChange({id: p.id, quantity: p.quantity, product_id: (selectedProduct._id || selectedProduct.id)});
            });
        };

        
        
        
        
        /**
         * Will find dependencies into collection by property
         * @param collection - collection where to search
         * @param byProp - String: path of properties for $parser
         * @param propValue - Object: value to compare with
         * @param compareFunc - function that calls to compare values of properties should return Bool
         * @param resultFunc - function that calls every time when, equal values are found
         * @param resultFuncConfig - Object: configuration that will be passed into resultFunc
         */
        function findDependencies(collection, byProp, propValue, compareFunc, resultFunc, resultFuncConfig){
            
            var propParser = $parse(byProp),
                cfunc = compareFunc || function(a,b){
                    return a === b;
                };
            collection.map(function(item, index){
                var p;
                try{
                    p = propParser(item);
                }catch(err){
                    console.warn(err.message);
                }
                cfunc(p, propValue, item) && resultFunc(item, index, resultFuncConfig);
            });
        }

        /**
         * Remove deleted dependencies if they selected into <select>
         * @param item - Object: item of collection
         * @param config - Object
         */
        function removeDeletedDeps(item, index, config){
            item[config] = null;
        }

        sc.highlight = function(dataProp, byProp, propValue){
            var highlight = (byProp && propValue) != undefined,
                c = highlight ? [byProp, propValue] : ["highlight", true];

            findDependencies(sc.data.quotationOrder[dataProp], c[0], c[1], null, function(row){
                row.highlight = highlight;
            });
        };

        sc.hideIndependentRows = function(item, dataProp, byProp, propValue, collectionProp){
            var hide = !item.hideIndependentRows,
                c = hide ? [byProp, propValue] : ["hidden", false];

            hide && sc.data.quotationOrder[collectionProp].map(function(item){
                 if(item.hideIndependentRows) item.hideIndependentRows = false;
            });

            item.hideIndependentRows = hide;

            findDependencies(sc.data.quotationOrder[dataProp], c[0], c[1], function(a, b, dep){
                var result = (a !== b);
                if(!result && hide) dep.hidden = false;
                return result;

            }, function(row){
                row.hidden = hide;
            });
        };

    }]).controller("EqoModalInstanceCtrl", ['$scope', '$uibModalInstance', 'serverApi', 'product', 'config', function($scope, $uibModalInstance, serverApi, product, config){
        var sc = $scope;

        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        sc.data = {
            selectedProduct: product,
            productsList: []
        };
        sc.config = angular.extend({
            title: 'Изменить товар',
            btnOkText: 'Изменить',
            btnCancelText: 'Отмена'
        }, config);

        sc.ok = function () {
            $uibModalInstance.close(sc.data.selectedProduct);
        };

        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);
}());