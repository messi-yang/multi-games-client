import { Axios } from 'axios';
import { RoomModel } from '@/models/room/room-model';
import { AxiosProvider } from '@/adapters/apis/axios-provider';
import { RoomDto, parseRoomDto } from '../dtos/room-dto';

export class RoomApi {
  private axios: Axios;

  constructor() {
    this.axios = AxiosProvider.create(`${process.env.API_URL}/api/rooms`);
  }

  static create(): RoomApi {
    return new RoomApi();
  }

  async queryRooms(limit: number, offset: number): Promise<RoomModel[]> {
    const { data } = await this.axios.get<RoomDto[]>('/', {
      params: {
        limit,
        offset,
      },
    });
    return data.map(parseRoomDto);
  }

  async getMyRooms(): Promise<RoomModel[]> {
    const { data } = await this.axios.get<RoomDto[]>('/mine');
    return data.map(parseRoomDto);
  }

  async createRoom(name: string): Promise<RoomModel> {
    const { data } = await this.axios.post<RoomDto>('/', {
      name,
    });
    return parseRoomDto(data);
  }

  async deleteRoom(roomId: string): Promise<Error | null> {
    try {
      await this.axios.delete(`/${roomId}`);
      return null;
    } catch (e: any) {
      return e;
    }
  }
}
