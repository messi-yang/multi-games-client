import { DateVo } from '@/models/global/date-vo';
import { MessageModel } from '@/models/message/message-model';

export type MessageDto = {
  id: string;
  playerName: string | null;
  content: string;
  createdAt: string;
};

export function parseMessageDto(dto: MessageDto): MessageModel {
  return MessageModel.load({
    id: dto.id,
    playerName: dto.playerName,
    content: dto.content,
    createdAt: DateVo.parseString(dto.createdAt),
  });
}

export function generateMessageDto(message: MessageModel): MessageDto {
  return {
    id: message.getId(),
    playerName: message.getPlayerName() ?? null,
    content: message.getContent(),
    createdAt: message.getCreatedAt().toString(),
  };
}
