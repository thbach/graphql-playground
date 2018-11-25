import React, { Component } from "react";
import PropTypes from "prop-types";
import { Auth } from "aws-amplify";
import { graphql, compose } from "react-apollo";
import { getUser } from "../graphql/queries";
import {
  registerUser,
  createConvo,
  createConvoLink,
  updateConvoLink
} from "../graphql/mutations";

import UserBar from "./UserBar";
import SideBar from "./SideBar";
import { MessengerWithData } from "./Messenger";
import gql from "graphql-tag";

function chatName(userName) {
  return `${userName}`;
}

const convoList = {};

class ChatApp extends Component {
  state = {
    conversation: undefined,
    registered: false,
    viewCN: true
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { data: { loading, getUser } = {} } = this.props;
  }

  initConvo = selection => {
    console.log("initConvo", selection);
    return this.gotoConversation({ convoLink: selection });
  };

  startConvoWithUser = async ({ user }) => {
    let conversationInfo = this.findConverationWithUser(user);
    if (!conversationInfo) {
      console.log("no convo, launch new");
      conversationInfo = await this.launchNewConversation(user);
    }
    console.log("Got the convo", conversationInfo);
    this.setState({ ...conversationInfo, viewCN: false });
  };

  gotoConversation = ({ convoLink }) => {
    console.log("goto", convoLink.conversation);
    this.setState({
      conversation: convoLink.conversation,
      conversationName: convoLink.name,
      viewCN: false
    });
  };

  startConvoAtMessage = ({ message }) => {
    const {
      data: {
        getUser: { userConversations: { items: convoLinks = [] } = {} } = {}
      } = {}
    } = this.props;
    const convoLink = convoLinks.find(
      c => c.conversation.id === message.messageConversationId
    );
    if (convoLink) {
      this.setState({
        conversation: convoLink.conversation,
        conversationName: convoLink.name,
        viewCN: false
      });
    }
  };

  findConverationWithUser = user => {
    const {
      data: {
        getUser: { userConversations: { items: convoLinks = [] } = {} } = {}
      } = {}
    } = this.props;
    const convoLink = convoLinks.find(c => {
      const {
        conversation: { associated: { items: assoc = [] } = {} } = {}
      } = c;
      return assoc.some(a => a.convoLinkUserId === user.id);
    });
    return convoLink
      ? {
          conversation: convoLink.conversation,
          conversationName: convoLink.name
        }
      : null;
  };

  launchNewConversation = user => {
    let resolveFn;
    const promise = new Promise((resolve, reject) => {
      resolveFn = resolve;
    });

    this.props.createConvo({
      update: async (proxy, { data: { createConvo } }) => {
        console.log("update, ", createConvo);
        if (createConvo.id === "-1" || convoList[`${createConvo.id}`]) {
          return;
        }
        convoList[`${createConvo.id}`] = true;
        const me = this.props.data.getUser;
        const otherChatName = chatName(me.username);
        const myChatName = chatName(user.username);
        const links = await Promise.all([
          this.linkNewConversation(createConvo.id, user.id, otherChatName),
          this.linkNewConversation(createConvo.id, me.id, myChatName)
        ]);
        console.log("next steps", links);
        const promises = links.map(c => this.updateToReadyConversation(c));
        const convoLinks = await Promise.all(promises);
        resolveFn({
          conversation: convoLinks[0].conversation,
          conversationName: myChatName
        });
      }
    });
    return promise;
  };

  linkNewConversation = (convoId, userId, chatName) => {
    console.log("linkNewConversation - start", convoId, userId, chatName);

    let resolveFn;
    const promise = new Promise((resolve, reject) => {
      resolveFn = resolve;
    });
    this.props.createConvoLink({
      variables: { convoId, userId, name: chatName },
      optimisticResponse: {
        createConvoLink: {
          __typename: "ConvoLink",
          id: "-1",
          status: "PENDING",
          name: chatName,
          conversation: {
            __typename: "Conversation",
            id: convoId,
            name: "",
            createdAt: "",
            associated: {
              __typename: "ModelConvoLinkConnection",
              items: []
            }
          }
        }
      },
      update: async (proxy, { data: { createConvoLink } }) => {
        if (createConvoLink.id === "-1") {
          return;
        }
        resolveFn(createConvoLink);
      }
    });
    return promise;
  };

  updateToReadyConversation = convoLink => {
    console.log("updateToReadyConversation - update", convoLink);

    let resolveFn;
    const promise = new Promise((resolve, reject) => {
      resolveFn = resolve;
    });

    this.props.updateConvoLink({
      variables: { id: convoLink.id },
      optimisticResponse: {
        updateConvoLink: {
          __typename: "ConvoLink",
          id: convoLink.id,
          name: convoLink.name,
          convoLinkUserId: "-1",
          status: "CONFIRMING",
          conversation: {
            __typename: "Conversation",
            id: convoLink.conversation.id,
            name: "",
            createdAt: "",
            associated: {
              __typename: "ModelConvoLinkConnection",
              items: []
            }
          }
        }
      },
      update: async (proxy, { data: { updateConvoLink } }) => {
        console.log("confirmLink , ", updateConvoLink);
        if (updateConvoLink.status === "READY") {
          resolveFn(updateConvoLink);
        }
      }
    });
    return promise;
  };

  switchView = () => {
    this.setState({ viewCN: !this.state.viewCN });
    //this.gotoConversation
  };

  render() {
    let { data: { subscribeToMore, getUser: user = {} } = {} } = this.props;
    user = user || { name: "", registered: false };

    let cn = this.state.viewCN ? "switchview" : "";
    cn +=
      " " +
      "bg-secondary row no-gutters align-items-stretch w-100 h-100 position-absolute";

    return (
      <div className={cn}>
        <div className="col-4 drawer bg-white">
          <div className="border-right border-secondary h-100">
            <UserBar switchView={this.switchView} name={user.username} />
            <SideBar
              {...{
                subscribeToMore,
                userId: user.id,
                conversations: user.userConversations,
                onChange: this.initConvo
              }}
            />
          </div>
        </div>
        <div className="col viewer bg-white">
          <MessengerWithData
            switchView={this.switchView}
            conversation={this.state.conversation}
            conversationName={this.state.conversationName}
            userId={this.props.id}
          />
        </div>
      </div>
    );
  }
}
ChatApp.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  data: PropTypes.object,
  registerUser: PropTypes.func.isRequired,
  createConvo: PropTypes.func.isRequired,
  createConvoLink: PropTypes.func.isRequired,
  updateConvoLink: PropTypes.func.isRequired
};

const ChatAppWithData = compose(
  graphql(
    gql`
      ${getUser}
    `,
    {
      skip: props => !props.id,
      options: props => ({
        variables: { id: props.id },
        fetchPolicy: "cache-and-network"
      })
    }
  ),
  graphql(
    gql`
      ${registerUser}
    `,
    {
      name: "registerUser",
      options: props => ({
        variables: {
          input: {
            id: props.id,
            username: props.name,
            registered: true
          }
        },
        optimisticResponse: {
          registerUser: {
            id: props.id,
            username: "Standby",
            registered: false,
            __typename: "User",
            userConversations: {
              __typename: "ModelConvoLinkConnection",
              items: []
            }
          }
        },
        update: (proxy, { data: { registerUser } }) => {
          const QUERY = {
            query: getUser,
            variables: { id: props.id }
          };
          const prev = proxy.readQuery(QUERY);
          console.log("prev getUser", prev);
          const data = {
            ...prev,
            getUser: { ...registerUser }
          };
          proxy.writeQuery({ ...QUERY, data });
        }
      })
    }
  ),
  graphql(
    gql`
      ${createConvo}
    `,
    {
      name: "createConvo",
      options: props => ({
        ignoreResults: true,
        variables: {
          input: { name: "direct" }
        },
        optimisticResponse: {
          createConvo: {
            id: "-1",
            name: "direct",
            createdAt: "",
            __typename: "Conversation",
            associated: {
              __typename: "ModelConvoLinkConnection",
              items: []
            }
          }
        }
      })
    }
  ),
  graphql(
    gql`
      ${createConvoLink}
    `,
    {
      name: "createConvoLink",
      options: props => ({
        ignoreResults: true
      })
    }
  ),
  graphql(
    gql`
      ${updateConvoLink}
    `,
    {
      name: "updateConvoLink",
      options: props => ({
        ignoreResults: true
      })
    }
  )
)(ChatApp);

export default ChatApp;
export { ChatAppWithData };
