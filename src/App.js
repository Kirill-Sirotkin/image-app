import { useEffect, useState } from "react";
import "./App.css";

const { BlobServiceClient } = require("@azure/storage-blob");
const { InteractiveBrowserCredential } = require("@azure/identity");

function App() {
  const [blobs, setBlobs] = useState([]);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState();

  const getImages = async () => {
    const signInOptions = {
      // the client id is the application id, from your earlier app registration
      clientId: "fe873926-3ab0-468f-922c-c354148582a8",
      // this is your tenant id - the id of your azure ad tenant. available from your app registration overview
      tenantId: "e05e2a10-b5bc-4d6b-921b-9f23261a6223",
    };

    const blobStorageClient = new BlobServiceClient(
      // this is the blob endpoint of your storage acccount. Available from the portal
      // they follow this format: <accountname>.blob.core.windows.net for Azure global
      // the endpoints may be slightly different from national clouds like US Gov or Azure China
      "https://kirillcloudstorage.blob.core.windows.net/",
      new InteractiveBrowserCredential(signInOptions)
    );

    const containerClient = blobStorageClient.getContainerClient("images");
    const localBlobList = [];

    for await (const blob of containerClient.listBlobsFlat()) {
      localBlobList.push(blob);
    }

    setBlobs(localBlobList);
    setUrl(containerClient.url);
  };

  const uploadImage = async () => {
    if (file === undefined || file === null) return;

    const signInOptions = {
      clientId: "fe873926-3ab0-468f-922c-c354148582a8",
      tenantId: "e05e2a10-b5bc-4d6b-921b-9f23261a6223",
    };

    const blobStorageClient = new BlobServiceClient(
      "https://kirillcloudstorage.blob.core.windows.net/",
      new InteractiveBrowserCredential(signInOptions)
    );

    const containerClient = blobStorageClient.getContainerClient("images");
    containerClient
      .uploadBlockBlob(file.name, file, file.size)
      .then(getImages());
  };

  useEffect(() => {
    console.log("hello!");

    getImages().catch(console.error);
  }, []);

  return (
    <div className="App">
      <header>
        <div>IMAGES! total: {blobs.length}</div>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/png, image/jpeg"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "25px",
          }}
          onChange={(value) => setFile(value.target.files[0])}
        />
        <button className="upload" onClick={uploadImage}>
          upload
        </button>
      </header>
      <div className="images-wrapper">
        {blobs.map((img, i) => {
          return (
            <img
              className="image-card"
              src={url + "/" + img.name}
              alt="card"
              key={i}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
