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

import classNames from "classnames";
import log from "electron-log";
import PropTypes from "prop-types";
import React from "react";
import leftArrowImage from "../assets/left_arrow.svg";
import leftWhiteIcon from "../assets/left_white_icon.svg";
import rightArrowImage from "../assets/right_arrow.svg";

const style = {
  msg: {
    color: "white",
    display: "table",
    fontSize: "30px",
    textAlign: "left",
    margin: "52px auto 0 auto",
  },
  accountInfo: {
    fontSize: "30px",
    textAlign: "center",
    marginTop: "20px",
  },
  createAccount: {
    fontSize: "11px",
    textAlign: "center",
    marginTop: "10px",
  },
  button: {
    width: "123px",
    height: "31px",
    fontSize: "11px",
    backgroundColor: "white",
    borderRadius: "5px",
    borderStyle: "none",
  },
  input: {
    width: "198px",
    height: "27px",
    marginBottom: 0,
  },
  createAccountText: {
    paddingBottom: "9px",
    color: "white",
  },
  createAccountButton: {
    fontSize: "9px",
    height: "15px",
    width: "90px",
    backgroundColor: "white",
    borderRadius: "5px",
    borderStyle: "none",
  },
};

export default class StorjLogin extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      key: "",
      emailWarn: props.emailWarn,
      passwordWarn: props.passwordWarn,
      keyWarn: props.keyWarn,
    };
    this._onClickNext = this._onClickNext.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      emailWarn: props.emailWarn,
      passwordWarn: props.passwordWarn,
      keyWarn: props.keyWarn,
    });
  }

  _onClickNext() {
    if (this.props.processing) {
      return
    }

    let warn = false;
    if (!this.state.email) {
      warn = true;
      this.setState({emailWarn: true});
    }
    if (!this.state.password) {
      warn = true;
      this.setState({passwordWarn: true});
    }
    if (!this.state.key) {
      warn = true;
      this.setState({keyWarn: true});
    }
    if (!warn) {
      this.props.onClickNext({
        email: this.state.email,
        password: this.state.password,
        key: this.state.key,
      });
    }
  }

  render() {
    log.silly(`StorjLogin(emailWarn: ${this.state.emailWarn}, passwordWarn: ${this.state.passwordWarn}, keyWarn: ${this.state.keyWarn})`);
    let msg;
    if (this.state.emailWarn || this.state.passwordWarn || this.state.keyWarn) {
      if (this.props.warnMsg) {
        msg = (
          <main className="warnMsg" style={style.msg}>
            <div className="f141">Ooops.</div>
            <div className="f211">{this.props.warnMsg}...</div>
          </main>
        );
      } else {
        msg = (
          <main className="warnMsg" style={style.msg}>
            <div className="f141">Ooops.</div>
            <div className="f211">Incorrect email or password. <span
              className="underlined bold">Please try again.</span>
            </div>
          </main>
        );
      }
    } else {
      msg = (
        <main className="info" style={style.msg}>
          <div className="f141">One last thing.</div>
          <div className="f211">Please login to your <span className="underlined bold">Storj account</span></div>
        </main>
      )
    }

    return (
      <div className={classNames("background-gradation", this.props.processing ? "wait" : "")}>
        <header><img className="icon" src={leftWhiteIcon}/></header>
        {msg}
        <main className="account-info" style={style.accountInfo}>
          <div>
            <input className={this.state.emailWarn ? "warn" : ""} id="email"
                   placeholder="e-mail" value={this.state.email} style={style.input}
                   onChange={e => this.props.processing || this.setState({email: e.target.value})}/>
          </div>
          <div>
            <input className={this.state.passwordWarn ? "warn" : ""} id="password" type="password"
                   placeholder="password" value={this.state.password} style={style.input}
                   onChange={e => this.props.processing || this.setState({password: e.target.value})}/>
          </div>
          <div>
            <input className={this.state.keyWarn ? "warn" : ""} id="key" type="password"
                   placeholder="encryption key" value={this.state.key} style={style.input}
                   onChange={e => this.props.processing || this.setState({key: e.target.value})}/>
          </div>
        </main>
        <main className="create-account" style={style.createAccount}>
          <div style={style.createAccountText}>
            Don't have an account?
          </div>
          <button id="create-account-btn" style={style.createAccountButton}
                  onClick={() => this.props.processing || this.props.onClickCreateAccount()}>
            click here to create
          </button>
        </main>
        <footer>
          <a className="back-btn" onClick={() => this.props.processing || this.props.onClickBack()}>
            <img className="arrow" src={leftArrowImage}/> Back
          </a>
          <a className="next-btn" onClick={this._onClickNext}>
            Finish <img className="arrow" src={rightArrowImage}/>
          </a>
        </footer>
      </div>
    );
  }

}

StorjLogin.propTypes = {
  // If true, showing wait mouse cursor and preventing all actions.
  processing: PropTypes.bool.isRequired,
  onClickCreateAccount: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  emailWarn: PropTypes.bool,
  passwordWarn: PropTypes.bool,
  keyWarn: PropTypes.bool,
  warnMsg: PropTypes.string,
};