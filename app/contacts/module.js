angular.module('app.contacts', ['ui.router']).config($stateProvider => {
    $stateProvider.state('app.contacts', {
        url: '/contacts?q',
        data:{
            title: 'Контакты',
            access:{
                action:'index',
                params:'Contact'
            }
        },
        views:{
            "content@app": {
                template: '<contacts query="$resolve.query"></contacts>',
                resolve: {query: ['$stateParams', $stateParams => $stateParams.q]}
            }
        }
    }).state('app.contacts.view', {
        url: '/:id',
        data:{
            title: 'Просмотр контакта',
            access:{
                action:'read',
                params:'Contact'
            }
        },
        views:{
            "content@app":{
                template: '<view-contact contact-id="$resolve.contactId"></view-contact>',
                resolve: {contactId: ['$stateParams', $stateParams => $stateParams.id]}
            }
        }
    });
});
