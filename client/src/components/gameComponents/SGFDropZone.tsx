import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

type Props = Readonly<{}>;
export const SGFDropZone = (props: Props): JSX.Element => {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Container maxWidth="sm">
      <div
        style={{ backgroundColor: "Ivory", height: "5vh" }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <p>Drop SGF files here</p>
      </div>
    </Container>
  );
};
