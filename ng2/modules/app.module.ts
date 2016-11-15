import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { upgradeAdapter } from './upgrade-adapter.module';

import { AppComponent }         from '../components/app/app.component';
import { CatalogListComponent } from '../components/catalog-list/catalog-list.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    CatalogListComponent,
    upgradeAdapter.upgradeNg1Component('catalogues')
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule {}
