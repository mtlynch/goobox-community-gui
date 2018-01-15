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

import {handleActions} from "redux-actions";
import * as actionTypes from "../constants/action-types";

export const InitialState = {
  // current screen.
  screen: "",
  // true if the user chooses Storj.
  storj: false,
  // true if the user chooses Sia.
  sia: false,
  // default sync folder: <home>/<app-name>
  folder: process.env.DEFAULT_SYNC_FOLDER,
  // Storj account information.
  storjAccount: {
    email: "",
    password: "",
    key: "xxxx xxxx xxxx xxxx xxxxx xxxxxx xxxxxx xxxx",
    emailWarn: false,
    passwordWarn: false,
    keyWarn: false,
    warnMsg: null,
  },
  // Sia account information.
  siaAccount: {
    address: "",
    seed: "",
  },
  // true if the background process is working.
  wait: false,
  processing: false,
  // used to show current progress in a progress bar.
  progress: 0,
};

export default handleActions({

  [actionTypes.SelectStorj]: (state) => ({
    ...state,
    storj: true,
    sia: false,
  }),
  [actionTypes.SelectSia]: (state) => ({
    ...state,
    storj: false,
    sia: true,
  }),
  [actionTypes.SelectBoth]: (state) => ({
    ...state,
    storj: true,
    sia: true,
  }),
  [actionTypes.SetProgressValue]: (state, action) => ({
    ...state,
    progress: action.payload,
  }),
  [actionTypes.StorjLoginSuccess]: (state, action) => ({
    ...state,
    storjAccount: action.payload,
  }),
  [actionTypes.StorjLoginFailure]: (state, action) => ({
    ...state,
    storjAccount: action.payload,
  }),
  [actionTypes.RequestSiaWalletInfoSuccess]: (state, action) => ({
    ...state,
    siaAccount: action.payload,
  }),
  [actionTypes.ProcessingStart]: (state) => ({
    ...state,
    processing: true,
  }),
  [actionTypes.ProcessingEnd]: (state) => ({
    ...state,
    processing: false,
  })

}, InitialState);


