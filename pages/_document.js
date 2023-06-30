import Document, { Html, Head, Main, NextScript } from "next/document";

class AmbrApp extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body style={{ minH: "-webkit-fill-available", height: "100vh" }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default AmbrApp;
