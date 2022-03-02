import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatrixComponent, MatrixModule } from 'projects/matrix/src/public-api';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    MatrixModule,
  ],
  entryComponents: [
    MatrixComponent
  ]
})
export class AppModule {
  constructor(private injector: Injector) { }

  ngDoBootstrap() {
    const el = createCustomElement(
      MatrixComponent,
      {
        injector: this.injector
      }
    );
    customElements.define('trustie-component', el);
  }
 }
