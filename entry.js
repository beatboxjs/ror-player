import "bootstrap";
import "angular-ui-bootstrap";
import "angular-bootstrap-slider";
import "angular-ui-router";
import "ngdraggable";
import "mp3";
import "beatbox.js-export";

import "./assets/styles.scss";
import "./build/audioFiles";

let requireContext = require.context("./app", true, /\.js$/);
requireContext.keys().map(requireContext);