const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/sendOtp", async (req, res) => {
  const { name, mobile } = req.body;
  const sanitized_number = mobile.toString().replace(/[- )(]/g, ""); // remove unnecessary chars from the number
  const final_number = `91${sanitized_number.substring(
    sanitized_number.length - 10
  )}`; // add 91 before the number here 91 is country code of India

  const number_details = await client.getNumberId(final_number); // get mobile number details

  if (number_details) {
    try {
      const sendMessageData = await client.sendMessage(
        number_details._serialized,
        `Hey ${name}, 4021 is your SECRET OTP for Login on www.taycoonfashions.com. Please Do not Share this OTP.`
      );
      return res.json({ message: "OTP sent Successfully" });
    } catch (error) {
      console.log(error);
      return res.json({ message: "Error Sending Message" });
    }
  } else {
    console.log(final_number, "Mobile number is not registered");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  client.initialize();
});
