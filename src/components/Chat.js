// @flow

import React, {Component} from 'react';
import {
  Button,
  Text,
  TextInput,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import ChatEngineCore from 'chat-engine';

const now = new Date().getTime();
const username = ['user', now].join('-');

let ChatEngine = ChatEngineCore.create(
  {
    publishKey: '<pub-key>',
    subscribeKey: '<sub-key>',
  },
  {
    // debug: true,
  },
);

export default class Chat extends Component {
  messages = [];
  state = {
    chatInput: '',
    dataSource: [],
    lobby: undefined,
    ready: false,
  };

  setChatInput = (value) => {
    this.setState({chatInput: value});
  };

  // Send chat to lobby
  sendChat = () => {
    let {chatInput, lobby} = this.state;
    if (chatInput && lobby) {
      lobby.emit('message', {
        text: chatInput,
      });

      this.setState({chatInput: ''});
    }
  };

  componentDidMount() {
    // Connect to CE server
    ChatEngine.connect(
      username,
      {
        signedOnTime: now,
      },
      'auth-key',
    );

    ChatEngine.on('$.ready', (data) => {
      let me = data.me;
      // Listen on any lobby invite
      me.direct.on('$.invite', (payload) => {
        let invitedChat = new ChatEngine.Chat(payload.data.channel);

        invitedChat.emit('message', {
          text: 'hello everybody!',
        });

        // Listen to new message on the lobby
        invitedChat.on('message', (payload) => {
          this.messages.push(payload);
          this.setState({
            dataSource: [...this.state.dataSource, payload],
          });
        });

        this.setState({
          lobby: invitedChat,
        });
      });

      console.log('READY', Platform.OS, me.uuid);
      this.setState({
        ready: true,
      });
    });
  }

  render() {
    return (
      <View style={{padding: 10}}>
        {this.state.lobby ? (
          <ScrollView>
            {this.state.dataSource.map((row, i) => {
              return (
                <View key={i}>
                  <Text>
                    {row.sender.uuid}: {row.data.text}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Button title="Create lobby" onPress={this._createLobby} />
        )}
        <TextInput
          style={{height: 40}}
          placeholder="Enter Chat Message Here!"
          onChangeText={(text) => this.setChatInput(text)}
          value={this.state.chatInput}
        />
        <View style={{flexDirection: 'row'}}>
          <Button
            disabled={!this.state.lobby}
            onPress={() => {
              this.sendChat();
            }}
            title="Send"
            color="#841584"
          />
          <Button onPress={this._invite} title="Invite" color="#40d544" />
        </View>
      </View>
    );
  }

  // Create a new chat lobby
  _createLobby = () => {
    if (this.state.ready) {
      let lobby = new ChatEngine.Chat('lobby');

      lobby.on('message', (payload) => {
        this.messages.push(payload);
        this.setState({
          dataSource: [...this.state.dataSource, payload],
        });
      });

      this.setState({
        lobby,
      });
    }
  };

  // Invite other user.
  _invite = () => {
    let {ready, chatInput, lobby} = this.state;
    if (ready && chatInput && lobby) {
      let invitedUser = ChatEngine.users[chatInput];
      if (invitedUser) {
        lobby.invite(invitedUser);
        lobby.emit('message', {
          text: `Invited ${chatInput}`,
        });
      } else {
        lobby.emit('message', {
          text: `User ${chatInput} not found.`,
        });
      }

      this.setState({chatInput: ''});
    }
  };
}
