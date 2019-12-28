/**
 * @flow
 */

import React from "react";
import {
  Image,
  Slider,
  Text,
  TouchableHighlight,
  View,
  Button,
  AsyncStorage
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Font from "expo-font";
import * as Permissions from "expo-permissions";
import { Sound } from "expo-av/build/Audio";
import {
  styles,
  BACKGROUND_COLOR,
  ICON_RECORD_BUTTON,
  ICON_RECORDING,
  ICON_PLAY_BUTTON,
  ICON_PAUSE_BUTTON,
  ICON_STOP_BUTTON,
  ICON_MUTED_BUTTON,
  ICON_UNMUTED_BUTTON,
  ICON_TRACK_1,
  ICON_THUMB_1,
  ICON_THUMB_2,
  DISABLED_OPACITY,
  RATE_SCALE
} from "./App.style";
import { Ionicons, AntDesign } from "@expo/vector-icons";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.recording = null;
    this.sound = null;
    this.simpleSound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: false,
      isLoading: false,
      isPlaybackAllowed: false,
      muted: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
      currentSentence: 0
    };
    this.recordingSettings = JSON.parse(
      JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
    );
    // // UNCOMMENT THIS TO TEST maxFileSize:
    // this.recordingSettings.android['maxFileSize'] = 12000;
  }

  componentDidMount() {
    (async () => {
      await Font.loadAsync({
        "cutive-mono-regular": require("./assets/fonts/CutiveMono-Regular.ttf")
      });
      this.setState({ fontLoaded: true });
    })();
    this._askForPermissions();
    this._loadCurrentSentenceIndex();
  }

  _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === "granted"
    });
  };

  _updateScreenForSoundStatus = status => {
    if (status.isLoaded) {
      if (status.positionMillis == status.durationMillis) {
        this.setState({
          ...this.state,
          soundPosition: 0
        });
        this.sound.stopAsync();
      } else {
        this.setState({
          soundDuration: status.durationMillis,
          soundPosition: status.positionMillis,
          shouldPlay: status.shouldPlay,
          isPlaying: status.isPlaying,
          rate: status.rate,
          muted: status.isMuted,
          volume: status.volume,
          shouldCorrectPitch: status.shouldCorrectPitch,
          isPlaybackAllowed: true
        });
      }
    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _updateScreenForRecordingStatus = status => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true
    });
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true
    });
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true
    });
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    const info = await FileSystem.getInfoAsync(this.recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true
    });
    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: false,
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch
      },
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.setState({
      isLoading: false
    });
  }

  _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  };

  _onPlayPausePressed = () => {
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
    }
  };

  _onStopPressed = () => {
    if (this.sound != null) {
      this.sound.stopAsync();
    }
  };

  _onMutePressed = () => {
    if (this.sound != null) {
      this.sound.setIsMutedAsync(!this.state.muted);
    }
  };

  _onVolumeSliderValueChange = value => {
    if (this.sound != null) {
      this.sound.setVolumeAsync(value);
    }
  };

  _onSeekSliderValueChange = value => {
    if (this.sound != null && !this.isSeeking) {
      this.isSeeking = true;
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.sound.pauseAsync();
    }
  };

  _onSeekSliderSlidingComplete = async value => {
    if (this.sound != null) {
      this.isSeeking = false;
      const seekPosition = value * this.state.soundDuration;
      if (this.shouldPlayAtEndOfSeek) {
        this.sound.playFromPositionAsync(seekPosition);
      } else {
        this.sound.setPositionAsync(seekPosition);
      }
    }
  };

  _getSeekSliderPosition() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return this.state.soundPosition / this.state.soundDuration;
    }
    return 0;
  }

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = number => {
      const string = number.toString();
      if (number < 10) {
        return "0" + string;
      }
      return string;
    };
    return padWithZero(minutes) + ":" + padWithZero(seconds);
  }

  _getPlaybackTimestamp() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return `${this._getMMSSFromMillis(
        this.state.soundPosition
      )} / ${this._getMMSSFromMillis(this.state.soundDuration)}`;
    }
    return "";
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  _saveCurrentSentenceIndex() {
    AsyncStorage.setItem(
      "CurrentSentenceIndex",
      this.state.currentSentence.toString(),
      _error => {
        if (!!_error) alert(_error);
      }
    );
  }

  _loadCurrentSentenceIndex() {
    const _this = this;
    AsyncStorage.getItem("CurrentSentenceIndex", (error, result) => {
      if (!error) {
        if (!!result) _this.setState({ currentSentence: Number(result) });
      } else {
        alert("error when getting current index");
      }
    });
  }

  _playCurrent() {
    if (this.simpleSound) {
      this.simpleSound.setPositionAsync(0);
      this.simpleSound.playAsync();
      return;
    }

    this.simpleSound = new Sound();
    const position = this.state.currentSentence.toString();
    const url = `https://s3.eu-central-1.amazonaws.com/liutaoran.com/audio/10_spektrum_a2-1_${
      position.length > 1 ? position : "0" + position
    }.mp3`;
    this.simpleSound
      .loadAsync({
        uri: url
      })
      .then(() => {
        this.simpleSound.playAsync();
      });
  }

  render() {
    if (!this.state.fontLoaded) {
      return <View style={styles.emptyContainer} />;
    }

    if (!this.state.haveRecordingPermissions) {
      return (
        <View style={styles.container}>
          <View />
          <Text
            style={[
              styles.noPermissionsText,
              { fontFamily: "cutive-mono-regular" }
            ]}
          >
            You must enable audio recording permissions in order to use this
            app.
          </Text>
          <View />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.halfScreenContainer,
            {
              opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0
            }
          ]}
        >
          <View />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignContent: "space-between",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <View
              style={{
                flex: 2,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                onPress={() => {
                  this.setState({
                    ...this.state,
                    currentSentence: this.state.currentSentence - 1
                  });
                  this.simpleSound = null;
                  this._saveCurrentSentenceIndex();

                  this._playCurrent();
                }}
              >
                <AntDesign name="stepbackward" size={32} />
              </TouchableHighlight>
            </View>
            <View style={{ flex: 3, alignItems: "center" }}>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                onPress={() => this._playCurrent()}
              >
                <AntDesign name="play" size={32} />
              </TouchableHighlight>
            </View>
            <View
              style={{
                flex: 2,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                onPress={() => {
                  this.setState({
                    ...this.state,
                    currentSentence: this.state.currentSentence + 1
                  });
                  this.simpleSound = null;
                  this._saveCurrentSentenceIndex();

                  this._playCurrent();
                }}
              >
                <AntDesign name="stepforward" size={32} />
              </TouchableHighlight>
            </View>
          </View>
          <View />
          <View
            style={{
              flex: 1,
              flexDirection: "row"
            }}
          >
            <Text
              style={[styles.liveText, { fontFamily: "cutive-mono-regular" }]}
            >
              {this.state.isRecording ? "LIVE" : ""}
            </Text>
            <Image
              style={[
                styles.image,
                { opacity: this.state.isRecording ? 1.0 : 0.0 }
              ]}
              source={ICON_RECORDING.module}
            />
            <Text
              style={[
                styles.recordingTimestamp,
                { fontFamily: "cutive-mono-regular" }
              ]}
            >
              {this._getRecordingTimestamp()}
            </Text>
          </View>
        </View>

        <View style={[styles.halfScreenContainer]}>
          <View />
          <View style={styles.playbackContainer}>
            <Slider
              style={styles.playbackSlider}
              trackImage={ICON_TRACK_1.module}
              thumbImage={ICON_THUMB_1.module}
              value={this._getSeekSliderPosition()}
              onValueChange={this._onSeekSliderValueChange}
              onSlidingComplete={this._onSeekSliderSlidingComplete}
              disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
            />
            <Text
              style={[
                styles.playbackTimestamp,
                { fontFamily: "cutive-mono-regular" }
              ]}
            >
              {this._getPlaybackTimestamp()}
            </Text>
          </View>
          <View
            style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center"
              }}
            >
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={[styles.wrapper]}
                onPress={this._onRecordPressed}
                disabled={this.state.isLoading}
              >
                <Image
                  style={[styles.image]}
                  source={ICON_RECORD_BUTTON.module}
                />
              </TouchableHighlight>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: "center"
              }}
            >
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onPlayPausePressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              >
                <Image
                  style={[
                    styles.image,
                    {
                      opacity:
                        !this.state.isPlaybackAllowed || this.state.isLoading
                          ? DISABLED_OPACITY
                          : 1.0
                    }
                  ]}
                  source={
                    this.state.isPlaying
                      ? ICON_PAUSE_BUTTON.module
                      : ICON_PLAY_BUTTON.module
                  }
                />
              </TouchableHighlight>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: "center"
              }}
            >
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={() => {
                  this._playCurrent();
                }}
              >
                <Image
                  style={styles.image}
                  source={ICON_UNMUTED_BUTTON.module}
                />
              </TouchableHighlight>
            </View>
          </View>

          <View />
        </View>
      </View>
    );
  }
}
