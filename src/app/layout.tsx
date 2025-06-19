'use client';

import './tailwind.css';
import { UserProvider } from '@/contexts/user-context';
import { AuthProvider } from '@/contexts/auth-context';
import { RoomJourneyServiceProvider } from '@/contexts/room-journey-service-context';
import { MyRoomsProvider } from '@/contexts/my-rooms-context';
import { RoomMembersProvider } from '@/contexts/room-members-context';
import { NotificationProvider } from '@/contexts/notification-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Exo+2&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NotificationProvider>
          <UserProvider>
            <AuthProvider>
              <RoomJourneyServiceProvider>
                <MyRoomsProvider>
                  <RoomMembersProvider>{children}</RoomMembersProvider>
                </MyRoomsProvider>
              </RoomJourneyServiceProvider>
            </AuthProvider>
          </UserProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
