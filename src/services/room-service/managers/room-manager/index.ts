import { EventHandler, EventHandlerSubscriber } from '@/event-dispatchers/common/event-handler';
import { RoomModel } from '@/models/room/room-model';

export class RoomManager {
  private room: RoomModel;

  private roomUpdatedEventHandler = EventHandler.create<RoomModel>();

  private constructor(room: RoomModel) {
    this.room = room;
  }

  static create(room: RoomModel) {
    return new RoomManager(room);
  }

  public getRoom(): RoomModel {
    return this.room;
  }

  public updateRoom(room: RoomModel) {
    this.room = room;
    this.publishRoomUpdatedEvent(room);
  }

  private publishRoomUpdatedEvent(room: RoomModel) {
    this.roomUpdatedEventHandler.publish(room);
  }

  public subscribeRoomUpdatedEvent(subscriber: EventHandlerSubscriber<RoomModel>) {
    return this.roomUpdatedEventHandler.subscribe(subscriber);
  }
}
