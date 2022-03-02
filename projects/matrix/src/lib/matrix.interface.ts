export interface MatrixContactInterface {

  get search(): string;
  set search(value:string);


  get activeRoom();

  changeRoom(room);

  getRoomMembers(room);


}
