/**
 * Created by Egor Lobanov on 04.10.16.
 */
(function(){
    var module = angular.module('app.api', []);
    /**
     * Service send requests to server and return response into callback function
     */
    module.service('serverApi', [ '$http', function($http){
        var o =  this;
        //get data of two dashboard tables
        o.getDashboard = function(success, fail){
            $http.get('/back/dashboard').then(success, fail);
        };

        //get current list of searched data
        o.getSearch = function(page, query, config, success, fail){
            var encoded = encodeURIComponent(query);

            var key = 'term='+encoded+'&$skip='+page+'&$top=25';
            if (window.search_results !== undefined && window.search_results[key] !== undefined) return success(window.search_results[key]);

            $http.get('/products/search?term='+encoded+'&$skip='+(page*25)+'&$top=25', config || null).then(r => {
                if(!window.search_results) window.search_results = {};
                window.search_results[key] = r;
                success(r);
            }, fail);

            // $http.get('/products/search?term='+encoded+'&$skip='+(page*25)+'&$top=25', config || null).then(success, fail);
        };

        o.getSubSearch = function(query, config, success, fail){
            $http.get('/products/set_functor?term=' + query, config || null).then(success, fail);
        };
        o.getSearchFunctor = function(name, props, success, fail){
            $http.get('/products/search_functor?functor=' + name + props).then(success, fail);
        };

        // get product info
        o.getProduct = function(productId, success, fail){
            $http.get('/products/' + productId).then(success, fail);
        };
        o.updateProduct = function(productId, data, success, fail){
            $http.put('/products/' + productId, data).then(success, fail);
        };
        o.deleteProduct = function(productId, success, fail) {
            $http.delete('/products/' + productId).then(success, fail);
        };

        //Customer Orders
        o.getCustomerOrders = (page, query, config, success, fail, partner_id) => {
            let path = '/customer_orders?page='+page + (query ? ('&q=' + query) : '') + (partner_id ? ('&partner_id=' + partner_id) : '');
            let promise = $http.get(path, config);

            promise.then(success, fail);

            return promise;
        };
        o.createCustomerOrder = (data, success, fail) => {
            $http.post('/customer_orders', data).then(success, fail);
        };
        o.deleteCustomerOrder = (order_id, success, fail) => {
            $http.delete('/customer_orders/' + order_id).then(success, fail)
        };
        o.getCustomerOrderDetails = (id) => {
          return $http.get('/customer_orders/' + id);
        };
        o.updateCustomerOrder = (id, data, success, fail) => {
            $http.put('/customer_orders/' + id, data).then(success, fail);
        };
        o.addCustomerOrderProduct = (id, data, success, fail) =>{
            $http.post('/customer_orders/' + id + '/customer_order_contents', data).then(success, fail);
        };
        o.updateCustomerOrderProduct = (order_id, row_id, data, success, fail) => {
            $http.put('/customer_orders/' + order_id + '/customer_order_contents/' + row_id, data).then(success, fail);
        };
        o.removeCustomerOrderProduct = (order_id, row_id, success, fail) => {
            $http.delete('/customer_orders/' + order_id + '/customer_order_contents/' + row_id).then(success);
        };
        o.getCustomerOrderLogs = (id, success, fail) => {
            $http.get('/customer_orders/' + id + '/logs').then(success, fail);
        };
        o.sendCustomerOrderInvoice = (id, data, success, fail) => {
            $http.put('/customer_orders/' + id + '/send_invoice', data)
            .then(success, fail);
        };
        o.recalculateCustomerOrder = (id, success, fail) => {
            $http.get('/customer_orders/' + id + '/recalculate').then(success, fail);
        };
        o.updateStatusCustomerOrder = (id, data, success, fail) => {
            $http.put('/customer_orders/' + id + '/update_status', data).then(success, fail);
        };
        o.updateCommandCustomerOrder = (id, data, success, fail) => {
            $http.put('/customer_orders/' + id + '/update_command', data).then(success, fail);
        };
        o.getRelatedOrdersOfCustomer = (id, success, fail) => {
            $http.get('/customer_orders/' + id + '/trace').then(success, fail);
        };

        // Quotataion Orders
        o.getQuotationOrders = function(page, query, config, success, fail){
            var path = '/quotation_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createQuotationOrder = function(data, success, fail){
            $http.post('/quotation_orders/', data).then(success, fail);
        };
        o.deleteQuotationOrder = function(id, success, fail){
            $http.delete('/quotation_orders/'+id).then(success, fail);
        };
        o.getQuotationOrderDetails = function(id, success, fail){
            $http.get('/quotation_orders/' + id).then(success, fail);
        };
        o.updateQuotationOrder = function(id, data, success, fail){
            $http.put('/quotation_orders/' + id, data).then(success, fail);
        };
        o.recalculateQuotationOrder = (id, success, fail) => {
            $http.get('/quotation_orders/' + id + '/recalculate').then(success, fail);
        };
        o.addQuotationOrderProduct = (id, data, success, fail) =>{
            $http.post('/quotation_orders/' + id + '/quotation_order_contents', data).then(success, fail);
        };
        o.updateQuotationOrderContent = function(quotation_order_id, content_id, data, success, fail){
            $http.put('/quotation_orders/' + quotation_order_id + '/quotation_order_contents/' + content_id, data).then(success, fail);
        };
        o.removeQuotationOrderContent = function(quotation_order_id, content_id, success, fail){
            $http.delete('/quotation_orders/' + quotation_order_id +'/quotation_order_contents/' + content_id).then(success);
        };
        o.sendQuotationOrderRFQ = function(id, success, fail){
            $http.put('/quotation_orders/' + id + '/send_rfq').then(success, fail);
        };
        o.updateStatusQuotationOrder = function(id, data, success, fail){
            $http.put('/quotation_orders/' + id + '/update_status', data).then(success, fail);
        };

        // Supplier Orders
        o.getSupplierOrders = function(page, query, config, success, fail){
            var path = '/supplier_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createSupplierOrder = function(data, success, fail){
            $http.post('/supplier_orders', data).then(success, fail);
        };
        o.deleteSupplierOrder = function(id, success, fail){
            $http.delete('/supplier_orders/'+id).then(success, fail);
        };
        o.getSupplierOrderDetails = function(id, success, fail){
            $http.get('/supplier_orders/' + id).then(success, fail);
        };
        o.updateSupplierOrder = function(id, data, success, fail){
            $http.put('/supplier_orders/' + id, data).then(success, fail);
        };
        o.sendSupplierOrderRFQ = function(id, success, fail){
            $http.put('/supplier_orders/' + id + '/send_rfq').then(success, fail);
        };

        o.addSupplierOrderProduct = function(id, data, success, fail){
            $http.post('/supplier_orders/'+id+'/supplier_order_contents', data).then(success, fail);
        };
        o.updateSupplierOrderProduct = function(order_id, product_id, data, success, fail){
            $http.put('/supplier_orders/'+order_id+'/supplier_order_contents/' + product_id, data).then(success, fail);
        };
        o.removeSupplierOrderProduct = function(order_id, product_id, success, fail){
            $http.delete('/supplier_orders/'+order_id+'/supplier_order_contents/' + product_id).then(success);
        };
        o.automaticallyCreateSupplierOrders = function(success, fail){
            $http.post('/supplier_orders/mass_make').then(success, fail);
        };
        o.updateStatusSupplierOrder = function(id, data, success, fail){
            $http.put('/supplier_orders/' + id + '/update_status', data).then(success, fail);
        };

        // Products' catalogues
        o.getCatalogues = function(page, query, config, success, fail){
            var path = '/catalogues?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getCatalogueDetails = function(id, success, fail){
            $http.get('/catalogues/' + id).then(success, fail);
        };
        o.updateCatalogue = function(id, data, success, fail){
            $http.put('/catalogues/' + id, data).then(success, fail);
        };
        o.deleteCatalogue = function(id, success, fail){
            $http.delete('/catalogues/' + id).then(success, fail)
        };

        // Manufacturers
        o.getManufacturers = function(page, query, config, success, fail){
            var path = '/manufacturers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getManufacturerDetails = function(id, success, fail){
            $http.get('/manufacturers/' + id).then(success, fail);
        };
        o.updateManufacturer = function(id, data, success, fail){
            $http.put('/manufacturers/' + id, data).then(success, fail);
        };
        o.deleteManufacturer = function(id, success, fail){
            $http.delete('/manufacturers/' + id).then(success, fail)
        };

        // PDF Catalogues
        o.getPdfCatalogues = function(page,query, config, success, fail){
            var path = '/pdf_catalogues?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getPdfCatalogueDetails = function(id, success, fail){
            $http.get('/pdf_catalogues/' + id).then(success, fail);
        };
        o.updatePdfCatalogue = function(id, data, success, fail){
            $http.put('/pdf_catalogues/' + id, data).then(success, fail);
        };
        o.deletePdfCatalogue = function(id, success, fail){
            $http.delete('/pdf_catalogues/' + id).then(success, fail);
        };
        o.createPdfCatalogueProduct = function (pdf_catalogue_id, data, success, fail) {
            $http.post('/pdf_catalogues/' + pdf_catalogue_id + '/products/', data).then(success, fail);
        }
        o.deletePdfCatalogueProduct = function (pdf_catalogue_id, product_id, success, fail) {
            $http.delete('/pdf_catalogues/' + pdf_catalogue_id + '/products/' + product_id).then(success, fail);
        }

        // Входящие платежи
        o.getIncomingTransferLogs = function(id, success, fail){
            $http.get('/incoming_transfers/' + id + '/logs').then(success, fail);
        };

        // Входящие письма
        o.getIncomingEmails = function(page, query, config, success, fail){
          let path = '/incoming_emails';

          config.params = getLazyListQueryParams(config, page, query);

          $http.get(path, config).then(success, fail);
        };
        o.getIncomingEmailDetails = function(id, success, fail){
            $http.get('/incoming_emails/' + id).then(success, fail);
        };
        o.deleteIncomingEmail = function(id, success, fail){
            $http.delete('/incoming_emails/' + id).then(success, fail);
        };
        o.updateIncomingEmail = (incomingEmailId, data, success, fail) => {
            $http.put('/incoming_emails/' + incomingEmailId, data).then(success, fail);
        };
        o.createIncomingEmailResponse = (emailId, data, success, fail) => {
            $http.post('/incoming_emails/' + emailId + '/reply', data).then(success, fail);
        }

        // Исходящие платежи
        o.getOutgoingTransfers = function(page, query, config, success, fail, partner_id){
            var path = '/outgoing_transfers?page='+page + (query ? ('&q=' + query) : '') + (partner_id ? ('&partner_id=' + partner_id) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createOutgoingTransfer = function(data, success, fail){
            $http.post('/outgoing_transfers', data).then(success, fail);
        };
        o.getOutgoingTransferDetails = function(id, success, fail){
            $http.get('/outgoing_transfers/' + id).then(success, fail);
        };
        o.appendOutgoingTransferOrder = function(outgoing_transfer_id, data, success, fail){
            $http.post('/outgoing_transfers/'+outgoing_transfer_id+'/outgoing_money_distributions', data).then(success, fail);
        };
        o.removeOutgoingTransferOrder = function(outgoing_transfer_id, order_id, success, fail){
            $http.delete('/outgoing_transfers/'+outgoing_transfer_id+'/outgoing_money_distributions/' + order_id).then(success, fail);
        };
        o.deleteOutgoingTransfer = function(transfer_id, success, fail){
            $http.delete('/outgoing_transfers/' + transfer_id).then(success, fail);
        };

        // Партнёры
        o.getPartners = (page, query, config, success, fail) => {
            var path = '/partners?page=' + page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getPartnerDetails = (partner_id, success, fail) => {
            $http.get('/partners/' + partner_id).then(success, fail);
        };
        o.updatePartner = (partner_id, data, success, fail) => {
            $http.put('/partners/' + partner_id, data).then(success, fail);
        };
        o.createPartner = (data, success, fail) => {
            $http.post('/partners/', data).then(success, fail);
        };
        o.getPartnerLogs = (partner_id, success, fail) => {
            $http.get('/partners/' + partner_id + '/logs').then(success, fail);
        };
        o.getDellinTerminals = (partner_id, success, fail) => {
            $http.get('/partners/' + partner_id + '/dellin_terminals').then(success, fail);
        }

        // Представители партнёра
        o.createPerson = function(partner_id, data, success, fail, config){
            $http.post('/partners/' + partner_id + '/people', data, config).then(success, fail);
        };
        o.sendPersonFile = function(partner_id, person_id, data, success, fail){
            $http.put('/partners/'+partner_id+'/people/' + person_id, data, {
                transformRequest: angular.identity,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(success, fail);
        };

        o.createBankAccount = function(partner_id, data, success, fail){
            $http.post('/partners/' + partner_id + '/bank_accounts', data).then(success, fail);
        };

        o.updateBankAccount = function(partner_id, bank_account_id, data, success, fail){
            $http.put('/partners/' + partner_id + '/bank_accounts/' + bank_account_id, data).then(success, fail);
        };

        o.createAddress = function(partner_id, data, success, fail){
            $http.post('/partners/' + partner_id + '/addresses/', data).then(success, fail);
        };

        o.updateAddress = function(partner_id, address_id, data, success, fail){
            $http.put('/partners/' + partner_id + '/addresses/' + address_id, data).then(success, fail);
        };

        // Контакты
        o.getContacts = function(page, query, config, success, fail){
            var path = '/contacts?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createContact = function(data, success, fail){
            $http.post('/contacts', data).then(success, fail);
        };
        o.getContactDetails = function(id, success, fail){
            $http.get('/contacts/' + id).then(success, fail);
        };
        o.updateContact = function(id, data, success, fail){
            $http.put('/contacts/' + id, data).then(success, fail);
        };
        o.generateApiTokenContact = function(id, data, success, fail){
            $http.put('/contacts/' + id + '/generate_api_token').then(success, fail);
        };

        // DispatchOrder
        o.getDispatchOrders = function(page, query, config, success, fail){
          let path = '/dispatch_orders',
              promise;
          config.params = getLazyListQueryParams(config, page, query);

          promise = $http.get(path, config);
          promise.then(success, fail);

          return promise;
        };
        o.createDispatchOrder = function(data, success, fail){
            $http.post('/dispatch_orders', data).then(success, fail);
        };
        o.getDispatchOrderDetails = function(id, success, fail){
            $http.get('/dispatch_orders/' + id).then(success, fail);
        };
        o.sendDispatchOrderPdf = (id, data, success, fail) => {
            $http.put('/dispatch_orders/' + id + '/send_pdf', data)
            .then(success, fail);
        };
        o.updateDispatchOrder = function(id, data, success, fail){
            $http.put('/dispatch_orders/' + id, data).then(success, fail);
        };
        o.deleteDispatchOrder = function(dispatch_order_id, success, fail){
            $http.delete('/dispatch_orders/' + dispatch_order_id).then(success, fail);
        };
        o.updateStatusDispatchOrder = function(id, data, success, fail){
            $http.put('/dispatch_orders/' + id + '/update_status', data).then(success, fail);
        };
        o.getDispatchOrderLogs = function(id, success, fail){
            $http.get('/dispatch_orders/' + id + '/logs').then(success, fail);
        };
        o.getDispatchableProducts = function(success, fail){
            $http.get('/customer_orders/can_dispatch').then(success, fail);
        };
        o.createDispatchOrderContent = function(dispatch_order_id, data, success, fail){
            $http.post('/dispatch_orders/'+dispatch_order_id+'/dispatch_order_contents', data).then(success, fail);
        };
        o.deleteDispatchOrderContent = function(dispatch_order_id, content_id, success, fail){
            $http.delete('/dispatch_orders/'+dispatch_order_id+'/dispatch_order_contents/' + content_id).then(success, fail);
        };

        // ReceiveOrder
        o.getReceiveOrders = function(page, query, config, success, fail, partner_id){
            var path = '/receive_orders?page='+page + (query ? ('&q=' + query) : '') + (partner_id ? ('&partner_id=' + partner_id) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createReceiveOrder = function(data, success, fail){
            $http.post('/receive_orders/', data).then(success, fail);
        };
        o.getReceiveOrderDetails = function(id, success, fail){
            $http.get('/receive_orders/' + id).then(success, fail);
        };
        o.updateReceiveOrder = function(id, data, success, fail){
            $http.put('/receive_orders/' + id, data).then(success, fail);
        };
        o.getUnreceivedProducts = function(receive_order_id, query, config, success, fail){
            $http.get('/receive_orders/'+receive_order_id+'/unreceived_products?q=' + query, config).then(success, fail);
        };
        o.createReceiveOrderContents = function(receive_order_id, data, success, fail){
            $http.post('/receive_orders/'+receive_order_id+'/product_order_contents', data).then(success, fail);
        };
        o.updateReceiveOrderContents = function(receive_order_id, content_id, data, success, fail){
            $http.put('/receive_orders/'+receive_order_id+'/product_order_contents/'+content_id, data).then(success, fail);
        };
        o.deleteReceiveOrderContents = function(receive_order_id, content_id, success, fail){
            $http.delete('/receive_orders/'+receive_order_id+'/product_order_contents/' + content_id).then(success, fail)
        };
        o.deleteReceiveOrder = function(receive_order_id, success, fail){
            $http.delete('/receive_orders/' + receive_order_id).then(success, fail);
        };
        o.getReceiveOrderLogs = function(id, success, fail){
            $http.get('/receive_orders/' + id + '/logs').then(success, fail);
        };


        //Files
        o.deleteFile = function(view, view_id, file_id, success, fail){
            $http.delete('/'+view+'/'+view_id+'/documents/' + file_id).then(success, fail);
        };
        o.deleteImage = function(view, view_id, file_id, success, fail){
            $http.delete('/'+view+'/'+view_id+'/image').then(success, fail);
        };

        o.signIn = function(data, success, fail){
            $http.post('/users/sign_in', data).then(success, fail);
        };
        o.resetPassword = function(data, success, fail){
            $http.post('/users/password', data).then(success, fail);
        };

        // Logs
        o.getSearchLogs = function(page, query, config, success, fail){
            var path = '/logs/search?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getParseLogs = function(page, query, config, success, fail){
            var path = '/logs/parse?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };

        // Чего тут у нас производство производит
        o.getAssemblyOrders = (page, query, config, success, fail) => {
            var path = '/assembly_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        }
        o.getAssemblyOrderToAssemble = (success, fail) => {
            $http.get('/assembly_orders/to_assemble').then(success, fail);
        }
        o.createAssemblyOrder = (data, success, fail) => {
            $http.post('/assembly_orders/', data).then(success, fail);
        };
        o.deleteAssemblyOrder = (assembly_order_id, success, fail) => {
            $http.delete('/assembly_orders/' + assembly_order_id).then(success, fail);
        };
        o.getAssemblyOrderDetails = (assembly_order_id, success, fail) => {
            $http.get('/assembly_orders/' + assembly_order_id).then(success, fail);
        };
        o.updateAssemblyOrder = function(assembly_order_id, data, success, fail){
            $http.put('/assembly_orders/' + assembly_order_id, data).then(success, fail);
        };
        o.updateStatusAssemblyOrder = (id, data, success, fail) => {
            $http.put('/assembly_orders/' + id + '/update_status', data).then(success, fail);
        };
        o.getInStockProducts = (success, fail) => {
            $http.get('/assembly_orders/in_stock').then(success, fail);
        };
        o.createAssemblyOrderContent = (assembly_order_id, data, success, fail) => {
            $http.post('/assembly_orders/' + assembly_order_id + '/assembly_order_contents', data).then(success, fail);
        };
        o.updateAssemblyOrderContent = function(assembly_order_id, content_id, data, success, fail){
            $http.put('/assembly_orders/' + assembly_order_id + '/assembly_order_contents/' + content_id, data).then(success, fail)
        };
        o.deleteAssemblyOrderContent = function(assembly_order_id, content_id, success, fail){
            $http.delete('/assembly_orders/' + assembly_order_id + '/assembly_order_contents/' + content_id).then(success, fail)
        };



        o.validateViaDaData = function(type, data){
            var url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/' + type;
            return $http.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept' : 'application/json',
                    'Authorization' : 'Token b9d1af0994c10d361ed1a354b0536f4f18ea099f'
                },
                withCredentials: false
            });
        }

        /**
        * @description Getting parameters for lazy-list query
        * @param {Object} config http config
        * @return {Object} params for config
        */
        let getLazyListQueryParams = (config, page, query) => {
          let params = {},
              additionalParams = config.additionalParams;

          params.page = page;
          if(query) params.q = query;

          if(additionalParams){
            for(let param in additionalParams){
              params[param] = additionalParams[param];
            }
          }

          return params;
        }
    }]);
}());
