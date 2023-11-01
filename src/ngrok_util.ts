import axios, { AxiosError } from "axios";
import chalk from "chalk";

// const desired = { url: "", method: "POST" };
export const getNgrokUrl = async () => {
  try {
    let res = await axios.get("http://localhost:4040/api/tunnels");
    // console.log(res.data);
    if (
      res &&
      res.status == 200 &&
      res.data &&
      res.data.tunnels &&
      res.data.tunnels.length > 0 &&
      res.data.tunnels[0].public_url
    ) {
      const url = `${res.data.tunnels[0].public_url}/twiml`;
      return url;
    } else {
      console.error(`no ngrok url via api ${res.status}`);
    }
  } catch (err: any) {
    const aErr = err as AxiosError;
    console.error(aErr.message);
  }
  // return "https://random";
  process.exit(-1);
};
