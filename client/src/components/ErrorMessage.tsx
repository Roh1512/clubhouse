import { useState } from "react";
import Alert from "react-bootstrap/Alert";

type Props = {
  message: string;
};

function ErrorMessage({ message }: Props) {
  const [show, setShow] = useState(true);

  if (show) {
    return (
      <Alert
        variant="danger"
        onClose={() => setShow(false)}
        dismissible
        className="errorMessageContainer"
      >
        <p>{message}</p>
      </Alert>
    );
  }
}

export default ErrorMessage;
