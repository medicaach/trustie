import { NgModule } from '@angular/core';
import { MatrixComponent } from './matrix.component';
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import {SortRoomsPipe} from "./sortRooms.pipe";
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { LoginComponent } from '../login/login.component';
import { ChatComponent } from '../chat/chat.component';
import { SettingsComponent } from '../settings/settings.component';
import { ContactComponent } from '../contact/contact.component';
import {FaIconLibrary, FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { fas } from '@fortawesome/free-solid-svg-icons';
import { MessageComponent } from '../message/message.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    MatrixComponent,
    SortRoomsPipe,
    LoginComponent,
    ChatComponent,
    SettingsComponent,
    ContactComponent,
    MessageComponent
  ],
  providers: [
    SortRoomsPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ZXingScannerModule,
    BrowserAnimationsModule,
    FontAwesomeModule
  ],
  exports: [
    MatrixComponent
  ]
})
export class MatrixModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
