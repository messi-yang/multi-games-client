import { EventHandler } from '../common/event-handler';

let instance: NotificationEventHandler | null = null;

export class NotificationEventHandler {
  private errorMessageEventHandler: EventHandler<string> = EventHandler.create<string>();

  private generalMessageEventHandler: EventHandler<string> = EventHandler.create<string>();

  static create(): NotificationEventHandler {
    if (!instance) {
      instance = new NotificationEventHandler();
    }

    return instance;
  }

  public publishErrorMessage(message: string) {
    this.errorMessageEventHandler.publish(message);
  }

  public publishGeneralMessage(message: string) {
    this.generalMessageEventHandler.publish(message);
  }

  public subscribeErrorMessage(eventHandler: (message: string) => void): () => void {
    return this.errorMessageEventHandler.subscribe(eventHandler);
  }

  public subscribeGeneralMessage(eventHandler: (message: string) => void): () => void {
    return this.generalMessageEventHandler.subscribe(eventHandler);
  }
}
