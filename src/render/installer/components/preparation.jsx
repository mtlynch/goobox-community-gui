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

import PropTypes from "prop-types"
import React from "react";
import strokeColorImage from "../assets/stroke_color.svg";
import symbolColorImage from "../assets/symbol_color.svg";

const style = {

  background: {
    background: "linear-gradient(to right, #00AFB1, #7A55DE)",
    position: "absolute",
    width: "760px",
    height: "760px",
    left: "-80px",
    top: "-180px",
    animation: "spin 2s linear infinite",
  },
  main: {
    backgroundColor: "white",
    position: "absolute",
    top: "10px",
    left: "10px",
    width: "580px",
    height: "380px",
    textAlign: "center",
    padding: "100px 100px",
  },
  component: {
    marginBottom: "50px",
  },
  msg: {
    color: "rgb(0, 175, 177)",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "50px",
  },
  iconBackground: {
    position: "relative",
    animation: "spin 2s linear infinite",
  },
  icon: {
    position: "absolute",
    top: "115px",
    left: "272px",
  }
};


export default function Preparation(props) {

  const barStyle = {
    width: `${props.progress}%`
  };

  let msg;
  if (props.errorMsg) {
    msg = <p className="errorMsg">{props.errorMsg}</p>
  } else {
    msg = props.children;
  }

  return (
    <div className={!props.errorMsg ? "wait" : ""}>
      <div style={style.background}>
      </div>
      <main style={style.main}>
        <div style={style.component}>
          <img style={style.iconBackground} src={strokeColorImage} width={66} height={66}/>
          <img style={style.icon} src={symbolColorImage} width={36} height={36}/>
        </div>
        <div className="meter" style={style.component}>
          <span className="bar" style={barStyle}/>
        </div>
        <p className="msg" style={style.msg}>
          {msg}
        </p>
      </main>
    </div>
  );

}

Preparation.propTypes = {
  progress: PropTypes.number.isRequired,
  errorMsg: PropTypes.string,
};
