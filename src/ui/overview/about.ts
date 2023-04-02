
import Vue from "vue";
import content from "../../../assets/about.md";
import Component from "vue-class-component";
import WithRender from "./about.vue";
import './about.scss'

@WithRender
@Component({})
export default class extends Vue {
    content = content
  }