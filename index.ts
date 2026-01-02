import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Html5Qrcode } from "html5-qrcode";

export class QRAutoScanner
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {

  private container!: HTMLDivElement;
  private notifyOutputChanged!: () => void;
  private value: string | undefined;

  private scanner!: Html5Qrcode;
  private lastValue: string = "";
  private isRunning = false;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.container = container;

    const scannerDiv = document.createElement("div");
    scannerDiv.id = "qr-reader";
    scannerDiv.style.width = "100%";
    scannerDiv.style.height = "100%";

    this.container.appendChild(scannerDiv);

    this.scanner = new Html5Qrcode("qr-reader");

    this.startScanner();
  }

  private startScanner() {
    if (this.isRunning) return;

    this.isRunning = true;

    this.scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        // 🔒 Debounce
        if (decodedText === this.lastValue) return;

        this.lastValue = decodedText;
        this.value = decodedText;

        this.notifyOutputChanged();
      },
      () => {}
    );
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {}

  public getOutputs(): IOutputs {
    return {
      value: this.value
    };
  }

  public destroy(): void {
    if (this.isRunning) {
      this.scanner.stop();
    }
  }
}
