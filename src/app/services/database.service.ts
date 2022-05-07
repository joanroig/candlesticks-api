import { Service } from "typedi";

@Service()
export default class DatabaseService {
  connect() {
    console.log(1);
  }
}
