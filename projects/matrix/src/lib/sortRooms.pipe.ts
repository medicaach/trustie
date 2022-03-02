import {Pipe, PipeTransform} from '@angular/core';
import {Room} from "matrix-js-sdk";

@Pipe({name: 'sortRooms'})
export class SortRoomsPipe implements PipeTransform {
  // The pipe's transform method take first Argurment is the data using that
  // pipe( which is data before the '|' mark in the template), the others
  // parameter is optional

  // Your sort logic is in here
  transform(input: Array<Room>, filter) {
    return input
      .sort((a, b) => a['name'].localeCompare(b['name']))
      .filter(function (room) {
        if (!filter) {
          return true;
        }
        return room['name'].toLocaleLowerCase().includes(filter.toLocaleLowerCase());
      });
  }
}
