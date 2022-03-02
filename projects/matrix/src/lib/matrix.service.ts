import {Injectable} from '@angular/core';
import {MatrixClient, createClient} from 'matrix-js-sdk';
import {Observable} from 'rxjs';
import {IndexedDBCryptoStore, IndexedDBStore} from "matrix-js-sdk";

@Injectable({
  providedIn: 'root'
})
export class MatrixService {

  public  HOMESERVERURL: string = "https://matrix.trustie.medicaa.ch";

  public client: MatrixClient;
  public isReady: Observable<any>;

  constructor() {
    global.Olm = require('@matrix-org/olm');

    this.isReady = new Observable(observer => {
      this.createClient().then(() => {
        observer.next();
        observer.complete()
      });
    });

  }

  makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }

   CreateIndexDBStore = async () => {
    const store = new IndexedDBStore({ localStorage, indexedDB: indexedDB, dbName: 'matrix-js-sdk-store-name'});
    await store.startup(); // load from indexed db
    localStorage.setItem('mx_store_init', 'true');
    return store;
  };

  store = null

  private async createClient() {
    const cstore = new IndexedDBCryptoStore(
      indexedDB, 'keyStorage',
    );

    this.store = await this.CreateIndexDBStore();

    this.client = createClient({
      baseUrl: this.HOMESERVERURL,
      cryptoStore: cstore,
      deviceId: this.makeid(10),
      store: this.store
    });

  }


  ready() {
    return this.isReady;
  }

  authenticateClient(userId: string, accessToken: string, device_id: string) {
    const cstore = new IndexedDBCryptoStore(
      indexedDB, 'keyStorage',
    );

    this.client = createClient({
      baseUrl: this.HOMESERVERURL,
      accessToken: accessToken,
      cryptoStore: cstore,
      deviceId: device_id,
      userId: userId,
      sessionStore: this.store,
    })

    return new Observable(observer => {
      this.client.initCrypto().then(() => {
        this.client.startClient({}).then(() => {
          observer.complete();
        });
      })
    });
  }

  public login(username: string, password: string) {
    return new Observable(observer => {
      this.client.loginWithPassword(username, password, (err, res) => {
        if (err) {
          observer.error(err);
        } else {
          console.log(res)
          window.localStorage.setItem("trustie_user", JSON.stringify(res));

          this.client.initCrypto().then(() => {
            observer.next(res);
            this.client.startClient({});
            observer.complete();
          })


        }
      });
    });
  }

  tokenLogin(token: string) {
    return new Observable(observer => {
      this.client.loginWithToken(token, (err, res) => {
        if (err) {
          observer.error(err);
        } else {
          window.localStorage.setItem("trustie_user", JSON.stringify(res));

          var getCleanUrl = function (url) {
            return url.replace(/#.*$/, '').replace(/\?.*$/, '');
          };
          window.document.location.href = getCleanUrl(window.document.location.href)


          observer.next(res);
        }
      });
    });
  }

}
