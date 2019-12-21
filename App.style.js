import { StyleSheet, Dimensions } from "react-native";
import { Asset } from "expo-asset";

export class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

export const ICON_RECORD_BUTTON = new Icon(
  require("./assets/images/record_button.png"),
  70,
  119
);
export const ICON_RECORDING = new Icon(
  require("./assets/images/record_icon.png"),
  20,
  14
);

export const ICON_PLAY_BUTTON = new Icon(
  require("./assets/images/play_button.png"),
  34,
  51
);
export const ICON_PAUSE_BUTTON = new Icon(
  require("./assets/images/pause_button.png"),
  34,
  51
);
export const ICON_STOP_BUTTON = new Icon(
  require("./assets/images/stop_button.png"),
  22,
  22
);

export const ICON_MUTED_BUTTON = new Icon(
  require("./assets/images/muted_button.png"),
  67,
  58
);
export const ICON_UNMUTED_BUTTON = new Icon(
  require("./assets/images/unmuted_button.png"),
  67,
  58
);

export const ICON_TRACK_1 = new Icon(
  require("./assets/images/track_1.png"),
  166,
  5
);
export const ICON_THUMB_1 = new Icon(
  require("./assets/images/thumb_1.png"),
  18,
  19
);
export const ICON_THUMB_2 = new Icon(
  require("./assets/images/thumb_2.png"),
  15,
  19
);

 const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get(
  "window"
);

export const BACKGROUND_COLOR = "#FFF8ED";
export const LIVE_COLOR = "#FF0000";
export const DISABLED_OPACITY = 0.5;
export const RATE_SCALE = 3.0;

export const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR,
    minHeight: DEVICE_HEIGHT,
    maxHeight: DEVICE_HEIGHT
  },
  noPermissionsText: {
    textAlign: "center"
  },
  wrapper: {},
  halfScreenContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: DEVICE_HEIGHT / 2.0,
    maxHeight: DEVICE_HEIGHT / 2.0
  },
  recordingContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: ICON_RECORD_BUTTON.height,
    maxHeight: ICON_RECORD_BUTTON.height
  },
  recordingDataContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: ICON_RECORD_BUTTON.height,
    maxHeight: ICON_RECORD_BUTTON.height,
    minWidth: ICON_RECORD_BUTTON.width * 3.0,
    maxWidth: ICON_RECORD_BUTTON.width * 3.0
  },
  recordingDataRowContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: ICON_RECORDING.height,
    maxHeight: ICON_RECORDING.height
  },
  playbackContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: ICON_THUMB_1.height * 2.0,
    maxHeight: ICON_THUMB_1.height * 2.0
  },
  playbackSlider: {
    alignSelf: "stretch"
  },
  liveText: {
    color: LIVE_COLOR
  },
  recordingTimestamp: {
    paddingLeft: 20
  },
  playbackTimestamp: {
    textAlign: "right",
    alignSelf: "stretch",
    paddingRight: 20
  },
  image: {
    backgroundColor: BACKGROUND_COLOR
  },
  textButton: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 10
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  buttonsContainerTopRow: {
    maxHeight: ICON_MUTED_BUTTON.height,
    alignSelf: "stretch",
    paddingRight: 20
  },
  playStopContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: ((ICON_PLAY_BUTTON.width + ICON_STOP_BUTTON.width) * 3.0) / 2.0,
    maxWidth: ((ICON_PLAY_BUTTON.width + ICON_STOP_BUTTON.width) * 3.0) / 2.0
  },
  volumeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0
  },
  volumeSlider: {
    width: DEVICE_WIDTH / 2.0 - ICON_MUTED_BUTTON.width
  },
  buttonsContainerBottomRow: {
    maxHeight: ICON_THUMB_1.height,
    alignSelf: "stretch",
    paddingRight: 20,
    paddingLeft: 20
  },
  rateSlider: {
    width: DEVICE_WIDTH / 2.0
  }
});
