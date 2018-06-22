import app from "../../app";
import "./overview.scss";

app.directive("bbOverview", function() {
	return {
		template: require("./overview.html")
	};
});