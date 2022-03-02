import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {MatrixContactInterface} from "../lib/matrix.interface";
// @ts-ignore

@Component({
  selector: 'trst-contact',
  templateUrl: './contact.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  @Input() contacts = [];
  // @ts-ignore
  @Input() component : MatrixContactInterface;

  constructor() {

  }

  ngOnInit(): void {

  }

}
