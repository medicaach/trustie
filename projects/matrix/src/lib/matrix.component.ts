import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatrixService} from './matrix.service';
import {createNewMatrixCall} from "matrix-js-sdk";
import {Room, User} from "matrix-js-sdk";
import {Preset} from 'matrix-js-sdk/lib/@types/partials';
import {CallErrorCode, CallState, MatrixCall} from 'matrix-js-sdk/lib/webrtc/call';
import anime from 'animejs/lib/anime.es.js';
import {HttpParams} from "@angular/common/http";
import {faPeopleArrows} from '@fortawesome/free-solid-svg-icons';
import {MatrixContactInterface} from "./matrix.interface";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ZXingScannerComponent} from "@zxing/ngx-scanner";

// @ts-ignore
window.Lame = require("lamejs/src/js/Lame");
// @ts-ignore
window.Presets = require("lamejs/src/js/Presets");
// @ts-ignore
window.GainAnalysis = require("lamejs/src/js/GainAnalysis");
// @ts-ignore
window.QuantizePVT = require("lamejs/src/js/QuantizePVT");
// @ts-ignore
window.Quantize = require("lamejs/src/js/Quantize");
// @ts-ignore
window.Reservoir = require("lamejs/src/js/Reservoir");
// @ts-ignore
window.Takehiro = require("lamejs/src/js/Takehiro");
// @ts-ignore
window.MPEGMode = require("lamejs/src/js/MPEGMode");
// @ts-ignore
window.BitStream = require("lamejs/src/js/BitStream");

const MicRecorder = require('mic-recorder-to-mp3');

@Component({
  selector: 'trst-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss', '../assets/styles/styles.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({opacity: 0}),
        animate(1000, style({opacity: 1}))
      ]),
      transition('* => void', [
        animate(1000, style({opacity: 0}))
      ])
    ]),
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [
        style({opacity: 0}),
        animate('300ms', style({opacity: 1})),
      ]),
      transition(':leave', [
        animate('300ms', style({opacity: 0}))
      ])
    ]),
  ]
})
export class MatrixComponent implements OnInit, MatrixContactInterface {
  public message: string = ""
  loggedIn: boolean = false;
  username: string;
  password: string;
  search: string = "";
  ready: any = false;
  loading: Boolean = false;
  public recordtime: number = 0;
  settingsOpen: boolean = false;
  wrongLogin: boolean = false;
  faPeopleArrows: any = faPeopleArrows;
  menuOpen: boolean = false;
  recorder = new MicRecorder({
    bitRate: 128
  });

  public matrixCall: MatrixCall;
  public isRecording: boolean = false;
  @ViewChild('FileSelectInputDialog') FileSelectInputDialog: ElementRef;
  contactsOpen: any = false;
  contactRegex = /\@[a-z_\.]+:[a-z-_\.]+\.[a-z]+/i;
  qrOpen: any = false;
  serverLogin: any = false;
  dataagreementvisible: boolean = false;
  ROOM_CRYPTO_CONFIG = {algorithm: 'm.megolm.v1.aes-sha2'};
  @ViewChild('chatWindow') private chatWindow: ElementRef;
  @ViewChild('remote') private remote: ElementRef;
  @ViewChild('local') private local: ElementRef;
  @ViewChild('plane') private plane: ElementRef;
  @ViewChild('loginWindow') private loginWindow: ElementRef;
  public hidden: boolean = false;
  public availableCameras: MediaDeviceInfo[] = [];

  public selectedCamera: MediaDeviceInfo = null;
  @ViewChild('scanner', {static: true}) scanner: ZXingScannerComponent;



  constructor(public mx: MatrixService, private host: ElementRef) {
    this.host.nativeElement.sendTextMessage = this.sendTextMessage.bind(this);
    this.host.nativeElement.show = this.show.bind(this);
    this.host.nativeElement.hide = this.hide.bind(this);
    let homeserver = this.host.nativeElement.attributes.getNamedItem('homeserver')?.value;
    if (homeserver) {
      this.homeserver = homeserver;
      this.mx.HOMESERVERURL = homeserver;
    }

  }

  private _homeserver: string = "Hello World!";
  enabledScanner: any = false;

  @Input()
  get homeserver(): string {
    return this._homeserver;
  }

  set homeserver(name: string) {
    this._homeserver = name;
    console.log(this._homeserver);
  }

  get activeRoom(): string {
    return localStorage.getItem('_activeRoom') || '!JdWNIzZqnjjEOrVGGB:immeditech.ch';
  }

  set activeRoom(value: string) {
    if (!value) {
      return;
    }
    localStorage.setItem('_activeRoom', value);
  }

  get fontSize(): number {
    return Number(localStorage.getItem('_fontSize') || '1');
  }

  set fontSize(value: number) {
    if (!value) {
      return;
    }
    localStorage.setItem('_fontSize', String(value));
  }

  public sendTextMessage(content: string) {
    this.message = content;
    this.sendMessage();
  }

  public hide() {
    this.hidden = true;
  }

  public show() {
    this.hidden = false;
  }

  public OpenAddFilesDialog() {
    const e: HTMLElement = this.FileSelectInputDialog.nativeElement;
    e.click();
  }

  ngAfterViewInit(): void {

    anime({
      targets: this.loginWindow.nativeElement,
      keyframes: [
        {opacity: 0, duration: 50},
        {opacity: 1, duration: 900}
      ],
      easing: 'easeInElastic(1, .6)'
    })

    let started = false;
    anime({
      targets: this.loginWindow.nativeElement.querySelector('.left-login'),
      keyframes: [
        {opacity: 0, duration: 50, translateX: 100, translateY: 0},
        {opacity: 0, duration: 50, translateX: 100, translateY: 0},
        {opacity: 1, duration: 300, translateX: 0, translateY: 0}
      ],
      delay: 100,
      easing: 'spring(1, 80, 10, 0)'
    })
  }

  getParamValueQueryString(paramName) {
    const url = window.location.href;
    let paramValue;
    if (url.includes('?')) {
      const httpParams = new HttpParams({fromString: url.split('?')[1].replace(/#.*/, '')});
      paramValue = httpParams.get(paramName);
    }
    return paramValue;
  }

  public ngGetAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      return navigator
        .mediaDevices
        .enumerateDevices()
        .then((devices: MediaDeviceInfo[]) => {
          if (!devices || !devices.length) {
            return null;
          }
          devices = devices.filter((device: MediaDeviceInfo) => device.kind === 'videoinput');

          if (!devices || !devices.length) {
            return null;
          }
          return devices;
        });
    } catch (exception) {
      return new Promise((resolve, reject) => {
        reject();
      });
    }
  }

  public ngGetDevicePermissions(): Promise<MediaStream> {
    return navigator
      .mediaDevices
      .getUserMedia({video: true});
  }



  ngOnInit(): void {
    this.ngGetAvailableDevices()
      .then(() => {
        return this.ngGetDevicePermissions();
      })
      .then((mediaStream: MediaStream) => {
        const mediaTracks = mediaStream.getTracks();
        for (const mediaTrack of mediaTracks) {
          mediaTrack.stop();
        }
      });

    const token = this.getParamValueQueryString('loginToken');
    this.mx.ready().subscribe(() => {
      if (window.localStorage.getItem("trustie_user") && window.localStorage.getItem("trustie_user") == "undefined") {
        window.localStorage.removeItem("trustie_user")
      }

      this.ready = true
      if (token && token.length > 5 && !window.localStorage.getItem("trustie_user")) {
        this.mx.client.loginWithToken(token, (err, data) => {
          window.localStorage.setItem("trustie_user", JSON.stringify(data));
          window.document.location.href = window.location.href.replace("?loginToken=" + token, '')
        })
      } else if (token && token.length > 5 && window.localStorage.getItem("trustie_user")) {
        window.document.location.href = window.location.href.replace("?loginToken=" + token, '')
      }

      if (window.localStorage.getItem("trustie_user")) {
        let user = JSON.parse(window.localStorage.getItem("trustie_user"));
        this.mx.authenticateClient(user['user_id'], user['access_token'], user['device_id']).subscribe({
          next: (res) => {
            console.log(res);
          },
          error: (err) => {
            console.log(err);
          },
          complete: () => {
            this.postLogin()
          }
        });
      }
    })
  }

  scrollToBottom(): void {
    try {
      if (!this.chatWindow.nativeElement) {
        return;
      }
      setTimeout(() => {
        this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight
        setTimeout(() => {
          this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight
          this.loading = false;
        }, 100)

      }, 15)
    } catch (err) {
    }
  }

  public startRinging() {
    if (this.matrixCall && this.matrixCall.state == 'ringing') {
      this.beep(100, 1000, 0.2, false, false, 0)
      this.beep(100, 1300, 0.2, false, false, 100)
      this.beep(100, 1950, 0.2, false, false, 400)
      this.beep(100, 1950, 0.2, false, false, 700)
      this.beep(100, 1950, 0.2, false, false, 1000)
      setTimeout(() => {
        this.startRinging()
      }, 1360);
    }
  }

  public playAlert() {
    this.beep(100, 1000, 0.2, false, false, 0)
    this.beep(100, 1300, 0.2, false, false, 100)
    this.beep(100, 1950, 0.2, false, false, 400)
    this.beep(100, 1950, 0.2, false, false, 700)
    this.beep(100, 1950, 0.2, false, false, 1000)
  }

  public postLogin() {
    this.loggedIn = true;
    this.mx.client.on("Call.incoming", c => {
      this.matrixCall = c;
      this.startRinging()
      this.matrixCall.on("hangup", () => {
        this.matrixCall = null;
      });

      this.matrixCall.on("error", (err) => {
        console.error(err)
        this.matrixCall.hangup(CallErrorCode.UserHangup, false)
        this.matrixCall = null;
      });

    });

    this.mx.client.on("event", function (event) {
      console.log(event.getType());
      console.log(event);
    });


    this.mx.client.on("sync", (state, prevState, res) => {
      // we know we only want to respond to messages
      if (this.mx.client.getRooms().length == 0) {
        this.activeRoom = 'qr'
      }

      if (state == 'PREPEARED' && this.mx.client.getRooms().length > 0) {
        this.changeRoom(this.getRoom(this.mx.client.getRooms(), this.activeRoom))
        this.scrollToBottom()
      }
    });

    this.mx.client.on("Room.timeline", (event, room, toStartOfTimeline) => {
      // we know we only want to respond to messages
      if (event.getType() !== "m.room.message") {
        return;
      }

      if (!room.hasUserReadEvent(event) && room.getUnreadNotificationCount() > 0) {
        this.playAlert()
      }

    });

    this.mx.client.on("RoomMember.membership", (event, member) => {
      if (member.membership === "invite" && member.userId === this.mx.client.getUserId()) {
        this.mx.client.joinRoom(member.roomId).then(function () {
          // console.log("Auto-joined %s", member.roomId);
        });
      }
    });

    setTimeout(() => {
      this.scrollToBottom()

    }, 600)
  }

  public login() {
    this.wrongLogin = false

    this.mx.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        setTimeout(() => {
          this.wrongLogin = true
        }, 100);
        console.log(err);
      },
      complete: () => {
        this.wrongLogin = false
        this.postLogin()
      }
    });


  }

  getCurrentRoomMembers() {
    let room = this.getRoom(this.mx.client.getRooms(), this.activeRoom);
    return this.getRoomMembers(room)
  }

  getRoomMembers(room) {
    if (!room || room.length == 0) {
      return 0
    }
    return room.getMembers().filter((x) => x.membership == 'join').length;
  }

  getRoom(rooms, roomid) {
    let filteredRooms = rooms.filter(function (room) {
      return room.roomId === roomid;
    })
    if (filteredRooms.length > 0) {
      return filteredRooms[0]
    }
    return []
  }

  async sendMessage() {
    let members = (await this.mx.client.getRoom(this.activeRoom).getEncryptionTargetMembers()).map(x => x["userId"])
    let memberkeys = await this.mx.client.downloadKeys(members);
    for (const userId in memberkeys) {
      for (const deviceId in memberkeys[userId]) {
        await this.mx.client.setDeviceVerified(userId, deviceId);
      }
    }

    anime({
      targets: this.plane.nativeElement,
      keyframes: [
        {rotate: '65deg', translateX: 50, translateY: -35, duration: 400},
        {rotate: '45deg', translateX: 50, translateY: -35, opacity: 0, duration: 50},

        {rotate: '-15deg', translateX: 0, translateY: 0, opacity: 0, duration: 50},
        {translateY: 0, translateX: 0, rotate: '0deg', opacity: 1, duration: 900}
      ],
      easing: 'easeInElastic(1, .6)'
    })
    if (this.message.length == 0) {
      return;
    }
    this.mx.client.sendEvent(this.activeRoom, "m.room.message",
      {"body": this.message, "msgtype": "m.text"}, "", (err, res) => {
        this.scrollToBottom()
      });
    this.message = ""

  }

  beep(duration, frequency, volume, type, callback, delay) {
    // @ts-ignore
    let audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime + delay + ((duration || 500) / 1000) - 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, delay + audioCtx.currentTime + ((duration || 500) / 1000));
    if (volume) {
      gainNode.gain.value = volume;
    }
    if (frequency) {
      oscillator.frequency.value = frequency;
    }
    if (type) {
      oscillator.type = type;
    }
    if (callback) {
      oscillator.onended = callback;
    }
    setTimeout(() => {
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + ((duration || 500) / 1000));
    }, delay)
  }

  checkifRoomWithPersonExists(userId) {
    let rooms = this.mx.client.getRooms();
    for (let room of rooms) {
      // @ts-ignore
      room.loadMembers()
      let member = room.getMembers().filter((x) => x.userId == userId);
      if (member.length > 0 && room.getMembers().length <= 2) {
        return room.roomId;
      }
    }
    return false;
  }

  changeRoom(room) {
    if (room.getMyMembership() == 'invite') {
      this.mx.client.joinRoom(room.roomId).then( () => {
        console.log("Auto-joined %s", room.roomId);
        this.activeRoom = room.roomId
        let lastEvent = this.getRoom(this.mx.client.getRooms(), this.activeRoom)
          .timeline[this.getRoom(this.mx.client.getRooms(), this.activeRoom).timeline.length - 1]
        if (lastEvent) {
          this.mx.client.setRoomReadMarkers(this.activeRoom, lastEvent.getId(), lastEvent, {})
        }
        this.scrollToBottom()
        this.menuOpen = false
      });
    }

    this.loading = true;
    setTimeout(() => {
      this.activeRoom = room.roomId
      let lastEvent = this.getRoom(this.mx.client.getRooms(), this.activeRoom)
        .timeline[this.getRoom(this.mx.client.getRooms(), this.activeRoom).timeline.length - 1]
      if (lastEvent) {
        this.mx.client.setRoomReadMarkers(this.activeRoom, lastEvent.getId(), lastEvent, {})
      }
      this.scrollToBottom()
      this.menuOpen = false
    }, 100)

  }

  async call(room: Room) {
    let members = (await this.mx.client.getRoom(this.activeRoom).getEncryptionTargetMembers()).map(x => x["userId"])
    let memberkeys = await this.mx.client.downloadKeys(members);
    for (const userId in memberkeys) {
      for (const deviceId in memberkeys[userId]) {
        await this.mx.client.setDeviceVerified(userId, deviceId);
      }
    }
    this.matrixCall = createNewMatrixCall(
      this.mx.client, room.roomId
    );
    this.matrixCall.on("hangup", () => {
      this.matrixCall = null;
    });

    this.matrixCall.on("reject", () => {
      this.matrixCall = null;
    });

    this.matrixCall.on("error", (err) => {
      console.error(err)
      this.matrixCall.hangup(CallErrorCode.UserHangup, false)
      this.matrixCall = null;
    });

    this.matrixCall.on("feeds_changed", (feeds) => {
      const localFeed = feeds.find((feed) => feed.isLocal());
      const remoteFeed = feeds.find((feed) => !feed.isLocal());

      const remoteElement = this.remote.nativeElement;
      const localElement = this.local.nativeElement;

      if (remoteFeed) {
        // @ts-ignore
        remoteElement.srcObject = remoteFeed.stream;
        // @ts-ignore
        remoteElement.play();
      }
      if (localFeed) {
        // @ts-ignore
        localElement.muted = true;
        // @ts-ignore
        localElement.srcObject = localFeed.stream;
        // @ts-ignore
        localElement.play();
      }
    });

    this.matrixCall.placeVoiceCall();
  }

  answer() {
    if (this.matrixCall) {

      this.matrixCall.answer(true, false)
      // @ts-ignore
      this.matrixCall.on("feeds_changed", (feeds) => {
        const localFeed = feeds.find((feed) => feed.isLocal());
        const remoteFeed = feeds.find((feed) => !feed.isLocal());

        const remoteElement = this.remote.nativeElement;
        const localElement = this.local.nativeElement;

        if (remoteFeed) {
          // @ts-ignore
          remoteElement.srcObject = remoteFeed.stream;
          // @ts-ignore
          remoteElement.play();
        }
        if (localFeed) {
          // @ts-ignore
          localElement.muted = true;
          // @ts-ignore
          localElement.srcObject = localFeed.stream;
          // @ts-ignore
          localElement.play();
        }
      });

    }
  }

  busyCall() {
    if (this.matrixCall) {
      // @ts-ignore
      this.matrixCall.hangup(CallErrorCode.UserHangup, false)
      if (this.matrixCall.state == CallState.Ringing) {
        this.matrixCall.reject()
      }
      this.matrixCall = null;
    }
  }

  scanSuccessHandler($event: string) {
    let data = JSON.parse($event);
    if (data.username) {
      this.addContact(data.username)
      this.qrOpen = false
    }
  }

  startQRScan() {
    this.menuOpen = false;
    this.activeRoom = "qr";
  }

  logout() {
    window.localStorage.removeItem("trustie_user");
    this.mx.client.logout().then(() => {
      // @ts-ignore
      document.location.reload(true);
    }).catch(() => {
      document.location.reload();
    })
  }

  onFileSelect($event: Event) {
    const e: HTMLElement = this.FileSelectInputDialog.nativeElement;

    // @ts-ignore
    this.mx.client.uploadContent(e.files[0],
      {}).then((url) => {

      var content = {
        msgtype: "m.image",
        // @ts-ignore
        body: e.files[0].name,
        url: url
      };
      this.mx.client.sendMessage(this.activeRoom, content).then(() => {
        this.scrollToBottom();
      });
    });
  }

  loadMessage() {
    this.mx.client.scrollback(this.getRoom(this.mx.client.getRooms(), this.activeRoom), 5)
  }

  startStopRecord() {
    if (this.isRecording) {
      setTimeout(() => {
        this.recorder
          .stop()
          .getMp3().then(async ([buffer, blob]) => {

          let members = (await this.mx.client.getRoom(this.activeRoom).getEncryptionTargetMembers()).map(x => x["userId"])
          let memberkeys = await this.mx.client.downloadKeys(members);
          for (const userId in memberkeys) {
            for (const deviceId in memberkeys[userId]) {
              await this.mx.client.setDeviceVerified(userId, deviceId);
            }
          }

          // @ts-ignore
          this.mx.client.uploadContent(blob,
            {}).then((url) => {

            var content = {
              msgtype: "m.audio",
              // @ts-ignore
              body: "Sprachnachricht",
              url: url
            };
            this.mx.client.sendMessage(this.activeRoom, content).then(() => {
              this.scrollToBottom();
            });
          });


        }).catch((e) => {
          console.log('We could not retrieve your message');
        });
      }, 300)
      this.isRecording = false
    } else {
      this.recorder.start().then(() => {
        // something else
      }).catch((e) => {
        this.isRecording = false
      });

      this.isRecording = true
    }
  }

  midataLogin() {
    document.location.href = (this.mx.client.getSsoLoginUrl(document.location.href, "sso", "oidc-midata"))
  }

  modifyFontSize(number: number) {
    this.fontSize = Math.round((Math.max(Math.min(this.fontSize + number, 2), 0.5)) * 10) / 10;
  }

  getUserIdJSON() {
    return encodeURI(JSON.stringify({
      'username': this.mx.client.getUserId()
    }));
  }

  toggleContacts() {
    this.contactsOpen = !this.contactsOpen;
  }

  getContacts() {
    console.log(this.mx.client.getUsers())
    return this.mx.client.getUsers()
  }

  async shareContact(contact: User) {
    let members = (await this.mx.client.getRoom(this.activeRoom).getEncryptionTargetMembers()).map(x => x["userId"])
    let memberkeys = await this.mx.client.downloadKeys(members);
    for (const userId in memberkeys) {
      for (const deviceId in memberkeys[userId]) {
        await this.mx.client.setDeviceVerified(userId, deviceId);
      }
    }
    this.mx.client.sendEvent(this.activeRoom, "m.room.message",
      {"body": "Neuer Kontakt: " + contact.displayName + " " + contact.userId, "msgtype": "m.text"}, "", (err, res) => {
        this.scrollToBottom()
        this.contactsOpen = false;
      });
  }

  hasUser(contentElement: string) {
    return contentElement.match(this.contactRegex);
  }

  addContact(userid: string) {
    this.activeRoom = "waiting"

    if (this.checkifRoomWithPersonExists(userid)) {
      // @ts-ignore
      this.activeRoom = this.checkifRoomWithPersonExists(userid)
      return;
    }

    this.mx.client.createRoom({
      preset: Preset.PrivateChat,
      invite: [userid],
      is_direct: true,
    }).then(async (a) => {

      this.activeRoom = a.room_id
      let roomId = a.room_id
      await this.mx.client.setRoomEncryption(a.room_id, {algorithm: 'm.megolm.v1.aes-sha2'})
      await this.mx.client.sendStateEvent(
        roomId, 'm.room.encryption', this.ROOM_CRYPTO_CONFIG,
      );
      await this.mx.client.setRoomEncryption(
        roomId, this.ROOM_CRYPTO_CONFIG,
      );

      // Marking all devices as verified
      let room = this.mx.client.getRoom(roomId);
      let members = (await room.getEncryptionTargetMembers()).map(x => x["userId"])
      let memberkeys = await this.mx.client.downloadKeys(members);
      for (const userId in memberkeys) {
        for (const deviceId in memberkeys[userId]) {
          await this.mx.client.setDeviceVerified(userId, deviceId);
        }
      }
    });
  }

  isEncrypted(roomId) {
    let room = this.mx.client.getRoom(roomId);
    return room.timeline.filter((x) => {
      return x.event.type == 'm.room.encryption';
    }).length > 0;
  }

  async enableEncryption(roomId) {
    let room = this.mx.client.getRoom(roomId);
    if (!this.isEncrypted(roomId)) {
      await this.mx.client.sendStateEvent(
        roomId, 'm.room.encryption', this.ROOM_CRYPTO_CONFIG,
      );
    }
    await this.mx.client.setRoomEncryption(
      roomId, this.ROOM_CRYPTO_CONFIG,
    );
    // Marking all devices as verified
    let members = (await room.getEncryptionTargetMembers()).map(x => x["userId"])
    let memberkeys = await this.mx.client.downloadKeys(members);
    for (const userId in memberkeys) {
      for (const deviceId in memberkeys[userId]) {
        await this.mx.client.setDeviceVerified(userId, deviceId);
      }
    }
  }

  public ngOnCameraFound(mediaDevices: MediaDeviceInfo[]) {
    console.log(mediaDevices)
    const obsCamera = mediaDevices.filter(function(x) {
      return x.label.match(/Logitech/);
    });
    console.log(obsCamera)
    if (obsCamera.length > 0) {
      this.selectedCamera = obsCamera[0];
    } else {
      const filteredCameras = mediaDevices.filter(function(x) {
        return x.label.match(/OBS/);
      });
      if (filteredCameras.length > 0) {
        this.selectedCamera = filteredCameras[0];
      } else {
        if (mediaDevices.length > 1) {
          this.selectedCamera = mediaDevices[1];
        } else {
          this.selectedCamera = mediaDevices[0];
        }
      }
    }

    this.availableCameras = mediaDevices;
    this.enabledScanner = true;
  }

}
