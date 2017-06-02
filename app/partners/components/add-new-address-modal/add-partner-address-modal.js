class AddPartnerAddressModalCtrl{
  constructor(serverApi, $uibModalInstance, $parse, config){
    this.serverApi = serverApi;
    this.$uibModalInstance = $uibModalInstance;
    this.$parse = $parse;
    this.config = config;

    this.cancel = $uibModalInstance.dismiss;
    this.address = {};
    this.selectedDellin = null;
    this.activeTab = 0; // def tab is Address
    this.dellinTerminalsList = [];
  }

  getDaDataSuggestions(type, value, fieldName) {
    let self = this;

    return this.serverApi.validateViaDaData(type, {query: value}).then(result => {
        return result.data.suggestions.map(item => {
            return {label: self.$parse(fieldName)(item) || value, item: item, field: fieldName};
        });
    });
  }

  fillAddressBySuggestion(daDataResponse, addr_item) {
    let data = daDataResponse.item.data;
    let addr = (addr_item === undefined) ? this.address : addr_item; // Default to newAddress

    addr.postal_index =  data.postal_code;
    addr.region = data.region_with_type;
    addr.city = (data.city || data.settlement_with_type);
    addr.street_kladr_id = data.street_kladr_id;
    addr.street = data.street_with_type;
    addr.house = data.house;
  }

  loadDellinTerminals(isOpen){
    let self = this;

    if(isOpen && !this.dellinTerminalsList.length){
      this.dellinTerminalsList = [];
      this.serverApi.getDellinTerminals(self.config.partnerId, r => {

        r.data.forEach( city => {
            city.terminals.forEach(terminal => {
                terminal.dellin_terminal = terminal.id;
                self.dellinTerminalsList.push(terminal);
            });
        });
      });
    }
  }

  saveAddress(){
    this.$uibModalInstance
    .close((this.activeTab ? this.selectedDellin : this.address));
  }
}

AddPartnerAddressModalCtrl.$inject = [
  'serverApi',
  '$uibModalInstance',
  '$parse',
  'config'
];

angular.module('app.partners')
.controller('AddPartnerAddressModalCtrl', AddPartnerAddressModalCtrl);
