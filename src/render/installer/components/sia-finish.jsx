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

import PropTypes from "prop-types";
import React from "react";
import leftArrowImage from "../assets/left_arrow.svg";
import leftWhiteIcon from "../assets/left_white_icon.svg";

const style = {
  main: {
    color: "white",
    display: "table",
    fontSize: "30px",
    textAlign: "left",
    margin: "84px auto 0 auto",
  },
  additionalInfo: {
    fontSize: "9px",
    textAlign: "center",
    color: "white",
    margin: "48px auto 0 auto",
  },
};


export default function SiaFinish(props) {

  return (
    <div className="background-gradation">
      <header><img className="icon" src={leftWhiteIcon}/></header>
      <main style={style.main}>
        <div className="f141">Sia installation.</div>
        <div className="f211">
          We're preparing your account...<br/>
          We will notify you when <span className="underlined bold">we are done</span>.
        </div>
      </main>
      <main style={style.additionalInfo}>
        You can close this window.
      </main>
      <footer>
        <a className="back-btn" onClick={() => props.onClickBack && props.onClickBack()}>
          <img className="arrow" src={leftArrowImage}/> Back
        </a>
        <a className="next-btn" onClick={() => props.onClickClose && props.onClickClose()}>
          Close
        </a>
      </footer>
    </div>
  );

}

SiaFinish.propTypes = {
  onClickBack: PropTypes.func.isRequired,
  onClickClose: PropTypes.func.isRequired,
};