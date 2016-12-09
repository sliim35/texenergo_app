class PartnersCtrl {
    constructor($state, $stateParams, serverApi, funcFactory, $parse) {
        this.$parse = $parse;
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;

        this.visual = {
            navButtsOptions: [
                {type: 'new', callback: () => $('#createPartnerModal').modal('show')}
            ],
            navTableButts: [
                {type: 'view', callback: data => $state.go('app.partners.view', {id: data.id || data._id})},
                {type: 'remove'}
            ],
            titles: ['Партнёры']
        };

        this.data = {partnersList: [], searchQuery: $stateParams.q};
        this.newPartnerData = {inn: '', name: '', delivery_address: '', phone: '', email: ''};
    }

    addNewPartner() {
        let self = this;

        this.serverApi.createPartner(this.newPartnerData, result => {
            if(!result.data.errors){
                self.data.partnersList.unshift(result.data);
                self.funcFactory.showNotification('Партнёр успешно добавлен', '', true);
                self.clearNewPartnerData();
            } else {
                self.funcFactory.showNotification('Не удалось создать партнёра', result.data.errors);
            }
        });
    }

    getDaDataSuggestions(type, value, fieldName) {
        let self = this;

        return this.serverApi.validateViaDaData(type, {query: value}).then(result => {
            return result.data.suggestions.map(item => {
                return {label: self.$parse(fieldName)(item) || value, item: item, field: fieldName};
            });
        });
    }

    fillBySuggestion($item, prop) {
        let data = $item.item.data,
            addr = this.newPartnerData[prop];

        switch ($item.field){
            case 'data.postal_code': {
                addr.postal_index =  data.postal_code;
                addr.region = data.region_with_type;
                addr.city = (data.city || data.settlement_with_type);
                addr.street = data.street;
                addr.house = data.house;
                break;
            }
            case 'data.city' : {
                addr.postal_index =  data.postal_code;
                addr.region =  data.region_with_type;
                addr.city = (data.city || data.settlement_with_type);
                addr.street = data.street;
                addr.house = data.house;
                break;
            }
            case 'data.street' : {
                addr.postal_index =  data.postal_code;
                addr.region =  data.region_with_type;
                addr.city = (data.city || data.settlement_with_type);
                addr.street = data.street;
                addr.house = data.house;
                break;
            }
            case 'data.inn' : {
                this.newPartnerData.inn = data.inn;
                this.newPartnerData.kpp = (data.kpp || '0');
                this.newPartnerData.legal_name = data.name.short_with_opf;
                this.newPartnerData.name = (data.name.short || data.name.short);

                if(data.management !== undefined) {
                    this.newPartnerData.ceo_name = data.management.name;
                    this.newPartnerData.ceo_title = data.management.post;
                }

                if((data.address.data !== null) && (data.address.data !== undefined)) {
                    let address = {
                        postal_index: data.address.data.postal_code,
                        region: data.address.data.region_with_type,
                        city: (data.address.data.city || data.address.data.settlement_with_type),
                        street: data.address.data.street_with_type,
                        house: data.address.data.house
                    };

                    this.newPartnerData.legal_address = address;
                    this.newPartnerData.delivery_address = address;
                }
                break;
            }
            default:  break;
        }
    }

    clearNewPartnerData() {
        this.newPartnerData = {inn: '', name: '', delivery_address: '', phone: ''};
    }

    onAddFile() {
        //this.parentNode.nextSibling.value = this.value;
    }
}

PartnersCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory', '$parse'];
angular.module('app.partners').controller('PartnersCtrl', PartnersCtrl);
