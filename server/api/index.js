import serverlessHttp from "serverless-http";
import app from "../expressApp.js";

export const config = {
  runtime: "nodejs18.x"
};

export default serverlessHttp(app);


