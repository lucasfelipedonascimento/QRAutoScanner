import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Html5Qrcode } from "html5-qrcode";

export class QRAutoScanner implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container!: HTMLDivElement;
    private notifyOutputChanged!: () => void;

    private scanner!: Html5Qrcode;
    private value: string | null = null;
    private lastValue: string | null = null;
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
        scannerDiv.style.backgroundColor = "#000";
        scannerDiv.style.color = "#fff";
        scannerDiv.innerText = "Ler QR Code"

        this.container.appendChild(scannerDiv);

        this.scanner = new Html5Qrcode("qr-reader");
        this.startScanner();
    }

    private startScanner() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.scanner.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: 800 },
            (decodedText) => {
                // 🔒 Evita leitura duplicada imediata
                if (decodedText === this.lastValue) return;

                this.lastValue = decodedText;
                this.value = decodedText;

                this.notifyOutputChanged();

                // 🔓 Libera para próxima leitura após pequeno delay
                setTimeout(() => {
                    this.value = null;
                    this.notifyOutputChanged();
                }, 300);
            },
            () => {}
        );
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Não precisa renderizar nada aqui,
        // mas o método NÃO pode ser omitido
    }

    public getOutputs(): IOutputs {
        return {
            Texto_Escaneado: this.value ?? undefined
        };
    }

    public destroy(): void {
        if (this.isRunning) {
            this.scanner.stop();
        }
    }
}
