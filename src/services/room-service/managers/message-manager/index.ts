import { EventHandler, EventHandlerSubscriber } from '@/event-dispatchers/common/event-handler';
import { MessageModel } from '@/models/message/message-model';

export class MessageManager {
  private messages: MessageModel[];

  private messageAddedEventHandler = EventHandler.create<MessageModel>();

  private localMessageAddedEventHandler = EventHandler.create<MessageModel>();

  private constructor() {
    this.messages = [];
  }

  public static create(): MessageManager {
    return new MessageManager();
  }

  public getMessages(): MessageModel[] {
    return this.messages;
  }

  public addLocalMessage(message: MessageModel): void {
    this.messages.push(message);
    this.publishMessageAddedEvent(message);
    this.publishLocalMessageAddedEvent(message);
  }

  public addRemoteMessage(message: MessageModel): void {
    this.messages.push(message);
    this.publishMessageAddedEvent(message);
  }

  public subscribeMessageAddedEvent(subscriber: EventHandlerSubscriber<MessageModel>): () => void {
    return this.messageAddedEventHandler.subscribe(subscriber);
  }

  private publishMessageAddedEvent(message: MessageModel): void {
    this.messageAddedEventHandler.publish(message);
  }

  public subscribeLocalMessageAddedEvent(subscriber: EventHandlerSubscriber<MessageModel>): () => void {
    return this.localMessageAddedEventHandler.subscribe(subscriber);
  }

  private publishLocalMessageAddedEvent(message: MessageModel): void {
    this.localMessageAddedEventHandler.publish(message);
  }
}
