import { createContext, useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { WorldJourneyApi } from '@/adapters/apis/world-journey-api';
import { DirectionVo } from '@/models/world/common/direction-vo';
import { WorldJourneyService } from '@/services/world-journey-service';
import { PlayerActionVo } from '@/models/world/player/player-action-vo';
import { ChangePlayerActionCommand } from '@/services/world-journey-service/managers/command-manager/commands/change-player-action-command';
import { NotificationEventDispatcher } from '@/event-dispatchers/notification-event-dispatcher';

type ConnectionStatus = 'WAITING' | 'CONNECTING' | 'OPEN' | 'DISCONNECTED';

type ContextValue = {
  worldJourneyService: WorldJourneyService | null;
  connectionStatus: ConnectionStatus;
  enterWorld: (worldId: string) => void;
  updateCameraPosition: () => void;
  makePlayerStand: () => void;
  makePlayerWalk: (direction: DirectionVo) => void;
  leaveWorld: () => void;
};

const Context = createContext<ContextValue>({
  worldJourneyService: null,
  connectionStatus: 'WAITING',
  enterWorld: () => {},
  updateCameraPosition: () => {},
  makePlayerStand: () => {},
  makePlayerWalk: () => {},
  leaveWorld: () => {},
});

type Props = {
  children: React.ReactNode;
};

export function Provider({ children }: Props) {
  const [worldJourneyService, setWorldJourneyService] = useState<WorldJourneyService | null>(null);
  useEffect(() => {
    // @ts-expect-error
    window.worldJourneyService = worldJourneyService;
  }, [worldJourneyService]);

  const notificationEventDispatcher = useMemo(() => NotificationEventDispatcher.create(), []);

  const worldJourneyApi = useRef<WorldJourneyApi | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('WAITING');

  useEffect(() => {
    return () => {
      worldJourneyService?.destroy();
    };
  }, [worldJourneyService]);

  const leaveWorld = useCallback(() => {
    worldJourneyApi.current?.disconnect();
    worldJourneyApi.current = null;
    setWorldJourneyService(null);
    setConnectionStatus('WAITING');
  }, []);

  const enterWorld = useCallback((worldId: string) => {
    if (worldJourneyApi.current) {
      leaveWorld();
      return;
    }

    let newWorldJourneyService: WorldJourneyService | null = null;
    const newWorldJourneyApi = WorldJourneyApi.create(worldId, {
      onWorldEntered: (_worldJourneyService) => {
        newWorldJourneyService = _worldJourneyService;
        setWorldJourneyService(_worldJourneyService);
      },
      onCommandReceived: (command) => {
        if (!newWorldJourneyService) return;
        newWorldJourneyService.executeRemoteCommand(command);
      },
      onCommandFailed: (commandId) => {
        if (!newWorldJourneyService) return;
        newWorldJourneyService.removeFailedCommand(commandId);
      },
      onErrored: (message) => {
        notificationEventDispatcher.publishErrorTriggeredEvent(message);
      },
      onOpen: () => {
        setConnectionStatus('OPEN');
      },
      onDisconnect: () => {
        worldJourneyApi.current = null;
        setWorldJourneyService(null);
        setConnectionStatus('DISCONNECTED');
      },
    });
    setConnectionStatus('CONNECTING');
    worldJourneyApi.current = newWorldJourneyApi;
  }, []);

  useEffect(() => {
    if (!worldJourneyService) return () => {};

    return worldJourneyService.subscribe('LOCAL_COMMAND_EXECUTED', (command) => {
      if (!worldJourneyApi.current) return;

      worldJourneyApi.current.sendCommand(command);
    });
  }, [worldJourneyService]);

  const updateCameraPosition = useCallback(() => {
    if (!worldJourneyService) return;

    worldJourneyService.updateCameraPosition();
  }, [worldJourneyService]);

  const makePlayerStand = useCallback(() => {
    if (!worldJourneyApi.current || !worldJourneyService) {
      return;
    }

    const myPlayer = worldJourneyService.getMyPlayer();
    if (myPlayer.getAction().isStand()) return;

    const playerDirection = worldJourneyService.getMyPlayer().getDirection();
    const playerAction = PlayerActionVo.newStand(playerDirection);
    const command = ChangePlayerActionCommand.create(myPlayer.getId(), playerAction);
    worldJourneyService.executeLocalCommand(command);
  }, [worldJourneyService]);

  const makePlayerWalk = useCallback(
    (direction: DirectionVo) => {
      if (!worldJourneyApi.current || !worldJourneyService) {
        return;
      }

      const myPlayer = worldJourneyService.getMyPlayer();
      const playerAction = PlayerActionVo.newWalk(direction);
      const command = ChangePlayerActionCommand.create(myPlayer.getId(), playerAction);
      worldJourneyService.executeLocalCommand(command);
    },
    [worldJourneyService]
  );

  const context = {
    worldJourneyService,
    connectionStatus,
    enterWorld,
    updateCameraPosition,
    makePlayerStand,
    makePlayerWalk,
    leaveWorld,
  };

  return <Context.Provider value={useMemo<ContextValue>(() => context, Object.values(context))}>{children}</Context.Provider>;
}

export { Provider as WorldJourneyServiceProvider, Context as WorldJourneyServiceContext };
