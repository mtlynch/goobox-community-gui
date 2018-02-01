/*
 * Copyright (C) 2017-2018 Junpei Kawamoto
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

import {call} from "redux-saga/effects";
import * as ipcActions from "../../../../src/ipc/actions";
import sendAsync from "../../../../src/ipc/send";
import openSyncFolder from "../../../../src/render/popup/sagas/openSyncFolder";

describe("openSyncFolder", () => {

  it("yields openSyncFolderAsync saga", () => {
    const saga = openSyncFolder();
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.openSyncFolder()));
    expect(saga.next().done).toBeTruthy();
  });

  // TODO: Test throwing exceptions.

});