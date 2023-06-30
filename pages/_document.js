import Document, { Html, Head, Main, NextScript } from "next/document";
import Div100vh from "react-div-100vh";
class AmbrApp extends Document {
  render() {
    return (
      <Html>
        <Head />
        <Div100vh>
          <body
            style={{ minHeight: "-webkit-fill-available", height: "100vh" }}
          >
            <Main />
            <NextScript />
          </body>
        </Div100vh>
      </Html>
    );
  }
}

export default AmbrApp;
