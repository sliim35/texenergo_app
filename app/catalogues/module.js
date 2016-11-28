angular.module('app.catalogues', ['ui.router']).config($stateProvider => {
    $stateProvider.state('app.catalogues', {
        url: '/catalogues?q',
        data:{
            title: 'Категории товаров',
            access:{
                action:'index',
                params:'Catalogue'
            }
        },
        params:{
          q:''
        },
        views:{
            "content@app": {
                template: '<catalogues search-query="$resolve.searchQuery"></catalogues>',
                resolve: {searchQuery: ['$stateParams', $stateParams => $stateParams.q]}
            }
        }
    }).state('app.catalogues.view', {
        url: '/:id',
        data:{
            access:{
                action:'read',
                params:'Catalogue'
            }
        },
        views:{
            "content@app":{
                controller: 'ViewCatalogueCtrl',
                templateUrl: '/app/catalogues/views/viewCatalogue.html'
            }
        }
    }).state('app.catalogues.view.edit', {
        url: '/edit',
        data:{
            title:'Редактирование категории',
            access:{
                action:'edit',
                params:'Catalogue'
            }
        },
        views:{
            "content@app":{
                controller: 'EditCatalogueCtrl',
                templateUrl: '/app/catalogues/views/editCatalogue.html'
            }
        }
    });
});
