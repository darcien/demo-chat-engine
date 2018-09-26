import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Constants} from 'expo';

import Chat from './components/Chat';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Chat />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
  },
});
