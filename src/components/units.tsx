import { Dimensions } from "react-native";

export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const SCREEN_WIDTH = Dimensions.get("window").width;

// Adding a dummy default export to avoid the warning
const defaultExport = {};
export default defaultExport;
