import "reflect-metadata";
import Container from "typedi";
import App from "./app/app";

const server = Container.get(App);
server.start();
