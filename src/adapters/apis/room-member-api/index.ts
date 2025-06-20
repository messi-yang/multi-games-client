import { Axios } from 'axios';
import { AxiosProvider } from '@/adapters/apis/axios-provider';
import { RoomMemberModel } from '@/models/room-member-model';
import { RoomMemberDto, parseRoomMemberDto } from '../dtos/room-member-dto';

export class RoomMemberApi {
  private axios: Axios;

  constructor() {
    this.axios = AxiosProvider.create(`${process.env.API_URL}/api/rooms`);
  }

  static create(): RoomMemberApi {
    return new RoomMemberApi();
  }

  async getRoomMembers(roomId: string): Promise<RoomMemberModel[]> {
    const { data } = await this.axios.get<RoomMemberDto[]>(`/${roomId}/members`);
    return data.map(parseRoomMemberDto);
  }
}
