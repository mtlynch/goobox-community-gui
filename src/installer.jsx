/*
 * Copyright (C) 2017 Junpei Kawamoto
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {remote} from "electron";
import path from "path";
import React from "react";
import {HashRouter, Route, Switch} from "react-router-dom";
import Welcome from "./welcome.jsx";
import ServiceSelector from "./service-selector";
import SelectFolder from "./select-folder";
import StorjLogin from "./storj-login";
import StorjRegistration from "./storj-registration";
import StorjEncryptionKey from "./storj-encryption-key";
import StorjEmailConfirmation from "./storj-email-confirmation";
import SiaWallet from "./sia-wallet";
import SiaFinish from "./sia-finish";
import Finish from "./finish-all";

const app = remote.app;

export const Hash = {
  ChooseCloudService: "choose-cloud-service",
  StorjSelected: "storj-selected",
  SiaSelected: "sia-selected",
  BothSelected: "both-selected",
  StorjLogin: "storj-login",
  StorjRegistration: "storj-registration",
  StorjEncryptionKey: "storj-encryption-key",
  StorjEmailConfirmation: "storj-email-confirmation",
  SiaWallet: "sia-wallet",
  SiaFinish: "sia-finish",
  FinishAll: "finish-all",
};


export const Storj = "Storj";
export const Sia = "SIA";


export class Installer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // true if the user chooses Storj.
      storj: false,
      // true if the user chooses SIA.
      sia: false,
      // default sync folder: <home>/<app-name>
      folder: path.join(app.getPath("home"), app.getName()),
      // Storj account information.
      storjAccount: {
        email: "",
        password: "",
        key: "xxxx xxxx xxxx xxxx xxxxx xxxxxx xxxxxx xxxx",
      },
      // Sia account information.
      siaAccount: {
        address: "00000000000000000000000000000",
        seed: "xxxx xxxx xxxx xxxx xxxxx xxxxxx xxxxxx xxxx",

      }
    }
  }

  render() {
    return (
      <HashRouter hashType="noslash">
        <Switch>
          <Route exact path="/" render={() => {
            return (
              <Welcome onClickNext={() => location.hash = Hash.ChooseCloudService}/>
            );
          }}/>
          <Route path={`/${Hash.ChooseCloudService}`} render={() => {
            return (
              <ServiceSelector
                onSelectStorj={() => {
                  this.setState({storj: true, sia: false});
                  location.hash = Hash.StorjSelected;
                }}
                onSelectSia={() => {
                  this.setState({storj: false, sia: true});
                  location.hash = Hash.SiaSelected;
                }}
                onSelectBoth={() => {
                  this.setState({storj: true, sia: true});
                  location.hash = Hash.BothSelected;
                }}
              />
            );
          }}/>
          <Route path={`/${Hash.StorjSelected}`} render={() => {
            return (
              <SelectFolder
                service={Storj}
                folder={this.state.folder}
                onSelectFolder={folder => this.setState({folder: folder})}
                onClickBack={() => location.hash = Hash.ChooseCloudService}
                onClickNext={() => location.hash = Hash.StorjLogin}
              />
            );
          }}/>
          <Route path={`/${Hash.SiaSelected}`} render={() => {
            return (
              <SelectFolder
                service={Sia}
                folder={this.state.folder}
                onSelectFolder={folder => this.setState({folder: folder})}
                onClickBack={() => location.hash = Hash.ChooseCloudService}
                onClickNext={() => location.hash = Hash.SiaWallet}
              />
            );
          }}/>
          <Route path={`/${Hash.BothSelected}`} render={() => {
            return (
              <SelectFolder
                service={`${Storj} and ${Sia}`}
                folder={this.state.folder}
                onSelectFolder={folder => this.setState({folder: folder})}
                onClickBack={() => location.hash = Hash.ChooseCloudService}
                onClickNext={() => location.hash = Hash.StorjLogin}
              />
            );
          }}/>
          <Route path={`/${Hash.StorjLogin}`} render={() => {
            return (
              <StorjLogin
                onClickCreateAccount={() => location.hash = Hash.StorjRegistration}
                onClickBack={() => {
                  if (this.state.sia) {
                    location.hash = Hash.BothSelected;
                  } else {
                    location.hash = Hash.StorjSelected;
                  }
                }}
                onClickFinish={(info) => {
                  this.setState({storjAccount: info});
                  if (this.state.sia) {
                    location.hash = Hash.SiaWallet;
                  } else {
                    location.hash = Hash.FinishAll;
                  }
                }}
              />
            );
          }}/>
          <Route path={`/${Hash.StorjRegistration}`} render={() => {
            return (
              <StorjRegistration
                onClickLogin={() => location.hash = Hash.StorjLogin}
                onClickBack={() => {
                  if (this.state.sia) {
                    location.hash = Hash.BothSelected;
                  } else {
                    location.hash = Hash.StorjSelected;
                  }
                }}
                onClickNext={() => location.hash = Hash.StorjEncryptionKey}
              />
            );
          }}/>
          <Route path={`/${Hash.StorjEncryptionKey}`} render={() => {
            return (
              <StorjEncryptionKey
                encryptionKey={this.state.storjAccount.key}
                onClickBack={() => location.hash = Hash.StorjRegistration}
                onClickNext={() => location.hash = Hash.StorjEmailConfirmation}
              />
            );
          }}/>
          <Route path={`/${Hash.StorjEmailConfirmation}`} render={() => {
            return (
              <StorjEmailConfirmation
                onClickBack={() => location.hash = Hash.StorjEncryptionKey}
                onClickLogin={() => location.hash = Hash.StorjLogin}
              />
            );
          }}/>
          <Route path={`/${Hash.SiaWallet}`} render={() => {
            return (
              <SiaWallet
                address={this.state.siaAccount.address}
                seed={this.state.siaAccount.seed}
                onClickBack={() => {
                  if (this.state.storj) {
                    location.hash = Hash.StorjLogin;
                  } else {
                    location.hash = Hash.SiaSelected;
                  }
                }}
                onClickNext={() => location.hash = Hash.SiaFinish}
              />
            );
          }}/>
          <Route path={`/${Hash.SiaFinish}`} render={() => {
            return (
              <SiaFinish
                onClickBack={() => location.hash = Hash.SiaWallet}
                onClickClose={() => remote.getCurrentWindow().close()}
              />
            );
          }}/>
          <Route path={`/${Hash.FinishAll}`} render={() => {
            return (
              <Finish
                onClickBack={() => location.hash = Hash.StorjLogin}
                onClickClose={() => remote.getCurrentWindow().close()}
              />
            );
          }}/>
        </Switch>
      </HashRouter>
    );
  }

}

export default Installer;