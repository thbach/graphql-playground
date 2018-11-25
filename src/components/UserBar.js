import React from "react";
import PropTypes from "prop-types";

const UserBar = ({ name, registered, switchView }) => (
  <div className="topbar">
    <nav className="navbar navbar-bbb bg-primary">
      <div className="navbar-brand">
        <span className={"mr-2 text-" + "dark"}>
          <i className="fas fa-robot" />
        </span>
        <span>GraphAI</span>
      </div>
    </nav>
  </div>
);
UserBar.propTypes = {
  name: PropTypes.string,
  registered: PropTypes.bool,
  switchView: PropTypes.func.isRequired
};

export default UserBar;
