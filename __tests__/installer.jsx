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
jest.mock("../src/config");

import {ipcRenderer, remote} from "electron";
import {mount, shallow} from "enzyme";
import path from "path";
import React from "react";
import {saveConfig} from "../src/config";
import {
  JREInstallEvent, Sia, SiaWalletEvent, StopSyncAppsEvent, Storj, StorjLoginEvent,
  StorjRegisterationEvent
} from "../src/constants";
import {Hash, Installer} from "../src/installer.jsx";

const app = remote.app;

const sampleHome = path.join("/home", "some-user");
process.env.DEFAULT_SYNC_FOLDER = path.join(sampleHome, app.getName());

describe("Installer component", () => {

  beforeEach(() => {
    app.getPath.mockReset();
    app.getPath.mockReturnValue(".");
    remote.getCurrentWindow.mockReset();
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, true);
        }
      });
    });
  });

  describe("hash is empty", () => {

    let wrapper, welcome;
    beforeEach(() => {
      location.hash = "";
      wrapper = mount(<Installer/>);
      welcome = wrapper.find("Welcome");
    });

    it("shows Welcome component at first", () => {
      expect(welcome.exists()).toBeTruthy();
    });

    it("invokes _checkJRE when next button in the welcome screen is clicked", async () => {
      wrapper.instance()._checkJRE = jest.fn().mockReturnValue(Promise.resolve());
      await welcome.prop("onClickNext")();
      expect(wrapper.instance()._checkJRE).toHaveBeenCalled();
    });

  });

  describe(`hash is ${Hash.ChooseCloudService}`, () => {

    let wrapper, component;
    beforeEach(() => {
      location.hash = Hash.ChooseCloudService;
      wrapper = mount(<Installer/>);
      component = wrapper.find("ServiceSelector");
    });

    it("shows ServiceSelector component when the hash is ChooseCloudService", () => {
      expect(component.exists()).toBeTruthy();
    });

    it("sets storj state true and moves to select folder screen when onSelectStorj is called", () => {
      expect(wrapper.state("storj")).toBeFalsy();

      component.prop("onSelectStorj")();
      expect(location.hash).toEqual(`#${Hash.StorjSelected}`);
      expect(wrapper.state("storj")).toBeTruthy();
    });

    it("sets sia state true and moves to select folder screen when onSelectSia is called", () => {
      expect(wrapper.state("sia")).toBeFalsy();

      component.prop("onSelectSia")();
      expect(location.hash).toEqual(`#${Hash.SiaSelected}`);
      expect(wrapper.state("sia")).toBeTruthy();
    });

    it("sets storj and sia state true and moves to select folder screen when onSelectBoth is called", () => {
      expect(wrapper.state("storj")).toBeFalsy();
      expect(wrapper.state("sia")).toBeFalsy();

      component.prop("onSelectBoth")();
      expect(location.hash).toEqual(`#${Hash.BothSelected}`);
      expect(wrapper.state("storj")).toBeTruthy();
      expect(wrapper.state("sia")).toBeTruthy();
    });

  });

  describe(`hash is ${Hash.StorjSelected}`, () => {

    let wrapper, selector;
    beforeEach(() => {
      location.hash = Hash.StorjSelected;
      wrapper = mount(<Installer/>);
      wrapper.instance()._stopSyncApps = jest.fn().mockReturnValue(Promise.resolve());
      selector = wrapper.find("SelectFolder");
    });

    it("shows SelectFolder component for storj when the hash is StorjSelected", () => {
      expect(selector.exists()).toBeTruthy();
      expect(selector.prop("service")).toEqual(Storj);
      expect(selector.prop("folder")).toEqual(process.env.DEFAULT_SYNC_FOLDER);
    });

    it("updates folder state when SelectFolder calls onSelectFolder", () => {
      const selectedFolder = "/sample/folder";
      selector.prop("onSelectFolder")(selectedFolder);
      expect(wrapper.state("folder")).toEqual(selectedFolder);
    });

    it("sets the hash is ChooseCloudService when back button is clicked in SelectFolder component", async () => {
      await selector.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.ChooseCloudService}`);
    });

    it("invokes _stopSyncApps when back button is clicked", async () => {
      await selector.prop("onClickBack")();
      expect(wrapper.instance()._stopSyncApps).toHaveBeenCalled();
    });

    it("sets the hash is StorjLogin when the next button is clicked in SelectFolder component", () => {
      selector.prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

  });

  describe(`hash is ${Hash.SiaSelected}`, () => {

    let wrapper, selector;
    beforeEach(() => {
      location.hash = Hash.SiaSelected;
      wrapper = mount(<Installer/>);
      wrapper.instance()._stopSyncApps = jest.fn().mockReturnValue(Promise.resolve());
      selector = wrapper.find("SelectFolder");
    });

    it("shows SelectFolder component for sia when the hash is SiaSelected", () => {
      expect(selector.exists()).toBeTruthy();
      expect(selector.prop("service")).toEqual(Sia);
      expect(selector.prop("folder")).toEqual(process.env.DEFAULT_SYNC_FOLDER);
    });

    it("updates folder state when SelectFolder calls onSelectFolder", () => {
      const selectedFolder = "/sample/folder";
      selector.prop("onSelectFolder")(selectedFolder);
      expect(wrapper.state("folder")).toEqual(selectedFolder);
    });

    it("sets the hash is ChooseCloudService when back button is clicked in SelectFolder component", async () => {
      await selector.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.ChooseCloudService}`);
    });

    it("invokes _stopSyncApps when back button is clicked", async () => {
      await selector.prop("onClickBack")();
      expect(wrapper.instance()._stopSyncApps).toHaveBeenCalled();
    });

    it("doesn't set the hash is ChooseCloudService when back button is clicked but requesting is true", () => {
      wrapper.instance().requesting = true;
      selector.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.SiaSelected}`);
    });

    it("invokes _requestSiaWallet when onClickNext is called", async () => {
      wrapper.instance()._requestSiaWallet = jest.fn().mockReturnValue(Promise.resolve());
      await selector.prop("onClickNext")();
      expect(wrapper.instance()._requestSiaWallet).toHaveBeenCalled();
    });

  });

  describe(`hash is ${Hash.BothSelected}`, () => {

    let wrapper, selector;
    beforeEach(() => {
      location.hash = Hash.BothSelected;
      wrapper = mount(<Installer/>);
      wrapper.instance()._stopSyncApps = jest.fn().mockReturnValue(Promise.resolve());
      selector = wrapper.find("SelectFolder");
    });

    it("shows SelectFolder component for storj and sia when the hash is BothSelected", () => {
      expect(selector.exists()).toBeTruthy();
      expect(selector.prop("service")).toEqual(`${Storj} and ${Sia}`);
      expect(selector.prop("folder")).toEqual(process.env.DEFAULT_SYNC_FOLDER);
    });

    it("updates folder state when SelectFolder calls onSelectFolder", () => {
      const selectedFolder = "/sample/folder";
      selector.prop("onSelectFolder")(selectedFolder);
      expect(wrapper.state("folder")).toEqual(selectedFolder);
    });

    it("sets the hash is ChooseCloudService when back button is clicked in SelectFolder component", async () => {
      await selector.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.ChooseCloudService}`);
    });

    it("invokes _stopSyncApps when back button is clicked", async () => {
      await selector.prop("onClickBack")();
      expect(wrapper.instance()._stopSyncApps).toHaveBeenCalled();
    });

    it("sets the hash is StorjLogin when the next button is clicked in SelectFolder component", () => {
      selector.prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

  });

  describe(`hash is ${Hash.StorjLogin}`, () => {

    let wrapper, login;
    beforeEach(() => {
      location.hash = Hash.StorjLogin;
      wrapper = mount(<Installer/>);
      login = wrapper.find("StorjLogin");
    });

    it("shows StorjLogin component", () => {
      expect(login.exists()).toBeTruthy();
    });

    it("updates the hash to StorjRegistration when onClickCreateAccount is called", () => {
      login.prop("onClickCreateAccount")();
      expect(location.hash).toEqual(`#${Hash.StorjRegistration}`);
    });

    it("doesn't update the hash when onClickCreateAccount is called but requesting is true", () => {
      wrapper.instance().requesting = true;
      login.prop("onClickCreateAccount")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("updates the hash to StorjSelected when onClickBack is called and sia state is false", () => {
      wrapper.setState({sia: false});
      login.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjSelected}`);
    });

    it("updates the hash to BothSelected when onClickBack is called and sia state is true", () => {
      wrapper.setState({sia: true});
      login.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.BothSelected}`);
    });

    it("doesn't update the hash when onClickBack is called but requesting is true", () => {
      wrapper.instance().requesting = true;
      wrapper.setState({sia: true});
      login.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("invokes _storjLogin when onClickFinish is called with an account information", async () => {
      wrapper.instance()._storjLogin = jest.fn().mockReturnValue(Promise.resolve());

      const email = "user@example.com";
      const password = "password";
      const key = "1234567890";
      await login.prop("onClickFinish")({
        email: email,
        password: password,
        encryptionKey: key
      });
      expect(wrapper.instance()._storjLogin).toHaveBeenCalledWith({
        email: email,
        password: password,
        encryptionKey: key
      });
    });

    it("sets emailWarn prop if emailWarn state is true", () => {
      wrapper.setState({storjAccount: {emailWarn: true}});
      expect(wrapper.find("StorjLogin").prop("emailWarn")).toBeTruthy();
    });

    it("sets passwordWarn prop if passwordWarn state is true", () => {
      wrapper.setState({storjAccount: {passwordWarn: true}});
      expect(wrapper.find("StorjLogin").prop("passwordWarn")).toBeTruthy();
    });

    it("sets keyWarn prop if keyWarn state is true", () => {
      wrapper.setState({storjAccount: {keyWarn: true}});
      expect(wrapper.find("StorjLogin").prop("keyWarn")).toBeTruthy();
    });

    it("sets warnMsg prop if warnMsg state is true", () => {
      const msg = "expected warn message";
      wrapper.setState({storjAccount: {warnMsg: msg}});
      expect(wrapper.find("StorjLogin").prop("warnMsg")).toBe(msg);
    });

  });

  describe(`hash is ${Hash.StorjRegistration}`, () => {

    let wrapper, registration;
    beforeEach(() => {
      location.hash = Hash.StorjRegistration;
      wrapper = mount(<Installer/>);
      registration = wrapper.find("StorjRegistration");
    });

    it("shows StorjRegistration component", () => {
      expect(registration.exists()).toBeTruthy();
    });

    it("updates the hash to StorjLogin when onClickLogin is called", () => {
      registration.prop("onClickLogin")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("doesn't update the hash when onClickLogin is called but requesting is true", () => {
      wrapper.instance().requesting = true;
      registration.prop("onClickLogin")();
      expect(location.hash).toEqual(`#${Hash.StorjRegistration}`);
    });

    it("updates the hash to StorjSelected when onClickBack is called and sia state is false", () => {
      wrapper.setState({sia: false});
      registration.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjSelected}`);
    });

    it("updates the hash to BothSelected when onClickBack is called and sia state is true", () => {
      wrapper.setState({sia: true});
      registration.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.BothSelected}`);
    });

    it("doesn't update the hash when onClickBack is called but requesting is true", () => {
      wrapper.instance().requesting = true;
      wrapper.setState({sia: true});
      registration.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjRegistration}`);
    });

    it("invokes _storjRegister when onClickNext is called", async () => {
      wrapper.instance()._storjRegister = jest.fn().mockReturnValue(Promise.resolve());

      const email = "user@example.com";
      const password = "password";
      const info = {
        email: email,
        password: password,
      };
      await registration.prop("onClickNext")(info);
      expect(wrapper.instance()._storjRegister).toHaveBeenCalledWith(info)
    });

  });

  describe(`hash is ${Hash.StorjEncryptionKey}`, () => {

    let wrapper, key;
    beforeEach(() => {
      location.hash = Hash.StorjEncryptionKey;
      wrapper = mount(<Installer/>);
      key = wrapper.find("StorjEncryptionKey");
    });

    it("shows StorjEncryptionKey component showing an encryption key in storjAccount.key state", () => {
      const encryptionKey = "000000-0000000-0000000000000";
      wrapper.setState({storjAccount: {key: encryptionKey}});

      const key = wrapper.find("StorjEncryptionKey");
      expect(key.exists()).toBeTruthy();
      expect(key.prop("encryptionKey")).toEqual(encryptionKey);
    });

    it("updates the hash to StorjRegistration when onClickBack is called", () => {
      key.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjRegistration}`);
    });

    it("updates the hash to StorjEamilConfirmation when onClickNext is called", () => {
      key.prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.StorjEmailConfirmation}`);
    });

  });

  describe(`hash is ${Hash.StorjEmailConfirmation}`, () => {

    let wrapper, comp;
    beforeEach(() => {
      location.hash = Hash.StorjEmailConfirmation;
      wrapper = mount(<Installer/>);
      comp = wrapper.find("StorjEmailConfirmation");
    });

    it("shows StorjEmailConfirmation component", () => {
      expect(comp.exists()).toBeTruthy();
    });

    it("updates the hash to StorjEncryptionKey when onClickBack is called", () => {
      comp.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjEncryptionKey}`);
    });

    it("updates the hash to StorjLogin when onClickLogin is called", () => {
      comp.prop("onClickLogin")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

  });

  describe(`hash is ${Hash.SiaWallet}`, () => {

    const address = "1234567890";
    const seed = "xxx xxx xxx xxx xxxx";

    let wrapper, wallet;
    beforeEach(() => {
      location.hash = Hash.SiaWallet;
      wrapper = mount(<Installer/>);
      wrapper.setState({
        siaAccount: {
          address: address,
          seed: seed,
        }
      });
      wallet = wrapper.find("SiaWallet");
    });

    it("shows SiaWallet component with information in siaAccount state", () => {
      expect(wallet.exists()).toBeTruthy();
      expect(wallet.prop("address")).toEqual(address);
      expect(wallet.prop("seed")).toEqual(seed);
    });

    it("updates the hash to SiaSelected when onClickBack is called and storj state is false", () => {
      wrapper.setState({storj: false});
      wallet.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.SiaSelected}`);
    });

    it("updates the hash to StorjLogin when onClickBack is called and storj state is true", () => {
      wrapper.setState({storj: true});
      wallet.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("invokes _saveConfig and updates the hash to SiaFinish when onClickNext is called", async () => {
      wrapper.instance()._saveConfig = jest.fn().mockReturnValue(Promise.resolve());
      await wallet.prop("onClickNext")();
      expect(wrapper.instance()._saveConfig).toHaveBeenCalled();
      expect(location.hash).toEqual(`#${Hash.SiaFinish}`);
    });

  });

  describe(`hash is ${Hash.SiaFinish}`, () => {

    let wrapper, finish;
    beforeEach(() => {
      location.hash = Hash.SiaFinish;
      wrapper = mount(<Installer/>);
      finish = wrapper.find("SiaFinish");
    });

    it("shows SiaFinish component", () => {
      expect(finish.exists()).toBeTruthy();
    });

    it("updates the hash to SiaWallet when onClickBack is called", () => {
      finish.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.SiaWallet}`);
    });

    it("closes the window when onClickClose is called", () => {
      const mockWindow = {
        close: jest.fn()
      };
      remote.getCurrentWindow.mockReturnValue(mockWindow);

      finish.prop("onClickClose")();
      expect(remote.getCurrentWindow).toHaveBeenCalledTimes(1);
      expect(mockWindow.close).toHaveBeenCalledTimes(1);
    });

  });

  describe(`hash is ${Hash.FinishAll}`, () => {

    let wrapper, finish;
    beforeEach(() => {
      location.hash = Hash.FinishAll;
      wrapper = mount(<Installer/>);
      finish = wrapper.find("Finish");
    });

    it("shows FinishAll component", () => {
      expect(finish.exists()).toBeTruthy();
    });

    it("updates the hash to StorjLogin when onClickBack is called", () => {
      finish.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("closes the window when onClickClose is called", () => {
      const mockWindow = {
        close: jest.fn()
      };
      remote.getCurrentWindow.mockReturnValue(mockWindow);

      finish.prop("onClickClose")();
      expect(remote.getCurrentWindow).toHaveBeenCalledTimes(1);
      expect(mockWindow.close).toHaveBeenCalledTimes(1);
    });

  });

  describe("_checkJRE", () => {

    let wrapper, instance;
    beforeEach(() => {
      wrapper = shallow(<Installer/>);
      instance = wrapper.instance();
      location.hash = "";
    });

    it("does nothing when requesting is true", async () => {
      instance.requesting = true;
      await instance._checkJRE();

      expect(ipcRenderer.once).not.toHaveBeenCalled();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it("sends JRE install request", async () => {
      await instance._checkJRE();

      expect(ipcRenderer.once).toHaveBeenCalledWith(JREInstallEvent, expect.any(Function));
      expect(ipcRenderer.send).toHaveBeenCalledWith(JREInstallEvent);
    });

    it("sets requesting and wait true while communicating to the main process", async () => {
      ipcRenderer.once.mockImplementation((listen, cb) => {
        expect(instance.requesting).toBeTruthy();
        expect(wrapper.state("wait")).toBeTruthy();
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, true);
          }
        });
      });

      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
      await instance._checkJRE();
      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
    });

    it("moves to ChooseCloudService", async () => {
      await instance._checkJRE();
      expect(location.hash).toEqual(`#${Hash.ChooseCloudService}`);
    });

    // TODO: Update this test after error notification template is decided.
    it("does not move to ChooseCloudService and show an error message when receives an error", async () => {
      const err = "expected error";
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, false, err);
          }
        });
      });
      await instance._checkJRE();
      expect(location.hash).toEqual("");
      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
    });

  });

  describe("_storjLogin", () => {

    const email = "user@example.com";
    const password = "password";
    const key = "1234567890";
    const info = {
      email: email,
      password: password,
      encryptionKey: key
    };

    let wrapper, instance;
    beforeEach(() => {
      wrapper = shallow(<Installer/>);
      instance = wrapper.instance();
      instance._requestSiaWallet = jest.fn().mockReturnValue(Promise.resolve());
      instance._saveConfig = jest.fn().mockReturnValue(Promise.resolve());
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, true);
          }
        });
      });
    });

    it("does nothing if requesting is true", async () => {
      instance.requesting = true;
      await instance._storjLogin();
      expect(ipcRenderer.once).not.toHaveBeenCalled();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it("send a login request", async () => {
      await instance._storjLogin(info);

      expect(ipcRenderer.once).toHaveBeenCalledWith(StorjLoginEvent, expect.any(Function));
      expect(ipcRenderer.send).toHaveBeenCalledWith(StorjLoginEvent, info);
      expect(wrapper.state("storjAccount")).toEqual(info);
    });

    it("sets requesting and wait true while communicating to the main process", async () => {
      ipcRenderer.once.mockImplementation((listen, cb) => {
        expect(instance.requesting).toBeTruthy();
        expect(wrapper.state("wait")).toBeTruthy();
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, true);
          }
        });
      });

      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
      await instance._storjLogin(info);
      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
    });

    it("invokes _requestSiaWallet when sia is true", async () => {
      wrapper.setState({sia: true});
      await instance._storjLogin(info);
      expect(instance._requestSiaWallet).toHaveBeenCalled();
      expect(instance._saveConfig).not.toHaveBeenCalled();
    });

    it("saves returned value to the config file and moves to FinishAll when sia is false", async () => {
      wrapper.setState({sia: false});
      await instance._storjLogin(info);
      expect(instance._requestSiaWallet).not.toHaveBeenCalled();
      expect(instance._saveConfig).toHaveBeenCalled();
      expect(location.hash).toEqual(`#${Hash.FinishAll}`);
    });

    // TODO: Update this test after error notification template is decided.
    it("neither call _requestSiaWallet nor move FinishAll when receives an error", async () => {
      const err = "expected error";
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, false, err, {
              email: false,
              password: false,
              encryptionKey: true,
            });
          }
        });
      });
      await instance._storjLogin(info);
      expect(instance._requestSiaWallet).not.toHaveBeenCalled();
      expect(instance._saveConfig).not.toHaveBeenCalled();
      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
      expect(wrapper.state("storjAccount").emailWarn).toBeTruthy();
      expect(wrapper.state("storjAccount").passwordWarn).toBeTruthy();
      expect(wrapper.state("storjAccount").keyWarn).toBeFalsy();
      expect(wrapper.state("storjAccount").warnMsg).toBe(err);
    });

  });

  describe("_storjRegister", () => {

    const email = "user@example.com";
    const password = "password";
    const key = "1234567890";
    const info = {
      email: email,
      password: password,
    };

    let wrapper, instance;
    beforeEach(() => {
      wrapper = shallow(<Installer/>);
      instance = wrapper.instance();
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, true, key);
          }
        });
      });
    });

    it("does nothing if requesting is true", async () => {
      instance.requesting = true;
      await instance._storjRegister(info);
      expect(ipcRenderer.once).not.toHaveBeenCalled();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it("send a create account request", async () => {
      await instance._storjRegister(info);

      expect(ipcRenderer.once).toHaveBeenCalledWith(StorjRegisterationEvent, expect.any(Function));
      expect(ipcRenderer.send).toHaveBeenCalledWith(StorjRegisterationEvent, info);
      expect(wrapper.state("storjAccount")).toEqual({
        email: email,
        password: password,
        encryptionKey: key,
      });
    });

    it("sets requesting and wait true while communicating to the main process", async () => {
      ipcRenderer.once.mockImplementation((listen, cb) => {
        expect(instance.requesting).toBeTruthy();
        expect(wrapper.state("wait")).toBeTruthy();
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, true);
          }
        });
      });

      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
      await instance._storjRegister(info);
      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
    });

    it("moves to StorjEncryptionKey", async () => {
      await instance._storjRegister(info);
      expect(location.hash).toEqual(`#${Hash.StorjEncryptionKey}`);
    });

    // TODO: Update this test after error notification template is decided.
    it("neither call _requestSiaWallet nor move FinishAll when receives an error", async () => {
      const err = "expected error";
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, false, err);
          }
        });
      });
      const current = location.hash;
      await instance._storjRegister(info);
      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
      expect(location.hash).toEqual(current);
    });

  });


  describe("_requestSiaWallet", () => {

    const address = "1234567890";
    const seed = "xxx xxx xxx xxx";
    const info = {
      address: address,
      seed: seed
    };

    let wrapper, instance;
    beforeEach(() => {
      wrapper = shallow(<Installer/>);
      instance = wrapper.instance();
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, info);
          }
        });
      });
      location.hash = "";
    });

    it("does nothing when requesting is true", async () => {
      instance.requesting = true;
      await instance._requestSiaWallet();
      expect(ipcRenderer.once).not.toHaveBeenCalled();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it("requests SIA wallet information", async () => {
      await instance._requestSiaWallet();
      expect(ipcRenderer.once).toHaveBeenCalledWith(SiaWalletEvent, expect.any(Function));
      expect(ipcRenderer.send).toHaveBeenCalledWith(SiaWalletEvent);
      expect(wrapper.state("siaAccount")).toEqual(info);
    });

    it("doesn't request SIA wallet information when siaAccount state has the information already", async () => {
      wrapper.setState({siaAccount: info});
      await instance._requestSiaWallet();
      expect(ipcRenderer.once).not.toHaveBeenCalled();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it("sets requesting and wait true while communicating to the main process", async () => {
      ipcRenderer.once.mockImplementation((listen, cb) => {
        expect(instance.requesting).toBeTruthy();
        expect(wrapper.state("wait")).toBeTruthy();
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, info);
          }
        });
      });

      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
      await instance._storjRegister(info);
      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
    });

    it("moves to SiaWallet if address and seed was received", async () => {
      await instance._requestSiaWallet();
      expect(location.hash).toEqual(`#${Hash.SiaWallet}`);
    });

    // TODO: Update this test after error notification template is decided.
    it("doesn't move to SiaWallet and shows an error message if ipc request fails", async () => {
      const error = "expected error";
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, null, error);
          }
        });
      });

      await instance._requestSiaWallet();
      expect(location.hash).toEqual("");
      expect(wrapper.instance().requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
    });

  });

  describe("_saveConfig", () => {
    const folder = "/tmp";

    let wrapper, instance;
    beforeEach(() => {
      wrapper = shallow(<Installer/>);
      instance = wrapper.instance();
      saveConfig.mockReset();
    });

    it("stores selected folder and marks installer finished", async () => {
      wrapper.setState({storj: true, sia: true, folder: folder});
      await instance._saveConfig();
      expect(saveConfig).toHaveBeenCalledWith({
        syncFolder: folder,
        installed: true,
        storj: true,
        sia: true,
      });
    });

    // TODO: Update this test after error notification template is decided.
    // it("shows an error message when saveConfig returns an error", async () => {
    //   const err = "expected error";
    //   saveConfig.mockReturnValue(Promise.reject(err));
    // });

  });

  describe("_stopSyncApps", () => {

    let wrapper, instance;
    beforeEach(() => {
      wrapper = shallow(<Installer/>);
      instance = wrapper.instance();
    });

    it("does nothing when requesting is true", async () => {
      instance.requesting = true;
      await instance._stopSyncApps();
      expect(ipcRenderer.once).not.toHaveBeenCalled();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
    });

    it("sends StopSyncAppEvent", async () => {
      await instance._stopSyncApps();
      expect(ipcRenderer.once).toHaveBeenCalledWith(StopSyncAppsEvent, expect.any(Function));
      expect(ipcRenderer.send).toHaveBeenCalledWith(StopSyncAppsEvent);
    });

    it("sets requesting and wait true while communicating to the main process", async () => {
      ipcRenderer.once.mockImplementation((listen, cb) => {
        expect(instance.requesting).toBeTruthy();
        expect(wrapper.state("wait")).toBeTruthy();
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null);
          }
        });
      });

      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
      await instance._stopSyncApps();
      expect(instance.requesting).toBeFalsy();
      expect(wrapper.state("wait")).toBeFalsy();
    });

  });

});