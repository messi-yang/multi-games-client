import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

export function MazeBattleGameRoom() {
  return (
    <div className={twMerge('w-full', 'h-full')}>
      <Image src="/assets/games/maze-battle/post.png" alt="post" fill />
    </div>
  );
}
