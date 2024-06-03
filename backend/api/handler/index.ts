interface Handler {
    setNext(handler: Handler): Handler;
    handle(request: any): void;
}

export abstract class AbstractHandler implements Handler {
    private nextHandler: Handler | null = null;

    public setNext(handler: Handler): Handler {
        this.nextHandler = handler;
        return handler;
    }

    public handle(request: any): void {
        if (this.nextHandler) {
            this.nextHandler.handle(request);
        }
    }
}
