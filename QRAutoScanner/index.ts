import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Html5Qrcode } from "html5-qrcode";

export class QRAutoScanner implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container!: HTMLDivElement;
    private notifyOutputChanged!: () => void;

    private scanner!: Html5Qrcode;
    private value: string | null = null;
    private lastValue: string | null = null;
    private lastResetValue: string | null = null;

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
        scannerDiv.style.minWidth = "570px";
        scannerDiv.style.minHeight = "500px";
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
            () => {
                // para não ficar vazio
            }
        );
    }

    private async restartScanner() {
    try {
        if (this.isRunning) {
            await this.scanner.stop();
            this.isRunning = false;
        }

        this.lastValue = null;
        this.value = null;

        this.startScanner();
        } catch (err) {
            console.error("Erro ao reiniciar scanner", err);
        }
    }


    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Não precisa renderizar nada aqui,
        // mas o método NÃO pode ser omitido

        const resetValue = context.parameters.resetScanner?.raw;

        // 🔥 Detecta mudança
        if (resetValue && resetValue !== this.lastResetValue) {
            this.lastResetValue = resetValue;
            this.restartScanner();
        }
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
