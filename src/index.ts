import "reflect-metadata";
import Container from "typedi";
import Server from "./app/server";

const server = Container.get(Server);
server.start();
