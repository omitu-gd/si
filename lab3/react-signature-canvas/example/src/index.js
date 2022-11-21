import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import md5 from 'md5';

import SignaturePad from '../../src/index.tsx';

import * as styles from './styles.module.css';

class App extends Component {
  state = { trimmedDataURL: null };

  sigPad = {};

  clear = () => {
    this.sigPad.clear();
  };

  trim = () => {
    this.setState({
      trimmedDataURL: this.sigPad.getTrimmedCanvas().toDataURL('image/png'),
    });
  };

  render() {
    const { trimmedDataURL } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.sigContainer}>
          <SignaturePad
            canvasProps={{ className: styles.sigPad }}
            ref={(ref) => {
              this.sigPad = ref;
            }}
          />
        </div>
        <div>
          <button className={styles.buttons} onClick={this.clear}>
            Clear
          </button>
          <button className={styles.buttons} onClick={this.trim}>
            Trim
          </button>
        </div>
        {trimmedDataURL ? (
          <img
            className={styles.sigImage}
            alt="signature"
            src={trimmedDataURL}
            onClick={() => {
              document.getElementById('download-signature').click();
              document.getElementById('download-signature-hash').click();
              console.log(md5(trimmedDataURL));
            }}
          />
        ) : null}
        {trimmedDataURL ? <a href={trimmedDataURL} id="download-signature" download /> : null}
        {trimmedDataURL ? (
          <a href={`data:text/txt,${md5(trimmedDataURL)}`} id="download-signature-hash" download="signature-hash.txt" />
        ) : null}
      </div>
    );
  }
}

createRoot(document.getElementById('container')).render(<App />);
