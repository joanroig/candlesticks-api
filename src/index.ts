import "reflect-metadata";
import Container from "typedi";
import App from "./app/app";

const app = Container.get(App);
app.start();
