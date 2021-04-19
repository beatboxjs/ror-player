declare module "html-webpack-inline-source-plugin";

declare module "stream-combiner2" {
	export function obj(...streams: NodeJS.ReadWriteStream[]): NodeJS.ReadWriteStream;
}