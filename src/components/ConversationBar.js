import React from "react";
import PropTypes from "prop-types";
import appsync from "../images/appsync.png";
import logo from "../images/logo.png";

const ConversationBar = ({ conversation, name, switchView }) => {
  return (
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
};
ConversationBar.propTypes = {
  conversation: PropTypes.object,
  name: PropTypes.string,
  switchView: PropTypes.func.isRequired
};

export default ConversationBar;
