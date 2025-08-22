import serverlessHttp from "serverless-http";
import app from "../expressApp.js";

export const config = {
  runtime: "nodejs"
};

export default serverlessHttp(app);


