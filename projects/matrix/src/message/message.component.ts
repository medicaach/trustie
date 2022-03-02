import {Component, Input, OnInit} from '@angular/core';


@Component({
  selector: 'trst-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {

  // @ts-ignore
  @Input() event;
  constructor() { }

  ngOnInit(): void {
  }

}
